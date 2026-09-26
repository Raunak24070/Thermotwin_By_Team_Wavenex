'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  FlaskConical, 
  Activity, 
  LogIn, 
  UserPlus, 
  User, 
  GraduationCap, 
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Layers,
  Building,
  LogOut,
  Camera
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/db';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, loginUser, registerUser, logout } = useAuthStore();
  
  // Auth Tab State on Home Page
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('STUDENT');

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('alex@student.edu');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpInstitution, setSignUpInstitution] = useState('Institute of Thermal Technology');
  const [signUpId, setSignUpId] = useState('');
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const handleRoleToggle = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'STUDENT') {
      setSignInEmail('alex@student.edu');
      setSignInPassword('password123');
    } else {
      setSignInEmail('vance@teacher.edu');
      setSignInPassword('password123');
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    const res = loginUser(signInEmail, signInPassword);
    if (!res.success) {
      setSignInError(res.message || 'Invalid credentials.');
      return;
    }
    if (role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setSignUpError('Please fill in all required fields.');
      return;
    }

    const res = registerUser({
      name: signUpName.trim(),
      email: signUpEmail.trim(),
      password: signUpPassword,
      role: role,
      institution: signUpInstitution.trim(),
      studentIdNumber: role === 'STUDENT' ? signUpId || '2026-ME-001' : undefined,
      teacherIdNumber: role === 'TEACHER' ? signUpId || 'FAC-THERMO-01' : undefined
    });

    if (!res.success) {
      setSignUpError(res.message || 'Registration failed.');
      return;
    }

    if (role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const isTeacher = currentUser?.role === 'TEACHER';

  return (
    <div className="flex flex-col gap-12 py-4">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center flex flex-col items-center gap-4 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          THERMOTWIN WEB &bull; GOOGLE CLASSROOM-STYLE VIRTUAL LABORATORY
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Interactive 3D Virtual Thermal Laboratory &amp; Experiment Management
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Experiment Module: <strong className="text-slate-200">Determination of Thermal Conductivity of a Metallic Rod</strong>.
          Complete with 1D discretized thermal physics, 3D interactive controls, real-time T1–T9 thermocouple telemetry, Fourier calculation, and live teacher supervision.
        </p>

        {/* ============================================================== */}
        {/* FIRST-TIME USER AUTHENTICATION PORTAL (SIGN IN / SIGN UP)     */}
        {/* ============================================================== */}
        {!isAuthenticated || !currentUser ? (
          <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mt-2 text-left">
            
            {/* Header Tabs: Sign In vs Sign Up */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAuthTab('signin')}
                  className={`text-sm font-extrabold pb-1 transition-all border-b-2 ${
                    authTab === 'signin'
                      ? 'text-amber-400 border-amber-400'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  Sign In to Classroom
                </button>
                <span className="text-slate-600">&bull;</span>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`text-sm font-extrabold pb-1 transition-all border-b-2 ${
                    authTab === 'signup'
                      ? 'text-amber-400 border-amber-400'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  Create New Account (Sign Up)
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden sm:inline">
                Portal
              </span>
            </div>

            {/* Role Switcher (Student / Teacher) */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[11px] font-mono text-slate-400">Select Role:</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleRoleToggle('STUDENT')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    role === 'STUDENT'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleToggle('TEACHER')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    role === 'TEACHER'
                      ? 'bg-indigo-500 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Teacher / Faculty
                </button>
              </div>
            </div>

            {/* SIGN IN TAB */}
            {authTab === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="flex flex-col gap-3.5 text-xs font-mono">
                {signInError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs">
                    {signInError}
                  </div>
                )}

                <div>
                  <label className="text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. alex@student.edu"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Password</label>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In as {role === 'STUDENT' ? 'Student' : 'Teacher'}
                </button>

                <div className="text-[10px] text-slate-500 text-center pt-1">
                  Default Demo Accounts: 
                  <span className="text-slate-300"> alex@student.edu</span> or 
                  <span className="text-slate-300"> vance@teacher.edu</span> (pass: password123)
                </div>
              </form>
            ) : (
              /* SIGN UP TAB */
              <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3 text-xs font-mono">
                {signUpError && (
                  <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs">
                    {signUpError}
                  </div>
                )}

                <div>
                  <label className="text-slate-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Jordan Lee or Maya Patel"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="e.g. user@university.edu"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="Create password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Institution</label>
                  <input
                    type="text"
                    value={signUpInstitution}
                    onChange={(e) => setSignUpInstitution(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">
                    {role === 'STUDENT' ? 'Student Roll / Registration ID' : 'Faculty ID'}
                  </label>
                  <input
                    type="text"
                    placeholder={role === 'STUDENT' ? 'e.g. 2026-ME-042' : 'e.g. FAC-THERMO-99'}
                    value={signUpId}
                    onChange={(e) => setSignUpId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Generate {role === 'STUDENT' ? 'Student' : 'Teacher'} Profile &amp; Enter
                </button>
              </form>
            )}

          </div>
        ) : (
          /* LOGGED IN USER WELCOME CARD */
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-2xl shadow-xl mt-2">
            <div className="flex items-center gap-4 text-left">
              <Link href="/profile" className="relative group">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-md text-[8px] font-bold">
                  <Camera className="w-2.5 h-2.5" />
                </span>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-100">{currentUser.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {currentUser.institution} &bull; ID: {currentUser.studentIdNumber || currentUser.teacherIdNumber || 'N/A'}
                </p>
                <Link href="/profile" className="text-[11px] text-amber-400 font-semibold hover:underline mt-1 inline-block">
                  View Full Profile &amp; Change Avatar &rarr;
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={isTeacher ? '/teacher/dashboard' : '/student/dashboard'}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={logout}
                className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl border border-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </section>

      {/* Feature Highlights Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          1D Finite Difference Physics
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          No Fake Physics Rule
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          T1–T9 Thermocouple Telemetry
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Real-Time Teacher Supervision
        </div>
      </section>

      {/* Pillars Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: 3D Apparatus */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-100">Interactive 3D Apparatus</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Realistic metallic rod (Copper, Aluminium, Steel), electrical heater glow, water cooling jacket, rotameter flow meter, and cutaway internal view modes.
          </p>
        </div>

        {/* Card 2: Physics Engine */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-100">Numerical Thermal Physics</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Governed by &rho; C_p A (&part;T/&part;t) = k A (&part;&sup2;T/&part;x&sup2;) + Q_in - Q_cooling - Q_loss. Temperatures evolve continuously to reach true steady state.
          </p>
        </div>

        {/* Card 3: Teacher Live Monitor */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-100">Live Lab Supervision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supervise every student performing the experiment in real time. Inspect live voltage, water flow rate, thermocouples T1–T9, thermal gradient, and steady-state status.
          </p>
        </div>

      </section>

    </div>
  );
}
