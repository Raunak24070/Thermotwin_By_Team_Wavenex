import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Sparkles, 
  Flame, 
  Droplets, 
  Activity, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface ExperimentPanelProps {
  onContinueToAnalyze: () => void;
  onOpenRecordModal: () => void;
  onCollapse?: () => void;
}

export const ExperimentPanel: React.FC<ExperimentPanelProps> = ({
  onContinueToAnalyze,
  onOpenRecordModal,
  onCollapse
}) => {
  const {
    simState,
    runStatus,
    simSpeed,
    demoStatus,
    demoStepDescription,
    startExperiment,
    pauseExperiment,
    stopExperiment,
    resetSimulation,
    setSimSpeed,
    setVoltage,
    setWaterFlow,
    fastForwardToSteadyState,
    startAutomatedDemo,
    cancelAutomatedDemo
  } = usePhysicsStore();

  const isRunning = runStatus === 'RUNNING';
  const isPaused = runStatus === 'PAUSED';
  const isSteady = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';
  const isDemoRunning = demoStatus === 'RUNNING';

  // Format simulation time to MM:SS
  const totalSeconds = Math.round(simState.timeSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="w-80 bg-[#171918] border-r border-[#252825] flex flex-col justify-between h-full select-none shrink-0 overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-[#252825]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] font-mono">
              02 &bull; RUN EXPERIMENT
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
              isRunning
                ? 'bg-[#102713] text-[#39FF14] border-[#163D19] glow-green-sm'
                : isPaused
                ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                : 'bg-[#202321] text-[#7C827C] border-[#303330]'
            }`}>
              {isRunning ? '● RUNNING' : isPaused ? '⏸ PAUSED' : '■ IDLE'}
            </span>
            {onCollapse && (
              <button
                onClick={onCollapse}
                className="p-1 rounded bg-[#202321] hover:bg-[#242725] text-[#7C827C] hover:text-[#39FF14] transition-colors cursor-pointer"
                title="Collapse Left Panel (◀)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-[#7C827C] font-mono">
          FDTD 50-Node Engine &bull; Explicit thermal diffusion solver.
        </p>
      </div>

      {/* Main Body */}
      <div className="p-4 flex flex-col gap-4 text-xs font-mono">
        
        {/* Simulation Clock & Solver Info */}
        <div className="p-3 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#7C827C] uppercase tracking-wider">SIMULATION TIME</span>
            <span className="text-[10px] text-[#39FF14] font-semibold">50 NODES &bull; &Delta;x=1cm</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black font-mono tracking-wider text-[#F5F5F5]">
              {timeFormatted}
              <span className="text-xs text-[#7C827C] font-normal ml-1">({totalSeconds}s)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
              <span className="text-[11px] font-bold text-[#8BEA63]">{simSpeed}x SPEED</span>
            </div>
          </div>

          {/* Speed Selector Buttons */}
          <div className="grid grid-cols-4 gap-1 pt-1 border-t border-[#252825]">
            {[1, 5, 10, 25].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                  simSpeed === spd
                    ? 'bg-[#102713] text-[#39FF14] border-[#163D19] glow-green-sm'
                    : 'bg-[#171918] text-[#7C827C] border-[#252825] hover:text-[#F5F5F5] hover:bg-[#202321]'
                }`}
              >
                {spd}&times;
              </button>
            ))}
          </div>
        </div>

        {/* Primary Simulation Controls */}
        <div className="grid grid-cols-2 gap-2">
          {isRunning ? (
            <button
              onClick={pauseExperiment}
              className="py-2.5 px-3 rounded-xl bg-[#202321] border border-[#303330] hover:border-[#F59E0B] text-[#F59E0B] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={startExperiment}
              className="py-2.5 px-3 rounded-xl bg-[#102713] border border-[#163D19] text-[#39FF14] font-bold flex items-center justify-center gap-1.5 glow-green-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-[#39FF14]" />
              <span>RESUME</span>
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="py-2.5 px-3 rounded-xl bg-[#202321] border border-[#303330] hover:border-[#7C827C] text-[#B5BBB5] hover:text-[#F5F5F5] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        {/* Fast-Forward & Automated Demo Tools */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={fastForwardToSteadyState}
            className="w-full py-2 px-3 rounded-xl bg-[#202321] border border-[#252825] hover:border-[#39FF14]/50 text-[#8BEA63] hover:text-[#39FF14] font-semibold text-[11px] flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <FastForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <span>FAST-FORWARD TO EQUILIBRIUM</span>
          </button>

          {isDemoRunning ? (
            <button
              onClick={cancelAutomatedDemo}
              className="w-full py-1.5 px-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] font-semibold text-[11px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Stop Demo Guide</span>
            </button>
          ) : (
            <button
              onClick={startAutomatedDemo}
              className="w-full py-2 px-3 rounded-xl bg-[#202321] border border-[#252825] hover:border-[#F59E0B]/50 text-[#B5BBB5] hover:text-[#F59E0B] font-semibold text-[11px] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>6-Step Instant Demo Workflow</span>
            </button>
          )}

          {isDemoRunning && demoStepDescription && (
            <div className="p-2 rounded-lg bg-[#111312] border border-[#39FF14]/30 text-[10px] text-[#8BEA63] font-mono leading-relaxed">
              {demoStepDescription}
            </div>
          )}
        </div>

        {/* Heater Parameters & Live Adjustment */}
        <div className="p-3 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              HEATER ELEMENT
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              simState.voltage > 0
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                : 'bg-[#171918] text-[#7C827C]'
            }`}>
              {simState.voltage > 0 ? '● ON' : 'OFF'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="bg-[#171918] p-1.5 rounded-lg border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">Voltage</span>
              <span className="font-bold text-[#F59E0B]">{simState.voltage.toFixed(1)} V</span>
            </div>
            <div className="bg-[#171918] p-1.5 rounded-lg border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">Current</span>
              <span className="font-bold text-[#E8ECE8]">{simState.current.toFixed(2)} A</span>
            </div>
            <div className="bg-[#171918] p-1.5 rounded-lg border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">Power (Q_in)</span>
              <span className="font-bold text-[#F59E0B]">{simState.power.toFixed(1)} W</span>
            </div>
          </div>

          {/* Quick Slider Adjustment */}
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={simState.voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full accent-[#F59E0B] cursor-pointer h-1.5 bg-[#242725] rounded-lg mt-1"
          />
        </div>

        {/* Cooling Water Parameters & Live Adjustment */}
        <div className="p-3 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#38BDF8]" />
              COOLING WATER
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              simState.waterFlowLmin > 0
                ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
                : 'bg-[#171918] text-[#7C827C]'
            }`}>
              {simState.waterFlowLmin > 0 ? '● ACTIVE' : 'STOPPED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="bg-[#171918] p-1.5 rounded-lg border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">Flow Rate</span>
              <span className="font-bold text-[#38BDF8]">{simState.waterFlowLmin.toFixed(2)} L/min</span>
            </div>
            <div className="bg-[#171918] p-1.5 rounded-lg border border-[#252825] flex flex-col">
              <span className="text-[#7C827C]">Inlet Temp</span>
              <span className="font-bold text-[#E8ECE8]">20.0 &deg;C</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={simState.waterFlowLmin}
            onChange={(e) => setWaterFlow(Number(e.target.value))}
            className="w-full accent-[#38BDF8] cursor-pointer h-1.5 bg-[#242725] rounded-lg mt-1"
          />
        </div>

      </div>

      {/* Bottom CTA to Step 03 */}
      <div className="p-4 border-t border-[#252825] bg-[#111312] flex flex-col gap-2">
        {isSteady ? (
          <button
            onClick={onOpenRecordModal}
            className="w-full py-2.5 px-3 rounded-xl bg-[#102713] border border-[#163D19] text-[#39FF14] font-bold text-xs uppercase font-mono flex items-center justify-center gap-2 glow-green-sm hover:bg-[#163D19] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
            <span>RECORD OBSERVATION</span>
          </button>
        ) : null}

        <button
          onClick={onContinueToAnalyze}
          className={`w-full py-3 px-4 rounded-xl font-black text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isSteady
              ? 'bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] shadow-lg glow-green'
              : 'bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] border border-[#303330]'
          }`}
        >
          <span>PROCEED TO ANALYZE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
