
import React, { useState } from 'react';
import { Calculator, CheckCircle, AlertCircle, Send, ArrowRight, ShieldCheck } from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useClassStore } from '@/store/useClassStore';
import { useAuthStore } from '@/store/useAuthStore';
import { performFourierAnalysis } from '@/physics/fourierCalculator';

interface FourierWorkbenchProps {
  onSubmittedSuccess?: () => void;
}

export const FourierWorkbench: React.FC<FourierWorkbenchProps> = ({ onSubmittedSuccess }) => {
  const { simState, observations, experimentMode, apparatusConfig } = usePhysicsStore();
  const { submitResult } = useClassStore();
  const { currentUser, registeredUsers } = useAuthStore();
  
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [selectedFacultyOption, setSelectedFacultyOption] = useState<string>('');
  const [customFacultyInput, setCustomFacultyInput] = useState<string>('');

  const registeredTeachers = registeredUsers.filter((u) => u.role === 'TEACHER');

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

  const isRealLab = experimentMode === 'REAL_LAB';
  const gradeScore = Math.max(60, Math.min(100, Math.round(100 - (analysis?.errorPercentage || 0) * 1.5)));

  const handleSubmit = () => {
    if (!currentUser) return;

    if (!analysis.isValidForSubmission) {
      setSubmissionFeedback(analysis.validationErrorMessage || 'Submission criteria not satisfied.');
      return;
    }

    if (isRealLab && observations.length < 3) {
      setSubmissionFeedback(`Real Laboratory Exam requires at least 3 timed observation snapshots logged in your notebook (currently recorded: ${observations.length}/3).`);
      return;
    }

    // Determine target teacher
    let targetTeacherId: string | undefined = undefined;
    let targetTeacherEmail: string | undefined = undefined;
    let targetClassCode: string | undefined = undefined;

    if (selectedFacultyOption && selectedFacultyOption !== 'CUSTOM') {
      const teacher = registeredTeachers.find((t) => t.id === selectedFacultyOption);
      if (teacher) {
        targetTeacherId = teacher.id;
        targetTeacherEmail = teacher.email;
      }
    } else if (customFacultyInput.trim()) {
      const input = customFacultyInput.trim();
      if (input.includes('@')) {
        targetTeacherEmail = input.toLowerCase();
        // check if matching registered teacher
        const found = registeredTeachers.find((t) => t.email.toLowerCase() === input.toLowerCase());
        if (found) targetTeacherId = found.id;
      } else {
        targetClassCode = input.toUpperCase();
      }
    }

    if (isRealLab && !targetTeacherId && !targetTeacherEmail && !targetClassCode) {
      setSubmissionFeedback('Please specify the destination Faculty Member, Teacher Email, or Classroom Code before submitting your exam.');
      return;
    }

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
      observationCount: observations.length,
      mode: isRealLab ? 'REAL_LAB' : 'DEMO',
      isCertifiedRealLab: isRealLab,
      gradeScore: isRealLab ? gradeScore : undefined,
      targetTeacherId,
      targetTeacherEmail,
      targetClassCode
    });

    setSubmissionFeedback('SUCCESS');
    if (onSubmittedSuccess) onSubmittedSuccess();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 shadow-xl flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm tracking-wide text-slate-200">
            FOURIER'S LAW & EXPERIMENTAL K CALCULATOR
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Q = -k · A · (dT/dx)
        </span>
      </div>

      {/* Main Formula Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Heat Power Input */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">1. Heat Power Q_in</span>
          <div className="text-xl font-extrabold font-mono text-amber-400 my-1">
            {analysis.heatInputPowerW.toFixed(1)} <span className="text-xs text-slate-400">W</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">P = V × I ({simState.voltage}V × {simState.current.toFixed(2)}A)</span>
        </div>

        {/* Cross Sectional Area */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">2. Area A (User Input)</span>
          <div className="text-xl font-extrabold font-mono text-indigo-300 my-1">
            {(apparatusConfig.crossSectionArea * 1e4).toFixed(2)}×10⁻⁴ <span className="text-xs text-slate-400">m²</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">D = {apparatusConfig.rodDiameterMm} mm &bull; A = &pi;&times;(D/2)&sup2;</span>
        </div>

        {/* Temperature Gradient dT/dx */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-slate-400 uppercase">3. Gradient |dT/dx|</span>
          <div className="text-xl font-extrabold font-mono text-cyan-400 my-1">
            {analysis.temperatureGradientCperM.toFixed(2)} <span className="text-xs text-slate-400">°C/m</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Linear slope T1..T7 over 0.3m</span>
        </div>

        {/* Calculated Experimental k */}
        <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/40 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-amber-300 uppercase font-bold">4. Calculated k (exp)</span>
          <div className="text-2xl font-black font-mono text-amber-400 my-1">
            {analysis.experimentalK > 0 ? analysis.experimentalK : '—'} <span className="text-xs text-amber-300">W/(m·K)</span>
          </div>
          <span className="text-[9px] font-mono text-amber-300/80">Ref ({simState.material.name}): {analysis.referenceK}</span>
        </div>

      </div>

      {/* Faculty Destination Selector */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
            <span className="text-amber-400">📤</span>
            Submit Report To Faculty / Instructor:
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            Select a faculty member or enter their institutional mail ID / classroom code.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {registeredTeachers.length > 0 && (
            <select
              value={selectedFacultyOption}
              onChange={(e) => {
                setSelectedFacultyOption(e.target.value);
                if (e.target.value !== 'CUSTOM') {
                  setCustomFacultyInput('');
                }
              }}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">— Select Faculty Member —</option>
              {registeredTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
              <option value="CUSTOM">✏️ Enter Mail ID / Class Code...</option>
            </select>
          )}

          {(registeredTeachers.length === 0 || selectedFacultyOption === 'CUSTOM') && (
            <input
              type="text"
              placeholder="e.g. teacher@institution.edu or THERMO-7K2P"
              value={customFacultyInput}
              onChange={(e) => setCustomFacultyInput(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 min-w-[260px]"
            />
          )}
        </div>
      </div>

      {/* Accuracy & Energy Balance comparison */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-400 block text-[10px]">EXPERIMENTAL ERROR %</span>
            <span className={`font-bold text-sm ${analysis.errorPercentage < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {analysis.errorPercentage.toFixed(2)}% Error
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">WATER HEAT REMOVAL Q_water</span>
            <span className="font-bold text-cyan-300">{analysis.waterHeatRemovalW.toFixed(1)} W</span>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-slate-400 block text-[10px]">INSULATION HEAT LOSS Q_loss</span>
            <span className="font-bold text-slate-300">{analysis.heatLossW.toFixed(1)} W</span>
          </div>
        </div>

        {/* Submit Experiment Button */}
        <div>
          {submissionFeedback === 'SUCCESS' ? (
            <div className={`px-4 py-2 border rounded-xl font-bold flex items-center gap-2 text-xs ${
              isRealLab 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {isRealLab ? '✅ Official Certified Lab Exam Submitted to Faculty!' : '🚀 Demo / Practice Attempt Saved!'}
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!analysis.isValidForSubmission || (isRealLab && observations.length < 3)}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs tracking-wider flex items-center gap-2 shadow-lg transition-all ${
                analysis.isValidForSubmission && (!isRealLab || observations.length >= 3)
                  ? isRealLab
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 cursor-pointer shadow-emerald-500/20 scale-102'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 cursor-pointer shadow-orange-500/20 scale-102'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Send className="w-4 h-4" />
              {isRealLab 
                ? (observations.length >= 3 
                    ? `Submit Official Lab Exam (${gradeScore}% Est. Grade)` 
                    : `Submit Locked (Need 3 Snapshots: ${observations.length}/3)`)
                : 'Save Demo / Practice Attempt'
              }
            </button>
          )}
        </div>
      </div>

      {/* Validation Feedback Warning */}
      {submissionFeedback && submissionFeedback !== 'SUCCESS' && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{submissionFeedback}</span>
        </div>
      )}

    </div>
  );
};
