'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FlaskConical, 
  Calendar, 
  Clock, 
  ArrowRight, 
  PlusCircle, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClassStore } from '@/store/useClassStore';

export default function StudentDashboard() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuthStore();
  const { assignments, submissions, joinClassByCode } = useClassStore();
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinMsg, setJoinMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  // Student's submitted attempts
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    const ok = joinClassByCode(classCodeInput.trim(), currentUser.id);
    if (ok) {
      setJoinMsg({ success: true, text: `Successfully joined class with code ${classCodeInput.toUpperCase()}` });
      setClassCodeInput('');
    } else {
      setJoinMsg({ success: false, text: `Invalid class code: ${classCodeInput.toUpperCase()}` });
    }
  };

  return (
    <div className="flex flex-col gap-8 py-2">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full border-2 border-amber-500/40 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-100">{currentUser.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                STUDENT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ID: {currentUser.studentIdNumber || '2026-ME-042'} &bull; {currentUser.institution}
            </p>
          </div>
        </div>

        {/* Join Class Form */}
        <form onSubmit={handleJoinClass} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 w-full md:w-auto">
          <input
            type="text"
            placeholder="Enter Class Code (e.g. THERMO-7K2P)"
            value={classCodeInput}
            onChange={(e) => setClassCodeInput(e.target.value)}
            className="bg-transparent text-xs font-mono px-2 py-1 text-slate-200 outline-none w-56 placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Join
          </button>
        </form>
      </div>

      {joinMsg && (
        <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
          joinMsg.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span>{joinMsg.text}</span>
        </div>
      )}

      {/* Main Assigned Experiments Section */}
      <div className="flex flex-col gap-4">
        <h3 className="font-extrabold text-lg text-slate-200 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-amber-400" />
          Assigned Thermal Laboratory Experiments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assign) => (
            <div key={assign.id} className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-xl transition-all group">
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400 border border-amber-500/20">
                    {assign.className}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {assign.dueDate}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-slate-100 group-hover:text-amber-400 transition-colors mt-1">
                  {assign.title}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {assign.instructions}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
                <div className="text-[11px] font-mono text-slate-500">
                  Max Attempts: <strong className="text-slate-300">{assign.maxAttempts}</strong>
                </div>

                <Link
                  href="/student/experiment/exp-thermal-rod"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
                >
                  Enter Virtual Lab
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Submissions & Attempt History Preview */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            My Experiment Attempt History ({mySubmissions.length})
          </h3>
          <Link href="/student/history" className="text-xs font-semibold text-amber-400 hover:underline">
            View All Attempts &rarr;
          </Link>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">No submitted experiment attempts yet.</p>
            <p className="text-[11px] text-slate-500 mt-1">Enter the 3D Virtual Lab above to perform your first experiment!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mySubmissions.map((sub) => (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 font-mono">{sub.materialName}</span>
                  <span className="text-[10px] font-mono text-slate-500">{sub.submittedAt}</span>
                </div>
                <div className="grid grid-cols-3 text-xs font-mono pt-1">
                  <div>k_exp: <strong className="text-emerald-400">{sub.experimentalK}</strong></div>
                  <div>k_ref: <strong className="text-slate-300">{sub.referenceK}</strong></div>
                  <div>Error: <strong className="text-amber-400">{sub.percentageError}%</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
