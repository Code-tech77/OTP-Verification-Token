import React from 'react';
import { BookOpen, ShieldCheck, X, CheckCircle2, Lock, Clock, Cpu, Code2 } from 'lucide-react';

interface SecurityAuditDocProps {
  onClose: () => void;
}

export const SecurityAuditDoc: React.FC<SecurityAuditDocProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#080c14] border border-emerald-500/30 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                OTP Algorithm & Validity Parameters Specification
              </h2>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span>ArithMatrix Technologies Internship Project</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Developed by Mohammed Zuoriki</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-slate-300 font-sans leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> 1. Algorithm Standards Overview
            </h3>
            <p>
              This implementation adheres strictly to internet standards for symmetric two-factor authentication:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono pl-2">
              <li><strong>RFC 4226:</strong> HOTP: An HMAC-Based One-Time Password Algorithm.</li>
              <li><strong>RFC 6238:</strong> TOTP: Time-Based One-Time Password Algorithm.</li>
              <li><strong>RFC 4648:</strong> The Base16, Base32, and Base64 Data Encodings.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 2. Mathematical Equations & Dynamic Truncation
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 font-mono text-[11px] space-y-2">
              <div><strong className="text-emerald-300">TOTP Moving Factor (T):</strong> T = ⌊(CurrentUnixTimestamp - T0) / X⌋</div>
              <div><strong className="text-emerald-300">HMAC Computation:</strong> HS = HMAC-Hash(K, T)</div>
              <div><strong className="text-emerald-300">Dynamic Offset Selection (O):</strong> O = HS[last_byte] & 0x0F</div>
              <div><strong className="text-emerald-300">Binary Dynamic Code (P):</strong> P = (HS[O] & 0x7F) &lt;&lt; 24 | (HS[O+1] & 0xFF) &lt;&lt; 16 | (HS[O+2] & 0xFF) &lt;&lt; 8 | (HS[O+3] & 0xFF)</div>
              <div><strong className="text-emerald-400">Final OTP:</strong> OTP = P mod 10^digits (formatted with leading zeros)</div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Lock className="w-4 h-4" /> 3. Security Rules & Validity Windows
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Time Step & Clock Skew (Drift)
                </h4>
                <p className="text-slate-400">
                  Standard step interval $X = 30$ seconds. Server permits a tolerance window $\Delta \in [-1, +1]$ to handle client/server clock unsynchronization up to 30 seconds.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Replay Attack Prevention
                </h4>
                <p className="text-slate-400">
                  Tokens are single-use. Once an OTP is validated for a given time step $T$, its tuple $(K, OTP, T)$ is stored in memory and rejected on subsequent attempts.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Brute-Force Rate Limiting
                </h4>
                <p className="text-slate-400">
                  Enforces a maximum threshold of 5 failed validation attempts, triggering a 30-second lockout window to render automated pin guessing infeasible.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-1.5">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Side-Channel Mitigation
                </h4>
                <p className="text-slate-400">
                  String equality check uses constant-time comparison <code className="text-emerald-300 font-bold">constantTimeCompare()</code> to eliminate timing side-channel leaks.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> 4. Project Author & Organization
            </h3>
            <p className="text-slate-400">
              Developed by <strong>Mohammed Zuoriki</strong> as part of the <strong>ArithMatrix Technologies Internship Assessment</strong>.
            </p>
          </section>
        </div>

        <div className="pt-4 border-t border-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-xs transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
