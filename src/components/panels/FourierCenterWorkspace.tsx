import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowDown, 
  ArrowRight, 
  Flame, 
  Droplets, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { performFourierAnalysis } from '@/physics/fourierCalculator';
import { LabCanvas } from '@/components/3d/LabCanvas';

export const FourierCenterWorkspace: React.FC = () => {
  const { simState, apparatusConfig } = usePhysicsStore();
  const [show3DPreview, setShow3DPreview] = useState<boolean>(true);

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
    simState.steadyStateStatus,
    apparatusConfig.crossSectionArea
  );

  const isLowError = analysis.errorPercentage <= 5.0;

  return (
    <div className="flex-1 bg-[#111312] p-4 flex flex-col gap-4 overflow-y-auto select-none h-full">
      
      {/* Top Banner: Fourier Law Header & 3D Preview Toggle */}
      <div className="flex items-center justify-between bg-[#171918] border border-[#252825] px-4 py-3 rounded-2xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
            <Calculator className="w-4 h-4 text-[#39FF14]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-[#F5F5F5] font-sans tracking-tight">
              FOURIER CONDUCTION WORKBENCH
            </h1>
            <p className="text-[11px] text-[#7C827C] font-mono">
              Fourier's Conduction Equation: Q = -k &middot; A &middot; (dT/dx)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShow3DPreview(!show3DPreview)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              show3DPreview
                ? 'bg-[#102713] text-[#39FF14] border-[#163D19] glow-green-sm'
                : 'bg-[#202321] text-[#7C827C] border-[#252825] hover:text-[#F5F5F5]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Apparatus: {show3DPreview ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Optional Embedded Mini 3D Apparatus Live Twin Preview */}
      {show3DPreview && (
        <div className="h-56 w-full rounded-2xl overflow-hidden border border-[#252825] shrink-0 relative bg-[#0D0F0E] shadow-xl">
          <LabCanvas />
          <div className="absolute top-2 left-2 pointer-events-none z-10 px-2.5 py-1 rounded-md bg-[#111312]/80 backdrop-blur-md border border-[#252825] text-[10px] font-mono text-[#8BEA63] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
            <span>Live 3D Specimen &bull; {simState.material.name}</span>
          </div>
        </div>
      )}

      {/* Visual Engineering Flow Cascade: Gradient -> Heat Transfer -> k -> Error */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
        
        {/* Step 1: Temperature Gradient */}
        <div className="p-3.5 rounded-2xl bg-[#171918] border border-[#252825] flex flex-col justify-between relative group hover:border-[#303330] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#7C827C] uppercase tracking-wider font-semibold">
              01 &bull; TEMP GRADIENT
            </span>
            <span className="text-[10px] text-[#38BDF8]">&Delta;T / L</span>
          </div>
          <div className="my-1">
            <div className="text-2xl font-black text-[#38BDF8]">
              {analysis.temperatureGradientCperM.toFixed(1)}
              <span className="text-xs text-[#7C827C] font-normal ml-1">&deg;C/m</span>
            </div>
            <span className="text-[10px] text-[#7C827C] block mt-1">
              Linear regression over 7 probes (x=5 to 35 cm)
            </span>
          </div>
          <div className="pt-2 border-t border-[#252825] flex justify-between text-[10px] text-[#B5BBB5]">
            <span>Rod &Delta;T (T1-T7):</span>
            <span className="font-bold text-[#E8ECE8]">{(simState.sensors.t1 - simState.sensors.t7).toFixed(1)}&deg;C</span>
          </div>
        </div>

        {/* Step 2: Heat Transfer Rate */}
        <div className="p-3.5 rounded-2xl bg-[#171918] border border-[#252825] flex flex-col justify-between relative group hover:border-[#303330] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#7C827C] uppercase tracking-wider font-semibold">
              02 &bull; HEAT FLOW RATE
            </span>
            <span className="text-[10px] text-[#F59E0B]">Q_rod</span>
          </div>
          <div className="my-1">
            <div className="text-2xl font-black text-[#F59E0B]">
              {analysis.qRodConductedW.toFixed(1)}
              <span className="text-xs text-[#7C827C] font-normal ml-1">W</span>
            </div>
            <span className="text-[10px] text-[#7C827C] block mt-1">
              Mean flux: (Q_input + Q_water) / 2
            </span>
          </div>
          <div className="pt-2 border-t border-[#252825] flex justify-between text-[10px] text-[#B5BBB5]">
            <span>Q_water Removed:</span>
            <span className="font-bold text-[#38BDF8]">{analysis.waterHeatRemovalW.toFixed(1)} W</span>
          </div>
        </div>

        {/* Step 3: Experimental k */}
        <div className="p-3.5 rounded-2xl bg-[#102713] border border-[#163D19] glow-green-sm flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#8BEA63] uppercase tracking-wider font-bold">
              03 &bull; THERMAL CONDUCTIVITY
            </span>
            <span className="text-[10px] text-[#39FF14] font-bold">k_exp</span>
          </div>
          <div className="my-1">
            <div className="text-3xl font-black text-[#39FF14]">
              {analysis.experimentalK > 0 ? analysis.experimentalK.toFixed(1) : '—'}
              <span className="text-xs text-[#8BEA63] font-normal ml-1">W/(m&middot;K)</span>
            </div>
            <span className="text-[10px] text-[#8BEA63] block mt-1">
              Formula: k = Q / [ A &middot; |dT/dx| ]
            </span>
          </div>
          <div className="pt-2 border-t border-[#163D19] flex justify-between text-[10px] text-[#8BEA63]">
            <span>Reference ({simState.material.name.split(' ')[0]}):</span>
            <span className="font-bold text-[#F5F5F5]">{analysis.referenceK} W/(m&middot;K)</span>
          </div>
        </div>

        {/* Step 4: Percentage Error */}
        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
          isLowError
            ? 'bg-[#171918] border-[#252825]'
            : 'bg-[#171918] border-[#F59E0B]/30'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#7C827C] uppercase tracking-wider font-semibold">
              04 &bull; ACCURACY &amp; ERROR
            </span>
            <span className="text-[10px] text-[#B5BBB5]">% Error</span>
          </div>
          <div className="my-1">
            <div className={`text-3xl font-black ${isLowError ? 'text-[#39FF14]' : 'text-[#F59E0B]'}`}>
              {analysis.errorPercentage.toFixed(2)}
              <span className="text-xs font-normal ml-0.5">%</span>
            </div>
            <span className="text-[10px] text-[#7C827C] block mt-1">
              |k_exp - k_ref| / k_ref &times; 100%
            </span>
          </div>
          <div className="pt-2 border-t border-[#252825] flex justify-between text-[10px]">
            <span className="text-[#7C827C]">Status:</span>
            <span className={`font-bold ${isLowError ? 'text-[#39FF14]' : 'text-[#F59E0B]'}`}>
              {isLowError ? 'High Precision' : 'Acceptable'}
            </span>
          </div>
        </div>

      </div>

      {/* Energy Balance & Heat Flux Details */}
      <div className="p-4 rounded-2xl bg-[#171918] border border-[#252825] font-mono text-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#252825] pb-2">
          <span className="font-bold text-[#F5F5F5] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
            FIRST LAW OF THERMODYNAMICS &bull; ENERGY BALANCE
          </span>
          <span className="text-[10px] text-[#8BEA63] bg-[#102713] px-2 py-0.5 rounded border border-[#163D19]">
            Conservation: Q_in = Q_water + Q_loss
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1">
            <span className="text-[10px] text-[#7C827C]">Electrical Heat Input (Q_in):</span>
            <span className="text-base font-bold text-[#F59E0B]">{analysis.heatInputPowerW.toFixed(1)} W</span>
            <span className="text-[9px] text-[#7C827C]">100% Total Generated Heat</span>
          </div>

          <div className="p-3 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1">
            <span className="text-[10px] text-[#7C827C]">Water Extracted Heat (Q_water):</span>
            <span className="text-base font-bold text-[#38BDF8]">{analysis.waterHeatRemovalW.toFixed(1)} W</span>
            <span className="text-[9px] text-[#7C827C]">
              {analysis.heatInputPowerW > 0 ? ((analysis.waterHeatRemovalW / analysis.heatInputPowerW) * 100).toFixed(1) : 0}% Transported to Sink
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1">
            <span className="text-[10px] text-[#7C827C]">Insulation Surface Loss (Q_loss):</span>
            <span className="text-base font-bold text-[#B5BBB5]">{analysis.heatLossW.toFixed(1)} W</span>
            <span className="text-[9px] text-[#7C827C]">
              {analysis.heatInputPowerW > 0 ? ((analysis.heatLossW / analysis.heatInputPowerW) * 100).toFixed(1) : 0}% Casing Dissipation
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
