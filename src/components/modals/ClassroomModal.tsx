import React, { useState } from 'react';
import { 
  X, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  GraduationCap,
  Plus,
  Send
} from 'lucide-react';
import { useClassStore } from '@/store/useClassStore';
import { useAuthStore } from '@/store/useAuthStore';

interface ClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClassroomModal: React.FC<ClassroomModalProps> = ({ isOpen, onClose }) => {
  const { classes, assignments, submissions, addTeacherFeedback, joinClassByCode } = useClassStore();
  const { currentUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions' | 'classes'>('assignments');
  const [classCodeInput, setClassCodeInput] = useState<string>('');
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim() || !currentUser) return;
    const ok = joinClassByCode(classCodeInput.trim(), currentUser.id);
    if (ok) {
      setJoinMsg('Successfully enrolled into classroom!');
      setClassCodeInput('');
    } else {
      setJoinMsg('Invalid classroom code. Check with your instructor.');
    }
  };

  const handleSendFeedback = (subId: string) => {
    const text = feedbackInput[subId]?.trim();
    if (!text || !currentUser) return;
    addTeacherFeedback(subId, text, currentUser.name);
    setFeedbackInput((prev) => ({ ...prev, [subId]: '' }));
  };

  const isTeacher = currentUser?.role === 'TEACHER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#171918] border border-[#303330] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-[#252825] flex items-center justify-between bg-[#111312]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
              <Users className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wide">
                VIRTUAL CLASSROOMS &bull; ACADEMIC PORTAL
              </h2>
              <span className="text-[10px] text-[#7C827C]">
                Institutional Class Sections &bull; Lab Assignments &bull; Faculty Grading
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#202321] rounded-lg p-0.5 border border-[#252825] text-[10px]">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                  activeTab === 'assignments' ? 'bg-[#102713] text-[#39FF14] font-bold' : 'text-[#7C827C] hover:text-[#F5F5F5]'
                }`}
              >
                Assignments ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                  activeTab === 'submissions' ? 'bg-[#102713] text-[#39FF14] font-bold' : 'text-[#7C827C] hover:text-[#F5F5F5]'
                }`}
              >
                Submissions ({submissions.length})
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                  activeTab === 'classes' ? 'bg-[#102713] text-[#39FF14] font-bold' : 'text-[#7C827C] hover:text-[#F5F5F5]'
                }`}
              >
                Classrooms ({classes.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#202321] text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#242725] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0D0F0E]">
          
          {/* Tab 1: Assignments */}
          {activeTab === 'assignments' && (
            <div className="flex flex-col gap-3">
              {assignments.map((assign) => (
                <div
                  key={assign.id}
                  className="p-4 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-2 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#F5F5F5]">{assign.title}</h3>
                      <span className="text-[10px] text-[#7C827C]">{assign.className}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#102713] text-[#39FF14] border border-[#163D19] text-[10px] font-bold">
                      DUE: {assign.dueDate}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#B5BBB5] leading-relaxed">
                    {assign.instructions}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-[#7C827C] pt-2 border-t border-[#252825]">
                    <span>Target Material: <strong className="text-[#39FF14] uppercase">{assign.requiredMaterial || 'Copper'}</strong></span>
                    <span>Voltage Range: <strong>6.0 &ndash; 12.0 V</strong></span>
                    <span>Cooling Flow: <strong>1.0 &ndash; 2.5 L/min</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Submissions Queue */}
          {activeTab === 'submissions' && (
            <div className="flex flex-col gap-3">
              {submissions.length === 0 ? (
                <div className="py-12 text-center text-[#7C827C]">
                  No student lab reports submitted yet.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#39FF14]" />
                        <span className="font-bold text-xs text-[#F5F5F5]">{sub.studentName}</span>
                        <span className="text-[10px] text-[#7C827C]">({sub.sessionId})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        sub.reviewStatus === 'REVIEWED'
                          ? 'bg-[#102713] text-[#39FF14] border-[#163D19]'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                      }`}>
                        {sub.reviewStatus === 'REVIEWED' ? '✓ GRADED' : 'PENDING REVIEW'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#111312] p-2.5 rounded-xl border border-[#252825] text-[10px]">
                      <div>
                        <span className="text-[#7C827C] block">Material:</span>
                        <span className="font-bold text-[#E8ECE8]">{sub.materialName}</span>
                      </div>
                      <div>
                        <span className="text-[#7C827C] block">Exp k:</span>
                        <span className="font-bold text-[#39FF14]">{sub.experimentalK} W/mK</span>
                      </div>
                      <div>
                        <span className="text-[#7C827C] block">Error %:</span>
                        <span className="font-bold text-[#8BEA63]">{sub.percentageError.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-[#7C827C] block">Score:</span>
                        <span className="font-bold text-[#38BDF8]">{sub.gradeScore || 95} / 100</span>
                      </div>
                    </div>

                    {/* Instructor Feedback Block */}
                    {sub.teacherFeedback ? (
                      <div className="p-2.5 rounded-xl bg-[#102713] border border-[#163D19] text-[11px] text-[#8BEA63]">
                        <span className="text-[10px] text-[#7C827C] block font-bold">
                          FEEDBACK BY {sub.gradedBy || 'Instructor'} ({sub.reviewedAt}):
                        </span>
                        <p className="mt-0.5 text-[#F5F5F5]">{sub.teacherFeedback}</p>
                      </div>
                    ) : isTeacher ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type instructor grading remarks..."
                          value={feedbackInput[sub.id] || ''}
                          onChange={(e) => setFeedbackInput({ ...feedbackInput, [sub.id]: e.target.value })}
                          className="flex-1 bg-[#111312] border border-[#303330] rounded-xl px-3 py-1.5 text-xs text-[#E8ECE8] focus:outline-none focus:border-[#39FF14]"
                        />
                        <button
                          onClick={() => handleSendFeedback(sub.id)}
                          className="px-3 py-1.5 bg-[#39FF14] text-[#0D0F0E] font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-[#4ADE2A]"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Grade</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Classrooms Enrollment */}
          {activeTab === 'classes' && (
            <div className="flex flex-col gap-4">
              {/* Join Code Input */}
              <form onSubmit={handleJoin} className="p-4 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-2">
                <span className="font-bold text-xs text-[#F5F5F5]">Join Classroom Section by Code</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. THERMO-7K2P"
                    value={classCodeInput}
                    onChange={(e) => setClassCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-[#111312] border border-[#303330] rounded-xl px-3 py-2 text-xs text-[#E8ECE8] focus:outline-none focus:border-[#39FF14]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#39FF14] text-[#0D0F0E] font-bold rounded-xl cursor-pointer hover:bg-[#4ADE2A]"
                  >
                    Join Class
                  </button>
                </div>
                {joinMsg && (
                  <span className={`text-[10px] font-bold ${joinMsg.includes('Success') ? 'text-[#39FF14]' : 'text-[#EF4444]'}`}>
                    {joinMsg}
                  </span>
                )}
              </form>

              {/* Class List */}
              <div className="flex flex-col gap-2">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-3.5 rounded-xl bg-[#171918] border border-[#252825] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#F5F5F5]">{cls.name}</h4>
                      <span className="text-[10px] text-[#7C827C]">
                        Instructor: {cls.teacherName} &bull; {cls.institution}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#202321] text-[#39FF14] border border-[#303330] font-bold">
                      {cls.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#252825] bg-[#111312] flex justify-between items-center text-[#7C827C]">
          <span>Institutional Academic Management Bus</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#202321] hover:bg-[#242725] text-[#F5F5F5] font-semibold border border-[#303330] cursor-pointer"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
};
