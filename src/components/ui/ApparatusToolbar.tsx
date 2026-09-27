'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Sparkles,
  Eye,
  ClipboardCheck,
  Calculator,
  BookOpen
} from 'lucide-react';
import { gsap } from 'gsap';
import { usePhysicsStore } from '@/store/usePhysicsStore';

// Workflow step definitions — communicates the lab flow clearly to students
const WORKFLOW_STEPS = [
  { id: 1, icon: Eye,           label: '① Observe',  desc: 'Set voltage & flow, watch 3D apparatus respond' },
  { id: 2, icon: ClipboardCheck, label: '② Record',   desc: 'Log T1–T9 at steady state into notebook' },
  { id: 3, icon: Calculator,     label: '③ Calculate', desc: 'Fourier workbench computes k automatically' },
  { id: 4, icon: BookOpen,       label: '④ Submit',   desc: 'Review results & submit lab report' },
];

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

  const toolbarRef = useRef<HTMLDivElement>(null);
  const isDemo = experimentMode === 'DEMO';
  const isDemoRunning = demoStatus === 'RUNNING';

  // GSAP entrance animation on first mount
  useEffect(() => {
    if (!toolbarRef.current) return;
    gsap.fromTo(
      toolbarRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'all' }
    );
  }, []);

  // Determine current workflow stage based on sim state
  const steadyReached = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';
  const isRunning = runStatus === 'RUNNING';

  return (
    <div ref={toolbarRef} className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-3">
      
      {/* === STUDENT WORKFLOW PROGRESS BAR === */}
      <div className="hidden sm:flex items-center gap-1 bg-slate-950/60 rounded-lg p-2 border border-slate-800/60">
        <span className="text-[10px] font-mono font-bold text-slate-500 mr-2 shrink-0 uppercase tracking-widest">Workflow:</span>
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          // Determine if this step is currently active/done based on real state
          const isActive =
            (idx === 0 && isRunning && !steadyReached) ||
            (idx === 1 && steadyReached) ||
            (idx === 2 && steadyReached) ||
            (idx === 3 && simState.steadyStateStatus === 'READY_TO_RECORD');
          return (
            <React.Fragment key={step.id}>
              <div
                title={step.desc}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-default select-none ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-500 border border-transparent'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="hidden md:inline">{step.label}</span>
              </div>
              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className="w-4 h-px bg-slate-700 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* === CONTROLS ROW === */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Experiment Status Badge */}
        <div className="flex items-center gap-2.5">
          {/* Animated status indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: runStatus === 'RUNNING' ? '#10b981' : runStatus === 'PAUSED' ? '#f59e0b' : '#ef4444',
                boxShadow: runStatus === 'RUNNING' ? '0 0 0 0 rgba(16,185,129,0.4)' : 'none',
                animation: runStatus === 'RUNNING' ? 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite' : 'none'
              }}
            />
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
              runStatus === 'RUNNING'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : runStatus === 'PAUSED'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : runStatus === 'STOPPED'
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {isDemoRunning ? 'DEMO RUNNING' : runStatus}
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 border-l border-slate-800 pl-2.5 hidden sm:inline">
            P = <strong className={simState.power > 0 ? 'text-amber-400' : 'text-slate-500'}>{simState.power.toFixed(1)} W</strong>
            {' · '}
            Flow = <strong className={simState.waterFlowLmin > 0 ? 'text-cyan-400' : 'text-slate-500'}>{simState.waterFlowLmin.toFixed(2)} L/min</strong>
          </span>
        </div>

        {/* Right: Execution Buttons */}
        <div className="flex items-center gap-1.5">
          
          {/* Primary action: Start / Pause */}
          {runStatus !== 'RUNNING' ? (
            <button
              onClick={startExperiment}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              title={runStatus === 'PAUSED' ? 'Resume simulation' : 'Begin recording experiment data'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {runStatus === 'PAUSED' ? 'Resume' : 'Start Experiment'}
            </button>
          ) : (
            <button
              onClick={pauseExperiment}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              title="Freeze simulation — sensor values stop updating"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </button>
          )}

          {/* Emergency Stop — labeled clearly for students */}
          <button
            onClick={stopExperiment}
            className="px-3.5 py-2 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 hover:border-red-500 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Cut heater power to 0 V immediately and stop simulation"
          >
            <Square className="w-3 h-3 fill-current" />
            Stop Heater
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
            title="Reset apparatus to 20°C ambient temperature"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* === INSTANT DEMO PLAYBACK BAR (Demo Mode only) === */}
      {isDemo && (
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-lg px-3 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-amber-300">
                {isDemoRunning ? 'Auto-Demo Running…' : '1-Click Instant Demo'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {isDemoRunning 
                  ? demoStepDescription 
                  : 'Runs the full experiment automatically — material, heater, steady state, and Fourier k.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {isDemoRunning ? (
              <div className="flex items-center gap-2">
                {/* Progress bar */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all ${
                        demoStepIndex >= i ? 'bg-amber-400 w-4' : 'bg-slate-700 w-2.5'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={cancelAutomatedDemo}
                  className="px-3 py-1 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 text-xs rounded border border-slate-700 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={startAutomatedDemo}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Instant Demo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
