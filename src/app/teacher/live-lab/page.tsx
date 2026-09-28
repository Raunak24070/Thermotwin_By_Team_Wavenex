
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  Activity, 
  Flame, 
  Droplets, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';
import { useRealtimeMonitorStore } from '@/store/useRealtimeMonitorStore';

export default function TeacherLiveLabMonitorPage() {
  const { liveStudents, tickLiveSimulation } = useRealtimeMonitorStore();

  // Tick live student background simulation every 1.5 seconds to emulate active multi-student lab flux
  useEffect(() => {
    const timer = setInterval(() => {
      tickLiveSimulation();
    }, 1500);
    return () => clearInterval(timer);
  }, [tickLiveSimulation]);

  const studentList = Object.values(liveStudents);

  return (
    <div className="flex flex-col gap-6 py-2">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
              LIVE LABORATORY MONITOR
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Supervise all active student experiments in real time. Live thermocouple telemetry streams dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-mono text-xs font-bold flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            {studentList.length} STUDENTS ONLINE
          </div>
        </div>
      </div>

      {/* Student Experiments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentList.map((student) => {
          const isSteady = student.steadyStateStatus === 'STEADY_STATE';
          const isApproaching = student.steadyStateStatus === 'APPROACHING_STEADY_STATE';

          return (
            <div
              key={student.studentId}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl transition-all group"
            >
              
              {/* Header: Student Info & Material */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={student.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={student.studentName}
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">
                      {student.studentName}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Session: {student.sessionId}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-950 text-amber-400 border border-amber-500/20">
                  {student.materialName.split(' ')[0]}
                </span>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
                isSteady
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : isApproaching
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <span className="flex items-center gap-1.5">
                  {isSteady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 animate-spin" />}
                  {student.steadyStateStatus}
                </span>
                <span className="text-[10px] text-slate-400">{student.lastUpdatedTime}</span>
              </div>

              {/* Power & Water Flow Parameters */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{student.power} W ({student.voltage}V)</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold justify-end">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{student.waterFlowLmin} L/min</span>
                </div>
              </div>

              {/* Mini T1 - T9 Sensor Summary Row */}
              <div className="grid grid-cols-5 text-[10px] font-mono text-center gap-1 border-t border-slate-800 pt-3">
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[8px]">T1</span>
                  <span className="font-bold text-amber-400">{student.t1}°C</span>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[8px]">T4</span>
                  <span className="font-bold text-slate-300">{student.t4}°C</span>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[8px]">T7</span>
                  <span className="font-bold text-blue-400">{student.t7}°C</span>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[8px]">T8(In)</span>
                  <span className="font-bold text-slate-300">{student.t8}°C</span>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[8px]">T9(Out)</span>
                  <span className="font-bold text-slate-300">{student.t9}°C</span>
                </div>
              </div>

              {/* Inspect Student 3D Lab Button */}
              <Link
                to={`/teacher/live-lab/${student.studentId}`}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all group-hover:border-amber-500/50"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                Supervise 3D Experiment
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

            </div>
          );
        })}
      </div>

    </div>
  );
}
