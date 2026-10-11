import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Terminal } from 'lucide-react';
import { UserBrandLogo } from './UserBrandLogo';

interface UnlockIntroAnimationProps {
  onComplete: () => void;
}

export const UnlockIntroAnimation: React.FC<UnlockIntroAnimationProps> = ({ onComplete }) => {
  const [displayText, setDisplayText] = useState<string>('0x7F9A3B... [LOCKED]');
  const [stage, setStage] = useState<'LOCK' | 'DECRYPTING' | 'UNLOCKED'>('LOCK');
  const [progress, setProgress] = useState<number>(0);

  const hashChars = '0123456789ABCDEFabcdef#@$%&*!?';

  useEffect(() => {
    let frame = 0;
    const totalFrames = 25;

    // Stage 1: Decrypting Hash Scramble
    setStage('DECRYPTING');

    const scrambleInterval = setInterval(() => {
      frame++;
      const currentProg = Math.min(100, Math.floor((frame / totalFrames) * 100));
      setProgress(currentProg);

      if (frame < totalFrames - 5) {
        let randomHash = '0x';
        for (let i = 0; i < 16; i++) {
          randomHash += hashChars.charAt(Math.floor(Math.random() * hashChars.length));
        }
        setDisplayText(`${randomHash} [DECRYPTING...]`);
      } else {
        setDisplayText('0x00DC82... [KEY UNLOCKED]');
        setStage('UNLOCKED');
      }

      if (frame >= totalFrames) {
        clearInterval(scrambleInterval);
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, 60);

    return () => clearInterval(scrambleInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#020408] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      {/* Background Matrix Grid */}
      <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute w-96 h-96 bg-yellow-500/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Intro Card */}
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-950/90 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 text-center space-y-6 relative backdrop-blur-xl animate-emerald-pulse">
        {/* Dual Brand Header in Intro */}
        <div className="flex items-center justify-center gap-4 pb-4 border-b border-slate-900">
          <UserBrandLogo size="md" showText={false} />
          <div className="w-px h-6 bg-slate-800" />
          <span className="font-extrabold text-sm text-white tracking-wide">
            ArithMatrix <span className="text-emerald-400">OTP Studio</span>
          </span>
        </div>

        {/* Lock / Unlock Glowing Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className={`w-full h-full rounded-2xl flex items-center justify-center border transition-all duration-500 ${
            stage === 'UNLOCKED'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-xl shadow-emerald-500/30 scale-110'
              : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 shadow-xl shadow-yellow-500/20'
          }`}>
            {stage === 'UNLOCKED' ? (
              <Unlock className="w-10 h-10 stroke-[2.5] animate-bounce" />
            ) : (
              <Lock className="w-10 h-10 stroke-[2.5]" />
            )}
          </div>
        </div>

        {/* Hashed Scramble Terminal */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>HASHED PASSWORD DECRYPTOR</span>
          </div>

          <div className="p-3 bg-[#030508] rounded-xl border border-slate-800 font-mono text-sm tracking-widest text-emerald-300 shadow-inner">
            {displayText}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-yellow-400 to-emerald-400 h-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>HASH KEY: HMAC-SHA256</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="text-xs text-slate-500 hover:text-slate-300 font-mono underline transition-colors"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
