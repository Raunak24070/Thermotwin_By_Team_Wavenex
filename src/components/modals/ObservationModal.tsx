import React from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Tablet,
  AlertTriangle
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({ isOpen, onClose }) => {
  const { observations, recordObservation, simState } = usePhysicsStore();

  if (!isOpen) return null;

  const exportCSV = () => {
    if (observations.length === 0) return;
    const headers = [
      'Sample #', 'Time (s)', 'Voltage (V)', 'Current (A)', 'Power (W)', 'Water Flow (L/min)',
      'T1 (°C)', 'T2 (°C)', 'T3 (°C)', 'T4 (°C)', 'T5 (°C)', 'T6 (°C)', 'T7 (°C)',
      'T8 Inlet (°C)', 'T9 Outlet (°C)', 'ΔTwater (°C)', 'Gradient dT/dx (°C/m)',
      'Experimental k (W/m·K)', 'Steady State'
    ];

    const rows = observations.map((r, idx) => [
      idx + 1, r.elapsedSeconds, r.voltage, r.current, r.power, r.flowRate,
      r.t1, r.t2, r.t3, r.t4, r.t5, r.t6, r.t7, r.t8, r.t9,
      r.deltaTWater, r.dTdx, r.calculatedK || 'N/A', r.steadyState
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ThermoTwin_Observations_${simState.material.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#171918] border border-[#303330] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-[#252825] flex items-center justify-between bg-[#111312]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
              <Tablet className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wide">
                VIRTUAL TABLET &bull; OBSERVATION NOTEBOOK
              </h2>
              <span className="text-[10px] text-[#7C827C]">
                {observations.length} Logged Entries &bull; Steady State Stability Criterion: |dT/dt| &lt; 0.008 &deg;C/s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={recordObservation}
              className="px-3 py-1.5 rounded-xl bg-[#39FF14] text-[#0D0F0E] font-bold text-xs flex items-center gap-1.5 glow-green cursor-pointer hover:bg-[#4ADE2A] transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Reading Snapshot</span>
            </button>
            <button
              onClick={exportCSV}
              disabled={observations.length === 0}
              className="px-3 py-1.5 rounded-xl bg-[#202321] text-[#B5BBB5] hover:text-[#F5F5F5] border border-[#303330] disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#202321] text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#242725] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Live Values Quick Bar */}
        <div className="bg-[#111312] border-b border-[#252825] px-4 py-2.5 grid grid-cols-4 sm:grid-cols-8 gap-2 text-[10px]">
          <div>
            <span className="text-[#7C827C] block">Voltage</span>
            <span className="font-bold text-[#F59E0B]">{simState.voltage.toFixed(1)} V</span>
          </div>
          <div>
            <span className="text-[#7C827C] block">Power</span>
            <span className="font-bold text-[#F59E0B]">{simState.power.toFixed(1)} W</span>
          </div>
          <div>
            <span className="text-[#7C827C] block">Water Flow</span>
            <span className="font-bold text-[#38BDF8]">{simState.waterFlowLmin.toFixed(2)} L/m</span>
          </div>
          <div>
            <span className="text-[#7C827C] block">T1 (Hot)</span>
            <span className="font-bold text-[#EF4444]">{simState.sensors.t1.toFixed(1)} &deg;C</span>
          </div>
          <div>
            <span className="text-[#7C827C] block">T4 (Mid)</span>
            <span className="font-bold text-[#EAB308]">{simState.sensors.t4.toFixed(1)} &deg;C</span>
          </div>
          <div>
            <span className="text-[#7C827C] block">T7 (Cold)</span>
            <span className="font-bold text-[#2563EB]">{simState.sensors.t7.toFixed(1)} &deg;C</span>
          </div>
          <div>
            <span className="text-[#7C827C] block">T8 / T9</span>
            <span className="font-bold text-[#38BDF8]">{simState.sensors.t8.toFixed(1)} / {simState.sensors.t9.toFixed(1)} &deg;C</span>
          </div>
          <div>
            <span className="text-[#7C827C] block">Status</span>
            <span className={`font-bold ${simState.steadyStateStatus === 'STEADY_STATE' ? 'text-[#39FF14]' : 'text-[#F59E0B]'}`}>
              {simState.steadyStateStatus === 'STEADY_STATE' ? 'STEADY' : 'TRANSIENT'}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          {observations.length === 0 ? (
            <div className="py-12 text-center text-[#7C827C] flex flex-col items-center justify-center gap-2">
              <Tablet className="w-8 h-8 opacity-40 text-[#39FF14]" />
              <p className="text-sm font-semibold text-[#B5BBB5]">No Observations Recorded Yet</p>
              <p className="text-[11px] max-w-sm">
                Wait for temperature stability (|dT/dt| &lt; 0.008 &deg;C/s) or click &ldquo;Log Reading Snapshot&rdquo; to capture the current state.
              </p>
            </div>
          ) : (
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-[#303330] text-[#7C827C] text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">V (V)</th>
                  <th className="p-2">P (W)</th>
                  <th className="p-2">Flow</th>
                  <th className="p-2">T1</th>
                  <th className="p-2">T2</th>
                  <th className="p-2">T3</th>
                  <th className="p-2">T4</th>
                  <th className="p-2">T5</th>
                  <th className="p-2">T6</th>
                  <th className="p-2">T7</th>
                  <th className="p-2">T8</th>
                  <th className="p-2">T9</th>
                  <th className="p-2">k_exp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252825]">
                {observations.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-[#202321] transition-colors">
                    <td className="p-2 font-bold text-[#39FF14]">#{idx + 1}</td>
                    <td className="p-2 text-[#7C827C]">{row.timestamp}</td>
                    <td className="p-2 font-bold text-[#F59E0B]">{row.voltage}</td>
                    <td className="p-2 text-[#E8ECE8]">{row.power}</td>
                    <td className="p-2 text-[#38BDF8]">{row.flowRate}</td>
                    <td className="p-2 text-[#EF4444] font-semibold">{row.t1}&deg;</td>
                    <td className="p-2 text-[#FF6B35]">{row.t2}&deg;</td>
                    <td className="p-2 text-[#F59E0B]">{row.t3}&deg;</td>
                    <td className="p-2 text-[#EAB308]">{row.t4}&deg;</td>
                    <td className="p-2 text-[#8BEA63]">{row.t5}&deg;</td>
                    <td className="p-2 text-[#38BDF8]">{row.t6}&deg;</td>
                    <td className="p-2 text-[#2563EB] font-semibold">{row.t7}&deg;</td>
                    <td className="p-2 text-[#0EA5E9]">{row.t8}&deg;</td>
                    <td className="p-2 text-[#A855F7]">{row.t9}&deg;</td>
                    <td className="p-2 font-bold text-[#39FF14]">{row.calculatedK || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#252825] bg-[#111312] flex justify-between items-center text-[#7C827C]">
          <span>Format: Standard Engineering 1D Fourier Specimen Observation Log</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] font-semibold border border-[#303330] cursor-pointer"
          >
            Close Notebook
          </button>
        </div>

      </div>
    </div>
  );
};
