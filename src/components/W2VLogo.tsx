import React from 'react';
import logoClean from '../assets/images/LOGO.jpeg';

interface W2VLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export const W2VLogo: React.FC<W2VLogoProps> = ({
  size = 'md',
  showWordmark = false,
  showTagline = false,
  theme = 'light',
  className = '',
}) => {
  const isDark = theme === 'dark';

  const imageDimensions = {
    sm: 'h-10 w-auto max-h-10',
    md: 'h-12 w-auto max-h-12',
    lg: 'h-16 w-auto max-h-16',
    xl: 'h-24 w-auto max-h-24',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official W2V Logo with Pure Crisp White Background */}
      <div className={`relative rounded-xl overflow-hidden ${isDark ? 'p-1 bg-white ring-1 ring-white/20' : ''}`}>
        <img
          src={logoClean}
          alt="W2V Waste2Value"
          className={`${imageDimensions[size]} object-contain`}
        />
      </div>

      {showWordmark && (
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-baseline gap-1 tracking-tight">
            <span
              className={`font-display font-extrabold text-xl ${
                isDark ? 'text-white' : 'text-[#0C2D21]'
              }`}
            >
              W2V
            </span>
            <span
              className={`font-display font-semibold text-xs ${
                isDark ? 'text-emerald-400' : 'text-[#166534]'
              }`}
            >
              Waste2Value
            </span>
          </div>

          {showTagline && (
            <p
              className={`mt-0.5 text-xs font-semibold tracking-tight ${
                isDark ? 'text-stone-300' : 'text-[#161A18]/75'
              }`}
            >
              Reduce Waste. Create Value.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
