import React from 'react';
import { ShieldCheck, Key, Clock, Binary, Cpu, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const FlowDiagram: React.FC = () => {
  return (
    <div className="arith-panel arith-panel-hover rounded-2xl p-6 border border-slate-900 relative overflow-hidden shadow-2xl space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-900">
        <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider border border-emerald-800/60 inline-flex items-center gap-1.5">
          Architecture & Flow Diagrams
        </span>
        <h2 className="text-xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> OTP Generation & Verification Lifecycle
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          End-to-end mathematical and security verification pipeline.
        </p>
      </div>

      {/* Generation Flow Diagram */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" /> 1. OTP Generation Pipeline (Client / Server)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center border border-emerald-800/60">
              01
            </div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" /> Shared Secret (K)
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Base32 string provisioned via QR code (160+ bits PRNG).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center border border-emerald-800/60">
              02
            </div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Moving Factor (T)
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              T = ⌊(UnixTime - T0) / X⌋ as 8-byte big endian array.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center border border-emerald-800/60">
              03
            </div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-emerald-400" /> HMAC-Hash
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              HMAC-SHA1/256/512(K, T) yields binary digest HS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center border border-emerald-800/60">
              04
            </div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Truncation
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Extract offset O = HS[last] & 0x0F, mask MSB (& 0x7FFFFFFF).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-2 bg-gradient-to-b from-slate-900 to-emerald-950/40">
            <div className="w-8 h-8 rounded-lg bg-emerald-400 text-black font-black font-mono text-xs flex items-center justify-center">
              05
            </div>
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Final OTP Code
            </h4>
            <p className="text-[11px] text-slate-300 font-mono font-bold">
              OTP = P mod 10^d (Zero Padded).
            </p>
          </div>
        </div>
      </div>

      {/* Verification Pipeline */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" /> 2. Server Verification & Security Checks
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> 1. Rate Limiting Check
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Verify submitter isn't locked out due to &gt;5 failed attempts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> 2. Clock Drift Match
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Evaluate T across drift window range [T-Δ, T+Δ].
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> 3. Replay Protection Guard
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Ensure (K, OTP, T) tuple has not already been consumed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/50 space-y-1 bg-emerald-950/20">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 4. Constant-Time Compare
            </div>
            <p className="text-[11px] text-emerald-200 font-mono">
              Bitwise XOR equality check to prevent side-channel timing leaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
