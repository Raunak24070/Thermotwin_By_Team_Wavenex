'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, UserPlus, User, GraduationCap, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/db';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuthStore();

  const [role, setRole] = useState<UserRole>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('Institute of Thermal Technology');
  const [idNumber, setIdNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const res = registerUser({
      name,
      email,
      password,
      role,
      institution,
      studentIdNumber: role === 'STUDENT' ? idNumber || '2026-STD-001' : undefined,
      teacherIdNumber: role === 'TEACHER' ? idNumber || 'FAC-THERMO-10' : undefined,
    });

    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed.');
      return;
    }

    if (role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1">
            Create ThermoTwin Account
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Register your Student or Teacher profile to enter the Virtual Lab
          </p>
        </div>

        {/* Role Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">I am joining as a:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                role === 'STUDENT'
                  ? 'bg-amber-500/10 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/30'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <div className="text-left text-xs font-bold">
                <div>Student</div>
                <div className="text-[10px] text-slate-500 font-normal">Perform lab &amp; submit</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                role === 'TEACHER'
                  ? 'bg-indigo-500/10 border-indigo-500/80 text-indigo-300 ring-1 ring-indigo-500/30'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <div className="text-left text-xs font-bold">
                <div>Teacher / Faculty</div>
                <div className="text-[10px] text-slate-500 font-normal">Supervise &amp; manage class</div>
              </div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Dr. Maya Patel or Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Email Address *</label>
            <input
              type="email"
              placeholder="e.g. j.lee@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Password *</label>
            <input
              type="password"
              placeholder="Create secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Institution / University</label>
            <input
              type="text"
              placeholder="e.g. Institute of Thermal Technology"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">
              {role === 'STUDENT' ? 'Student Roll / Registration ID' : 'Faculty / Instructor ID'}
            </label>
            <input
              type="text"
              placeholder={role === 'STUDENT' ? 'e.g. 2026-ME-099' : 'e.g. FAC-THERMO-12'}
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Registration &amp; Enter System
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4 flex items-center justify-between">
          <span>Already have a profile?</span>
          <Link href="/login" className="text-amber-400 font-bold hover:underline">
            Sign In &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
