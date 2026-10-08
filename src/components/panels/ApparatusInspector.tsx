import React from 'react';
import { 
  Cpu, 
  Layers, 
  Gauge, 
  Thermometer, 
  ShieldCheck, 
  Zap, 
  Droplets,
  Ruler,
  ChevronRight
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { APPARATUS_CONFIG } from '@/physics/materials';

interface ApparatusInspectorProps {
  onCollapse?: () => void;
}

export const ApparatusInspector: React.FC<ApparatusInspectorProps> = ({ onCollapse }) => {
  const { simState, apparatusConfig } = usePhysicsStore();
  const mat = simState.material;

  const crossAreaM2 = apparatusConfig.crossSectionArea;
  const areaCm2 = crossAreaM2 * 1e4;
  const rodLengthM = apparatusConfig.rodLengthCm / 100;
  const rodDiamM = apparatusConfig.rodDiameterMm / 1000;
  const volumeM3 = crossAreaM2 * rodLengthM;
  const massKg = volumeM3 * mat.density;
  const thermalDiffusivity = mat.thermalConductivity / (mat.density * mat.specificHeat);

  return (
    <aside className="w-80 bg-[#171918] border-l border-[#252825] flex flex-col justify-between h-full select-none shrink-0 overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-[#252825]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] font-mono">
              PROPERTIES INSPECTOR
            </h2>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 rounded bg-[#202321] hover:bg-[#242725] text-[#7C827C] hover:text-[#39FF14] transition-colors cursor-pointer"
              title="Collapse Properties Inspector (▶)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-[#7C827C] font-mono">
          Physical characteristics, boundary matrices, and sensor array geometry.
        </p>
      </div>

      {/* Inspector Sections */}
      <div className="p-4 flex flex-col gap-4 text-xs font-mono">
        
        {/* Section 1: Specimen Material Constants */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
              SPECIMEN METRIC
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#102713] text-[#39FF14] border border-[#163D19] font-bold">
              {mat.chemicalSymbol}
            </span>
          </div>

          <div className="bg-[#202321] rounded-xl border border-[#252825] divide-y divide-[#252825] text-[11px]">
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Specimen Alloy:</span>
              <span className="font-bold text-[#E8ECE8]">{mat.name}</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Thermal Cond. (k):</span>
              <span className="font-bold text-[#39FF14]">{mat.thermalConductivity} W/(m&middot;K)</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Bulk Density (&rho;):</span>
              <span className="text-[#E8ECE8]">{mat.density} kg/m&sup3;</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Specific Heat (Cp):</span>
              <span className="text-[#E8ECE8]">{mat.specificHeat} J/(kg&middot;K)</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Diffusivity (&alpha;):</span>
              <span className="text-[#38BDF8]">{(thermalDiffusivity * 1e6).toFixed(2)} &times; 10⁻⁶ m&sup2;/s</span>
            </div>
          </div>
        </div>

        {/* Section 2: Rod Geometry & Form Factor */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
          <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
            GEOMETRIC PROFILE
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1">
              <span className="text-[10px] text-[#7C827C]">Cross Area (A)</span>
              <span className="text-sm font-bold text-[#38BDF8]">{areaCm2.toFixed(2)} cm&sup2;</span>
              <span className="text-[9px] text-[#7C827C]">&pi; &times; (D/2)&sup2;</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#202321] border border-[#252825] flex flex-col gap-1">
              <span className="text-[10px] text-[#7C827C]">Specimen Mass</span>
              <span className="text-sm font-bold text-[#E8ECE8]">{(massKg * 1000).toFixed(0)} g</span>
              <span className="text-[9px] text-[#7C827C]">V = {(volumeM3 * 1e6).toFixed(0)} cm&sup3;</span>
            </div>
          </div>

          <div className="bg-[#202321] rounded-xl border border-[#252825] divide-y divide-[#252825] text-[11px]">
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Axial Length (L):</span>
              <span className="text-[#E8ECE8]">{rodLengthM * 1000} mm (0.50 m)</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Outer Diameter (D):</span>
              <span className="text-[#E8ECE8]">{rodDiamM * 1000} mm</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-[#7C827C]">Surface Area (As):</span>
              <span className="text-[#E8ECE8]">{(Math.PI * rodDiamM * rodLengthM * 1e4).toFixed(1)} cm&sup2;</span>
            </div>
          </div>
        </div>

        {/* Section 3: Sensor Array Placement Map */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
              SENSOR MATRIX
            </span>
            <span className="text-[10px] text-[#7C827C]">Type-K Probes</span>
          </div>

          <div className="bg-[#111312] rounded-xl border border-[#252825] p-2 flex flex-col gap-1.5 text-[10px]">
            <div className="grid grid-cols-4 text-[#7C827C] border-b border-[#252825] pb-1 font-semibold">
              <span>Probe</span>
              <span>Pos (x)</span>
              <span>Role</span>
              <span className="text-right">Baseline</span>
            </div>
            {APPARATUS_CONFIG.sensorPositions.map((xM, idx) => (
              <div key={idx} className="grid grid-cols-4 items-center text-[#B5BBB5] py-0.5">
                <span className="font-bold text-[#39FF14]">T{idx + 1}</span>
                <span className="text-[#E8ECE8]">{(xM * 100).toFixed(0)} cm</span>
                <span className="text-[#7C827C] truncate">{idx === 0 ? 'Heater Jnc' : idx === 6 ? 'Cold End' : 'Axial'}</span>
                <span className="text-right text-[#8BEA63]">20.0&deg;C</span>
              </div>
            ))}
            <div className="grid grid-cols-4 items-center text-[#38BDF8] pt-1 border-t border-[#252825]">
              <span className="font-bold">T8 / T9</span>
              <span className="text-[#E8ECE8]">Jacket</span>
              <span>Water In/Out</span>
              <span className="text-right">20.0&deg;C</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Info Pill */}
      <div className="p-3 border-t border-[#252825] bg-[#111312] text-[10px] text-[#7C827C] font-mono flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14] shrink-0" />
        <span>Discretization Grid: 50 Explicit FDTD Spatial Nodes</span>
      </div>

    </aside>
  );
};
