import React, { useState, useEffect } from 'react';
import {
  HashAlgorithm,
  OtpOptions,
  generateOtpWithDetails
} from '../utils/cryptoOtp';
import { Hash, Plus, RotateCcw, Copy, Check, Key, Cpu, ShieldCheck } from 'lucide-react';

interface HotpGeneratorProps {
  secret: string;
  setSecret: (s: string) => void;
  algorithm: HashAlgorithm;
  setAlgorithm: (a: HashAlgorithm) => void;
  digits: number;
  setDigits: (d: number) => void;
  counter: number;
  setCounter: (c: number) => void;
  onInspectDetails?: (details: any) => void;
}

export const HotpGenerator: React.FC<HotpGeneratorProps> = ({
  secret,
  setSecret,
  algorithm,
  setAlgorithm,
  digits,
  setDigits,
  counter,
  setCounter,
  onInspectDetails
}) => {
  const [currentOtp, setCurrentOtp] = useState<string>('------');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const updateHotp = async () => {
      const options: OtpOptions = {
        secret,
        isBase32: true,
        algorithm,
        digits,
        counter
      };

      try {
        const details = await generateOtpWithDetails(options);
        if (isMounted) {
          setCurrentOtp(details.otp);
          if (onInspectDetails) {
            onInspectDetails(details);
          }
        }
      } catch (err) {
        if (isMounted) {
          setCurrentOtp('ERROR');
        }
      }
    };

    updateHotp();

    return () => {
      isMounted = false;
    };
  }, [secret, algorithm, digits, counter]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleIncrement = () => {
    setCounter(counter + 1);
  };

  const handleReset = () => {
    setCounter(0);
  };

  return (
    <div className="arith-panel arith-panel-hover rounded-2xl p-6 border border-slate-900 relative overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider border border-emerald-800/60 inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" /> RFC 4226 Standard
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
            <Hash className="w-5 h-5 text-emerald-400" /> Event-Based OTP (HOTP) Engine
          </h2>
        </div>

        {/* Counter Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all border border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (C=0)</span>
          </button>
          <button
            onClick={handleIncrement}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Increment Counter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live HOTP Token Display */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 bg-slate-950/80 rounded-2xl border border-slate-900 relative">
          <div className="text-center space-y-3 my-4">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest px-3.5 py-1 bg-emerald-950/80 border border-emerald-800/60 rounded-full font-bold">
              Counter C = {counter}
            </span>

            <div className="py-4">
              <span className="monospaced-code text-5xl sm:text-6xl font-black tracking-wider text-white glow-emerald">
                {currentOtp}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Event-driven one-time password generated from 8-byte counter state
            </p>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full max-w-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold transition-all shadow-lg ${
              copied
                ? 'bg-emerald-400 text-black shadow-emerald-400/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Copied HOTP Token!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy HOTP Token</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Parameters */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Counter Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-400" /> Current Counter Value (C)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                8-Byte Unsigned Integer
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={counter}
                onChange={(e) => setCounter(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                onClick={handleIncrement}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-xl font-bold text-xs"
              >
                +1
              </button>
            </div>
          </div>

          {/* Secret Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> Shared Secret Key (Base32)
            </label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase transition-colors"
            />
          </div>

          {/* Algorithm & Digits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> HMAC Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
                className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="SHA-1">SHA-1 (RFC Standard)</option>
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-512">SHA-512</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Digits Length</label>
              <div className="grid grid-cols-2 gap-2">
                {[6, 8].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDigits(d)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all border ${
                      digits === d
                        ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d} Digits
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formula info */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 font-mono space-y-1">
            <div className="text-slate-300 font-semibold flex items-center justify-between">
              <span>HOTP Formula:</span>
              <span className="text-emerald-400 font-bold">HOTP(K, C) = Truncate(HMAC-SHA-1(K, C))</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Counter increments on client and server upon each authentication event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
