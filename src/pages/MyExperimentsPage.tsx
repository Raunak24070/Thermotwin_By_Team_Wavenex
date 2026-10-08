import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Flame, 
  FlaskConical, 
  History, 
  ArrowLeft, 
  Trash2, 
  Eye, 
  Plus, 
  Calendar, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useExperimentStore } from '../store/useExperimentStore';
import { useAuthStore } from '../store/useAuthStore';
import { SavedExperiment } from '../api/apiClient';

export const MyExperimentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { experiments, fetchExperiments, deleteExperiment, isLoading, isSaving, error, successMessage, clearMessages } = useExperimentStore();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchExperiments();
    return () => {
      clearMessages();
    };
  }, [fetchExperiments, clearMessages]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete experiment "${name}" from MongoDB?`)) {
      setDeletingId(id);
      await deleteExperiment(id);
      setDeletingId(null);
    }
  };

  const getMaterialColor = (material: string) => {
    const mat = (material || '').toLowerCase();
    if (mat.includes('copper')) return 'text-[#FF6B35] bg-[#FF6B35]/10 border-[#FF6B35]/30';
    if (mat.includes('alum')) return 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30';
    if (mat.includes('steel')) return 'text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/30';
    return 'text-[#39FF14] bg-[#102713] border-[#163D19]';
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F0E] text-[#F5F5F5] flex flex-col font-mono select-none antialiased">
      
      {/* 1. Header Bar */}
      <header className="h-16 bg-[#111312] border-b border-[#252825] px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
            <Flame className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-[#F5F5F5] font-sans">
                THERMOTWIN
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#171918] border border-[#303330] text-[#38BDF8] font-bold">
                ARCHIVES
              </span>
            </div>
            <span className="text-[11px] text-[#7C827C]">
              MongoDB Saved Experiments &bull; User Session Data
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-[#171918] border border-[#252825] hover:border-[#39FF14]/40 text-xs text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <button
            onClick={() => navigate('/lab')}
            className="px-4 py-2 rounded-xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black text-xs uppercase tracking-wider flex items-center gap-2 glow-green cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Experiment</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Page Title & Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#252825] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#F5F5F5] flex items-center gap-2.5 font-sans">
              <History className="w-6 h-6 text-[#38BDF8]" />
              <span>My Saved Experiments</span>
            </h1>
            <p className="text-xs text-[#7C827C] mt-1">
              Archived experimental sessions for {currentUser?.name} &bull; Stored securely in MongoDB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7C827C]">TOTAL ARCHIVED:</span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[#102713] text-[#39FF14] border border-[#163D19]">
              {experiments.length} RUNS
            </span>
          </div>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-[#102713] border border-[#163D19] rounded-xl text-[#39FF14] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && experiments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#7C827C]">
            <div className="w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Fetching experiments from MongoDB...</span>
          </div>
        ) : experiments.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-6 bg-[#111312] border border-[#252825] rounded-3xl flex flex-col items-center justify-center text-center gap-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#171918] border border-[#252825] flex items-center justify-center text-[#7C827C]">
              <FlaskConical className="w-8 h-8 text-[#39FF14]" />
            </div>
            <div className="max-w-md flex flex-col gap-1">
              <h3 className="font-bold text-base text-[#F5F5F5]">No Saved Experiments Yet</h3>
              <p className="text-xs text-[#7C827C] leading-relaxed">
                You haven't saved any experimental runs to MongoDB yet. Launch the virtual laboratory, configure your apparatus, record telemetry, and click "Save Experiment".
              </p>
            </div>
            <button
              onClick={() => navigate('/lab')}
              className="mt-2 px-6 py-3 rounded-xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black text-xs uppercase tracking-wider flex items-center gap-2 glow-green cursor-pointer transition-all"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Launch Virtual Lab Now</span>
            </button>
          </div>
        ) : (
          /* Experiments Table / Cards */
          <div className="bg-[#111312] border border-[#252825] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#171918] border-b border-[#252825] text-[#7C827C] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Experiment Name</th>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Thermal Conductivity (k)</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252825]">
                  {experiments.map((exp) => {
                    const id = exp._id || exp.id || '';
                    const dateFormatted = new Date(exp.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr 
                        key={id}
                        className="hover:bg-[#171918]/60 transition-colors"
                      >
                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#F5F5F5] hover:text-[#39FF14] transition-colors cursor-pointer"
                              onClick={() => navigate(`/experiments/${id}`)}
                            >
                              {exp.experimentName}
                            </span>
                            <span className="text-[10px] text-[#7C827C]">
                              P={exp.heaterPower.toFixed(1)}W &bull; V={exp.heaterVoltage.toFixed(1)}V &bull; Flow={exp.coolingWaterFlow.toFixed(2)} L/min
                            </span>
                          </div>
                        </td>

                        {/* Material */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold ${getMaterialColor(exp.material)}`}>
                            {exp.material}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-[#B5BBB5] whitespace-nowrap text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#7C827C]" />
                            <span>{dateFormatted}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                            exp.experimentStatus === 'STEADY_STATE'
                              ? 'bg-[#102713] text-[#39FF14] border-[#163D19]'
                              : exp.experimentStatus === 'SUBMITTED'
                              ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
                              : 'bg-[#202321] text-[#B5BBB5] border-[#303330]'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            <span>{exp.experimentStatus}</span>
                          </span>
                        </td>

                        {/* Conductivity */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-sm text-[#39FF14]">
                            {exp.thermalConductivity ? exp.thermalConductivity.toFixed(1) : '—'}
                          </span>
                          <span className="text-[10px] text-[#7C827C] ml-1">W/(m&middot;K)</span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/experiments/${id}`)}
                              className="p-1.5 rounded-lg bg-[#202321] hover:bg-[#252825] text-[#38BDF8] border border-[#303330] hover:border-[#38BDF8]/50 transition-colors cursor-pointer"
                              title="View Experiment Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(id, exp.experimentName)}
                              disabled={deletingId === id}
                              className="p-1.5 rounded-lg bg-[#202321] hover:bg-red-500/20 text-[#7C827C] hover:text-red-400 border border-[#303330] hover:border-red-500/40 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete from MongoDB"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
