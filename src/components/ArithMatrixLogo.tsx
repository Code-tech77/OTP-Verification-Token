import React from 'react';

interface ArithMatrixLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subText?: string;
}

export const ArithMatrixLogo: React.FC<ArithMatrixLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  subText = 'OTP STUDIO'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Visual Logo SVG */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} bg-black rounded-lg p-1.5 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group`}>
        <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform duration-300 group-hover:scale-105">
          {/* 'A' Path */}
          <path
            d="M 25 150 L 65 30 L 95 30 L 135 150 L 102 150 L 91 115 L 53 115 L 43 150 Z M 60 90 L 84 90 L 72 52 Z"
            fill="#FFFFFF"
          />
          {/* 'I' Path */}
          <rect x="145" y="30" width="28" height="120" rx="3" fill="#FFFFFF" />
          
          {/* Subscript 'X' with diagonal striped pattern (Emerald / Teal) */}
          <g>
            {/* Diagonal stroke lines for top-left to bottom-right */}
            <line x1="172" y1="110" x2="198" y2="148" stroke="#00dc82" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="168" y1="115" x2="194" y2="153" stroke="#00dc82" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="176" y1="105" x2="202" y2="143" stroke="#00dc82" strokeWidth="3.5" strokeLinecap="round" />

            {/* Diagonal stroke lines for bottom-left to top-right */}
            <line x1="172" y1="148" x2="198" y2="110" stroke="#00dc82" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="168" y1="143" x2="194" y2="105" stroke="#00dc82" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="176" y1="153" x2="202" y2="115" stroke="#00dc82" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className={`font-black tracking-tight text-white leading-none ${textSizes[size]} flex items-center gap-1.5`}>
            <span>ArithMatrix</span>
            <span className="text-emerald-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
              TECH
            </span>
          </div>
          {subText && (
            <span className="text-[10px] font-mono tracking-widest text-emerald-400/90 font-semibold uppercase mt-0.5">
              {subText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
