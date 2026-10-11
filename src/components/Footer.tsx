import React from 'react';
import { ArithMatrixLogo } from './ArithMatrixLogo';
import { UserBrandLogo } from './UserBrandLogo';
import { ShieldCheck, ExternalLink, Code2 } from 'lucide-react';

interface FooterProps {
  onOpenDoc: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDoc }) => {
  return (
    <footer className="bg-[#020408] border-t border-slate-900 py-8 px-4 lg:px-8 mt-auto relative overflow-hidden">
      {/* Dual ambient glow */}
      <div className="absolute -bottom-24 left-1/4 w-96 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-48 bg-yellow-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Dual Logos & Internship Context */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <ArithMatrixLogo size="sm" subText="INTERNSHIP PROJECT" />
          <div className="hidden sm:block w-px h-8 bg-slate-800" />
          <UserBrandLogo size="sm" showText={false} />
          <div>
            <p className="text-xs text-slate-300 font-semibold">
              ArithMatrix Technologies Internship Project
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Production-Grade One-Time Password Engine & Verifier
            </p>
          </div>
        </div>

        {/* Center: Developer Credit */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/90 border border-yellow-500/30 rounded-full shadow-lg shadow-yellow-500/5">
          <Code2 className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs text-slate-300">
            Developed by <strong className="text-yellow-400 font-black tracking-wide">Mohammed Zuoriki</strong>
          </span>
        </div>

        {/* Right: Social Links & Docs */}
        <div className="flex items-center gap-3">
          {/* GitHub */}
          <a
            href="https://github.com/Code-tech77"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-yellow-500/40 text-xs font-semibold transition-all group"
            title="GitHub Repository & Profile"
          >
            <svg className="w-4 h-4 fill-current group-hover:text-yellow-400 transition-colors" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-yellow-400 transition-colors" />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/mohammed-zuoriki-856133250/?isSelfProfile=true"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-yellow-500/40 text-xs font-semibold transition-all group"
            title="LinkedIn Profile"
          >
            <svg className="w-4 h-4 fill-current text-[#0a66c2] group-hover:text-yellow-400 transition-colors" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span>LinkedIn</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-yellow-400 transition-colors" />
          </a>

          {/* Documentation Modal */}
          <button
            onClick={onOpenDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
