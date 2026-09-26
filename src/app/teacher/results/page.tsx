'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, CheckCircle2, MessageSquare, Send, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClassStore } from '@/store/useClassStore';
import { ExportPdfModal } from '@/components/ui/ExportPdfModal';

export default function TeacherResultsPage() {
  const { currentUser } = useAuthStore();
  const { submissions, addTeacherFeedback } = useClassStore();

  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleSaveFeedback = (submissionId: string) => {
    if (!feedbackText.trim() || !currentUser) return;
    addTeacherFeedback(submissionId, feedbackText.trim(), currentUser.name);
    setActiveFeedbackId(null);
    setFeedbackText('');
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-400" />
          Student Experiment Submissions &amp; Review Queue
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Inspect student experimental observations, Fourier thermal conductivity calculations, and provide feedback.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="font-extrabold text-base text-slate-300">No Submissions Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Student submissions will appear here as soon as they complete steady state in the 3D Virtual Lab.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {submissions.map((sub) => {
            const isReviewed = sub.reviewStatus === 'REVIEWED';

            return (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-100">{sub.studentName}</h3>
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {sub.materialName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                      Session ID: {sub.sessionId} &bull; Submitted: {sub.submittedAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                      isReviewed
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {isReviewed ? 'REVIEWED' : 'PENDING REVIEW'}
                    </span>

                    <ExportPdfModal submission={sub} />
                  </div>
                </div>

                {/* Experimental Data Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-mono text-xs">
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
                    <span className="text-slate-500 text-[10px] block">ERROR % vs REF</span>
                    <span className="font-bold text-slate-200">{sub.percentageError}%</span>
                  </div>
                </div>

                {/* Thermocouples T1 - T9 Summary */}
                <div className="grid grid-cols-9 text-[10px] font-mono text-center gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div><span className="text-slate-500 block">T1</span><strong className="text-amber-400">{sub.t1}°C</strong></div>
                  <div><span className="text-slate-500 block">T2</span><strong>{sub.t2}°C</strong></div>
                  <div><span className="text-slate-500 block">T3</span><strong>{sub.t3}°C</strong></div>
                  <div><span className="text-slate-500 block">T4</span><strong>{sub.t4}°C</strong></div>
                  <div><span className="text-slate-500 block">T5</span><strong>{sub.t5}°C</strong></div>
                  <div><span className="text-slate-500 block">T6</span><strong>{sub.t6}°C</strong></div>
                  <div><span className="text-slate-500 block">T7</span><strong className="text-blue-400">{sub.t7}°C</strong></div>
                  <div><span className="text-slate-500 block">T8(In)</span><strong>{sub.t8}°C</strong></div>
                  <div><span className="text-slate-500 block">T9(Out)</span><strong>{sub.t9}°C</strong></div>
                </div>

                {/* Teacher Feedback Box */}
                {sub.teacherFeedback ? (
                  <div className="bg-indigo-500/10 border border-indigo-500/30 p-3.5 rounded-xl text-xs flex flex-col gap-1">
                    <span className="font-bold text-indigo-300 font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      Teacher Review Feedback ({sub.gradedBy} on {sub.reviewedAt}):
                    </span>
                    <p className="text-slate-300 italic">{sub.teacherFeedback}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                    {activeFeedbackId === sub.id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          rows={2}
                          placeholder="Write instructor feedback on student calculations and observation table..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setActiveFeedbackId(null)}
                            className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveFeedback(sub.id)}
                            className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Submit Review
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveFeedbackId(sub.id);
                          setFeedbackText('');
                        }}
                        className="self-start px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Add Instructor Feedback
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
