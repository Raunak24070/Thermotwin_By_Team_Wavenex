import React from 'react';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { SENSORS } from '@/physics/sensors';

interface LiveTelemetryInspectorProps {
  onQuickRecord: () => void;
}

export const LiveTelemetryInspector: React.FC<LiveTelemetryInspectorProps> = ({ onQuickRecord }) => {
  const { 
    simState, 
    sensorRates, 
    selectedSensorId, 
    setSelectedSensor, 
    observations 
  } = usePhysicsStore();

  const isSteady = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';
  const deltaTWater = Math.max(0, simState.sensors.t9 - simState.sensors.t8);
  const deltaTRod = Math.max(0, simState.sensors.t1 - simState.sensors.t7);

  // Helper to determine status and color based on dynamic rate of change
  const getSensorStatus = (key: string, rate: number, temp: number) => {
    if (temp >= 120) return { label: 'WARNING', color: '#EF4444', bg: 'bg-[#EF4444]/15' };
    if (rate > 0.02) return { label: 'HEATING', color: '#F59E0B', bg: 'bg-[#F59E0B]/15' };
    if (rate < -0.02) return { label: 'COOLING', color: '#38BDF8', bg: 'bg-[#38BDF8]/15' };
    return { label: 'STABLE', color: '#8BEA63', bg: 'bg-[#102713]' };
  };

  const sensorKeys: ('t1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 't9')[] = [
    't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'
  ];

  return (
    <aside className="w-80 bg-[#171918] border-l border-[#252825] flex flex-col justify-between h-full select-none shrink-0 overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-[#252825]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] font-mono">
              LIVE TELEMETRY &bull; T1&ndash;T9
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#8BEA63]">
            {observations.length} Logs
          </span>
        </div>
        <p className="text-[11px] text-[#7C827C] font-mono">
          Calibrated Type-K Thermocouple streaming bus.
        </p>
      </div>

      {/* Sensor Stream Body */}
      <div className="p-3 flex flex-col gap-1.5 text-xs font-mono">
        
        {/* Sensor Rows List */}
        <div className="flex flex-col gap-1">
          {sensorKeys.map((key) => {
            const sensorDef = SENSORS.find((s) => s.id.toLowerCase() === key);
            const temp = simState.sensors[key] || 20.0;
            const rate = sensorRates[key] || 0.0;
            const isSelected = selectedSensorId?.toLowerCase() === key;
            const isWater = key === 't8' || key === 't9';
            const status = getSensorStatus(key, rate, temp);

            // Rate prefix
            const rateSign = rate > 0 ? `+${rate.toFixed(2)}` : `${rate.toFixed(2)}`;

            return (
              <button
                key={key}
                onClick={() => setSelectedSensor(isSelected ? null : key.toUpperCase())}
                className={`p-2 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#102713] border-[#39FF14] text-[#F5F5F5] glow-green-sm'
                    : 'bg-[#202321] border-[#252825] hover:border-[#303330] hover:bg-[#242725] text-[#B5BBB5]'
                }`}
              >
                {/* Left: ID & Location */}
                <div className="flex items-center gap-2">
                  <span className={`w-7 py-0.5 rounded text-[10px] font-black text-center border font-mono ${
                    isWater
                      ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
                      : 'bg-[#111312] text-[#F5F5F5] border-[#303330]'
                  }`}>
                    {key.toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#7C827C] leading-none">
                      {isWater ? (key === 't8' ? 'Water In' : 'Water Out') : `${(sensorDef?.positionX || 0) * 100} cm`}
                    </span>
                  </div>
                </div>

                {/* Center: Live Temperature */}
                <div className="text-right flex flex-col items-end">
                  <span className="font-extrabold text-sm text-[#F5F5F5] font-mono leading-none">
                    {temp.toFixed(1)}&deg;C
                  </span>
                  <span className="text-[10px] text-[#7C827C] font-mono leading-tight flex items-center gap-0.5">
                    {rate > 0.02 ? (
                      <TrendingUp className="w-2.5 h-2.5 text-[#F59E0B]" />
                    ) : rate < -0.02 ? (
                      <TrendingDown className="w-2.5 h-2.5 text-[#38BDF8]" />
                    ) : (
                      <Minus className="w-2.5 h-2.5 text-[#8BEA63]" />
                    )}
                    <span>{rateSign}&deg;C/s</span>
                  </span>
                </div>

                {/* Right: Status Pill */}
                <div className="w-18 flex justify-end">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider ${status.bg}`}
                    style={{ color: status.color }}
                  >
                    &bull; {status.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Aggregate Derived Telemetry Metrics */}
        <div className="p-3 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-2 mt-2">
          <span className="text-[10px] text-[#7C827C] uppercase tracking-wider font-semibold">
            DERIVED GRADIENTS &amp; TRANSPORT
          </span>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-[#171918] border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">Gradient |dT/dx|</span>
              <span className="text-xs font-bold text-[#38BDF8]">{simState.tempGradient.toFixed(1)} &deg;C/m</span>
            </div>

            <div className="p-2 rounded-lg bg-[#171918] border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">Max Drift Rate</span>
              <span className={`text-xs font-bold ${isSteady ? 'text-[#39FF14]' : 'text-[#F59E0B]'}`}>
                {simState.rateOfChangeMax.toFixed(3)} &deg;C/s
              </span>
            </div>

            <div className="p-2 rounded-lg bg-[#171918] border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">&Delta;T Rod (T1-T7)</span>
              <span className="text-xs font-bold text-[#E8ECE8]">{deltaTRod.toFixed(1)} &deg;C</span>
            </div>

            <div className="p-2 rounded-lg bg-[#171918] border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">&Delta;T Water (T9-T8)</span>
              <span className="text-xs font-bold text-[#38BDF8]">{deltaTWater.toFixed(2)} &deg;C</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Quick Action */}
      <div className="p-3 border-t border-[#252825] bg-[#111312] flex flex-col gap-1.5">
        <button
          onClick={onQuickRecord}
          className="w-full py-2 px-3 rounded-xl bg-[#202321] hover:bg-[#242725] border border-[#303330] hover:border-[#39FF14]/50 text-[#F5F5F5] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>Record Snapshot Row</span>
        </button>
      </div>

    </aside>
  );
};
