
import React from 'react';
import { Tablet, PlusCircle, Download, Trash2, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

export const ObservationTable: React.FC = () => {
  const { observations, recordObservation, simState, experimentMode } = usePhysicsStore();

  const isRealLab = experimentMode === 'REAL_LAB';
  const isSteady = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';
  const canRecord = !isRealLab || isSteady;

  const exportCSV = () => {
    if (observations.length === 0) return;
    const headers = [
      'Sample #',
      'Time (s)',
      'Voltage (V)',
      'Current (A)',
      'Power (W)',
      'Water Flow (L/min)',
      'T1 (°C)',
      'T2 (°C)',
      'T3 (°C)',
      'T4 (°C)',
      'T5 (°C)',
      'T6 (°C)',
      'T7 (°C)',
      'T8 Inlet (°C)',
      'T9 Outlet (°C)',
      'ΔTwater (°C)',
      'Temperature Gradient dT/dx (°C/m)',
      'Heat Input Q_in (W)',
      'Heat Removed Q_water (W)',
      'Heat Loss Q_loss (W)',
      'Experimental k (W/m·K)',
      'Steady State Status'
    ];

    const rows = observations.map((r, idx) => [
      idx + 1,
      r.elapsedSeconds,
      r.voltage,
      r.current,
      r.power,
      r.flowRate,
      r.t1,
      r.t2,
      r.t3,
      r.t4,
      r.t5,
      r.t6,
      r.t7,
      r.t8,
      r.t9,
      r.deltaTWater,
      r.dTdx,
      r.heatInput,
      r.heatRemoved,
      r.heatLoss,
      r.calculatedK || 'N/A',
      r.steadyState
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ThermoTwin_VirtualTablet_${simState.material.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 text-slate-100 shadow-xl flex flex-col gap-3">
      {/* Virtual Tablet Device Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Tablet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm tracking-wide text-slate-200">
                VIRTUAL TABLET &bull; DATA LOGGING NOTEBOOK
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-950 text-indigo-300 border border-indigo-500/20">
                {observations.length} Logs
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              {isRealLab
                ? 'Official Real Lab Mode: Requires thermal steady state (|dT/dt| < 0.008 °C/s) to record'
                : 'Demo / Practice Mode: Real-time observation snapshots'}
            </p>
          </div>
        </div>

        {/* Tablet Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {canRecord ? (
            <button
              onClick={recordObservation}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Steady-State Reading</span>
            </button>
          ) : (
            <button
              disabled
              title={`Thermal equilibrium required before logging official data. Current rate: ${simState.rateOfChangeMax.toFixed(4)} °C/s`}
              className="px-3 py-1.5 bg-slate-800/80 text-slate-400 border border-slate-700/60 font-mono text-xs rounded-lg flex items-center gap-1.5 cursor-not-allowed opacity-80"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Stabilizing ({simState.rateOfChangeMax.toFixed(3)} °C/s)</span>
            </button>
          )}

          {/* Practice snapshot in real lab if student explicitly wants to log transient point */}
          {isRealLab && !isSteady && (
            <button
              onClick={recordObservation}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-[11px] font-mono rounded-lg transition-all"
              title="Log transient point for curve observation only (not final steady-state)"
            >
              + Transient Pt
            </button>
          )}
          
          <button
            onClick={exportCSV}
            disabled={observations.length === 0}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Download CSV of all logged readings"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Observation Table Content */}
      {observations.length === 0 ? (
        <div className="py-6 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 flex flex-col items-center justify-center gap-1.5">
          <Tablet className="w-6 h-6 text-slate-600 mb-0.5" />
          <p className="text-xs text-slate-300 font-medium">Virtual Tablet Notebook is Empty</p>
          <p className="text-[11px] text-slate-500 max-w-md font-mono">
            {isRealLab
              ? 'Adjust heater & cooling flow, observe temperature evolution on 3D apparatus, and wait for Steady State to record certified readings.'
              : 'Click "Record Steady-State Reading" or run Instant Demo to log readings.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-56 rounded-lg border border-slate-800">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800 text-[10px]">
              <tr>
                <th className="py-1.5 px-2">#</th>
                <th className="py-1.5 px-2">Time</th>
                <th className="py-1.5 px-2">V</th>
                <th className="py-1.5 px-2">I</th>
                <th className="py-1.5 px-2 text-amber-400">P (W)</th>
                <th className="py-1.5 px-2">Flow</th>
                <th className="py-1.5 px-2 text-amber-400">T1</th>
                <th className="py-1.5 px-2">T2</th>
                <th className="py-1.5 px-2">T3</th>
                <th className="py-1.5 px-2">T4</th>
                <th className="py-1.5 px-2">T5</th>
                <th className="py-1.5 px-2">T6</th>
                <th className="py-1.5 px-2 text-blue-400">T7</th>
                <th className="py-1.5 px-2">T8</th>
                <th className="py-1.5 px-2">T9</th>
                <th className="py-1.5 px-2 text-cyan-300">ΔTw</th>
                <th className="py-1.5 px-2 text-indigo-300">|dT/dx|</th>
                <th className="py-1.5 px-2 text-amber-300">Qin</th>
                <th className="py-1.5 px-2 text-cyan-300">Qwater</th>
                <th className="py-1.5 px-2 text-emerald-400">k (exp)</th>
                <th className="py-1.5 px-2">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {observations.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="py-1 px-2 font-bold text-slate-500">{idx + 1}</td>
                  <td className="py-1 px-2 text-slate-300">{row.elapsedSeconds}s</td>
                  <td className="py-1 px-2">{row.voltage}V</td>
                  <td className="py-1 px-2">{row.current}A</td>
                  <td className="py-1 px-2 font-bold text-amber-400">{row.power}W</td>
                  <td className="py-1 px-2">{row.flowRate}L</td>
                  <td className="py-1 px-2 font-bold text-amber-400">{row.t1}°</td>
                  <td className="py-1 px-2">{row.t2}°</td>
                  <td className="py-1 px-2">{row.t3}°</td>
                  <td className="py-1 px-2">{row.t4}°</td>
                  <td className="py-1 px-2">{row.t5}°</td>
                  <td className="py-1 px-2">{row.t6}°</td>
                  <td className="py-1 px-2 font-bold text-blue-400">{row.t7}°</td>
                  <td className="py-1 px-2">{row.t8}°</td>
                  <td className="py-1 px-2">{row.t9}°</td>
                  <td className="py-1 px-2 font-bold text-cyan-300">{row.deltaTWater}°</td>
                  <td className="py-1 px-2 font-bold text-indigo-300">{row.dTdx}</td>
                  <td className="py-1 px-2 text-amber-300">{row.heatInput}W</td>
                  <td className="py-1 px-2 text-cyan-300">{row.heatRemoved}W</td>
                  <td className="py-1 px-2 font-extrabold text-emerald-400">
                    {row.calculatedK ? `${row.calculatedK}` : '—'}
                  </td>
                  <td className="py-1 px-2">
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      row.steadyState.includes('STEADY')
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {row.steadyState.includes('STEADY') ? 'STEADY' : 'TRANS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
