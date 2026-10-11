import React from 'react';
import { ArithMatrixLogo } from './ArithMatrixLogo';
import { UserBrandLogo } from './UserBrandLogo';
import { BookOpen, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenDoc: () => void;
  onReplayIntro: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDoc, onReplayIntro }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#020408]/90 backdrop-blur-xl border-b border-slate-900 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Dual Brand Logos Section */}
        <div className="flex items-center gap-4">
          {/* Internship Provider Logo */}
          <ArithMatrixLogo size="md" subText="INTERNSHIP ASSESSMENT" />

          {/* Separator Divider */}
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Developer Personal Brand Logo */}
          <UserBrandLogo size="md" showText={true} />
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReplayIntro}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-950/40 hover:bg-yellow-950/80 text-yellow-300 border border-yellow-800/40 text-xs font-semibold font-mono transition-colors"
            title="Replay Password Unlock Animation"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Unlock FX</span>
          </button>

          <button
            onClick={onOpenDoc}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/50 rounded-lg transition-colors"
            title="Algorithm Specs & Security Parameters"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Docs & Specs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
