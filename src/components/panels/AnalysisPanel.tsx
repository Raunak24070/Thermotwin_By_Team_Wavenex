import React from 'react';
import { 
  Calculator, 
  ClipboardList, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  Flame, 
  Droplets,
  Ruler
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface AnalysisPanelProps {
  onBackToExperiment: () => void;
  onOpenNotebook: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  onBackToExperiment,
  onOpenNotebook
}) => {
  const { 
    observations, 
    apparatusConfig, 
    simState 
  } = usePhysicsStore();

  const crossAreaM2 = apparatusConfig.crossSectionArea;
  const areaCm2 = crossAreaM2 * 1e4;

  return (
    <div className="w-80 bg-[#171918] border-r border-[#252825] flex flex-col justify-between h-full select-none shrink-0 overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-[#252825]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] font-mono">
              03 &bull; FOURIER PARAMETERS
            </h2>
          </div>
          <button
            onClick={onBackToExperiment}
            className="flex items-center gap-1 text-[11px] font-mono text-[#7C827C] hover:text-[#39FF14] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>
        </div>
        <p className="text-[11px] text-[#7C827C] font-mono">
          Governing boundary variables &amp; logged steady-state snapshots.
        </p>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4 text-xs font-mono">
        
        {/* Observations Summary Box */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-[#39FF14]" />
              LOGGED OBSERVATIONS
            </span>
            <button
              onClick={onOpenNotebook}
              className="text-[10px] text-[#39FF14] hover:underline cursor-pointer"
            >
              Open Notebook &rarr;
            </button>
          </div>

          <div className="bg-[#202321] rounded-xl border border-[#252825] p-2.5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#7C827C]">Recorded Snapshots:</span>
              <span className="font-bold text-[#E8ECE8]">{observations.length} Rows</span>
            </div>

            {observations.length === 0 ? (
              <div className="p-2 rounded-lg bg-[#111312] border border-[#252825] text-[10px] text-[#7C827C] text-center">
                Using current active apparatus state for Fourier regression.
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                {observations.slice(-3).map((obs, idx) => (
                  <div
                    key={obs.id}
                    className="p-1.5 rounded-lg bg-[#111312] border border-[#252825] flex justify-between items-center text-[10px]"
                  >
                    <span className="font-bold text-[#8BEA63]">#{observations.length - 2 + idx}</span>
                    <span className="text-[#B5BBB5]">T1={obs.t1}&deg;C</span>
                    <span className="text-[#B5BBB5]">T7={obs.t7}&deg;C</span>
                    <span className="text-[#39FF14] font-bold">{obs.calculatedK || '—'} W/mK</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Governing Input Terms */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
          <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
            CALCULATION INPUTS
          </span>

          <div className="bg-[#202321] rounded-xl border border-[#252825] divide-y divide-[#252825] text-[11px]">
            
            {/* Heat Input Power */}
            <div className="p-2.5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[#7C827C]">Electrical Heat Input (Q_in):</span>
                <span className="text-[9px] text-[#7C827C]">P = V &times; I</span>
              </div>
              <span className="font-bold text-[#F59E0B] text-xs">
                {simState.power.toFixed(1)} W
              </span>
            </div>

            {/* Cross Section Area */}
            <div className="p-2.5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[#7C827C]">Cross-Sectional Area (A):</span>
                <span className="text-[9px] text-[#7C827C]">&pi; &times; (D/2)&sup2;</span>
              </div>
              <span className="font-bold text-[#38BDF8] text-xs">
                {areaCm2.toFixed(2)} cm&sup2;
              </span>
            </div>

            {/* Temperature Gradient */}
            <div className="p-2.5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[#7C827C]">Linear Gradient (|dT/dx|):</span>
                <span className="text-[9px] text-[#7C827C]">Axial slope T1..T7</span>
              </div>
              <span className="font-bold text-[#38BDF8] text-xs">
                {simState.tempGradient.toFixed(1)} &deg;C/m
              </span>
            </div>

            {/* Rod Length */}
            <div className="p-2.5 flex justify-between items-center">
              <span className="text-[#7C827C]">Conduction Length (L):</span>
              <span className="text-[#E8ECE8]">
                {(apparatusConfig.rodLengthCm / 100).toFixed(2)} m (500 mm)
              </span>
            </div>

            {/* Water Cooling Heat Removal */}
            <div className="p-2.5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[#7C827C]">Heat Extracted by Water (Q_w):</span>
                <span className="text-[9px] text-[#7C827C]">&rho; &times; &Vdot; &times; Cp &times; &Delta;Tw</span>
              </div>
              <span className="font-bold text-[#38BDF8] text-xs">
                {simState.heatRemovedByWater.toFixed(1)} W
              </span>
            </div>

          </div>
        </div>

        {/* Theoretical Material Benchmark */}
        <div className="p-3 rounded-xl bg-[#111312] border border-[#252825] flex flex-col gap-1.5 text-[11px]">
          <span className="text-[#7C827C] text-[10px] uppercase tracking-wider">LITERATURE REFERENCE</span>
          <div className="flex justify-between items-center">
            <span className="text-[#B5BBB5]">{simState.material.name}:</span>
            <span className="font-bold text-[#39FF14]">{simState.material.thermalConductivity} W/(m&middot;K)</span>
          </div>
        </div>

      </div>

      {/* Footer Return Action */}
      <div className="p-4 border-t border-[#252825] bg-[#111312] flex flex-col gap-2">
        <button
          onClick={onBackToExperiment}
          className="w-full py-2.5 px-3 rounded-xl bg-[#202321] hover:bg-[#242725] border border-[#303330] hover:border-[#39FF14]/50 text-[#F5F5F5] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>Return to 3D Simulation</span>
        </button>
      </div>

    </div>
  );
};
