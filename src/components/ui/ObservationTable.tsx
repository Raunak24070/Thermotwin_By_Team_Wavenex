'use client';

import React from 'react';
import { FileSpreadsheet, PlusCircle, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';

export const ObservationTable: React.FC = () => {
  const { observations, recordObservation, simState } = usePhysicsStore();

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
    link.setAttribute('download', `ThermoTwin_Observations_${simState.material.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          <div>
            <h3 className="font-bold text-sm tracking-wide text-slate-200">
              VIRTUAL LABORATORY NOTEBOOK OBSERVATIONS
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Logged Snapshots: {observations.length} {observations.length >= 3 && '• Minimum criteria satisfied'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={recordObservation}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Log Current Snapshot
          </button>
          
          <button
            onClick={exportCSV}
            disabled={observations.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {observations.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-medium">No observation rows logged yet.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Click <strong className="text-amber-400">Log Current Snapshot</strong> to capture thermocouple readings into your virtual lab notebook.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-64 rounded-lg border border-slate-800">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-800 text-[10px]">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Time</th>
                <th className="p-2">V (V)</th>
                <th className="p-2">I (A)</th>
                <th className="p-2">P (W)</th>
                <th className="p-2">Flow</th>
                <th className="p-2 text-amber-400">T1</th>
                <th className="p-2">T2</th>
                <th className="p-2">T3</th>
                <th className="p-2">T4</th>
                <th className="p-2">T5</th>
                <th className="p-2">T6</th>
                <th className="p-2 text-blue-400">T7</th>
                <th className="p-2">T8</th>
                <th className="p-2">T9</th>
                <th className="p-2 text-cyan-300">ΔTw</th>
                <th className="p-2 text-indigo-300">dT/dx</th>
                <th className="p-2 text-amber-300">Qin</th>
                <th className="p-2 text-cyan-300">Qwater</th>
                <th className="p-2 text-slate-400">Qloss</th>
                <th className="p-2 text-emerald-400">k (exp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {observations.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="p-2 font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2 text-slate-300">{row.elapsedSeconds}s</td>
                  <td className="p-2">{row.voltage}</td>
                  <td className="p-2">{row.current}</td>
                  <td className="p-2 font-bold text-amber-400">{row.power}</td>
                  <td className="p-2">{row.flowRate}</td>
                  <td className="p-2 font-bold text-amber-400">{row.t1}</td>
                  <td className="p-2">{row.t2}</td>
                  <td className="p-2">{row.t3}</td>
                  <td className="p-2">{row.t4}</td>
                  <td className="p-2">{row.t5}</td>
                  <td className="p-2">{row.t6}</td>
                  <td className="p-2 font-bold text-blue-400">{row.t7}</td>
                  <td className="p-2">{row.t8}</td>
                  <td className="p-2">{row.t9}</td>
                  <td className="p-2 font-bold text-cyan-300">{row.deltaTWater}°</td>
                  <td className="p-2 font-bold text-indigo-300">{row.dTdx}</td>
                  <td className="p-2 text-amber-300">{row.heatInput}W</td>
                  <td className="p-2 text-cyan-300">{row.heatRemoved}W</td>
                  <td className="p-2 text-slate-400">{row.heatLoss}W</td>
                  <td className="p-2 font-extrabold text-emerald-400">
                    {row.calculatedK ? `${row.calculatedK}` : '—'}
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
