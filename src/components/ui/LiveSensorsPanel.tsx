'use client';

import React, { useEffect, useRef } from 'react';
import { Thermometer, Flame, Droplets, Info } from 'lucide-react';
import { gsap } from 'gsap';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { SENSORS } from '@/physics/sensors';

// Thermal tier categorization
function getThermalTier(tempC: number) {
  if (tempC >= 50.0) {
    return { label: 'Hot', color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/30', barColor: 'from-amber-500 via-orange-500 to-red-500' };
  } else if (tempC >= 32.0) {
    return { label: 'Warm', color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/30', barColor: 'from-cyan-500 via-emerald-500 to-amber-500' };
  } else {
    return { label: 'Cool', color: '#38bdf8', bg: 'bg-sky-500/10', border: 'border-sky-500/30', barColor: 'from-sky-600 to-cyan-500' };
  }
}

// Individual Sensor Card with smooth value transition & thermal gauge
const SensorCard: React.FC<{
  sensor: typeof SENSORS[0];
  tempVal: number;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ sensor, tempVal, isSelected, onSelect }) => {
  const isWater = sensor.type !== 'rod';
  const tier = getThermalTier(tempVal);
  
  // Normalized percentage for thermal level indicator bar (20°C to 70°C)
  const normPercent = Math.max(10, Math.min(100, ((tempVal - 20.0) / 50.0) * 100));

  return (
    <button
      onClick={onSelect}
      className={`group relative p-2.5 rounded-xl border transition-all duration-200 flex flex-col justify-between text-left cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10 scale-[1.02]'
          : isWater
          ? 'bg-slate-950/80 border-slate-800 hover:border-sky-600/60 hover:bg-slate-900/80'
          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
      }`}
    >
      {/* Top Row: Sensor ID + Role / Type */}
      <div className="flex items-center justify-between w-full mb-1">
        <span
          className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
            isWater
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          {sensor.id}
        </span>
        <span className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded ${tier.bg} text-[${tier.color}]`} style={{ color: tier.color }}>
          {tier.label}
        </span>
      </div>

      {/* Primary Live Temperature Reading */}
      <div className="my-1">
        <div className="text-base sm:text-lg font-black font-mono tracking-tight text-white transition-colors duration-300">
          {tempVal.toFixed(1)}
          <span className="text-xs text-slate-400 font-normal ml-0.5">°C</span>
        </div>
      </div>

      {/* Position / Location Subtitle */}
      <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between w-full border-t border-slate-800/80 pt-1 mt-0.5">
        <span className="truncate">
          {sensor.type === 'rod' 
            ? `x = ${(sensor.positionX * 100).toFixed(0)} cm` 
            : sensor.id === 'T8' 
            ? 'Water In' 
            : 'Water Out'}
        </span>
        {isWater ? (
          <Droplets className="w-2.5 h-2.5 text-sky-400 shrink-0" />
        ) : (
          <Thermometer className="w-2.5 h-2.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
        )}
      </div>

      {/* Horizontal Thermal Intensity Level Bar */}
      <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tier.barColor} transition-all duration-500`}
          style={{ width: `${normPercent}%` }}
        />
      </div>
    </button>
  );
};

export const LiveSensorsPanel: React.FC = () => {
  const { simState, selectedSensorId, setSelectedSensor } = usePhysicsStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const getSensorVal = (id: string): number => {
    const key = id.toLowerCase() as keyof typeof simState.sensors;
    return simState.sensors[key] || 20.0;
  };

  // GSAP subtle staggered entrance on mount
  useEffect(() => {
    if (!panelRef.current) return;
    const cards = panelRef.current.querySelectorAll('.sensor-card-item');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out', clearProps: 'all' }
    );
  }, []);

  // Count sensors exceeding ambient + 5°C
  const activeHeatingCount = SENSORS.filter(s => getSensorVal(s.id) > 25.0).length;

  return (
    <div ref={panelRef} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm tracking-wide text-slate-200">
            LIVE THERMOCOUPLE TELEMETRY (T1–T9)
          </h3>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Live sensor stream" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Active Heating: <strong className="text-amber-400">{activeHeatingCount}/9</strong> probes &gt; 25°C
          </span>
          <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Click probe to inspect on 3D rod
          </span>
        </div>
      </div>

      {/* 9-Column Sensor Card Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
        {SENSORS.map((sensor) => {
          const isSelected = selectedSensorId === sensor.id;
          const tempVal = getSensorVal(sensor.id);

          return (
            <div key={sensor.id} className="sensor-card-item">
              <SensorCard
                sensor={sensor}
                tempVal={tempVal}
                isSelected={isSelected}
                onSelect={() => setSelectedSensor(isSelected ? null : sensor.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
