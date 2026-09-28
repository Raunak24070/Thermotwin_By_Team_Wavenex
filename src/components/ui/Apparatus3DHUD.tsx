
import React from 'react';
import { 
  X, 
  Flame, 
  Droplets, 
  Layers, 
  Thermometer, 
  Gauge, 
  Zap, 
  Sliders, 
  Check, 
  Info,
  Maximize2
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { MATERIALS } from '@/physics/materials';
import { MaterialId } from '@/physics/types';

export const Apparatus3DHUD: React.FC = () => {
  const { 
    inspectedPart, 
    setInspectedPart, 
    simState, 
    setVoltage, 
    setWaterFlow, 
    setMaterial,
    selectedSensorId,
    setSelectedSensor
  } = usePhysicsStore();

  if (!inspectedPart) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-20 bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          {inspectedPart === 'HEATER' && <Flame className="w-5 h-5 text-amber-400" />}
          {inspectedPart === 'COOLING_JACKET' && <Droplets className="w-5 h-5 text-cyan-400" />}
          {inspectedPart === 'ROD' && <Layers className="w-5 h-5 text-indigo-400" />}
          {inspectedPart === 'THERMOCOUPLES' && <Thermometer className="w-5 h-5 text-rose-400" />}
          {inspectedPart === 'METERS' && <Gauge className="w-5 h-5 text-emerald-400" />}

          <div>
            <h4 className="font-extrabold text-sm text-slate-100">
              {inspectedPart === 'HEATER' && 'Electrical Band Heater Unit'}
              {inspectedPart === 'COOLING_JACKET' && 'Cooling Water Jacket & Rotameter'}
              {inspectedPart === 'ROD' && 'Metallic Specimen Conduction Rod'}
              {inspectedPart === 'THERMOCOUPLES' && 'Thermocouple Array (T1 – T9)'}
              {inspectedPart === 'METERS' && 'Digital Measurement Instrumentation'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              3D Component Inspector & Controller
            </span>
          </div>
        </div>

        <button
          onClick={() => setInspectedPart(null)}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Part Details & Direct 3D Controls */}
      <div className="flex flex-col gap-3 text-xs">
        
        {/* 1. HEATER CONTROLS */}
        {inspectedPart === 'HEATER' && (
          <>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Provides constant electrical heat power <span className="font-mono text-amber-400 font-bold">P = V × I</span> at the rod hot boundary (<span className="font-mono">x = 0</span>). Nichrome heating element clamped securely.
            </p>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px]">VOLTAGE</span>
                <span className="font-bold text-amber-400">{simState.voltage.toFixed(1)} V</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">CURRENT</span>
                <span className="font-bold text-slate-200">{simState.current.toFixed(2)} A</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">POWER (Q_in)</span>
                <span className="font-bold text-emerald-400">{simState.power.toFixed(1)} W</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-300 flex justify-between">
                <span>Adjust Heater Voltage Directly:</span>
                <span className="font-mono text-amber-400 font-bold">{simState.voltage} V</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={simState.voltage}
                onChange={(e) => setVoltage(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </>
        )}

        {/* 2. COOLING JACKET CONTROLS */}
        {inspectedPart === 'COOLING_JACKET' && (
          <>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Maintains the cold sink at <span className="font-mono">x = L</span>. Cold tap water enters at <span className="font-mono text-cyan-300">T8</span> and exits at <span className="font-mono text-cyan-300">T9</span>, removing heat continuously.
            </p>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px]">FLOW RATE</span>
                <span className="font-bold text-cyan-400">{simState.waterFlowLmin.toFixed(2)} L/min</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">INLET T8</span>
                <span className="font-bold text-slate-200">{simState.sensors.t8.toFixed(1)}°C</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">OUTLET T9</span>
                <span className="font-bold text-cyan-300">{simState.sensors.t9.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-300 flex justify-between">
                <span>Adjust Cooling Valve Directly:</span>
                <span className="font-mono text-cyan-400 font-bold">{simState.waterFlowLmin.toFixed(2)} L/min</span>
              </label>
              <input
                type="range"
                min="0"
                max="3.0"
                step="0.1"
                value={simState.waterFlowLmin}
                onChange={(e) => setWaterFlow(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </>
        )}

        {/* 3. ROD CONTROLS */}
        {inspectedPart === 'ROD' && (
          <>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Cylindrical metallic test bar (<span className="font-mono">d = 25 mm, L = 500 mm</span>). Heat conducts longitudinally from left to right governed by <span className="font-mono text-amber-400">Q = -k · A · (dT/dx)</span>.
            </p>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-300">Switch Material Directly:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(MATERIALS) as MaterialId[]).map((matId) => {
                  const m = MATERIALS[matId];
                  const isCur = simState.material.id === matId;
                  return (
                    <button
                      key={matId}
                      onClick={() => setMaterial(matId)}
                      className={`p-1.5 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${
                        isCur
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{m.name.split(' ')[0]}</span>
                      <span className="text-[9px] font-mono text-slate-400">k={m.thermalConductivity}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 4. THERMOCOUPLE CONTROLS */}
        {inspectedPart === 'THERMOCOUPLES' && (
          <>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              9 calibrated K-type thermocouple probes. <span className="font-mono text-rose-300">T1–T7</span> measure rod temperatures at 50 mm intervals. <span className="font-mono text-cyan-300">T8 & T9</span> measure water inlet & outlet.
            </p>

            <div className="grid grid-cols-4 gap-1 font-mono text-[10px] text-center">
              {[
                { id: 'T1', v: simState.sensors.t1 },
                { id: 'T2', v: simState.sensors.t2 },
                { id: 'T3', v: simState.sensors.t3 },
                { id: 'T4', v: simState.sensors.t4 },
                { id: 'T5', v: simState.sensors.t5 },
                { id: 'T6', v: simState.sensors.t6 },
                { id: 'T7', v: simState.sensors.t7 },
                { id: 'T9', v: simState.sensors.t9 }
              ].map((s) => (
                <div key={s.id} className="bg-slate-950 p-1 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[9px]">{s.id}</span>
                  <span className="font-bold text-amber-300">{s.v.toFixed(1)}°</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 5. METERS CONTROLS */}
        {inspectedPart === 'METERS' && (
          <>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              High-precision digital multimeters recording instantaneous voltage drops and heater circuit current.
            </p>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">Voltmeter</span>
                <span className="text-base font-extrabold text-amber-400">{simState.voltage.toFixed(1)} V</span>
              </div>

              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase block">Ammeter</span>
                <span className="text-base font-extrabold text-cyan-400">{simState.current.toFixed(2)} A</span>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
};
