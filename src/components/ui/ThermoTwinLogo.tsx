
import React from 'react';

interface ThermoTwinLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const ThermoTwinLogo: React.FC<ThermoTwinLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconDimensions = {
    sm: { box: 'w-8 h-8', svg: 22, text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', svg: 26, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', svg: 32, text: 'text-2xl', sub: 'text-xs' }
  }[size];

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Modern Scientific Thermal Icon Mark */}
      <div className={`relative ${iconDimensions.box} rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:border-amber-500/60 group-hover:shadow-amber-500/25 transition-all duration-300`}>
        {/* Subtle Ambient Radial Heat Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-500/10 blur-sm group-hover:blur-md transition-all opacity-80" />

        <svg
          width={iconDimensions.svg}
          height={iconDimensions.svg}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Heat Flux Gradient */}
            <linearGradient id="heatFluxGradient" x1="2" y1="16" x2="30" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Twin Thermal Wave Gradient */}
            <linearGradient id="twinWaveGradient" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Conduction Rod Axis Line (1D Heat Flux Arrow) */}
          <line
            x1="4"
            y1="16"
            x2="28"
            y2="16"
            stroke="url(#heatFluxGradient)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="2 1.5"
          />

          {/* Dual Thermal Sine Waves (Heat Propagation + Digital Twin Duality) */}
          <path
            d="M 4,16 Q 10,6 16,16 Q 22,26 28,16"
            fill="none"
            stroke="url(#twinWaveGradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 4,16 Q 10,26 16,16 Q 22,6 28,16"
            fill="none"
            stroke="#fb923c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />

          {/* Central Radiant Hot Core Node */}
          <circle cx="16" cy="16" r="3" fill="#fbbf24" />
          <circle cx="16" cy="16" r="1.5" fill="#ffffff" />

          {/* Cold Sink & Hot Source Boundary Nodes */}
          <circle cx="5" cy="16" r="2" fill="#ef4444" />
          <circle cx="27" cy="16" r="2" fill="#38bdf8" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight ${iconDimensions.text} leading-tight`}>
          <span className="text-white">Thermo</span>
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">Twin</span>
          <span className="text-[11px] font-mono text-amber-500/80 font-bold ml-1 px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 align-top">
            3D
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-mono text-slate-400 tracking-wider uppercase ${iconDimensions.sub} -mt-0.5`}>
            Virtual Thermal Lab
          </span>
        )}
      </div>
    </div>
  );
};
