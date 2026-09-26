'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, ShieldCheck, Flame, Droplets, Radio, Activity } from 'lucide-react';
import { LabCanvas } from '@/components/3d/LabCanvas';
import { LiveSensorsPanel } from '@/components/ui/LiveSensorsPanel';
import { TemperatureGraph } from '@/components/ui/TemperatureGraph';
import { SteadyStateBadge } from '@/components/ui/SteadyStateBadge';
import { useRealtimeMonitorStore } from '@/store/useRealtimeMonitorStore';

export default function IndividualStudentSupervisionPage({
  params
}: {
  params: Promise<{ studentId: string }>;
}) {
  const resolvedParams = use(params);
  const { liveStudents } = useRealtimeMonitorStore();
  const student = liveStudents[resolvedParams.studentId] || Object.values(liveStudents)[0];

  return (
    <div className="flex flex-col gap-6 py-2">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/live-lab"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <h1 className="text-lg font-black text-slate-100 flex items-center gap-2">
                SUPERVISING: {student.studentName}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                READ-ONLY MONITORING
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Session: {student.sessionId} &bull; Material: {student.materialName} &bull; Voltage: {student.voltage}V &bull; Flow: {student.waterFlowLmin} L/min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          TELEMETRY SYNCHRONIZED
        </div>
      </div>

      <SteadyStateBadge />

      {/* 3D Viewport in Supervision Mode */}
      <div className="h-[480px] w-full">
        <LabCanvas />
      </div>

      <LiveSensorsPanel />
      <TemperatureGraph />

    </div>
  );
}
