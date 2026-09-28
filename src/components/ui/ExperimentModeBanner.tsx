
import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

export const ExperimentModeBanner: React.FC = () => {
  const { experimentMode, setExperimentMode, autoSetupDemo, simState, observations } = usePhysicsStore();

  const isRealLab = experimentMode === 'REAL_LAB';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
      
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Experiment Workflow Mode
          </span>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-0.5">
            {isRealLab ? (
              <>
                <span className="text-emerald-400">🔬 Real Laboratory Session</span>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono px-2 py-0.5 rounded-full">
                  OFFICIAL EVALUATION
                </span>
              </>
            ) : (
              <>
                <span className="text-amber-400">🚀 Instant Demo & Practice Mode</span>
                <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono px-2 py-0.5 rounded-full">
                  SANDBOX / ZERO WAIT
                </span>
              </>
            )}
          </h2>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setExperimentMode('DEMO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isRealLab
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Option 1: Instant Demo
          </button>

          <button
            onClick={() => setExperimentMode('REAL_LAB')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isRealLab
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Option 2: Real Experiment
          </button>
        </div>
      </div>

      {/* Mode Details & Helper Callouts */}
      {!isRealLab ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-amber-300 block mb-0.5">
              ⚡ Instant Exploration & Fast-Forward Enabled
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Use this mode to quickly understand how the rod heats up, test different materials, fast-forward time (5x–25x), or auto-fill standard lab parameters in 1 second.
            </p>
          </div>

          <button
            onClick={autoSetupDemo}
            className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            1-Click Auto Setup Demo
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Authentic Physics Pacing (1x Real-Time) — Coursework Evaluation
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Elapsed: {Math.round(simState.timeSeconds)}s
            </span>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            In this mode, thermal diffusion follows physical timescales. You must manually operate the apparatus, wait through transient heating until steady state (<span className="text-emerald-300 font-mono">|dT/dt| &lt; 0.008 °C/s</span>), and record at least 3 notebook snapshots to unlock official submission.
          </p>

          {/* Progress Requirement Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              simState.waterFlowLmin >= 0.5 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              Flow &ge; 0.5 L/min
            </div>

            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              simState.voltage >= 4.0 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              Voltage &ge; 4.0 V
            </div>

            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              simState.steadyStateStatus === 'STEADY_STATE' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              Steady State: {simState.steadyStateStatus === 'STEADY_STATE' ? 'YES' : 'PENDING'}
            </div>

            <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 ${
              observations.length >= 3 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <CheckCircle2 className="w-3 h-3" />
              Snapshots: {observations.length}/3
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
