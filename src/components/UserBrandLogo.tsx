import React from 'react';

interface UserBrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const UserBrandLogo: React.FC<UserBrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Globe Keyhole Cyber SVG Logo */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]} bg-black rounded-lg p-1 border border-yellow-500/30 shadow-lg shadow-yellow-500/10 group`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform duration-300 group-hover:scale-105">
          {/* Globe Outer Circle */}
          <circle cx="50" cy="50" r="42" stroke="#facc15" strokeWidth="3" />
          
          {/* Latitude Lines */}
          <ellipse cx="50" cy="50" rx="42" ry="24" stroke="#facc15" strokeWidth="2.5" strokeDasharray="none" />
          <ellipse cx="50" cy="50" rx="42" ry="36" stroke="#facc15" strokeWidth="2" opacity="0.6" />

          {/* Longitude Lines */}
          <ellipse cx="50" cy="50" rx="24" ry="42" stroke="#facc15" strokeWidth="2.5" />
          <line x1="50" y1="8" x2="50" y2="92" stroke="#facc15" strokeWidth="3" />
          <line x1="8" y1="50" x2="92" y2="50" stroke="#facc15" strokeWidth="3" />

          {/* Network Node Dots */}
          <circle cx="50" cy="8" r="3.5" fill="#facc15" />
          <circle cx="50" cy="92" r="3.5" fill="#facc15" />
          <circle cx="8" cy="50" r="3.5" fill="#facc15" />
          <circle cx="92" cy="50" r="3.5" fill="#facc15" />
          <circle cx="20" cy="26" r="3" fill="#facc15" />
          <circle cx="80" cy="26" r="3" fill="#facc15" />
          <circle cx="20" cy="74" r="3" fill="#facc15" />
          <circle cx="80" cy="74" r="3" fill="#facc15" />
          <circle cx="26" cy="50" r="3" fill="#facc15" />
          <circle cx="74" cy="50" r="3" fill="#facc15" />

          {/* Center Keyhole */}
          <g transform="translate(50, 50)">
            <path
              d="M 0 -11 C -4 -11 -7 -8 -7 -4 C -7 -1 -5 1.5 -3 3 L -4 11 C -4 12 -3 13 -2 13 L 2 13 C 3 13 4 12 4 11 L 3 3 C 5 1.5 7 -1 7 -4 C 7 -8 4 -11 0 -11 Z"
              fill="#000000"
              stroke="#facc15"
              strokeWidth="2.5"
            />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-xs tracking-wider text-yellow-400 font-mono uppercase">
            Mohammed Zuoriki
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            @Code-tech77
          </span>
        </div>
      )}
    </div>
  );
};
