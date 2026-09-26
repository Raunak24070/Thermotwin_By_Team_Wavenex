'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Sparkles, 
  StopCircle, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

export const ApparatusToolbar: React.FC = () => {
  const { 
    runStatus, 
    startExperiment, 
    pauseExperiment, 
    stopExperiment, 
    resetSimulation,
    experimentMode,
    demoStatus,
    demoStepDescription,
    demoStepIndex,
    startAutomatedDemo,
    cancelAutomatedDemo,
    simState
  } = usePhysicsStore();

  const isDemo = experimentMode === 'DEMO';
  const isDemoRunning = demoStatus === 'RUNNING';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-2.5">
      
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Experiment Status Badge */}
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full animate-ping" style={{
              backgroundColor: runStatus === 'RUNNING' ? '#10b981' : runStatus === 'PAUSED' ? '#f59e0b' : '#ef4444'
            }} />
            Status:
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
            runStatus === 'RUNNING'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : runStatus === 'PAUSED'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : runStatus === 'STOPPED'
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {isDemoRunning ? 'AUTOMATED DEMO' : runStatus}
          </span>

          <span className="text-[11px] font-mono text-slate-400 border-l border-slate-800 pl-2">
            P = {simState.power.toFixed(1)}W &bull; Flow = {simState.waterFlowLmin.toFixed(2)}L/min
          </span>
        </div>

        {/* Right: Master Execution Controls */}
        <div className="flex items-center gap-1.5">
          
          {/* Start / Resume Button */}
          {runStatus !== 'RUNNING' ? (
            <button
              onClick={startExperiment}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {runStatus === 'PAUSED' ? 'Resume Lab' : 'Start Experiment'}
            </button>
          ) : (
            <button
              onClick={pauseExperiment}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause Lab
            </button>
          )}

          {/* Emergency Stop Button */}
          <button
            onClick={stopExperiment}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Emergency Power Cutoff: Sets heater voltage to 0.0V immediately"
          >
            <Square className="w-3 h-3 fill-current" />
            Stop / Power Cutoff
          </button>

          {/* Reset Button */}
          <button
            onClick={resetSimulation}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
            title="Reset apparatus to 20°C room temperature"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

        </div>

      </div>

      {/* Demo Automated Playback Bar (Visible in Demo Mode) */}
      {isDemo && (
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-lg p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-300">
                {isDemoRunning ? 'Automated Walkthrough in Progress' : 'Automated 1-Click Guided Demo'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isDemoRunning 
                  ? demoStepDescription 
                  : 'Runs the whole experiment automatically from specimen selection to final Fourier k.'
                }
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isDemoRunning ? (
              <div className="flex items-center gap-2">
                {/* Progress Dots */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all ${
                        demoStepIndex >= i ? 'bg-amber-400 scale-110' : 'bg-slate-800'
                      }`} 
                    />
                  ))}
                </div>

                <button
                  onClick={cancelAutomatedDemo}
                  className="px-3 py-1 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs rounded border border-slate-700 font-semibold transition-all"
                >
                  Cancel Demo
                </button>
              </div>
            ) : (
              <button
                onClick={startAutomatedDemo}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Instant Demo
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
