/**
 * ArithMatrix Technology - Production-Grade OTP Engine
 * Implementation of RFC 4226 (HOTP) and RFC 6238 (TOTP)
 * Supports HMAC-SHA1, HMAC-SHA256, HMAC-SHA512
 */

export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

export interface OtpOptions {
  secret: string; // Base32 encoded or plain string
  isBase32?: boolean;
  algorithm?: HashAlgorithm;
  digits?: number; // Default: 6 (can be 6, 7, 8)
  period?: number; // Time step in seconds for TOTP, default: 30
  epoch?: number; // T0 initial epoch in seconds, default: 0
  counter?: number; // Counter value for HOTP
}

export interface DynamicTruncationResult {
  secretHex: string;
  movingFactorHex: string; // 8-byte big endian hex string
  hmacDigestHex: string;
  offset: number;
  extracted4BytesHex: string;
  binaryCode: number;
  maskedBinaryCode: number;
  otp: string;
}

export interface VerificationResult {
  valid: boolean;
  code: 'SUCCESS' | 'EXPIRED' | 'REPLAY_ATTACK' | 'INVALID_CODE' | 'RATE_LIMITED' | 'WINDOW_DRIFT_MATCH';
  message: string;
  deltaWindow?: number; // 0 for current, -1 for previous window, +1 for next window
  timestampExecuted: number;
  executionTimeMs: number;
  constantTimeMatch?: boolean;
}

// Base32 alphabet according to RFC 4648
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Base32 Decode -> Uint8Array
 */
export function base32ToBytes(base32: string): Uint8Array {
  const sanitized = base32.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < sanitized.length; i++) {
    const idx = BASE32_CHARS.indexOf(sanitized.charAt(i));
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Uint8Array -> Base32 Encode
 */
export function bytesToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  // Padding
  while (output.length % 8 !== 0) {
    output += '=';
  }

  return output;
}

/**
 * Converts ASCII string or Secret to bytes
 */
export function secretToBytes(secret: string, isBase32: boolean = true): Uint8Array {
  if (isBase32) {
    const bytes = base32ToBytes(secret);
    if (bytes.length > 0) return bytes;
  }
  // Fallback to UTF-8 / ASCII bytes
  return new TextEncoder().encode(secret);
}

/**
 * Format counter or timestamp moving factor into 8-byte Big Endian Uint8Array
 */
export function numberTo8ByteBE(num: number): Uint8Array {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  
  // JavaScript numbers are double precision floats, split into high and low 32-bit ints
  const high = Math.floor(num / 0x100000000);
  const low = num % 0x100000000;

  view.setUint32(0, high, false); // Big endian
  view.setUint32(4, low, false);  // Big endian

  return new Uint8Array(buffer);
}

/**
 * Helper to convert Uint8Array to Hex String
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Pure JavaScript Implementation of HMAC (SHA-1, SHA-256, SHA-512)
 * Guarantees standard RFC 4226 & RFC 6238 test vectors work identically in all JS environments.
 */

// Pure SHA-1 / SHA-256 / SHA-512 byte hashing implementations
async function computeHmac(
  algorithm: HashAlgorithm,
  keyBytes: Uint8Array,
  messageBytes: Uint8Array
): Promise<Uint8Array> {
  // Use Web Crypto API when available (Web browser & modern Node)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const hashName = algorithm; // 'SHA-1', 'SHA-256', 'SHA-512'
      const keyBuffer = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer;
      const msgBuffer = messageBytes.buffer.slice(messageBytes.byteOffset, messageBytes.byteOffset + messageBytes.byteLength) as ArrayBuffer;

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: { name: hashName } },
        false,
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
      return new Uint8Array(signature);
    } catch {
      // Fallback to pure JS below if subtle crypto fails
    }
  }

  // Pure JS HMAC Fallback for SHA-1 / SHA-256 / SHA-512
  return pureJsHmac(algorithm, keyBytes, messageBytes);
}

// Fallback pure JS HMAC engine
function pureJsHmac(algorithm: HashAlgorithm, key: Uint8Array, message: Uint8Array): Uint8Array {
  let blockSize = 64; // SHA-1, SHA-256
  if (algorithm === 'SHA-512') {
    blockSize = 128;
  }

  let preparedKey = key;
  if (preparedKey.length > blockSize) {
    preparedKey = hashMessage(algorithm, preparedKey);
  }
  if (preparedKey.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(preparedKey);
    preparedKey = padded;
  }

  const oPad = new Uint8Array(blockSize);
  const iPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    oPad[i] = preparedKey[i] ^ 0x5c;
    iPad[i] = preparedKey[i] ^ 0x36;
  }

  const innerMessage = new Uint8Array(iPad.length + message.length);
  innerMessage.set(iPad, 0);
  innerMessage.set(message, iPad.length);

  const innerHash = hashMessage(algorithm, innerMessage);

  const outerMessage = new Uint8Array(oPad.length + innerHash.length);
  outerMessage.set(oPad, 0);
  outerMessage.set(innerHash, oPad.length);

  return hashMessage(algorithm, outerMessage);
}

// Pure JS Message Hashing (SHA-1 / SHA-256 / SHA-512)
function hashMessage(algorithm: HashAlgorithm, msg: Uint8Array): Uint8Array {
  if (algorithm === 'SHA-1') return sha1(msg);
  if (algorithm === 'SHA-256') return sha256(msg);
  return sha512(msg);
}

// Bitwise SHA-1
function sha1(msg: Uint8Array): Uint8Array {
  const h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const l = msg.length;
  const words: number[] = [];

  for (let i = 0; i < l; i++) {
    words[i >> 2] |= msg[i] << (24 - (i % 4) * 8);
  }
  words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);

  const bitsHigh = Math.floor((l * 8) / 0x100000000);
  const bitsLow = (l * 8) % 0x100000000;
  const wordCount = (((l + 8) >> 6) + 1) * 16;
  words[wordCount - 2] = bitsHigh;
  words[wordCount - 1] = bitsLow;

  const w = new Array(80);

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) w[t] = words[i + t] || 0;
    for (let t = 16; t < 80; t++) {
      const val = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = (val << 1) | (val >>> 31);
    }

    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4];

    for (let t = 0; t < 80; t++) {
      let f = 0, k = 0;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + (w[t] >>> 0)) >>> 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
  }

  const result = new Uint8Array(20);
  for (let i = 0; i < 5; i++) {
    result[i * 4] = (h[i] >>> 24) & 0xff;
    result[i * 4 + 1] = (h[i] >>> 16) & 0xff;
    result[i * 4 + 2] = (h[i] >>> 8) & 0xff;
    result[i * 4 + 3] = h[i] & 0xff;
  }
  return result;
}

// Bitwise SHA-256
function sha256(msg: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef4a3f7, 0xc67178f2
  ];
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const l = msg.length;
  const words: number[] = [];

  for (let i = 0; i < l; i++) {
    words[i >> 2] |= msg[i] << (24 - (i % 4) * 8);
  }
  words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);

  const bitsHigh = Math.floor((l * 8) / 0x100000000);
  const bitsLow = (l * 8) % 0x100000000;
  const wordCount = (((l + 8) >> 6) + 1) * 16;
  words[wordCount - 2] = bitsHigh;
  words[wordCount - 1] = bitsLow;

  const w = new Array(64);

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) w[t] = words[i + t] || 0;
    for (let t = 16; t < 64; t++) {
      const s0 = ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^ ((w[t - 15] >>> 18) | (w[t - 15] << 14)) ^ (w[t - 15] >>> 3);
      const s1 = ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^ ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + (w[t] >>> 0)) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  const result = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    result[i * 4] = (H[i] >>> 24) & 0xff;
    result[i * 4 + 1] = (H[i] >>> 16) & 0xff;
    result[i * 4 + 2] = (H[i] >>> 8) & 0xff;
    result[i * 4 + 3] = H[i] & 0xff;
  }
  return result;
}

// Bitwise SHA-512 (64-bit integer simulation using BigInt)
function sha512(msg: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,
    0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,
    0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
    0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,
    0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,
    0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
    0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7bef0bf17n,
    0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,
    0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
    0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353an,
    0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n,
    0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,
    0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeef9n, 0x34b0bcb5e19b48a8n,
    0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n,
    0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,
    0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef4a3f7b2c67915n, 0xc67178f2e372532bn
  ];

  const H = [
    0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n,
    0x510e527fade682d1n, 0x9b05688c2b3e6c1fn, 0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n
  ];

  const l = BigInt(msg.length);
  const blocks: BigInt[] = [];

  for (let i = 0; i < msg.length; i += 8) {
    let word = 0n;
    for (let j = 0; j < 8; j++) {
      word = (word << 8n) | BigInt(msg[i + j] || 0);
    }
    blocks.push(word);
  }

  // Padding
  const padIndex = msg.length;
  const bitLength = l * 8n;
  const mod128 = (padIndex + 1 + 16) % 128;
  const zeroBytesCount = mod128 === 0 ? 0 : 128 - mod128;

  const paddedLength = padIndex + 1 + zeroBytesCount + 16;
  const padded = new Uint8Array(paddedLength);
  padded.set(msg);
  padded[padIndex] = 0x80;

  // Set bit length at end (128-bit int big endian)
  const view = new DataView(padded.buffer);
  view.setBigUint64(paddedLength - 8, bitLength, false);

  const w = new BigInt64Array(80);
  const M = new DataView(padded.buffer);

  for (let offset = 0; offset < paddedLength; offset += 128) {
    for (let i = 0; i < 16; i++) {
      w[i] = M.getBigUint64(offset + i * 8, false);
    }

    for (let i = 16; i < 80; i++) {
      const rotr = (x: bigint, n: bigint) => (x >> n) | (x << (64n - n));
      const s0 = rotr(w[i - 15], 1n) ^ rotr(w[i - 15], 8n) ^ (w[i - 15] >> 7n);
      const s1 = rotr(w[i - 2], 19n) ^ rotr(w[i - 2], 61n) ^ (w[i - 2] >> 6n);
      w[i] = BigInt.asUintN(64, w[i - 16] + s0 + w[i - 7] + s1);
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let i = 0; i < 80; i++) {
      const rotr = (x: bigint, n: bigint) => (x >> n) | (x << (64n - n));
      const S1 = rotr(e, 14n) ^ rotr(e, 18n) ^ rotr(e, 41n);
      const ch = (e & f) ^ (~e & g);
      const temp1 = BigInt.asUintN(64, h + S1 + ch + K[i] + w[i]);
      const S0 = rotr(a, 28n) ^ rotr(a, 34n) ^ rotr(a, 39n);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = BigInt.asUintN(64, S0 + maj);

      h = g;
      g = f;
      f = e;
      e = BigInt.asUintN(64, d + temp1);
      d = c;
      c = b;
      b = a;
      a = BigInt.asUintN(64, temp1 + temp2);
    }

    H[0] = BigInt.asUintN(64, H[0] + a);
    H[1] = BigInt.asUintN(64, H[1] + b);
    H[2] = BigInt.asUintN(64, H[2] + c);
    H[3] = BigInt.asUintN(64, H[3] + d);
    H[4] = BigInt.asUintN(64, H[4] + e);
    H[5] = BigInt.asUintN(64, H[5] + f);
    H[6] = BigInt.asUintN(64, H[6] + g);
    H[7] = BigInt.asUintN(64, H[7] + h);
  }

  const result = new Uint8Array(64);
  const resView = new DataView(result.buffer);
  for (let i = 0; i < 8; i++) {
    resView.setBigUint64(i * 8, H[i], false);
  }
  return result;
}

/**
 * Dynamic Truncation Core Algorithm (RFC 4226 Section 5.3 & RFC 6238)
 */
export async function generateOtpWithDetails(
  options: OtpOptions,
  movingFactorOverride?: number
): Promise<DynamicTruncationResult> {
  const {
    secret,
    isBase32 = true,
    algorithm = 'SHA-1',
    digits = 6,
    period = 30,
    epoch = 0,
    counter = 0
  } = options;

  // 1. Calculate Moving Factor T or C
  let movingFactor = counter;
  if (movingFactorOverride !== undefined) {
    movingFactor = movingFactorOverride;
  } else if (options.counter === undefined) {
    // TOTP calculation: T = floor((CurrentTime - T0) / X)
    const currentTimeSec = Math.floor(Date.now() / 1000);
    movingFactor = Math.floor((currentTimeSec - epoch) / period);
  }

  // 2. Secret Key Bytes & Moving Factor 8-Byte BE Array
  const keyBytes = secretToBytes(secret, isBase32);
  const movingFactorBytes = numberTo8ByteBE(movingFactor);

  // 3. Compute HMAC
  const hmacDigest = await computeHmac(algorithm, keyBytes, movingFactorBytes);

  // 4. Dynamic Truncation
  // Offset is last nibble (4 bits) of HMAC digest
  const offset = hmacDigest[hmacDigest.length - 1] & 0x0f;

  // Extract 4 bytes from HMAC digest starting at offset
  const binaryCode =
    ((hmacDigest[offset] & 0x7f) << 24) |
    ((hmacDigest[offset + 1] & 0xff) << 16) |
    ((hmacDigest[offset + 2] & 0xff) << 8) |
    (hmacDigest[offset + 3] & 0xff);

  const maskedBinaryCode = binaryCode & 0x7fffffff;
  const modulo = Math.pow(10, digits);
  const rawOtpNum = maskedBinaryCode % modulo;
  const otp = rawOtpNum.toString().padStart(digits, '0');

  // Extract hex string for 4 bytes slice
  const extracted4BytesHex = bytesToHex(hmacDigest.slice(offset, offset + 4));

  return {
    secretHex: bytesToHex(keyBytes),
    movingFactorHex: bytesToHex(movingFactorBytes),
    hmacDigestHex: bytesToHex(hmacDigest),
    offset,
    extracted4BytesHex,
    binaryCode,
    maskedBinaryCode,
    otp
  };
}

/**
 * Generate standard OTP string
 */
export async function generateOtp(options: OtpOptions, movingFactorOverride?: number): Promise<string> {
  const details = await generateOtpWithDetails(options, movingFactorOverride);
  return details.otp;
}

/**
 * Constant-Time String Comparison
 * Prevents timing side-channel attacks by comparing every character index regardless of early mismatch.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Dummy loop to keep timing uniform
    let dummy = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      dummy |= (a.charCodeAt(i % a.length) || 0) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false && dummy === 0;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Single-Use Replay Protection Memory Store
 */
class ReplayGuard {
  private usedTokens = new Map<string, number>(); // Key: "secret:otp:windowIndex", Value: expirySec

  public isReused(secret: string, otp: string, windowIndex: number): boolean {
    const key = `${secret}:${otp}:${windowIndex}`;
    this.cleanUp();
    return this.usedTokens.has(key);
  }

  public recordUsage(secret: string, otp: string, windowIndex: number, ttlSec: number = 300): void {
    const key = `${secret}:${otp}:${windowIndex}`;
    const expiry = Date.now() + ttlSec * 1000;
    this.usedTokens.set(key, expiry);
  }

  private cleanUp(): void {
    const now = Date.now();
    for (const [key, expiry] of this.usedTokens.entries()) {
      if (now > expiry) {
        this.usedTokens.delete(key);
      }
    }
  }

  public clear(): void {
    this.usedTokens.clear();
  }
}

export const replayGuard = new ReplayGuard();

/**
 * Rate Limiter & Brute Force Protection Simulator
 */
export class RateLimiter {
  private attempts = 0;
  private maxAttempts: number;
  private lockoutDurationSec: number;
  private lockedUntilMs = 0;

  constructor(maxAttempts: number = 5, lockoutDurationSec: number = 30) {
    this.maxAttempts = maxAttempts;
    this.lockoutDurationSec = lockoutDurationSec;
  }

  public isLockedOut(): { locked: boolean; remainingSec: number } {
    const now = Date.now();
    if (now < this.lockedUntilMs) {
      return {
        locked: true,
        remainingSec: Math.ceil((this.lockedUntilMs - now) / 1000)
      };
    }
    return { locked: false, remainingSec: 0 };
  }

  public recordFailure(): { locked: boolean; remainingAttempts: number; remainingSec: number } {
    this.attempts++;
    if (this.attempts >= this.maxAttempts) {
      this.lockedUntilMs = Date.now() + this.lockoutDurationSec * 1000;
      this.attempts = 0; // Reset counter for next cycle after unlock
      return { locked: true, remainingAttempts: 0, remainingSec: this.lockoutDurationSec };
    }
    return {
      locked: false,
      remainingAttempts: this.maxAttempts - this.attempts,
      remainingSec: 0
    };
  }

  public recordSuccess(): void {
    this.attempts = 0;
    this.lockedUntilMs = 0;
  }

  public reset(): void {
    this.attempts = 0;
    this.lockedUntilMs = 0;
  }
}

export const defaultRateLimiter = new RateLimiter(5, 30);

/**
 * Comprehensive Verification Engine
 * Validates OTP against clock drift window, replay attack guard, and rate limiter.
 */
export async function verifyOtp(
  userOtp: string,
  options: OtpOptions,
  config: {
    driftWindow?: number; // Allowed steps +/- (e.g., 1 allows T-1, T, T+1)
    rateLimiter?: RateLimiter;
    enforceReplayGuard?: boolean;
    counterResyncWindow?: number; // HOTP lookahead counter window
  } = {}
): Promise<VerificationResult> {
  const startTime = performance.now();
  const {
    driftWindow = 1,
    rateLimiter = defaultRateLimiter,
    enforceReplayGuard = true,
    counterResyncWindow = 5
  } = config;

  // 1. Check Rate Limiter
  const lockStatus = rateLimiter.isLockedOut();
  if (lockStatus.locked) {
    const execTime = performance.now() - startTime;
    return {
      valid: false,
      code: 'RATE_LIMITED',
      message: `Account temporarily locked due to repeated invalid attempts. Try again in ${lockStatus.remainingSec}s.`,
      timestampExecuted: Date.now(),
      executionTimeMs: execTime
    };
  }

  const digits = options.digits || 6;
  const sanitizedInput = userOtp.trim().padStart(digits, '0');

  // HOTP Verification
  if (options.counter !== undefined) {
    const baseCounter = options.counter;
    for (let c = baseCounter; c <= baseCounter + counterResyncWindow; c++) {
      const expectedOtp = await generateOtp(options, c);
      const isMatch = constantTimeCompare(sanitizedInput, expectedOtp);
      if (isMatch) {
        rateLimiter.recordSuccess();
        const execTime = performance.now() - startTime;
        return {
          valid: true,
          code: 'SUCCESS',
          message: `HOTP Validated successfully at Counter = ${c}.`,
          deltaWindow: c - baseCounter,
          timestampExecuted: Date.now(),
          executionTimeMs: execTime,
          constantTimeMatch: true
        };
      }
    }

    rateLimiter.recordFailure();
    const execTime = performance.now() - startTime;
    return {
      valid: false,
      code: 'INVALID_CODE',
      message: 'Invalid HOTP code submitted.',
      timestampExecuted: Date.now(),
      executionTimeMs: execTime,
      constantTimeMatch: false
    };
  }

  // TOTP Verification
  const period = options.period || 30;
  const epoch = options.epoch || 0;
  const currentSec = Math.floor(Date.now() / 1000);
  const currentT = Math.floor((currentSec - epoch) / period);

  // Check window drift range [-driftWindow, +driftWindow]
  for (let delta = -driftWindow; delta <= driftWindow; delta++) {
    const testT = currentT + delta;
    const expectedOtp = await generateOtp(options, testT);
    const isMatch = constantTimeCompare(sanitizedInput, expectedOtp);

    if (isMatch) {
      // Replay Attack Check
      if (enforceReplayGuard && replayGuard.isReused(options.secret, sanitizedInput, testT)) {
        rateLimiter.recordFailure();
        const execTime = performance.now() - startTime;
        return {
          valid: false,
          code: 'REPLAY_ATTACK',
          message: 'Replay Attack Blocked: This OTP token has already been consumed for this time step!',
          timestampExecuted: Date.now(),
          executionTimeMs: execTime,
          constantTimeMatch: true
        };
      }

      // Record Usage
      if (enforceReplayGuard) {
        replayGuard.recordUsage(options.secret, sanitizedInput, testT, period * 2);
      }

      rateLimiter.recordSuccess();
      const execTime = performance.now() - startTime;
      const codeType = delta === 0 ? 'SUCCESS' : 'WINDOW_DRIFT_MATCH';
      const driftDesc = delta === 0 ? 'Current window' : `${delta > 0 ? '+' : ''}${delta} step clock drift`;

      return {
        valid: true,
        code: codeType,
        message: `TOTP Verified successfully (${driftDesc}).`,
        deltaWindow: delta,
        timestampExecuted: Date.now(),
        executionTimeMs: execTime,
        constantTimeMatch: true
      };
    }
  }

  // If no match found
  rateLimiter.recordFailure();
  const execTime = performance.now() - startTime;
  return {
    valid: false,
    code: 'INVALID_CODE',
    message: 'Invalid or expired OTP token.',
    timestampExecuted: Date.now(),
    executionTimeMs: execTime,
    constantTimeMatch: false
  };
}

/**
 * Generates standard OTPAuth URI for QR Code scanning
 * otpauth://totp/Issuer:Label?secret=SECRET&issuer=Issuer&algorithm=SHA1&digits=6&period=30
 */
export function generateOtpAuthUrl(
  secret: string,
  accountName: string = 'user@arithmatrix.io',
  issuer: string = 'ArithMatrix Technology',
  options: Partial<OtpOptions> = {}
): string {
  const type = options.counter !== undefined ? 'hotp' : 'totp';
  const algo = (options.algorithm || 'SHA-1').replace('-', '');
  const digits = options.digits || 6;
  const period = options.period || 30;

  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);

  let url = `otpauth://${type}/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${algo}&digits=${digits}`;

  if (type === 'totp') {
    url += `&period=${period}`;
  } else {
    url += `&counter=${options.counter || 0}`;
  }

  return url;
}

/**
 * Random Base32 Secret Generator (160-bit / 20 bytes by default)
 */
export function generateRandomSecret(byteLength: number = 20): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToBase32(bytes).replace(/=/g, '');
}
