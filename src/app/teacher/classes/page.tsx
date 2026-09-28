
import React, { useState } from 'react';
import { GraduationCap, PlusCircle, Calendar, Send, Copy, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClassStore } from '@/store/useClassStore';

export default function TeacherClassesPage() {
  const { currentUser } = useAuthStore();
  const { classes, createClass, createAssignment, assignments } = useClassStore();

  const [classNameInput, setClassNameInput] = useState('');
  const [instInput, setInstInput] = useState('Institute of Thermal Technology');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Assignment Form State
  const [assignTitle, setAssignTitle] = useState('Determination of Thermal Conductivity of a Metallic Rod');
  const [assignClassId, setAssignClassId] = useState(classes[0]?.id || '');
  const [assignDueDate, setAssignDueDate] = useState('2026-10-15');
  const [assignInstructions, setAssignInstructions] = useState('Set heater voltage between 7V to 10V and cooling water flow to ~1.5 L/min. Wait for steady-state equilibrium (|dT/dt| < 0.008 °C/s) before recording observation table.');

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim() || !currentUser) return;
    createClass(classNameInput.trim(), instInput.trim(), currentUser.id, currentUser.name);
    setClassNameInput('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const targetClass = classes.find((c) => c.id === assignClassId) || classes[0];
    if (!targetClass) return;
    createAssignment({
      classId: targetClass.id,
      className: targetClass.name,
      teacherId: currentUser.id,
      title: assignTitle,
      experimentType: 'thermal_conductivity',
      instructions: assignInstructions,
      dueDate: assignDueDate,
      maxAttempts: 3
    });
    alert('Experiment assignment published successfully to class!');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 py-2">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-black text-slate-100 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          Classroom Management &amp; Assignments
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Create laboratory classes, generate student join codes, and assign thermal conductivity experiments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Create & List Classes */}
        <div className="flex flex-col gap-6">
          
          {/* Create Class Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Create New Laboratory Class
            </h3>

            <form onSubmit={handleCreateClass} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. ME 302 — Heat & Mass Transfer Lab"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Institution</label>
                <input
                  type="text"
                  value={instInput}
                  onChange={(e) => setInstInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="mt-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                Create Class &amp; Generate Join Code
              </button>
            </form>
          </div>

          {/* Active Classes List */}
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-sm text-slate-200">Active Classes ({classes.length})</h3>
            {classes.map((cls) => (
              <div key={cls.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100">{cls.name}</h4>
                  <button
                    onClick={() => copyCode(cls.code)}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copiedCode === cls.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    CODE: {cls.code}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Enrolled Students: {cls.studentIds.length}</span>
                  <span>Created: {cls.createdDate}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Assign Experiment to Class */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
          <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            Assign Thermal Experiment to Class
          </h3>

          <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Target Class</label>
              <select
                value={assignClassId}
                onChange={(e) => setAssignClassId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-amber-500 font-mono"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Experiment Title</label>
              <input
                type="text"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Submission Due Date</label>
              <input
                type="date"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Teacher Instructions &amp; Notes</label>
              <textarea
                rows={4}
                value={assignInstructions}
                onChange={(e) => setAssignInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500 font-mono leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all"
            >
              Publish Experiment Assignment
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
