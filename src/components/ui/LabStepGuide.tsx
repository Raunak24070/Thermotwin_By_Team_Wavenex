
import React, { useState } from 'react';
import { 
  Compass, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle, 
  HelpCircle, 
  Lightbulb, 
  ArrowRight,
  Droplets,
  Zap,
  Layers,
  Activity,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface GuideStep {
  number: number;
  title: string;
  shortDesc: string;
  scientificWhy: string;
  actionText?: string;
  isComplete: (simState: any, obs: any[]) => boolean;
  onApplyAction?: () => void;
}

export const LabStepGuide: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { 
    simState, 
    observations, 
    guideStep, 
    setGuideStep,
    setMaterial,
    setWaterFlow,
    setVoltage,
    fastForwardToSteadyState,
    recordObservation,
    experimentMode
  } = usePhysicsStore();

  const steps: GuideStep[] = [
    {
      number: 1,
      title: 'Select Metallic Specimen',
      shortDesc: 'Choose Copper, Aluminium, or Stainless Steel rod.',
      scientificWhy: 'Different metals possess distinct crystal lattice structures and free electron densities, leading to vastly different thermal conductivities (Copper: 385 W/m·K vs Steel: 50.2 W/m·K).',
      actionText: 'Choose Copper Specimen',
      isComplete: (sim) => Boolean(sim.material.id),
      onApplyAction: () => setMaterial('copper')
    },
    {
      number: 2,
      title: 'Initiate Cold Water Circulation',
      shortDesc: 'Adjust water flow to 1.0 – 1.5 L/min at the cooling jacket.',
      scientificWhy: 'Heat transfer requires a thermal sink. Circulating water at the cold end continuously extracts heat (Q_water = m_dot · Cp · ΔT), creating the driving temperature difference across the rod.',
      actionText: 'Set Flow to 1.50 L/min',
      isComplete: (sim) => sim.waterFlowLmin >= 0.5,
      onApplyAction: () => setWaterFlow(1.5)
    },
    {
      number: 3,
      title: 'Energize Electrical Band Heater',
      shortDesc: 'Adjust heater voltage to 8.0 – 10.0 V (Heat Power = 15 – 25 W).',
      scientificWhy: 'Fourier conduction requires continuous heat energy input (P = V · I = V²/R). Heat enters at x = 0 and diffuses down the rod length towards the cooling jacket.',
      actionText: 'Set Voltage to 10.0 V',
      isComplete: (sim) => sim.voltage >= 4.0,
      onApplyAction: () => setVoltage(10.0)
    },
    {
      number: 4,
      title: 'Reach Steady-State Equilibrium',
      shortDesc: 'Wait until the thermal gradient stabilizes (|dT/dt| < 0.008 °C/s).',
      scientificWhy: 'In transient phase, heat is absorbed to raise the rod temperature (internal energy storage). Fourier\'s 1D law Q = -k·A·(dT/dx) strictly applies only in steady state when energy storage becomes zero.',
      actionText: experimentMode === 'DEMO' ? '⚡ Jump to Steady State' : undefined,
      isComplete: (sim) => sim.steadyStateStatus === 'STEADY_STATE',
      onApplyAction: experimentMode === 'DEMO' ? () => fastForwardToSteadyState() : undefined
    },
    {
      number: 5,
      title: 'Record Notebook Observations & Submit',
      shortDesc: 'Log at least 3 periodic temperature snapshots and review experimental k.',
      scientificWhy: 'Recording multiple readings along thermocouples T1–T7 allows linear regression to calculate the exact spatial slope (dT/dx) and compute experimental conductivity with statistical accuracy.',
      actionText: 'Record Snapshot Now',
      isComplete: (sim, obs) => obs.length >= (experimentMode === 'REAL_LAB' ? 3 : 1),
      onApplyAction: () => recordObservation()
    }
  ];

  const currentStep = steps[guideStep - 1] || steps[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      
      {/* Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none border-b border-slate-800 pb-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-500/10 text-amber-400 rounded-lg">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              STUDENT LAB PROCEDURE & SCIENTIFIC GUIDE
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Step {guideStep} of {steps.length}
              </span>
            </h3>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 font-semibold">
          {isExpanded ? (
            <>
              Hide Guide <ChevronDown className="w-4 h-4" />
            </>
          ) : (
            <>
              Show Guide <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3">
          
          {/* Step Navigation Tabs */}
          <div className="grid grid-cols-5 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {steps.map((s) => {
              const completed = s.isComplete(simState, observations);
              const isCurrent = guideStep === s.number;

              return (
                <button
                  key={s.number}
                  onClick={() => setGuideStep(s.number)}
                  className={`py-2 px-1.5 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : completed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {completed ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="font-mono text-[11px]">#{s.number}</span>
                    )}
                  </div>
                  <span className="text-[10px] truncate max-w-full">
                    {s.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Detailed Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex flex-col gap-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Step {currentStep.number}: {currentStep.title}
                </span>
                {currentStep.isComplete(simState, observations) && (
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-200 font-medium">
                {currentStep.shortDesc}
              </p>

              {/* Scientific Rationale Callout */}
              <div className="flex items-start gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg mt-1 text-[11px] text-slate-400">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-300 block mb-0.5">Scientific Principle:</span>
                  {currentStep.scientificWhy}
                </div>
              </div>
            </div>

            {/* Quick Action Button & Next Step */}
            <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
              {currentStep.onApplyAction && (
                <button
                  onClick={currentStep.onApplyAction}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {currentStep.actionText}
                </button>
              )}

              {guideStep < steps.length && (
                <button
                  onClick={() => setGuideStep(guideStep + 1)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  Next Step <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
