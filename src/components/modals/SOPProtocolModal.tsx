import React from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Flame, 
  Droplets, 
  Activity, 
  Calculator, 
  Send,
  HelpCircle
} from 'lucide-react';

interface SOPProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOP_STEPS = [
  { step: 1, title: 'Specimen Inspection & Material Selection', desc: 'Select test metallic alloy (Copper, Aluminium, or Stainless Steel) in Step 01. Verify known handbook thermal conductivity values.' },
  { step: 2, title: 'Apparatus Geometry Check', desc: 'Inspect specimen rod length (500 mm), outer diameter (25 mm), cross-sectional area (4.91 cm²), and heater coil resistance (15.0 Ω).' },
  { step: 3, title: 'Establish Cooling Water Sink Loop', desc: 'Turn on water cooling rotameter valve to 1.50 L/min. Ensure cold heat sink is established at the specimen exit prior to heating.' },
  { step: 4, title: 'Energize Electrical Dimmer-Stat Heater', desc: 'Set electrical voltage slider to 8.0 – 10.0 V (approx 4.0 – 6.7 W). Monitor live ammeter and voltmeter readings.' },
  { step: 5, title: 'Observe 1D Axial Heat Conduction', desc: 'Transition into Step 02. Observe thermal front propagation across 50 discretized spatial nodes and vertex color gradient in the 3D twin.' },
  { step: 6, title: 'Monitor Type-K Thermocouple Telemetry', desc: 'Track T1 through T7 axial rod probes and T8/T9 cooling jacket fluid ports. Watch drift rate |dT/dt| decline over time.' },
  { step: 7, title: 'Detect Thermal Equilibrium (Steady State)', desc: 'Wait until stability condition |dT/dt| < 0.008 °C/s is satisfied. The green STEADY STATE DETECTED badge will glow.' },
  { step: 8, title: 'Record Steady-State Notebook Observation', desc: 'Click "Record Observation" to log temperature and energy values into the Virtual Tablet notebook.' },
  { step: 9, title: 'Execute Fourier Law Analysis', desc: 'Transition to Step 03 Fourier Workbench. Review linear gradient regression |dT/dx|, heat transfer Q, and experimental k calculation.' },
  { step: 10, title: 'Preview & Submit Official Lab Report', desc: 'Verify percentage error, preview the full laboratory report document, export a PDF certificate, and submit to your faculty instructor.' },
];

export const SOPProtocolModal: React.FC<SOPProtocolModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#171918] border border-[#303330] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-[#252825] flex items-center justify-between bg-[#111312]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
              <BookOpen className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wide">
                STANDARD OPERATING PROCEDURE &bull; 10-STEP PROTOCOL
              </h2>
              <span className="text-[10px] text-[#7C827C]">
                Official ISO/ASTM Laboratory Protocol for Thermal Conductivity Testing
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#202321] text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#242725] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#0D0F0E]">
          {SOP_STEPS.map((item) => (
            <div
              key={item.step}
              className="p-3 rounded-xl bg-[#171918] border border-[#252825] flex items-start gap-3 hover:border-[#303330] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#102713] border border-[#163D19] text-[#39FF14] font-black text-xs flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="font-bold text-xs text-[#F5F5F5]">{item.title}</h4>
                <p className="text-[11px] text-[#B5BBB5] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#252825] bg-[#111312] flex justify-between items-center text-[#7C827C]">
          <span>Heat Transfer Laboratory Manual &bull; Section 4.2</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] font-semibold border border-[#303330] cursor-pointer"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
