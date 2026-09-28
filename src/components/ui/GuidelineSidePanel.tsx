
import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Zap, 
  Droplets, 
  Flame, 
  FileSpreadsheet, 
  Calculator, 
  Send, 
  PowerOff, 
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useClassStore } from '@/store/useClassStore';
import { useAuthStore } from '@/store/useAuthStore';
import { performFourierAnalysis } from '@/physics/fourierCalculator';

export const GuidelineSidePanel: React.FC = () => {
  const { 
    simState, 
    observations, 
    runStatus, 
    startExperiment, 
    stopExperiment, 
    setWaterFlow, 
    setVoltage, 
    recordObservation, 
    experimentMode 
  } = usePhysicsStore();

  const { submitResult, submissions } = useClassStore();
  const { currentUser } = useAuthStore();

  const isRunning = runStatus === 'RUNNING';
  const hasHeating = simState.power > 1.0;
  const hasCooling = simState.waterFlowLmin >= 0.5;
  const isSteadyState = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';
  const isReadyToRecord = simState.steadyStateStatus === 'READY_TO_RECORD';
  const hasMinObservations = observations.length >= (experimentMode === 'REAL_LAB' ? 3 : 1);

  // Analysis result
  const analysis = performFourierAnalysis(
    simState.voltage,
    simState.current,
    [
      simState.sensors.t1,
      simState.sensors.t2,
      simState.sensors.t3,
      simState.sensors.t4,
      simState.sensors.t5,
      simState.sensors.t6,
      simState.sensors.t7,
    ],
    simState.sensors.t8,
    simState.sensors.t9,
    simState.waterFlowLmin,
    simState.material.thermalConductivity,
    simState.steadyStateStatus
  );

  const hasSubmitted = submissions.some((r: any) => r.studentId === currentUser?.id);
  const isHeaterOff = simState.voltage === 0;
  const isWaterOff = simState.waterFlowLmin === 0;

  // 10-Step Laboratory Protocol
  const workflowSteps = [
    {
      num: 1,
      title: 'Start Experiment',
      desc: 'Energize lab apparatus',
      active: isRunning,
      complete: isRunning || simState.timeSeconds > 2,
      action: !isRunning ? (
        <button
          onClick={startExperiment}
          className="mt-1 w-full py-1 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer"
        >
          <Zap className="w-3 h-3 fill-current" />
          Click to Start
        </button>
      ) : null
    },
    {
      num: 2,
      title: 'Transient Heating',
      desc: 'Set Flow ≥ 1.0 L/min & Voltage ≥ 8.0 V',
      active: isRunning && !isSteadyState,
      complete: hasHeating && hasCooling,
      action: (!hasCooling || !hasHeating) ? (
        <div className="flex gap-1 mt-1">
          {!hasCooling && (
            <button
              onClick={() => setWaterFlow(1.5)}
              className="py-0.5 px-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[9px] font-bold flex-1"
            >
              Water Flow ON
            </button>
          )}
          {!hasHeating && (
            <button
              onClick={() => setVoltage(10.0)}
              className="py-0.5 px-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold flex-1"
            >
              Heater 10V ON
            </button>
          )}
        </div>
      ) : null
    },
    {
      num: 3,
      title: 'Approaching Steady State',
      desc: '|dT/dt| < 0.040 °C/s stability window',
      active: simState.steadyStateStatus === 'APPROACHING_STEADY_STATE',
      complete: isSteadyState,
      info: `Current rate: ${simState.rateOfChangeMax.toFixed(4)} °C/s`
    },
    {
      num: 4,
      title: 'Steady State Achieved',
      desc: '|dT/dt| < 0.008 °C/s confirmed',
      active: isSteadyState,
      complete: isSteadyState
    },
    {
      num: 5,
      title: 'Record Observations',
      desc: `Log timed snapshots (${observations.length}/${experimentMode === 'REAL_LAB' ? 3 : 1})`,
      active: isSteadyState && !hasMinObservations,
      complete: hasMinObservations,
      action: isSteadyState ? (
        <button
          onClick={recordObservation}
          className="mt-1 w-full py-1 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer"
        >
          <FileSpreadsheet className="w-3 h-3" />
          + Log Snapshot Row
        </button>
      ) : null
    },
    {
      num: 6,
      title: 'Fourier k Calculation',
      desc: `k_exp = ${analysis.experimentalK > 0 ? analysis.experimentalK : '—'} W/(m·K)`,
      active: hasMinObservations && !hasSubmitted,
      complete: hasMinObservations && analysis.experimentalK > 0,
      info: `Error: ${analysis.errorPercentage.toFixed(1)}% (Ref: ${analysis.referenceK})`
    },
    {
      num: 7,
      title: 'Student Submits Result',
      desc: 'Verify energy balance & submit',
      active: hasMinObservations && !hasSubmitted,
      complete: hasSubmitted,
      action: (hasMinObservations && !hasSubmitted && analysis.isValidForSubmission) ? (
        <button
          onClick={() => {
            if (!currentUser) return;
            submitResult({
              sessionId: `EXP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
              studentId: currentUser.id,
              studentName: currentUser.name,
              classId: currentUser.classId || 'class-thermo-101',
              materialId: simState.material.id,
              materialName: simState.material.name,
              voltage: Number(simState.voltage.toFixed(1)),
              current: Number(simState.current.toFixed(2)),
              power: Number(simState.power.toFixed(1)),
              waterFlowLmin: Number(simState.waterFlowLmin.toFixed(2)),
              t1: Number(simState.sensors.t1.toFixed(1)),
              t2: Number(simState.sensors.t2.toFixed(1)),
              t3: Number(simState.sensors.t3.toFixed(1)),
              t4: Number(simState.sensors.t4.toFixed(1)),
              t5: Number(simState.sensors.t5.toFixed(1)),
              t6: Number(simState.sensors.t6.toFixed(1)),
              t7: Number(simState.sensors.t7.toFixed(1)),
              t8: Number(simState.sensors.t8.toFixed(1)),
              t9: Number(simState.sensors.t9.toFixed(1)),
              tempGradient: Number(analysis.temperatureGradientCperM.toFixed(2)),
              heatInputW: Number(analysis.heatInputPowerW.toFixed(1)),
              heatRemovedWaterW: Number(analysis.waterHeatRemovalW.toFixed(1)),
              experimentalK: analysis.experimentalK,
              referenceK: analysis.referenceK,
              absoluteError: Number(Math.abs(analysis.experimentalK - analysis.referenceK).toFixed(2)),
              percentageError: analysis.errorPercentage,
              timeToSteadyStateSec: Math.round(simState.timeSeconds),
              observationCount: observations.length,
              mode: experimentMode,
              isCertifiedRealLab: experimentMode === 'REAL_LAB'
            });
          }}
          className="mt-1 w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold rounded text-[10px] flex items-center justify-center gap-1 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          Submit Official Attempt
        </button>
      ) : null
    },
    {
      num: 8,
      title: 'Save Result & Certify',
      desc: 'Result archived in student record',
      active: hasSubmitted,
      complete: hasSubmitted
    },
    {
      num: 9,
      title: 'Heater Power Cutoff',
      desc: 'Set voltage to 0.0 V (Cooldown)',
      active: hasSubmitted && !isHeaterOff,
      complete: hasSubmitted && isHeaterOff,
      action: (hasSubmitted && !isHeaterOff) ? (
        <button
          onClick={stopExperiment}
          className="mt-1 w-full py-1 px-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
        >
          <PowerOff className="w-3 h-3" />
          Heater OFF (0V)
        </button>
      ) : null
    },
    {
      num: 10,
      title: 'Water Off & Completed',
      desc: 'Quench rod to 20°C & shut valve',
      active: hasSubmitted && isHeaterOff && !isWaterOff,
      complete: hasSubmitted && isHeaterOff && isWaterOff,
      action: (hasSubmitted && isHeaterOff && !isWaterOff) ? (
        <button
          onClick={() => setWaterFlow(0)}
          className="mt-1 w-full py-1 px-2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/40 rounded text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
        >
          <Droplets className="w-3 h-3" />
          Water Valve OFF
        </button>
      ) : null
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl flex flex-col gap-3 text-slate-100 h-full">
      {/* Header */}
      <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-xs tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            LABORATORY EXPERIMENT PROTOCOL
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Standard 10-Step Heat Transfer Procedure
          </span>
        </div>
      </div>

      {/* Live Energy Balance Miniature Card */}
      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono flex flex-col gap-1">
        <span className="text-slate-400 uppercase font-bold text-[9px] flex justify-between">
          <span>Live Energy Balance</span>
          <span className="text-emerald-400">
            {simState.power > 0 
              ? `${(((analysis.waterHeatRemovalW + analysis.heatLossW) / simState.power) * 100).toFixed(0)}% Accounted` 
              : '0W'}
          </span>
        </span>
        <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800/60">
          <div>
            <span className="text-slate-500 block text-[8px]">Q_IN</span>
            <span className="font-bold text-amber-400">{simState.power.toFixed(1)}W</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[8px]">Q_WATER</span>
            <span className="font-bold text-cyan-300">{analysis.waterHeatRemovalW.toFixed(1)}W</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[8px]">Q_LOSS</span>
            <span className="font-bold text-slate-300">{analysis.heatLossW.toFixed(1)}W</span>
          </div>
        </div>
      </div>

      {/* 10-Step Interactive Workflow List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[460px] pr-1">
        {workflowSteps.map((s) => (
          <div
            key={s.num}
            className={`p-2 rounded-lg border text-xs transition-all flex flex-col gap-0.5 ${
              s.complete
                ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-200'
                : s.active
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/30'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] flex items-center gap-1.5">
                {s.complete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : s.active ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span>{s.num}. {s.title}</span>
              </span>

              {s.complete && (
                <span className="text-[9px] font-mono text-emerald-400 uppercase">DONE</span>
              )}
            </div>

            <span className="text-[10px] text-slate-400 pl-5">
              {s.desc}
            </span>

            {s.info && (
              <span className="text-[10px] font-mono text-cyan-300 pl-5">
                {s.info}
              </span>
            )}

            {s.action && (
              <div className="pl-5 pt-0.5">
                {s.action}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
