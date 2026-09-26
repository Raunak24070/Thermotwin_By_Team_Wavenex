'use client';

import React from 'react';
import { Thermometer, ChevronRight } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { SENSORS } from '@/physics/sensors';

export const LiveSensorsPanel: React.FC = () => {
  const { simState, selectedSensorId, setSelectedSensor } = usePhysicsStore();

  const getSensorVal = (id: string): number => {
    const key = id.toLowerCase() as keyof typeof simState.sensors;
    return simState.sensors[key] || 20.0;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-red-400" />
          <h3 className="font-bold text-sm tracking-wide text-slate-200">
            THERMOCOUPLE SENSORS T1–T9
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Click sensor to inspect position
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {SENSORS.map((sensor) => {
          const isSelected = selectedSensorId === sensor.id;
          const tempVal = getSensorVal(sensor.id);
          const isWater = sensor.type !== 'rod';

          return (
            <button
              key={sensor.id}
              onClick={() => setSelectedSensor(isSelected ? null : sensor.id)}
              className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-between text-center ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 scale-105 shadow-lg'
                  : isWater
                  ? 'bg-blue-950/40 border-blue-900/60 text-blue-200 hover:border-blue-700'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isWater ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {sensor.id}
              </span>

              <span className="text-sm font-extrabold font-mono my-1 tracking-tight">
                {tempVal.toFixed(1)}°C
              </span>

              <span className="text-[9px] font-mono text-slate-500 truncate w-full">
                {sensor.type === 'rod' ? `${(sensor.positionX * 100).toFixed(0)}cm` : sensor.id === 'T8' ? 'Inlet' : 'Outlet'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
