import React from 'react';
import { APP_NAME, APP_TAGLINE } from '../../config/brand';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Reusable abstract continuous-flow geometric "C" glassmorphic mark
 */
export const CadenceMark: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; onClick?: () => void; }> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
  };

  const spinnerMap = {
    sm: 'w-3 h-3 border-[1.5px]',
    md: 'w-4 h-4 border-2',
    lg: 'w-6 h-6 border-2',
    xl: 'w-8 h-8 border-4',
  };

  const [imgError, setImgError] = React.useState(false);
  
  if (!imgError) {
    return (
      <img
        src="/icon.png"
        alt="Cadence Logo"
        onError={() => setImgError(true)}
        className={`${sizeMap[size]} rounded-2xl object-cover shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.2)] ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeMap[size]} rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.4)] shrink-0 ${className}`}>
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
      <div className={`relative ${spinnerMap[size]} border-white rounded-full border-t-transparent animate-spin`} style={{ animationDuration: '3s' }}></div>
    </div>
  );
};

/**
 * Reusable full Cadence Logo with mark & typography
 */
export const CadenceLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  onClick,
}) => {
  const fontSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <CadenceMark size={size} className={onClick ? 'transition-transform duration-300 group-hover:scale-105' : ''} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`text-white uppercase ${fontSizes[size]}`}>
            {APP_NAME}
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wide text-neutral-400 -mt-0.5">
            {APP_TAGLINE}
          </span>
        )}
      </div>
    </div>
  );
};
