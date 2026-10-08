import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Eye, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  GraduationCap, 
  Users,
  Award,
  ChevronRight
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useClassStore } from '@/store/useClassStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useExperimentStore } from '@/store/useExperimentStore';
import { performFourierAnalysis } from '@/physics/fourierCalculator';

interface ResultReportInspectorProps {
  onOpenReportPreview: () => void;
  onCollapse?: () => void;
}

export const ResultReportInspector: React.FC<ResultReportInspectorProps> = ({ onOpenReportPreview, onCollapse }) => {
  const { simState, apparatusConfig, observations, experimentMode } = usePhysicsStore();
  const { submitResult, submissions } = useClassStore();
  const { currentUser, registeredUsers } = useAuthStore();
  const { saveCurrentExperiment } = useExperimentStore();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('user-tch-201');
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [submittedTime, setSubmittedTime] = useState<string>('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const analysis = performFourierAnalysis(
    simState.voltage,
    simState.current,
    [
      simState.sensors.t1,
      simState.sensors.t2,
      simState.sensors.t3,
      simState.sensors.t4,
      simState.sensors.t5,
      simState.sensors.t6,
      simState.sensors.t7,
    ],
    simState.sensors.t8,
    simState.sensors.t9,
    simState.waterFlowLmin,
    simState.material.thermalConductivity,
    simState.steadyStateStatus,
    apparatusConfig.crossSectionArea
  );

  const registeredTeachers = (registeredUsers || []).filter((u) => u?.role === 'TEACHER');
  const gradeScore = Math.max(60, Math.min(100, Math.round(100 - (analysis?.errorPercentage || 0) * 1.5)));

  const handleSubmit = () => {
    if (!currentUser) return;
    setSubmissionError(null);

    const targetTeacher = registeredTeachers.find((t) => t.id === selectedTeacherId);

    const now = new Date().toLocaleTimeString();
    submitResult({
      sessionId: `EXP-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      classId: currentUser.classId || 'class-thermo-101',
      materialId: simState.material.id,
      materialName: simState.material.name,
      voltage: Number(simState.voltage.toFixed(1)),
      current: Number(simState.current.toFixed(2)),
      power: Number(simState.power.toFixed(1)),
      waterFlowLmin: Number(simState.waterFlowLmin.toFixed(2)),
      t1: Number(simState.sensors.t1.toFixed(1)),
      t2: Number(simState.sensors.t2.toFixed(1)),
      t3: Number(simState.sensors.t3.toFixed(1)),
      t4: Number(simState.sensors.t4.toFixed(1)),
      t5: Number(simState.sensors.t5.toFixed(1)),
      t6: Number(simState.sensors.t6.toFixed(1)),
      t7: Number(simState.sensors.t7.toFixed(1)),
      t8: Number(simState.sensors.t8.toFixed(1)),
      t9: Number(simState.sensors.t9.toFixed(1)),
      tempGradient: Number(analysis.temperatureGradientCperM.toFixed(2)),
      heatInputW: Number(analysis.heatInputPowerW.toFixed(1)),
      heatRemovedWaterW: Number(analysis.waterHeatRemovalW.toFixed(1)),
      experimentalK: analysis.experimentalK,
      referenceK: analysis.referenceK,
      absoluteError: Number(Math.abs(analysis.experimentalK - analysis.referenceK).toFixed(2)),
      percentageError: analysis.errorPercentage,
      timeToSteadyStateSec: Math.round(simState.timeSeconds),
      observationCount: Math.max(1, observations.length),
      mode: experimentMode === 'REAL_LAB' ? 'REAL_LAB' : 'DEMO',
      isCertifiedRealLab: experimentMode === 'REAL_LAB',
      gradeScore: gradeScore,
      targetTeacherId: targetTeacher?.id,
      targetTeacherEmail: targetTeacher?.email
    });

    // Save to MongoDB Archive
    saveCurrentExperiment({
      experimentName: `${simState.material.name} Submission #${Date.now().toString().slice(-4)}`,
      material: simState.material.name,
      thermalConductivity: analysis.experimentalK,
      density: simState.material.density,
      specificHeat: simState.material.specificHeat,
      rodLength: apparatusConfig.rodLengthCm / 100,
      rodDiameter: apparatusConfig.rodDiameterMm / 1000,
      heaterVoltage: simState.voltage,
      heaterPower: simState.power,
      coolingWaterFlow: simState.waterFlowLmin,
      sensorReadings: {
        t1: simState.sensors.t1,
        t2: simState.sensors.t2,
        t3: simState.sensors.t3,
        t4: simState.sensors.t4,
        t5: simState.sensors.t5,
        t6: simState.sensors.t6,
        t7: simState.sensors.t7,
        t8: simState.sensors.t8,
        t9: simState.sensors.t9
      },
      temperatureGradient: analysis.temperatureGradientCperM,
      heatRemoved: analysis.waterHeatRemovalW,
      experimentStatus: 'SUBMITTED',
      observationsCount: Math.max(1, observations.length)
    });

    setSubmittedTime(now);
    setSubmissionSuccess(true);
  };

  return (
    <aside className="w-80 bg-[#171918] border-l border-[#252825] flex flex-col justify-between h-full select-none shrink-0 overflow-y-auto">
      
      {/* Header */}
      <div className="p-4 border-b border-[#252825]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#39FF14]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F5] font-mono">
              RESULT &amp; REPORT PANEL
            </h2>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 rounded bg-[#202321] hover:bg-[#242725] text-[#7C827C] hover:text-[#39FF14] transition-colors cursor-pointer"
              title="Collapse Properties Inspector (▶)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-[#7C827C] font-mono">
          Final laboratory certification &amp; academic faculty submission.
        </p>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-4 text-xs font-mono">
        
        {/* Core Calculation Metrics */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
            ANALYTICAL RESULT
          </span>

          <div className="bg-[#202321] rounded-xl border border-[#252825] p-3 flex flex-col gap-2.5">
            <div className="flex justify-between items-baseline">
              <span className="text-[#7C827C]">Experimental k:</span>
              <span className="text-lg font-black text-[#39FF14]">
                {analysis.experimentalK > 0 ? analysis.experimentalK.toFixed(1) : '—'} W/(m&middot;K)
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[#7C827C]">Theoretical Reference:</span>
              <span className="font-bold text-[#E8ECE8]">
                {analysis.referenceK} W/(m&middot;K)
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-[#252825]">
              <span className="text-[#7C827C]">Percentage Error:</span>
              <span className="font-bold text-[#8BEA63]">
                {analysis.errorPercentage.toFixed(2)} %
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[#7C827C]">Estimated Score:</span>
              <span className="font-bold text-[#38BDF8]">
                {gradeScore} / 100 (Grade A)
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Status Pill */}
        <div className="p-2.5 rounded-xl bg-[#102713] border border-[#163D19] flex items-center gap-2 text-[#39FF14]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-[11px] font-bold">✓ Calculation Complete &amp; Verified</span>
        </div>

        {/* Report Metadata */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#252825]">
          <span className="text-[11px] font-semibold text-[#B5BBB5] uppercase tracking-wider">
            REPORT METADATA
          </span>

          <div className="bg-[#202321] rounded-xl border border-[#252825] divide-y divide-[#252825] text-[11px]">
            <div className="p-2 flex justify-between">
              <span className="text-[#7C827C]">Student:</span>
              <span className="font-bold text-[#E8ECE8]">{currentUser?.name}</span>
            </div>
            <div className="p-2 flex justify-between">
              <span className="text-[#7C827C]">ID Number:</span>
              <span className="text-[#E8ECE8]">{currentUser?.studentIdNumber || 'ME-2026-4401'}</span>
            </div>
            <div className="p-2 flex justify-between">
              <span className="text-[#7C827C]">Material:</span>
              <span className="text-[#E8ECE8]">{simState.material.name}</span>
            </div>
            <div className="p-2 flex justify-between">
              <span className="text-[#7C827C]">Date:</span>
              <span className="text-[#E8ECE8]">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Target Faculty Destination */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-[#252825]">
          <label className="text-[10px] text-[#7C827C] uppercase tracking-wider font-semibold">
            ASSIGN TO FACULTY MEMBER:
          </label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full bg-[#202321] border border-[#303330] text-[#E8ECE8] text-xs font-mono rounded-lg p-2 focus:outline-none focus:border-[#39FF14] cursor-pointer"
          >
            {registeredTeachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.department?.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>

        {/* Post-Submission Status Block (When Submitted) */}
        {submissionSuccess && (
          <div className="p-3 rounded-xl bg-[#102713] border border-[#163D19] glow-green-sm flex flex-col gap-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-[#39FF14] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>✓ EXPERIMENT SUBMITTED</span>
            </div>
            <div className="text-[10px] text-[#8BEA63] flex flex-col gap-0.5 pt-1 border-t border-[#163D19]">
              <div className="flex justify-between">
                <span>Submission Status:</span>
                <span className="font-bold text-[#F5F5F5]">SUBMITTED</span>
              </div>
              <div className="flex justify-between">
                <span>Submitted At:</span>
                <span className="font-bold text-[#F5F5F5]">{submittedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Faculty Review:</span>
                <span className="font-bold text-[#F59E0B]">PENDING</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-[#252825] bg-[#111312] flex flex-col gap-2 font-mono">
        <button
          onClick={onOpenReportPreview}
          className="w-full py-2.5 px-3 rounded-xl bg-[#202321] hover:bg-[#242725] border border-[#303330] hover:border-[#F5F5F5] text-[#F5F5F5] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>PREVIEW REPORT &amp; PDF</span>
        </button>

        {!submissionSuccess ? (
          <button
            onClick={handleSubmit}
            className="w-full py-3 px-4 rounded-xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg glow-green cursor-pointer transition-all active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>SUBMIT LAB REPORT</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 px-3 rounded-xl bg-[#202321] border border-[#163D19] text-[#8BEA63] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Update Submission</span>
          </button>
        )}
      </div>

    </aside>
  );
};
