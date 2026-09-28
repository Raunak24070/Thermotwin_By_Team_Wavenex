
import React from 'react';
import { Activity, CheckCircle2, Clock, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useClassStore } from '@/store/useClassStore';
import { ExportPdfModal } from '@/components/ui/ExportPdfModal';

export default function StudentHistoryPage() {
  const { currentUser } = useAuthStore();
  const { submissions } = useClassStore();

  const mySubmissions = currentUser 
    ? submissions.filter((s) => s.studentId === currentUser.id) 
    : [];

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            My Experiment Attempt History
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Review recorded observations, calculated thermal conductivities, and teacher feedback.
          </p>
        </div>

        <Link
          to="/student/dashboard"
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {mySubmissions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-300">No Submitted Attempts Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            You have not submitted any completed thermal conductivity experiments. Enter the 3D Virtual Lab to begin an attempt!
          </p>
          <Link
            to="/student/experiment/exp-thermal-rod"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
          >
            Enter 3D Virtual Lab &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {mySubmissions.map((sub) => (
            <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {sub.sessionId}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-100">{sub.materialName}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 block mt-1">
                    Submitted: {sub.submittedAt} &bull; Time to Steady State: {sub.timeToSteadyStateSec}s
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    sub.reviewStatus === 'REVIEWED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {sub.reviewStatus === 'REVIEWED' ? 'REVIEWED BY PROFESSOR' : 'PENDING REVIEW'}
                  </span>

                  <ExportPdfModal submission={sub} />
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">POWER P</span>
                  <span className="font-bold text-amber-400">{sub.power} W ({sub.voltage}V)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">GRADIENT |dT/dx|</span>
                  <span className="font-bold text-cyan-400">{sub.tempGradient} °C/m</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">EXPERIMENTAL k</span>
                  <span className="font-extrabold text-emerald-400">{sub.experimentalK} W/(m·K)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">ERROR %</span>
                  <span className="font-bold text-slate-200">{sub.percentageError}%</span>
                </div>
              </div>

              {/* Teacher Feedback Box if reviewed */}
              {sub.teacherFeedback && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 p-3.5 rounded-xl text-xs flex flex-col gap-1">
                  <span className="font-bold text-indigo-300 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    Teacher Feedback ({sub.gradedBy})
                  </span>
                  <p className="text-slate-300 italic">{sub.teacherFeedback}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
