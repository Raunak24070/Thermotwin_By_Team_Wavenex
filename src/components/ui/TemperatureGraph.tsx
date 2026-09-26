'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Activity, TrendingDown } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { SENSOR_POSITIONS } from '@/physics/materials';

export const TemperatureGraph: React.FC = () => {
  const { chartDataHistory, simState } = usePhysicsStore();
  const [chartType, setChartType] = useState<'time' | 'spatial'>('time');

  // Prepare Spatial Gradient curve data (T vs x position along rod length)
  const spatialData = [
    { x: '5 cm', position: 0.05, temp: Number(simState.sensors.t1.toFixed(2)) },
    { x: '10 cm', position: 0.10, temp: Number(simState.sensors.t2.toFixed(2)) },
    { x: '15 cm', position: 0.15, temp: Number(simState.sensors.t3.toFixed(2)) },
    { x: '20 cm', position: 0.20, temp: Number(simState.sensors.t4.toFixed(2)) },
    { x: '25 cm', position: 0.25, temp: Number(simState.sensors.t5.toFixed(2)) },
    { x: '30 cm', position: 0.30, temp: Number(simState.sensors.t6.toFixed(2)) },
    { x: '35 cm', position: 0.35, temp: Number(simState.sensors.t7.toFixed(2)) },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl flex flex-col gap-3 h-[380px]">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm tracking-wide text-slate-200">
            {chartType === 'time' ? 'TRANSIENT TEMPERATURE CURVES (T vs TIME)' : 'THERMAL GRADIENT PROFILE T(x)'}
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setChartType('time')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              chartType === 'time'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            T vs Time
          </button>
          <button
            onClick={() => setChartType('spatial')}
            className={`px-2.5 py-1 rounded font-semibold transition-all ${
              chartType === 'spatial'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            T(x) Gradient
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full flex-1 min-h-0 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'time' ? (
            <LineChart data={chartDataHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} label={{ value: 'T (°C)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                itemStyle={{ padding: '0px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />

              <Line type="monotone" dataKey="t1" stroke="#f59e0b" dot={false} strokeWidth={2} name="T1 (5cm)" />
              <Line type="monotone" dataKey="t3" stroke="#ef4444" dot={false} strokeWidth={1.5} name="T3 (15cm)" />
              <Line type="monotone" dataKey="t5" stroke="#10b981" dot={false} strokeWidth={1.5} name="T5 (25cm)" />
              <Line type="monotone" dataKey="t7" stroke="#3b82f6" dot={false} strokeWidth={2} name="T7 (35cm)" />
              <Line type="monotone" dataKey="t8" stroke="#06b6d4" dot={false} strokeWidth={1} strokeDasharray="4 4" name="T8 (Inlet)" />
              <Line type="monotone" dataKey="t9" stroke="#8b5cf6" dot={false} strokeWidth={1} strokeDasharray="4 4" name="T9 (Outlet)" />
            </LineChart>
          ) : (
            <LineChart data={spatialData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="x" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5, fill: '#f59e0b' }}
                activeDot={{ r: 8 }}
                name="Temperature (°C)"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
