import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  TrendingDown, 
  Maximize2, 
  Minimize2, 
  Check, 
  Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { usePhysicsStore } from '@/store/usePhysicsStore';

// Scientific sensor color palette — matches 3D apparatus sensor colors
const SENSOR_COLORS: Record<string, string> = {
  t1: '#EF4444', // Red — hot junction
  t2: '#FF6B35', // Orange-red
  t3: '#F59E0B', // Amber
  t4: '#EAB308', // Yellow
  t5: '#8BEA63', // Soft green
  t6: '#38BDF8', // Light blue
  t7: '#2563EB', // Blue — cool junction
  t8: '#0EA5E9', // Sky — Water In
  t9: '#A855F7', // Purple — Water Out
};

// Custom dark tooltip
const CustomGraphTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#171918] border border-[#303330] rounded-xl p-2.5 shadow-2xl text-[10px] font-mono">
      <div className="text-[#7C827C] mb-1 font-semibold">Sim Time: t = {label}s</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-[#B5BBB5] uppercase">{entry.name}:</span>
            <span className="font-bold text-[#F5F5F5]">{entry.value?.toFixed(1)}&deg;C</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CollapsibleGraphPanel: React.FC = () => {
  const { chartDataHistory, simState } = usePhysicsStore();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'time' | 'spatial'>('time');
  const [visibleSensors, setVisibleSensors] = useState<Record<string, boolean>>({
    t1: true, t2: false, t3: true, t4: false, t5: true, t6: false, t7: true, t8: true, t9: true
  });

  const toggleSensor = (key: string) => {
    setVisibleSensors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Spatial gradient data along rod length
  const spatialData = useMemo(() => [
    { x: '5cm (T1)',  temp: Number(simState.sensors.t1.toFixed(2)) },
    { x: '10cm (T2)', temp: Number(simState.sensors.t2.toFixed(2)) },
    { x: '15cm (T3)', temp: Number(simState.sensors.t3.toFixed(2)) },
    { x: '20cm (T4)', temp: Number(simState.sensors.t4.toFixed(2)) },
    { x: '25cm (T5)', temp: Number(simState.sensors.t5.toFixed(2)) },
    { x: '30cm (T6)', temp: Number(simState.sensors.t6.toFixed(2)) },
    { x: '35cm (T7)', temp: Number(simState.sensors.t7.toFixed(2)) },
  ], [simState.sensors]);

  const timeYDomain = useMemo(() => {
    if (chartDataHistory.length < 2) return [19, 35];
    let min = Infinity, max = -Infinity;
    chartDataHistory.forEach(d => {
      ['t1','t2','t3','t4','t5','t6','t7','t8','t9'].forEach(k => {
        const v = (d as any)[k];
        if (v !== undefined) {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      });
    });
    return [Math.max(18, Math.floor(min - 2)), Math.ceil(max + 3)];
  }, [chartDataHistory]);

  const hasData = chartDataHistory.length > 2;

  return (
    <div className="bg-[#171918] border-t border-[#252825] flex flex-col shrink-0 select-none transition-all">
      
      {/* Collapsible Bar Header */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[#252825] bg-[#111312]">
        
        {/* Left: Title & Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#39FF14]" />
            <span className="text-xs font-bold text-[#F5F5F5] font-mono tracking-wide">
              {chartType === 'time' ? 'TEMPERATURE vs TIME (T1–T9)' : 'SPATIAL GRADIENT T(x)'}
            </span>
          </div>

          <div className="flex items-center bg-[#202321] rounded-lg p-0.5 border border-[#252825] text-[10px] font-mono">
            <button
              onClick={() => setChartType('time')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                chartType === 'time' ? 'bg-[#102713] text-[#39FF14] font-bold' : 'text-[#7C827C] hover:text-[#F5F5F5]'
              }`}
            >
              Time Curve
            </button>
            <button
              onClick={() => setChartType('spatial')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                chartType === 'spatial' ? 'bg-[#102713] text-[#39FF14] font-bold' : 'text-[#7C827C] hover:text-[#F5F5F5]'
              }`}
            >
              Spatial T(x)
            </button>
          </div>
        </div>

        {/* Center: Sensor Active Toggles (Only in time mode) */}
        {chartType === 'time' && (
          <div className="hidden lg:flex items-center gap-1 font-mono text-[10px]">
            {(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'] as const).map((key) => {
              const isVis = visibleSensors[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleSensor(key)}
                  className={`px-1.5 py-0.2 rounded border transition-all cursor-pointer ${
                    isVis
                      ? 'border-transparent font-bold text-white'
                      : 'border-[#303330] text-[#555B55] opacity-40'
                  }`}
                  style={{
                    backgroundColor: isVis ? `${SENSOR_COLORS[key]}25` : 'transparent',
                    borderColor: isVis ? SENSOR_COLORS[key] : undefined
                  }}
                >
                  {key.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Expand / Minimize */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#7C827C]">
            {hasData ? `${chartDataHistory.length} pts` : 'Awaiting data'}
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded bg-[#202321] hover:bg-[#242725] text-[#B5BBB5] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse graph' : 'Expand graph'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Expanded Chart Body */}
      {isExpanded && (
        <div className="h-44 p-2 bg-[#111312] relative">
          {!hasData && chartType === 'time' ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#7C827C] font-mono text-xs gap-1">
              <Activity className="w-5 h-5 animate-pulse text-[#39FF14]" />
              <span>Starting experiment will stream live curves here...</span>
            </div>
          ) : chartType === 'time' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataHistory} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202321" />
                <XAxis 
                  dataKey="time" 
                  stroke="#555B55" 
                  tick={{ fontSize: 9, fill: '#7C827C', fontFamily: 'JetBrains Mono' }} 
                  unit="s"
                />
                <YAxis 
                  domain={timeYDomain} 
                  stroke="#555B55" 
                  tick={{ fontSize: 9, fill: '#7C827C', fontFamily: 'JetBrains Mono' }} 
                  unit="°"
                />
                <Tooltip content={<CustomGraphTooltip />} />

                {Object.keys(visibleSensors).map((key) => {
                  if (!visibleSensors[key]) return null;
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key.toUpperCase()}
                      stroke={SENSOR_COLORS[key]}
                      strokeWidth={1.75}
                      dot={false}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spatialData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#202321" />
                <XAxis 
                  dataKey="x" 
                  stroke="#555B55" 
                  tick={{ fontSize: 9, fill: '#7C827C', fontFamily: 'JetBrains Mono' }} 
                />
                <YAxis 
                  stroke="#555B55" 
                  tick={{ fontSize: 9, fill: '#7C827C', fontFamily: 'JetBrains Mono' }} 
                  unit="°"
                />
                <Tooltip 
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#171918] border border-[#303330] rounded-xl p-2 text-[10px] font-mono">
                        <div className="text-[#7C827C]">{label}</div>
                        <div className="font-bold text-[#39FF14]">{payload[0]?.value?.toFixed(1)}&deg;C</div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  name="Temperature"
                  stroke="#39FF14"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#39FF14' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

    </div>
  );
};
