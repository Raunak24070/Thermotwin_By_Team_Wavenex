import React from 'react';
import { 
  Layers, 
  Flame, 
  Droplets, 
  Sliders, 
  ArrowRight, 
  Info,
  CheckCircle2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { MATERIALS } from '@/physics/materials';
import { MaterialId } from '@/physics/types';

interface ConfigurePanelProps {
  onContinue: () => void;
}

export const ConfigurePanel: React.FC<ConfigurePanelProps> = ({ onContinue }) => {
  const { 
    simState, 
    apparatusConfig, 
    setMaterial, 
    setApparatusConfig, 
    setVoltage, 
    setWaterFlow, 
    startExperiment,
    resetSimulation
  } = usePhysicsStore();

  const selectedMaterial = simState.material;

  const handleStart = () => {
    // If voltage is zero, set to default 8.0V so simulation heats realistically
    if (simState.voltage === 0) {
      setVoltage(8.0);
    }
    // If water flow is zero, set default 1.5 L/min
    if (simState.waterFlowLmin === 0) {
      setWaterFlow(1.5);
    }
    startExperiment();
    onContinue();
  };

  return (
    <div className="w-80 bg-[#171918] border-r border-[#252825] flex flex-col justify-between h-full select-none shrink-0 overflow-y-auto">
      
      {/* Top Header */}
      <div className="p-4 border-b border-[#252825]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] font-mono">
              01 &bull; APPARATUS CONFIG
            </h2>
          </div>
          <button
            onClick={resetSimulation}
            className="p-1 rounded bg-[#202321] hover:bg-[#242725] text-[#7C827C] hover:text-[#F5F5F5] transition-colors cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-[#7C827C] font-mono">
          Configure specimen material, physical geometry, and boundary thermal inputs.
        </p>
      </div>

      {/* Configuration Controls Body */}
      <div className="p-4 flex flex-col gap-4 text-xs font-mono">
        
        {/* 1. Specimen Material Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
              SPECIMEN MATERIAL
            </span>
            <span className="text-[10px] text-[#39FF14] font-bold">
              k = {selectedMaterial.thermalConductivity} W/m&middot;K
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(MATERIALS) as MaterialId[]).map((matId) => {
              const mat = MATERIALS[matId];
              const isSelected = simState.material.id === matId;
              return (
                <button
                  key={matId}
                  onClick={() => setMaterial(matId)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#102713] border-[#39FF14] text-[#39FF14] glow-green-sm font-bold'
                      : 'bg-[#202321] border-[#303330] text-[#B5BBB5] hover:border-[#4ADE2A]/40 hover:text-[#F5F5F5]'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full border border-black/40 shadow-sm"
                    style={{ backgroundColor: mat.colorHex }}
                  />
                  <span className="text-[11px]">{mat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Compact Material Technical Specs */}
          <div className="p-2.5 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1 text-[10px] text-[#B5BBB5]">
            <div className="flex justify-between">
              <span className="text-[#7C827C]">Thermal Conductivity (k):</span>
              <span className="font-bold text-[#E8ECE8]">{selectedMaterial.thermalConductivity} W/(m&middot;K)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C827C]">Density (&rho;):</span>
              <span className="font-bold text-[#E8ECE8]">{selectedMaterial.density} kg/m&sup3;</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C827C]">Specific Heat (Cp):</span>
              <span className="font-bold text-[#E8ECE8]">{selectedMaterial.specificHeat} J/(kg&middot;K)</span>
            </div>
          </div>
        </div>

        {/* 2. Apparatus Physical Dimensions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
              APPARATUS GEOMETRY
            </span>
            <span className="text-[10px] text-[#38BDF8]">
              A = {(apparatusConfig.crossSectionArea * 1e4).toFixed(2)} cm&sup2;
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Rod Length */}
            <div className="p-2.5 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1">
              <span className="text-[10px] text-[#7C827C]">Rod Length (L)</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#E8ECE8]">{apparatusConfig.rodLengthCm * 10}</span>
                <span className="text-[10px] text-[#7C827C]">mm</span>
              </div>
            </div>

            {/* Rod Diameter */}
            <div className="p-2.5 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1">
              <span className="text-[10px] text-[#7C827C]">Rod Diameter (D)</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#E8ECE8]">{apparatusConfig.rodDiameterMm}</span>
                <span className="text-[10px] text-[#7C827C]">mm</span>
              </div>
            </div>
          </div>

          {/* Heater Resistance specification */}
          <div className="p-2 rounded-lg bg-[#111312] border border-[#252825] flex justify-between text-[10px]">
            <span className="text-[#7C827C]">Heater Resistance (R):</span>
            <span className="font-bold text-[#E8ECE8]">{apparatusConfig.heaterResistanceR.toFixed(1)} &Omega;</span>
          </div>
        </div>

        {/* 3. Heating Element Controls */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              HEATER VOLTAGE
            </span>
            <span className="text-xs font-bold text-[#F59E0B]">
              {simState.voltage.toFixed(1)} V &bull; {simState.power.toFixed(1)} W
            </span>
          </div>

          {/* Voltage Slider */}
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={simState.voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full accent-[#39FF14] cursor-pointer h-1.5 bg-[#242725] rounded-lg"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[4, 8, 10, 12].map((v) => (
                <button
                  key={v}
                  onClick={() => setVoltage(v)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                    simState.voltage === v
                      ? 'bg-[#102713] text-[#39FF14] border-[#163D19]'
                      : 'bg-[#202321] text-[#7C827C] border-[#252825] hover:text-[#F5F5F5]'
                  }`}
                >
                  {v}V
                </button>
              ))}
            </div>
            <button
              onClick={() => setVoltage(simState.voltage > 0 ? 0 : 8.0)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                simState.voltage > 0
                  ? 'bg-[#102713] text-[#39FF14] border-[#163D19]'
                  : 'bg-[#242725] text-[#7C827C] border-[#303330]'
              }`}
            >
              {simState.voltage > 0 ? 'HEATER: ON' : 'HEATER: OFF'}
            </button>
          </div>
        </div>

        {/* 4. Cooling System Controls */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-[#38BDF8]" />
              COOLING WATER
            </span>
            <span className="text-xs font-bold text-[#38BDF8]">
              {simState.waterFlowLmin.toFixed(2)} L/min
            </span>
          </div>

          {/* Water Flow Slider */}
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={simState.waterFlowLmin}
            onChange={(e) => setWaterFlow(Number(e.target.value))}
            className="w-full accent-[#38BDF8] cursor-pointer h-1.5 bg-[#242725] rounded-lg"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[0.5, 1.0, 1.5, 2.0].map((f) => (
                <button
                  key={f}
                  onClick={() => setWaterFlow(f)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                    simState.waterFlowLmin === f
                      ? 'bg-[#102713] text-[#38BDF8] border-[#163D19]'
                      : 'bg-[#202321] text-[#7C827C] border-[#252825] hover:text-[#F5F5F5]'
                  }`}
                >
                  {f}L
                </button>
              ))}
            </div>
            <button
              onClick={() => setWaterFlow(simState.waterFlowLmin > 0 ? 0 : 1.5)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                simState.waterFlowLmin > 0
                  ? 'bg-[#102713] text-[#38BDF8] border-[#163D19]'
                  : 'bg-[#242725] text-[#7C827C] border-[#303330]'
              }`}
            >
              {simState.waterFlowLmin > 0 ? 'FLOW: ON' : 'FLOW: OFF'}
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Action CTA */}
      <div className="p-4 border-t border-[#252825] bg-[#111312] flex flex-col gap-2">
        <button
          onClick={handleStart}
          className="w-full py-3 px-4 rounded-xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black text-xs tracking-wider uppercase font-mono flex items-center justify-center gap-2 shadow-lg glow-green cursor-pointer transition-all active:scale-[0.98]"
        >
          <span>CONTINUE TO EXPERIMENT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-center text-[#7C827C] font-mono">
          Apparatus will initialize and begin explicit FDTD heat propagation
        </span>
      </div>

    </div>
  );
};
