'use client';

import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, Clock, Award } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

export const SteadyStateBadge: React.FC = () => {
  const { simState } = usePhysicsStore();

  const status = simState.steadyStateStatus;
  const rate = simState.rateOfChangeMax;

  let bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
  let icon = <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
  let label = 'TRANSIENT HEATING';
  let desc = '|dT/dt| stability condition not met. Wait for thermal equilibrium.';

  if (status === 'APPROACHING_STEADY_STATE') {
    bgClass = 'bg-blue-500/10 border-blue-500/30 text-blue-300';
    icon = <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
    label = 'APPROACHING STEADY STATE';
    desc = 'Rate of temperature change slowing down (|dT/dt| < 0.040 °C/s)...';
  } else if (status === 'STEADY_STATE') {
    bgClass = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    label = 'STEADY STATE REACHED';
    desc = 'Equilibrium satisfied (|dT/dt| < 0.008 °C/s). Verifying stability window...';
  } else if (status === 'READY_TO_RECORD') {
    bgClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40';
    icon = <Award className="w-4 h-4 text-emerald-300 animate-bounce" />;
    label = 'READY TO RECORD OBSERVATIONS';
    desc = 'Thermal stability confirmed. Fourier k calculation is scientifically valid!';
  }

  return (
    <div className={`border rounded-xl p-3.5 flex items-center justify-between shadow-lg transition-all ${bgClass}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-950/40 border border-white/10">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs tracking-wider uppercase font-mono">
              {label}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-white/10">
              |dT/dt| = {rate.toFixed(4)} °C/s
            </span>
          </div>
          <p className="text-[11px] opacity-80 mt-0.5">
            {desc}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-end text-right font-mono text-xs">
        <span className="text-slate-400 text-[10px]">ENERGY BALANCE Q_in</span>
        <span className="font-bold text-amber-400">{simState.power.toFixed(1)} W</span>
      </div>
    </div>
  );
};
