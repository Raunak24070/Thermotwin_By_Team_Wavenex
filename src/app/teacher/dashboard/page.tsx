
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  GraduationCap, 
  BarChart3, 
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClassStore } from '@/store/useClassStore';
import { useRealtimeMonitorStore } from '@/store/useRealtimeMonitorStore';

export default function TeacherDashboard() {
  const router = useNavigate();
  const { currentUser, isAuthenticated } = useAuthStore();
  const { classes, submissions, students } = useClassStore();
  const { liveStudents } = useRealtimeMonitorStore();

  useEffect(() => {
    if (!isAuthenticated || !currentUser || currentUser.role !== 'TEACHER') {
      router('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser || currentUser.role !== 'TEACHER') {
    return null;
  }

  const mySubmissions = submissions.filter((sub) => {
    if (!currentUser) return false;
    if (sub.targetTeacherId && sub.targetTeacherId === currentUser.id) return true;
    if (sub.targetTeacherEmail && sub.targetTeacherEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (sub.targetClassCode && currentUser.classId && sub.targetClassCode.toUpperCase() === currentUser.classId.toUpperCase()) return true;
    if (!sub.targetTeacherId && !sub.targetTeacherEmail && !sub.targetClassCode) return true;
    return false;
  });

  const activeCount = Object.values(liveStudents).filter((s) => s.isOnline).length;
  const pendingReviewCount = mySubmissions.filter((s) => s.reviewStatus === 'PENDING').length;
  const avgError = mySubmissions.length > 0
    ? (mySubmissions.reduce((acc, s) => acc + s.percentageError, 0) / mySubmissions.length).toFixed(2)
    : '0.00';

  return (
    <div className="flex flex-col gap-8 py-2">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full border-2 border-indigo-500/40 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-100">{currentUser.name}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                TEACHER &bull; INSTRUCTOR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Faculty ID: {currentUser.teacherIdNumber || 'FAC-THERMO-99'} &bull; {currentUser.institution}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/teacher/live-lab"
            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Open Live Lab Monitor ({activeCount} Active)
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL STUDENTS</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-100 my-2">
            {students.length}
          </div>
          <span className="text-[10px] text-slate-500">Enrolled across {classes.length} classes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE LIVE LAB</span>
            <Activity className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black font-mono text-red-400 my-2">
            {activeCount} <span className="text-xs text-slate-400">students</span>
          </div>
          <span className="text-[10px] text-red-400/80">Real-time telemetry online</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>PENDING REVIEWS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 my-2">
            {pendingReviewCount}
          </div>
          <span className="text-[10px] text-slate-500">Submissions awaiting feedback</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>CLASS AVG ERROR</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 my-2">
            {avgError}%
          </div>
          <span className="text-[10px] text-slate-500">Accuracy vs theoretical k</span>
        </div>

      </div>

      {/* Class Overview Cards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-200 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            My Managed Classes &amp; Codes
          </h3>
          <Link to="/teacher/classes" className="text-xs font-semibold text-amber-400 hover:underline">
            Manage All Classes &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-base text-slate-100">{cls.name}</h4>
                <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  CODE: {cls.code}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Institution: {cls.institution} &bull; Created: {cls.createdDate}
              </p>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs font-mono">
                <span className="text-slate-400">{cls.studentIds.length} Students Enrolled</span>
                <Link to="/teacher/classes" className="text-amber-400 font-semibold hover:underline">
                  Assign Experiment &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
