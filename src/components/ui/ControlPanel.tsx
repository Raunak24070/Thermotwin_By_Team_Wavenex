'use client';

import React from 'react';
import { 
  Zap, 
  Droplets, 
  Layers, 
  Eye, 
  RotateCcw, 
  Sliders,
  Flame,
  ShieldAlert,
  Gauge,
  FastForward
} from 'lucide-react';
import { usePhysicsStore, ViewMode } from '@/store/usePhysicsStore';
import { MATERIALS } from '@/physics/materials';
import { MaterialId } from '@/physics/types';

export const ControlPanel: React.FC = () => {
  const {
    simState,
    viewMode,
    simSpeed,
    experimentMode,
    setVoltage,
    setWaterFlow,
    setMaterial,
    setViewMode,
    setSimSpeed,
    fastForwardToSteadyState,
    resetSimulation
  } = usePhysicsStore();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl flex flex-col gap-5">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm tracking-wide text-slate-200">
            APPARATUS CONTROLS
          </h3>
        </div>
        <button
          onClick={resetSimulation}
          className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700/80 flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset Lab
        </button>
      </div>

      {/* 1. Material Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Metallic Rod Material
          </span>
          <span className="font-mono text-[11px] text-amber-400">
            k = {simState.material.thermalConductivity} W/(m·K)
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(MATERIALS) as MaterialId[]).map((matId) => {
            const mat = MATERIALS[matId];
            const isSelected = simState.material.id === matId;
            return (
              <button
                key={matId}
                onClick={() => setMaterial(matId)}
                className={`p-2 rounded-lg text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/30 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full border border-slate-700"
                  style={{ backgroundColor: mat.colorHex }}
                />
                <span>{mat.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Electrical Heater Voltage Controller */}
      <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Electrical Heater Voltage
          </span>
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-sm">
            {simState.voltage.toFixed(1)} V
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="12"
          step="0.5"
          value={simState.voltage}
          onChange={(e) => setVoltage(parseFloat(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="grid grid-cols-3 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
          <div>I = {simState.current.toFixed(2)} A</div>
          <div className="text-center">R = {simState.resistance} Ω</div>
          <div className="text-right text-emerald-400 font-bold">P = {simState.power.toFixed(1)} W</div>
        </div>
      </div>

      {/* 3. Water Cooling Flow Controller */}
      <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Cooling Water Flow Rate
          </span>
          <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-sm">
            {simState.waterFlowLmin.toFixed(2)} L/min
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="3.0"
          step="0.1"
          value={simState.waterFlowLmin}
          onChange={(e) => setWaterFlow(parseFloat(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
          <span>Inlet T8: {simState.sensors.t8.toFixed(1)}°C</span>
          <span className="text-cyan-300 font-bold">Outlet T9: {simState.sensors.t9.toFixed(1)}°C</span>
        </div>
      </div>

      {/* 4. 3D View Mode Switcher */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          3D Visualization Mode
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['normal', 'thermal', 'cutaway'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                viewMode === mode
                  ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Simulation Speed & Fast-Forward to Steady State */}
      <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            Simulation Speed
          </span>
          <span className="font-mono text-[11px] text-amber-400 font-bold">
            {simSpeed}x {experimentMode === 'REAL_LAB' ? 'Lab Paced' : 'Real-Time'}
          </span>
        </label>

        {experimentMode === 'REAL_LAB' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimSpeed(speed)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    simSpeed === speed
                      ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {speed === 1 ? '1x (Physical Real-Time)' : '2x (Academic Lab)'}
                </button>
              ))}
            </div>

            <div className="mt-1 p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-[11px] text-slate-400 font-mono text-center">
              🔒 Fast-forward locked in Real Lab mode. Physical thermal diffusion active.
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 5, 10, 25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimSpeed(speed)}
                  className={`py-1 px-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                    simSpeed === speed
                      ? 'bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <button
              onClick={fastForwardToSteadyState}
              className="mt-1 w-full py-2 px-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-400" />
              ⚡ Jump Directly to Steady State
            </button>
          </>
        )}
      </div>

    </div>
  );
};
