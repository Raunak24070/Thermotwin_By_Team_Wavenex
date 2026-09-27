'use client';

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from 'recharts';
import { Activity, TrendingDown, Info } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

// Scientific sensor color palette — matches 3D apparatus sensor colors
const SENSOR_COLORS: Record<string, string> = {
  t1: '#f59e0b', // amber  — hottest (heater junction)
  t2: '#fb923c', // orange
  t3: '#ef4444', // red
  t4: '#a855f7', // purple
  t5: '#10b981', // emerald
  t6: '#3b82f6', // blue
  t7: '#06b6d4', // cyan — coolest rod sensor
  t8: '#0ea5e9', // sky — inlet water
  t9: '#8b5cf6', // violet — outlet water
};

// Custom tooltip styled for lab data
const LabTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 shadow-2xl text-[11px] font-mono">
      <div className="text-slate-400 mb-1.5 font-semibold">t = {label}s</div>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-bold text-white">{entry.value?.toFixed(2)}°C</span>
        </div>
      ))}
    </div>
  );
};

const SpatialTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 shadow-2xl text-[11px] font-mono">
      <div className="text-slate-400 mb-1">x = {label}</div>
      <div className="font-bold text-amber-400">{payload[0]?.value?.toFixed(2)} °C</div>
    </div>
  );
};

export const TemperatureGraph: React.FC = () => {
  const { chartDataHistory, simState } = usePhysicsStore();
  const [chartType, setChartType] = useState<'time' | 'spatial'>('time');
  const [visibleSensors, setVisibleSensors] = useState<Record<string, boolean>>({
    t1: true, t3: true, t5: true, t7: true, t8: true, t9: false
  });

  const toggleSensor = (key: string) => {
    setVisibleSensors(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Prepare spatial gradient data — real physics values, no fabrication
  const spatialData = useMemo(() => [
    { x: '5 cm',  temp: Number(simState.sensors.t1.toFixed(2)) },
    { x: '10 cm', temp: Number(simState.sensors.t2.toFixed(2)) },
    { x: '15 cm', temp: Number(simState.sensors.t3.toFixed(2)) },
    { x: '20 cm', temp: Number(simState.sensors.t4.toFixed(2)) },
    { x: '25 cm', temp: Number(simState.sensors.t5.toFixed(2)) },
    { x: '30 cm', temp: Number(simState.sensors.t6.toFixed(2)) },
    { x: '35 cm', temp: Number(simState.sensors.t7.toFixed(2)) },
  ], [simState.sensors]);

  // Y-axis domain with slight padding for better graph readability
  const timeYDomain = useMemo(() => {
    if (chartDataHistory.length < 2) return [19, 30];
    let min = Infinity, max = -Infinity;
    chartDataHistory.forEach(d => {
      ['t1','t2','t3','t4','t5','t6','t7','t8','t9'].forEach(k => {
        const v = (d as any)[k];
        if (v !== undefined) { if (v < min) min = v; if (v > max) max = v; }
      });
    });
    return [Math.floor(min - 1), Math.ceil(max + 1)];
  }, [chartDataHistory]);

  const dataPointCount = chartDataHistory.length;
  const hasData = dataPointCount > 2;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl flex flex-col gap-3 h-[420px]">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm tracking-wide text-slate-200">
            {chartType === 'time'
              ? 'TEMPERATURE vs TIME — T1 to T9 Transient Curves'
              : 'SPATIAL GRADIENT — T(x) Along Rod Length'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Data point count badge */}
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            {hasData ? `${dataPointCount} pts` : 'No data — start experiment'}
          </span>

          {/* Chart type toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setChartType('time')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                chartType === 'time'
                  ? 'bg-emerald-500/90 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              T vs Time
            </button>
            <button
              onClick={() => setChartType('spatial')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                chartType === 'spatial'
                  ? 'bg-amber-500/90 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              T(x) Gradient
            </button>
          </div>
        </div>
      </div>

      {/* Sensor visibility toggles (only for time chart) */}
      {chartType === 'time' && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500 mr-1">Toggle:</span>
          {[
            { key: 't1', label: 'T1 (5cm)' },
            { key: 't3', label: 'T3 (15cm)' },
            { key: 't5', label: 'T5 (25cm)' },
            { key: 't7', label: 'T7 (35cm)' },
            { key: 't8', label: 'T8 In' },
            { key: 't9', label: 'T9 Out' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleSensor(key)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                visibleSensors[key]
                  ? 'border-transparent text-slate-900 font-bold'
                  : 'border-slate-700 text-slate-500 bg-transparent'
              }`}
              style={visibleSensors[key] ? { backgroundColor: SENSOR_COLORS[key] } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Chart Canvas */}
      <div className="w-full flex-1 min-h-0">
        {!hasData && chartType === 'time' ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
            <Info className="w-8 h-8 opacity-40" />
            <span className="text-xs font-mono">Set voltage &gt; 0 V and click <strong className="text-slate-300">Start Experiment</strong> to begin recording</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'time' ? (
              <LineChart data={chartDataHistory} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  domain={timeYDomain}
                  label={{ value: 'T (°C)', angle: -90, position: 'insideLeft', offset: 14, fill: '#475569', fontSize: 10, fontFamily: 'monospace' }}
                />
                {/* Ambient reference line */}
                <ReferenceLine y={20} stroke="#334155" strokeDasharray="3 6" label={{ value: 'T_amb', fill: '#475569', fontSize: 9, position: 'right' }} />
                <Tooltip content={<LabTooltip />} />

                {visibleSensors.t1 && <Line isAnimationActive={true} animationDuration={300} type="monotone" dataKey="t1" stroke={SENSOR_COLORS.t1} dot={false} strokeWidth={2} name="T1 (5cm)" />}
                {visibleSensors.t3 && <Line isAnimationActive={true} animationDuration={300} type="monotone" dataKey="t3" stroke={SENSOR_COLORS.t3} dot={false} strokeWidth={1.5} name="T3 (15cm)" />}
                {visibleSensors.t5 && <Line isAnimationActive={true} animationDuration={300} type="monotone" dataKey="t5" stroke={SENSOR_COLORS.t5} dot={false} strokeWidth={1.5} name="T5 (25cm)" />}
                {visibleSensors.t7 && <Line isAnimationActive={true} animationDuration={300} type="monotone" dataKey="t7" stroke={SENSOR_COLORS.t7} dot={false} strokeWidth={2} name="T7 (35cm)" />}
                {visibleSensors.t8 && <Line isAnimationActive={true} animationDuration={300} type="monotone" dataKey="t8" stroke={SENSOR_COLORS.t8} dot={false} strokeWidth={1} strokeDasharray="4 3" name="T8 Inlet" />}
                {visibleSensors.t9 && <Line isAnimationActive={true} animationDuration={300} type="monotone" dataKey="t9" stroke={SENSOR_COLORS.t9} dot={false} strokeWidth={1} strokeDasharray="4 3" name="T9 Outlet" />}
              </LineChart>
            ) : (
              <LineChart data={spatialData} margin={{ top: 10, right: 20, left: -6, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
                <XAxis
                  dataKey="x"
                  stroke="#475569"
                  tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  label={{ value: 'Position along rod (cm)', position: 'insideBottomRight', offset: -8, fill: '#475569', fontSize: 10 }}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  domain={['auto', 'auto']}
                  label={{ value: 'T (°C)', angle: -90, position: 'insideLeft', offset: 12, fill: '#475569', fontSize: 10 }}
                />
                <ReferenceLine y={20} stroke="#334155" strokeDasharray="3 6" label={{ value: 'Amb.', fill: '#475569', fontSize: 9, position: 'left' }} />
                <Tooltip content={<SpatialTooltip />} />
                <Line
                  isAnimationActive={true}
                  animationDuration={500}
                  type="monotone"
                  dataKey="temp"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 7, fill: '#fb923c' }}
                  name="Temperature (°C)"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer: spatial gradient reading */}
      {chartType === 'spatial' && (
        <div className="text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-2 flex items-center justify-between">
          <span>Gradient |dT/dx| = <strong className="text-amber-400">{simState.tempGradient?.toFixed(1)} °C/m</strong></span>
          <span>k (Fourier) = <strong className={simState.calculatedK ? 'text-emerald-400' : 'text-slate-500'}>
            {simState.calculatedK ? `${simState.calculatedK.toFixed(2)} W/(m·K)` : '— (steady state required)'}
          </strong></span>
        </div>
      )}
    </div>
  );
};
