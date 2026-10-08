import React from 'react';
import { 
  X, 
  Download, 
  Send, 
  FileText, 
  CheckCircle2, 
  Award, 
  Calendar, 
  User, 
  Building,
  Flame,
  Droplets
} from 'lucide-react';
import jsPDF from 'jspdf';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { performFourierAnalysis } from '@/physics/fourierCalculator';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { simState, apparatusConfig, observations } = usePhysicsStore();
  const { currentUser } = useAuthStore();

  if (!isOpen) return null;

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

  const gradeScore = Math.max(60, Math.min(100, Math.round(100 - (analysis?.errorPercentage || 0) * 1.5)));

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Dark banner header
    doc.setFillColor(17, 19, 18);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(57, 255, 20);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('THERMOTWIN &bull; THERMAL CONDUCTIVITY REPORT', 14, 18);

    doc.setTextColor(181, 187, 181);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Virtual Laboratory Conduction Analysis &bull; Fourier\'s Law Verification', 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    // 1. Student & Specimen Metadata
    doc.setTextColor(23, 25, 24);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. STUDENT & SPECIMEN METADATA', 14, 48);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${currentUser?.name || 'Alex Rivera'}`, 14, 56);
    doc.text(`Student ID: ${currentUser?.studentIdNumber || 'ME-2026-4401'}`, 14, 62);
    doc.text(`Institution: ${currentUser?.institution || 'Institute of Thermal Technology'}`, 14, 68);

    doc.text(`Material: ${simState.material.name}`, 110, 56);
    doc.text(`Specimen Diameter: ${apparatusConfig.rodDiameterMm} mm`, 110, 62);
    doc.text(`Specimen Length: ${apparatusConfig.rodLengthCm * 10} mm (500 mm)`, 110, 68);

    // 2. Operational Boundary Values
    doc.setFont('helvetica', 'bold');
    doc.text('2. THERMAL BOUNDARY CONDITIONS', 14, 82);

    doc.setFont('helvetica', 'normal');
    doc.text(`Heater Voltage: ${simState.voltage.toFixed(1)} V`, 14, 90);
    doc.text(`Heater Current: ${simState.current.toFixed(2)} A`, 14, 96);
    doc.text(`Electrical Heat Power: ${simState.power.toFixed(1)} W`, 14, 102);

    doc.text(`Cooling Water Flow Rate: ${simState.waterFlowLmin.toFixed(2)} L/min`, 110, 90);
    doc.text(`Water Inlet Temp (T8): ${simState.sensors.t8.toFixed(1)} °C`, 110, 96);
    doc.text(`Water Outlet Temp (T9): ${simState.sensors.t9.toFixed(1)} °C`, 110, 102);

    // 3. Sensor Arrays
    doc.setFont('helvetica', 'bold');
    doc.text('3. THERMOCOUPLE TEMPERATURE READINGS (T1–T7)', 14, 116);
    doc.setFont('helvetica', 'normal');
    doc.text(`T1: ${simState.sensors.t1.toFixed(1)}°C  |  T2: ${simState.sensors.t2.toFixed(1)}°C  |  T3: ${simState.sensors.t3.toFixed(1)}°C  |  T4: ${simState.sensors.t4.toFixed(1)}°C`, 14, 124);
    doc.text(`T5: ${simState.sensors.t5.toFixed(1)}°C  |  T6: ${simState.sensors.t6.toFixed(1)}°C  |  T7: ${simState.sensors.t7.toFixed(1)}°C`, 14, 130);

    // 4. Calculations & Accuracy
    doc.setFont('helvetica', 'bold');
    doc.text('4. FOURIER CALCULATIONS & EXPERIMENTAL RESULTS', 14, 144);
    doc.setFont('helvetica', 'normal');
    doc.text(`Temperature Gradient (|dT/dx|): ${analysis.temperatureGradientCperM.toFixed(2)} °C/m`, 14, 152);
    doc.text(`Mean Rod Heat Flux (Q_rod): ${analysis.qRodConductedW.toFixed(1)} W`, 14, 158);
    doc.text(`Experimental Thermal Conductivity (k_exp): ${analysis.experimentalK.toFixed(2)} W/(m·K)`, 14, 164);
    doc.text(`Theoretical Reference Value (k_ref): ${analysis.referenceK.toFixed(2)} W/(m·K)`, 14, 170);
    doc.text(`Percentage Error: ${analysis.errorPercentage.toFixed(2)} %`, 14, 176);
    doc.text(`Estimated Laboratory Score: ${gradeScore} / 100`, 14, 182);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 120);
    doc.text('ThermoTwin Engineering Platform — Discretized Finite Difference Heat Solver', 14, 280);

    doc.save(`ThermoTwin_Report_${currentUser?.name?.replace(/\s+/g, '_') || 'Student'}_${simState.material.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#171918] border border-[#303330] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-[#252825] flex items-center justify-between bg-[#111312]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
              <FileText className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wide">
                LABORATORY EXPERIMENT REPORT PREVIEW
              </h2>
              <span className="text-[10px] text-[#7C827C]">
                Official Academic Report &bull; Certified Virtual Twin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 rounded-xl bg-[#202321] text-[#E8ECE8] hover:text-[#39FF14] border border-[#303330] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#202321] text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#242725] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-[#0D0F0E]">
          
          {/* Document Title Banner */}
          <div className="border-b border-[#252825] pb-4 flex flex-col gap-1">
            <span className="text-[10px] text-[#39FF14] tracking-widest uppercase font-bold">
              LABORATORY EXPERIMENT CERTIFICATE
            </span>
            <h1 className="text-lg font-black text-[#F5F5F5] tracking-tight">
              Determination of Thermal Conductivity of a Metallic Specimen
            </h1>
            <p className="text-[11px] text-[#7C827C]">
              One-Dimensional Discretized Thermal Conduction via Fourier&apos;s Law Engine
            </p>
          </div>

          {/* Student & Session Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#171918] border border-[#252825]">
              <span className="text-[10px] text-[#7C827C] block">Student</span>
              <span className="font-bold text-[#F5F5F5] text-xs">{currentUser?.name}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#171918] border border-[#252825]">
              <span className="text-[10px] text-[#7C827C] block">Student ID</span>
              <span className="font-bold text-[#F5F5F5] text-xs">{currentUser?.studentIdNumber || 'ME-2026-4401'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#171918] border border-[#252825]">
              <span className="text-[10px] text-[#7C827C] block">Specimen</span>
              <span className="font-bold text-[#39FF14] text-xs">{simState.material.name}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#171918] border border-[#252825]">
              <span className="text-[10px] text-[#7C827C] block">Institution</span>
              <span className="font-bold text-[#F5F5F5] text-xs truncate">{currentUser?.institution}</span>
            </div>
          </div>

          {/* Apparatus & Operational Parameters */}
          <div className="p-4 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-2.5">
            <span className="text-[10px] font-bold text-[#8BEA63] uppercase tracking-wider">
              APPARATUS BOUNDARY CONDITIONS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-[#7C827C] block">Rod Diameter (D):</span>
                <span className="font-bold text-[#E8ECE8]">{apparatusConfig.rodDiameterMm} mm</span>
              </div>
              <div>
                <span className="text-[#7C827C] block">Rod Length (L):</span>
                <span className="font-bold text-[#E8ECE8]">{apparatusConfig.rodLengthCm * 10} mm</span>
              </div>
              <div>
                <span className="text-[#7C827C] block">Cross Section (A):</span>
                <span className="font-bold text-[#38BDF8]">{(apparatusConfig.crossSectionArea * 1e4).toFixed(2)} cm&sup2;</span>
              </div>
              <div>
                <span className="text-[#7C827C] block">Heater Voltage &bull; Power:</span>
                <span className="font-bold text-[#F59E0B]">{simState.voltage.toFixed(1)} V ({simState.power.toFixed(1)} W)</span>
              </div>
              <div>
                <span className="text-[#7C827C] block">Cooling Water Flow:</span>
                <span className="font-bold text-[#38BDF8]">{simState.waterFlowLmin.toFixed(2)} L/min</span>
              </div>
              <div>
                <span className="text-[#7C827C] block">Water &Delta;T (T9 - T8):</span>
                <span className="font-bold text-[#38BDF8]">{(simState.sensors.t9 - simState.sensors.t8).toFixed(2)} &deg;C</span>
              </div>
            </div>
          </div>

          {/* Thermocouple Telemetry Strip */}
          <div className="p-4 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[#8BEA63] uppercase tracking-wider">
              STEADY-STATE TEMPERATURE DISTRIBUTION (T1&ndash;T9)
            </span>
            <div className="grid grid-cols-9 gap-1 text-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const key = `t${num}` as keyof typeof simState.sensors;
                const temp = simState.sensors[key] || 20.0;
                return (
                  <div key={num} className="p-1.5 rounded-lg bg-[#202321] border border-[#252825]">
                    <span className="text-[9px] text-[#7C827C] block">T{num}</span>
                    <span className="font-bold text-xs text-[#E8ECE8]">{temp.toFixed(1)}&deg;</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Analytical Calculation Results Banner */}
          <div className="p-4 rounded-xl bg-[#102713] border border-[#163D19] glow-green-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-[#8BEA63] block">GRADIENT |dT/dx|</span>
              <span className="text-base font-black text-[#38BDF8]">{analysis.temperatureGradientCperM.toFixed(1)} &deg;C/m</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8BEA63] block">EXPERIMENTAL k</span>
              <span className="text-xl font-black text-[#39FF14]">{analysis.experimentalK.toFixed(1)} W/m&middot;K</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8BEA63] block">LITERATURE REF</span>
              <span className="text-base font-bold text-[#F5F5F5]">{analysis.referenceK} W/m&middot;K</span>
            </div>
            <div>
              <span className="text-[10px] text-[#8BEA63] block">ERROR % &bull; GRADE</span>
              <span className="text-base font-black text-[#39FF14]">{analysis.errorPercentage.toFixed(2)}% ({gradeScore}%)</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#252825] bg-[#111312] flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] font-semibold border border-[#303330] cursor-pointer"
          >
            Close Preview
          </button>

          <button
            onClick={() => {
              onSubmit();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black uppercase tracking-wider flex items-center gap-2 glow-green cursor-pointer shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span>Submit Official Report</span>
          </button>
        </div>

      </div>
    </div>
  );
};
