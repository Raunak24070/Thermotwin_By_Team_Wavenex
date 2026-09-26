'use client';

import React, { useEffect, useRef } from 'react';
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
import { FlaskConical, Radio, Sliders, ClipboardList } from 'lucide-react';

export default function VirtualLabExperimentPage() {
  const router = useRouter();
  const [rightTab, setRightTab] = React.useState<'CONTROLS' | 'GUIDELINE'>('CONTROLS');
  const { initSimulation, stepSimulation } = usePhysicsStore();
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

      // Physics engine steps whenever experiment is running, heater is on, or cooling down toward ambient
      if (!isPaused && (isRunning || isHeating || hasResidualHeat)) {
        const speed = state.simSpeed || 1;
        const dtSec = Math.min(0.1, Math.max(0.005, dtMs / 1000));
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
    <div className="flex flex-col gap-6 py-2">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-black text-slate-100 tracking-tight">
              Virtual Laboratory — Thermal Conductivity of Metallic Rod
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Physics Engine: 1D Finite Difference Conduction &bull; Fourier's Law Solver
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            LIVE TELEMETRY BROADCASTING TO TEACHER
          </div>
        </div>
      </div>

      {/* Option 1: Instant Demo vs Option 2: Real Experiment Mode Selector */}
      <ExperimentModeBanner />

      {/* Unified Master Control Toolbar: Start / Pause / Stop / Instant Demo */}
      <ApparatusToolbar />

      {/* Steady State Status Indicator Banner */}
      <SteadyStateBadge />

      {/* Primary Split View: 3D Canvas (Left/Center) + Control Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 3D Viewport Area */}
        <div className="lg:col-span-2 h-[520px] w-full">
          <LabCanvas />
        </div>

        {/* Control Panel Area or Guideline Side Panel */}
        <div className="lg:col-span-1 flex flex-col gap-2.5">
          {/* Tab Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 shadow-inner">
            <button
              onClick={() => setRightTab('CONTROLS')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'CONTROLS'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Apparatus Controls
            </button>
            <button
              onClick={() => setRightTab('GUIDELINE')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                rightTab === 'GUIDELINE'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
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

      {/* Student Guided Procedure & Scientific Theory Assistant */}
      <LabStepGuide />

      {/* Thermocouple Sensors T1-T9 Grid */}
      <LiveSensorsPanel />

      {/* Dual Real-Time Line Charts & Spatial Gradient Profile */}
      <TemperatureGraph />

      {/* Fourier Law Calculations & Experiment Submission */}
      <FourierWorkbench />

      {/* Virtual Laboratory Notebook Observations Table */}
      <ObservationTable />

    </div>
  );
}
