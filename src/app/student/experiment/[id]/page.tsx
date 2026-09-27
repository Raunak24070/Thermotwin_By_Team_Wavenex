'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LabCanvas } from '@/components/3d/LabCanvas';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { LiveSensorsPanel } from '@/components/ui/LiveSensorsPanel';
import { TemperatureGraph } from '@/components/ui/TemperatureGraph';
import { SteadyStateBadge } from '@/components/ui/SteadyStateBadge';
import { ExperimentModeBanner } from '@/components/ui/ExperimentModeBanner';
import { ApparatusToolbar } from '@/components/ui/ApparatusToolbar';
import { LabStepGuide } from '@/components/ui/LabStepGuide';
import { ObservationTable } from '@/components/ui/ObservationTable';
import { FourierWorkbench } from '@/components/ui/FourierWorkbench';
import { GuidelineSidePanel } from '@/components/ui/GuidelineSidePanel';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useRealtimeMonitorStore } from '@/store/useRealtimeMonitorStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  FlaskConical, 
  Radio, 
  Sliders, 
  ClipboardList, 
  LineChart as ChartIcon, 
  Tablet, 
  Calculator, 
  BookOpen, 
  Layers 
} from 'lucide-react';

export default function VirtualLabExperimentPage() {
  const router = useRouter();
  const [rightTab, setRightTab] = useState<'CONTROLS' | 'GUIDELINE'>('CONTROLS');
  const [activeBottomTab, setActiveBottomTab] = useState<'GRAPHS' | 'TABLET' | 'FOURIER' | 'GUIDE' | 'ALL'>('GRAPHS');
  
  const { initSimulation, stepSimulation, simState, observations } = usePhysicsStore();
  const { updateStudentTelemetry } = useRealtimeMonitorStore();
  const { currentUser, isAuthenticated } = useAuthStore();
  
  const lastTimeRef = useRef<number>(performance.now());
  const reqAnimRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  // Initialize Physics Simulation Engine on mount
  useEffect(() => {
    initSimulation('copper');
  }, [initSimulation]);

  // Main high-frequency Physics Integration Loop
  useEffect(() => {
    if (!currentUser) return;

    const loop = (timeNow: number) => {
      const dtMs = timeNow - lastTimeRef.current;
      lastTimeRef.current = timeNow;

      const state = usePhysicsStore.getState();
      const isPaused = state.runStatus === 'PAUSED';
      const isRunning = state.runStatus === 'RUNNING';
      const isHeating = state.simState.voltage > 0;
      const hasResidualHeat = state.simState.sensors.t1 > 20.05;

      // Always advance thermal physics when running, heating, or cooling back to ambient
      if (!isPaused && (isRunning || isHeating || hasResidualHeat)) {
        const speed = state.simSpeed;
        const dtSec = Math.min(dtMs / 1000, 0.1);
        stepSimulation(dtSec * speed);
      }

      // Stream telemetry to Teacher Live Lab Monitor
      const currentSim = usePhysicsStore.getState().simState;
      updateStudentTelemetry(currentUser.id, {
        studentId: currentUser.id,
        studentName: currentUser.name,
        materialId: currentSim.material.id,
        materialName: currentSim.material.name,
        voltage: Number(currentSim.voltage.toFixed(1)),
        current: Number(currentSim.current.toFixed(2)),
        power: Number(currentSim.power.toFixed(1)),
        waterFlowLmin: Number(currentSim.waterFlowLmin.toFixed(2)),
        t1: Number(currentSim.sensors.t1.toFixed(1)),
        t2: Number(currentSim.sensors.t2.toFixed(1)),
        t3: Number(currentSim.sensors.t3.toFixed(1)),
        t4: Number(currentSim.sensors.t4.toFixed(1)),
        t5: Number(currentSim.sensors.t5.toFixed(1)),
        t6: Number(currentSim.sensors.t6.toFixed(1)),
        t7: Number(currentSim.sensors.t7.toFixed(1)),
        t8: Number(currentSim.sensors.t8.toFixed(1)),
        t9: Number(currentSim.sensors.t9.toFixed(1)),
        steadyStateStatus: currentSim.steadyStateStatus,
        isOnline: true
      });

      reqAnimRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    reqAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
    };
  }, [stepSimulation, updateStudentTelemetry, currentUser]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-1">
      
      {/* Top Header Bar — Slim & Modern */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-100 tracking-tight leading-tight">
              Virtual Laboratory &bull; Thermal Conductivity of Metal Rod
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              1D Discretized Heat Conduction &bull; Fourier's Law Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-[11px] font-mono font-semibold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="hidden sm:inline">LIVE TELEMETRY STREAM</span>
            <span className="sm:hidden">STREAMING</span>
          </div>
        </div>
      </div>

      {/* Mode Banner + Toolbar */}
      <ExperimentModeBanner />
      <ApparatusToolbar />
      <SteadyStateBadge />

      {/* Primary 3D Viewport + Control Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* 3D Apparatus Viewport */}
        <div className="lg:col-span-2 h-[420px] sm:h-[480px] w-full">
          <LabCanvas />
        </div>

        {/* Right Sidebar: Controls vs 10-Step Protocol */}
        <div className="lg:col-span-1 flex flex-col gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shadow-inner text-xs font-semibold">
            <button
              onClick={() => setRightTab('CONTROLS')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'CONTROLS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Apparatus Controls
            </button>
            <button
              onClick={() => setRightTab('GUIDELINE')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'GUIDELINE'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              10-Step Protocol
            </button>
          </div>

          {rightTab === 'CONTROLS' ? <ControlPanel /> : <GuidelineSidePanel />}
        </div>
      </div>

      {/* Thermocouple Sensors T1-T9 Live Strip */}
      <LiveSensorsPanel />

      {/* ============================================================== */}
      {/* SLEEK LIGHTWEIGHT WORKSPACE TABS (Eliminates vertical bloat)    */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3">
        {/* Workspace Tab Bar */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-lg flex-wrap gap-1.5">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setActiveBottomTab('GRAPHS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'GRAPHS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ChartIcon className="w-3.5 h-3.5" />
              <span>Real-Time Curves &amp; Gradients</span>
            </button>

            <button
              onClick={() => setActiveBottomTab('TABLET')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'TABLET'
                  ? 'bg-indigo-500 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Virtual Tablet Notebook</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                activeBottomTab === 'TABLET' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {observations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveBottomTab('FOURIER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'FOURIER'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Fourier Calculator &amp; Results</span>
              {simState.calculatedK && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  activeBottomTab === 'FOURIER' ? 'bg-amber-600 text-slate-950 font-bold' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  k={simState.calculatedK.toFixed(1)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveBottomTab('GUIDE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeBottomTab === 'GUIDE'
                  ? 'bg-slate-700 text-white shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lab Step Guide</span>
            </button>
          </div>

          {/* Show All Toggle */}
          <button
            onClick={() => setActiveBottomTab(activeBottomTab === 'ALL' ? 'GRAPHS' : 'ALL')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
              activeBottomTab === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle expanded view of all panels simultaneously"
          >
            <Layers className="w-3 h-3" />
            <span>{activeBottomTab === 'ALL' ? 'Tabbed Mode' : 'Expand All'}</span>
          </button>
        </div>

        {/* Dynamic Lightweight Workspace Body */}
        {(activeBottomTab === 'GRAPHS' || activeBottomTab === 'ALL') && (
          <div className="animate-in fade-in duration-200">
            <TemperatureGraph />
          </div>
        )}

        {(activeBottomTab === 'TABLET' || activeBottomTab === 'ALL') && (
          <div className="animate-in fade-in duration-200">
            <ObservationTable />
          </div>
        )}

        {(activeBottomTab === 'FOURIER' || activeBottomTab === 'ALL') && (
          <div className="animate-in fade-in duration-200">
            <FourierWorkbench />
          </div>
        )}

        {(activeBottomTab === 'GUIDE' || activeBottomTab === 'ALL') && (
          <div className="animate-in fade-in duration-200">
            <LabStepGuide />
          </div>
        )}
      </div>

    </div>
  );
}
