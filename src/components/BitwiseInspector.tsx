import React, { useState } from 'react';
import { DynamicTruncationResult } from '../utils/cryptoOtp';
import { Cpu, CheckCircle2, Key, Binary, Hash, Code } from 'lucide-react';

interface BitwiseInspectorProps {
  details: DynamicTruncationResult | null;
  digits: number;
}

export const BitwiseInspector: React.FC<BitwiseInspectorProps> = ({ details, digits }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!details) {
    return (
      <div className="arith-panel rounded-2xl p-8 border border-slate-900 text-center text-slate-400 font-mono">
        Loading cryptographic details...
      </div>
    );
  }

  const digestBytes = details.hmacDigestHex.match(/.{1,2}/g) || [];
  const offset = details.offset;

  const steps = [
    {
      num: 1,
      title: 'Secret Key Byte Expansion',
      icon: Key,
      desc: 'Base32 secret decoded into raw binary key byte array K.'
    },
    {
      num: 2,
      title: '8-Byte Big Endian Moving Factor',
      icon: Binary,
      desc: 'Moving factor T (for TOTP) or Counter C (for HOTP) serialized as 8-byte big endian array.'
    },
    {
      num: 3,
      title: 'HMAC Hash Digest Generation',
      icon: Hash,
      desc: 'HMAC computation yields binary digest (20-byte SHA-1, 32-byte SHA-256, or 64-byte SHA-512).'
    },
    {
      num: 4,
      title: 'Dynamic Truncation & Modulo',
      icon: Code,
      desc: 'Extract 4-byte code via Offset O = Digest[Last] & 0x0F, mask MSB (& 0x7FFFFFFF), compute Mod 10^d.'
    }
  ];

  return (
    <div className="arith-panel arith-panel-hover rounded-2xl p-6 border border-slate-900 relative overflow-hidden shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider border border-emerald-800/60 inline-flex items-center gap-1.5">
            Byte-Level Cryptographic Inspector
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" /> Dynamic Truncation & Bitwise Pipeline
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-900">
          Selected Offset <strong className="text-emerald-400 font-bold">O = {offset}</strong> (0x{offset.toString(16).toUpperCase()})
        </div>
      </div>

      {/* Interactive Step Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.num;
          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`p-3.5 rounded-xl text-left border transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                  : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                  isActive ? 'bg-emerald-400 text-black font-black' : 'bg-slate-900 text-slate-400'
                }`}>
                  {step.num}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">{step.title}</div>
            </button>
          );
        })}
      </div>

      {/* Step Content View */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-900 space-y-6">
        {/* Step 1: Secret Bytes */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" /> Step 1: Secret Key Hex Bytes (K)
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Total Bytes: {details.secretHex.length / 2}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The Base32 secret string is decoded into raw binary bytes used as the HMAC secret key.
            </p>
            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 break-all leading-relaxed tracking-widest">
              {details.secretHex.match(/.{1,2}/g)?.join(' ') || details.secretHex}
            </div>
          </div>
        )}

        {/* Step 2: 8-Byte BE Counter */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Binary className="w-4 h-4 text-emerald-400" /> Step 2: 8-Byte Big Endian Moving Factor
              </h3>
              <span className="text-xs font-mono text-slate-400">Fixed 64-Bit Array</span>
            </div>
            <p className="text-xs text-slate-400">
              The counter or Unix time step is serialized into an 8-byte big endian byte array (high-order bytes first).
            </p>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {details.movingFactorHex.match(/.{1,2}/g)?.map((byte, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 mb-1">[{idx}]</span>
                  <span className="px-3 py-2 bg-slate-900 border border-emerald-800/60 text-emerald-300 rounded-lg font-bold">
                    0x{byte.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Digest Output & Offset Highlight */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-400" /> Step 3: Full HMAC Hash Digest & Offset Selection
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {digestBytes.length} Bytes Total
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The last byte of the HMAC digest determines offset:
              <code className="text-emerald-300 ml-1">O = Digest[{digestBytes.length - 1}] & 0x0F = {offset}</code>.
              The 4 bytes selected starting at index <strong className="text-emerald-400 font-bold">[{offset}..{offset + 3}]</strong> are highlighted in emerald below:
            </p>

            {/* Interactive Byte Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 font-mono text-xs">
              {digestBytes.map((byte, idx) => {
                const isSelectedByte = idx >= offset && idx < offset + 4;
                const isLastByte = idx === digestBytes.length - 1;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isSelectedByte
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20 scale-105 font-black'
                        : isLastByte
                        ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-900/90 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-[9px] opacity-60 mb-1">[{idx}]</span>
                    <span>{byte.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Truncation Bitwise Math */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" /> Step 4: Dynamic Truncation & Bitwise Operations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">A. Extracted 4 Bytes (Offset {offset})</span>
                <span className="text-emerald-400 font-extrabold text-base block">
                  0x{details.extracted4BytesHex.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500 block">Raw 32-bit slice</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">B. Bitwise Mask (& 0x7FFFFFFF)</span>
                <span className="text-emerald-300 font-extrabold text-base block">
                  {details.maskedBinaryCode}
                </span>
                <span className="text-[10px] text-slate-500 block">Ignores sign bit (MSB)</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">C. Modulo 10^{digits} & Zero Padding</span>
                <span className="text-white font-black text-lg block glow-emerald">
                  {details.otp}
                </span>
                <span className="text-[10px] text-slate-500 block">Final Output OTP Code</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-slate-300 font-mono space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Bitwise Verification Equation:
              </div>
              <p className="text-slate-400">
                P = (Digest[{offset}] & 0x7F) &lt;&lt; 24 | (Digest[{offset + 1}] & 0xFF) &lt;&lt; 16 | (Digest[{offset + 2}] & 0xFF) &lt;&lt; 8 | (Digest[{offset + 3}] & 0xFF)
              </p>
              <p className="text-emerald-300 pt-1 font-bold">
                OTP = P mod 10^{digits} = {details.maskedBinaryCode} mod {Math.pow(10, digits)} = <strong>{details.otp}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
