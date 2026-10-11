import { HashAlgorithm, generateOtpWithDetails } from './cryptoOtp';

export interface TestVector {
  id: string;
  rfc: 'RFC 6238 (TOTP)' | 'RFC 4226 (HOTP)';
  algorithm: HashAlgorithm;
  secretAscii: string;
  isBase32: boolean;
  secretDisplay: string;
  timeOrCounter: number; // Unix timestamp in sec or Counter index
  movingFactorT: number;
  digits: number;
  expectedOtp: string;
  description: string;
}

export interface TestResult {
  vector: TestVector;
  generatedOtp: string;
  passed: boolean;
  durationMs: number;
  hmacDigestHex?: string;
  offset?: number;
}

export const OFFICIAL_TEST_VECTORS: TestVector[] = [
  // --- RFC 4226 HOTP (SHA-1, 6 digits) ---
  {
    id: 'hotp-0',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 0,
    movingFactorT: 0,
    digits: 6,
    expectedOtp: '755224',
    description: 'RFC 4226 Counter = 0'
  },
  {
    id: 'hotp-1',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 1,
    movingFactorT: 1,
    digits: 6,
    expectedOtp: '287082',
    description: 'RFC 4226 Counter = 1'
  },
  {
    id: 'hotp-2',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 2,
    movingFactorT: 2,
    digits: 6,
    expectedOtp: '359152',
    description: 'RFC 4226 Counter = 2'
  },
  {
    id: 'hotp-3',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 3,
    movingFactorT: 3,
    digits: 6,
    expectedOtp: '969429',
    description: 'RFC 4226 Counter = 3'
  },
  {
    id: 'hotp-4',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 4,
    movingFactorT: 4,
    digits: 6,
    expectedOtp: '338314',
    description: 'RFC 4226 Counter = 4'
  },
  {
    id: 'hotp-5',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 5,
    movingFactorT: 5,
    digits: 6,
    expectedOtp: '254676',
    description: 'RFC 4226 Counter = 5'
  },
  {
    id: 'hotp-6',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 6,
    movingFactorT: 6,
    digits: 6,
    expectedOtp: '287922',
    description: 'RFC 4226 Counter = 6'
  },
  {
    id: 'hotp-7',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 7,
    movingFactorT: 7,
    digits: 6,
    expectedOtp: '162583',
    description: 'RFC 4226 Counter = 7'
  },
  {
    id: 'hotp-8',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 8,
    movingFactorT: 8,
    digits: 6,
    expectedOtp: '399871',
    description: 'RFC 4226 Counter = 8'
  },
  {
    id: 'hotp-9',
    rfc: 'RFC 4226 (HOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '12345678901234567890 (ASCII)',
    timeOrCounter: 9,
    movingFactorT: 9,
    digits: 6,
    expectedOtp: '520489',
    description: 'RFC 4226 Counter = 9'
  },

  // --- RFC 6238 TOTP SHA-1 (8 digits) ---
  {
    id: 'totp-sha1-59',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '20-Byte Key',
    timeOrCounter: 59,
    movingFactorT: 1,
    digits: 8,
    expectedOtp: '94287082',
    description: 'RFC 6238 SHA1 at T=59s (T=1)'
  },
  {
    id: 'totp-sha1-1111111109',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '20-Byte Key',
    timeOrCounter: 1111111109,
    movingFactorT: 37037036,
    digits: 8,
    expectedOtp: '07081804',
    description: 'RFC 6238 SHA1 at T=1,111,111,109s'
  },
  {
    id: 'totp-sha1-1111111111',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '20-Byte Key',
    timeOrCounter: 1111111111,
    movingFactorT: 37037037,
    digits: 8,
    expectedOtp: '14050471',
    description: 'RFC 6238 SHA1 at T=1,111,111,111s'
  },
  {
    id: 'totp-sha1-1234567890',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '20-Byte Key',
    timeOrCounter: 1234567890,
    movingFactorT: 41152263,
    digits: 8,
    expectedOtp: '89005924',
    description: 'RFC 6238 SHA1 at T=1,234,567,890s'
  },
  {
    id: 'totp-sha1-2000000000',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-1',
    secretAscii: '12345678901234567890',
    isBase32: false,
    secretDisplay: '20-Byte Key',
    timeOrCounter: 2000000000,
    movingFactorT: 66666666,
    digits: 8,
    expectedOtp: '69279037',
    description: 'RFC 6238 SHA1 at T=2,000,000,000s'
  },

  // --- RFC 6238 TOTP SHA-256 (8 digits) ---
  {
    id: 'totp-sha256-59',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-256',
    secretAscii: '12345678901234567890123456789012',
    isBase32: false,
    secretDisplay: '32-Byte Key',
    timeOrCounter: 59,
    movingFactorT: 1,
    digits: 8,
    expectedOtp: '46119246',
    description: 'RFC 6238 SHA256 at T=59s'
  },
  {
    id: 'totp-sha256-1111111109',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-256',
    secretAscii: '12345678901234567890123456789012',
    isBase32: false,
    secretDisplay: '32-Byte Key',
    timeOrCounter: 1111111109,
    movingFactorT: 37037036,
    digits: 8,
    expectedOtp: '68084743',
    description: 'RFC 6238 SHA256 at T=1,111,111,109s'
  },
  {
    id: 'totp-sha256-1234567890',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-256',
    secretAscii: '12345678901234567890123456789012',
    isBase32: false,
    secretDisplay: '32-Byte Key',
    timeOrCounter: 1234567890,
    movingFactorT: 41152263,
    digits: 8,
    expectedOtp: '91819424',
    description: 'RFC 6238 SHA256 at T=1,234,567,890s'
  },

  // --- RFC 6238 TOTP SHA-512 (8 digits) ---
  {
    id: 'totp-sha512-59',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-512',
    secretAscii: '1234567890123456789012345678901234567890123456789012345678901234',
    isBase32: false,
    secretDisplay: '64-Byte Key',
    timeOrCounter: 59,
    movingFactorT: 1,
    digits: 8,
    expectedOtp: '90698825',
    description: 'RFC 6238 SHA512 at T=59s'
  },
  {
    id: 'totp-sha512-1111111109',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-512',
    secretAscii: '1234567890123456789012345678901234567890123456789012345678901234',
    isBase32: false,
    secretDisplay: '64-Byte Key',
    timeOrCounter: 1111111109,
    movingFactorT: 37037036,
    digits: 8,
    expectedOtp: '25091201',
    description: 'RFC 6238 SHA512 at T=1,111,111,109s'
  },
  {
    id: 'totp-sha512-1234567890',
    rfc: 'RFC 6238 (TOTP)',
    algorithm: 'SHA-512',
    secretAscii: '1234567890123456789012345678901234567890123456789012345678901234',
    isBase32: false,
    secretDisplay: '64-Byte Key',
    timeOrCounter: 1234567890,
    movingFactorT: 41152263,
    digits: 8,
    expectedOtp: '93441116',
    description: 'RFC 6238 SHA512 at T=1,234,567,890s'
  }
];

export async function runTestVectorsSuite(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const vector of OFFICIAL_TEST_VECTORS) {
    const t0 = performance.now();
    let details;
    if (vector.rfc.includes('HOTP')) {
      details = await generateOtpWithDetails({
        secret: vector.secretAscii,
        isBase32: vector.isBase32,
        algorithm: vector.algorithm,
        digits: vector.digits,
        counter: vector.timeOrCounter
      });
    } else {
      const movingT = Math.floor(vector.timeOrCounter / 30);
      details = await generateOtpWithDetails({
        secret: vector.secretAscii,
        isBase32: vector.isBase32,
        algorithm: vector.algorithm,
        digits: vector.digits,
        period: 30,
        epoch: 0
      }, movingT);
    }
    const t1 = performance.now();

    results.push({
      vector,
      generatedOtp: details.otp,
      passed: details.otp === vector.expectedOtp,
      durationMs: t1 - t0,
      hmacDigestHex: details.hmacDigestHex,
      offset: details.offset
    });
  }

  return results;
}
