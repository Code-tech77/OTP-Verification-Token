import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  HashAlgorithm,
  OtpOptions,
  verifyOtp,
  VerificationResult,
  defaultRateLimiter,
  replayGuard
} from '../utils/cryptoOtp';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  RotateCcw,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

interface OtpVerifierProps {
  secret: string;
  algorithm: HashAlgorithm;
  digits: number;
  period: number;
  counter: number;
  isHotpMode: boolean;
}

export const OtpVerifier: React.FC<OtpVerifierProps> = ({
  secret,
  algorithm,
  digits,
  period,
  counter,
  isHotpMode
}) => {
  const [inputOtp, setInputOtp] = useState<string>('');
  const [driftWindow, setDriftWindow] = useState<number>(1);
  const [enforceReplayGuard, setEnforceReplayGuard] = useState<boolean>(true);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationLogs, setVerificationLogs] = useState<Array<{
    timestamp: string;
    code: string;
    valid: boolean;
    msg: string;
    execTime: string;
  }>>([]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00dc82', '#10b981', '#34d399', '#ffffff']
    });
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputOtp.trim()) return;

    const options: OtpOptions = {
      secret,
      isBase32: true,
      algorithm,
      digits,
      period,
      counter: isHotpMode ? counter : undefined
    };

    const result = await verifyOtp(inputOtp, options, {
      driftWindow,
      enforceReplayGuard,
      counterResyncWindow: 5
    });

    setVerificationResult(result);

    if (result.valid) {
      triggerConfetti();
    }

    setVerificationLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        code: inputOtp,
        valid: result.valid,
        msg: result.message,
        execTime: `${result.executionTimeMs.toFixed(3)}ms`
      },
      ...prev.slice(0, 19)
    ]);
  };

  const handleResetSecurityState = () => {
    defaultRateLimiter.reset();
    replayGuard.clear();
    setVerificationResult(null);
    setVerificationLogs([]);
  };

  const lockStatus = defaultRateLimiter.isLockedOut();

  return (
    <div className="arith-panel arith-panel-hover rounded-2xl p-6 border border-slate-900 relative overflow-hidden shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider border border-emerald-800/60 inline-flex items-center gap-1.5">
            Real-Time Verification Engine
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> OTP Verifier & Security Enforcement
          </h2>
        </div>

        <button
          onClick={handleResetSecurityState}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all border border-slate-800"
          title="Reset Rate Limiter & Replay Memory"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Security Memory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Verification Form & Status */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleVerify} className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-900">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Submit User OTP for Validation
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {isHotpMode ? `HOTP (Counter = ${counter})` : `TOTP (${period}s window)`}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={digits}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                disabled={lockStatus.locked}
                placeholder={`Enter ${digits}-digit OTP code`}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={lockStatus.locked || !inputOtp.trim()}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Verify Token</span>
              </button>
            </div>

            {/* Quick Helper Buttons for Edge-Case Testing */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900">
              <span className="text-[11px] text-slate-500 font-semibold">Simulate Edge Cases:</span>
              <button
                type="button"
                onClick={() => setInputOtp('000000')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-400 text-[11px] font-mono rounded-lg border border-slate-800"
              >
                Invalid Code (000000)
              </button>
              <button
                type="button"
                onClick={() => handleVerify()}
                className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-[11px] font-mono rounded-lg border border-emerald-800/40 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Re-Submit Same OTP (Test Replay)
              </button>
            </div>
          </form>

          {/* Verification Result Card */}
          {verificationResult && (
            <div
              className={`p-5 rounded-2xl border transition-all duration-300 shadow-xl ${
                verificationResult.valid
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : verificationResult.code === 'REPLAY_ATTACK'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : verificationResult.code === 'RATE_LIMITED'
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {verificationResult.valid ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                  ) : verificationResult.code === 'REPLAY_ATTACK' ? (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/40">
                      <XCircle className="w-6 h-6 text-rose-400" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base tracking-wide">
                        {verificationResult.valid ? 'TOKEN VERIFIED SUCCESS' : 'VERIFICATION FAILED'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950 border border-slate-800">
                        {verificationResult.code}
                      </span>
                    </div>
                    <p className="text-xs font-mono mt-1 opacity-90">{verificationResult.message}</p>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400 shrink-0">
                  <div>Latency: <strong className="text-white">{verificationResult.executionTimeMs.toFixed(3)}ms</strong></div>
                  <div>Constant-Time: <strong className="text-emerald-400">Enforced</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Audit Log Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Verification Trace Log
            </h3>
            <div className="bg-slate-950 rounded-xl border border-slate-900 overflow-hidden max-h-56 overflow-y-auto">
              {verificationLogs.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No verification attempts recorded in current session.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Submitted OTP</th>
                      <th className="py-2 px-3">Result</th>
                      <th className="py-2 px-3">Message</th>
                      <th className="py-2 px-3 text-right">Exec Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300">
                    {verificationLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-500">{log.timestamp}</td>
                        <td className="py-2 px-3 font-bold text-emerald-300">{log.code}</td>
                        <td className="py-2 px-3">
                          {log.valid ? (
                            <span className="text-emerald-400 font-bold">PASS</span>
                          ) : (
                            <span className="text-rose-400 font-bold">FAIL</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{log.msg}</td>
                        <td className="py-2 px-3 text-right text-slate-500">{log.execTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Validity Rules & Policy Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Security Validity Rules
            </h3>

            {/* Drift Window Setting */}
            {!isHotpMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Clock Drift Tolerance Window
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    ±{driftWindow} {driftWindow === 1 ? 'Step' : 'Steps'} (±{driftWindow * period}s)
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setDriftWindow(w)}
                      className={`py-2 px-2 text-xs font-bold font-mono rounded-xl border transition-all ${
                        driftWindow === w
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      {w === 0 ? 'Exact (±0s)' : `±${w} Step (${w * period}s)`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Allows client/server clock skew within ±{driftWindow * period} seconds.
                </p>
              </div>
            )}

            {/* Replay Protection Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">
                  Single-Use Token Replay Guard
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Invalidates OTP after first successful verification
                </span>
              </div>
              <input
                type="checkbox"
                checked={enforceReplayGuard}
                onChange={(e) => setEnforceReplayGuard(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-800"
              />
            </div>

            {/* Rate Limiter Status */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Brute-Force Rate Limiter:</span>
                <span className="font-mono text-emerald-400 font-bold">Max 5 Attempts / 30s</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Protects against automated pin brute-forcing by triggering a 30-second lockout after 5 consecutive failed attempts.
              </p>
            </div>

            {/* Constant Time Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Constant-Time String Comparison
              </div>
              <p className="text-[11px] text-slate-400">
                Eliminates side-channel timing attacks by executing full bitwise XOR comparison across all digit positions regardless of early mismatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
