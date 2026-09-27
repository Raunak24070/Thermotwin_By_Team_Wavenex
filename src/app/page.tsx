'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Play
} from 'lucide-react';
import { gsap } from 'gsap';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/db';
import { LabCanvas } from '@/components/3d/LabCanvas';
import { ThermoTwinLogo } from '@/components/ui/ThermoTwinLogo';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, loginUser, registerUser, logout } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  
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

  // GSAP Entrance Animations
  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', clearProps: 'all' }
    );
  }, []);

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
    <div className="flex flex-col gap-10 py-2">
      
      {/* ============================================================== */}
      {/* HERO SECTION — 3D APPARATUS IS THE PROMINENT VISUAL FOCUS       */}
      {/* ============================================================== */}
      <section ref={heroRef} className="relative overflow-hidden bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Soft Ambient Heat Gradients */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-red-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-[360px] h-[360px] bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Header Text */}
        <div className="flex flex-col items-center text-center gap-3 max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono font-semibold shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            THERMOTWIN &bull; 3D VIRTUAL PHYSICS LABORATORY
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Learn Heat Transfer Through an Interactive 3D Digital Twin
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Standard laboratory experiment: <strong className="text-slate-200">Determination of Thermal Conductivity of a Metal Rod</strong>.
            Experience authentic 1D conduction physics, live T1–T9 thermocouple telemetry, and instant Fourier coefficient calculations.
          </p>

          {/* Subtle Thermal Heat-Flow Wave Animation */}
          <div className="w-64 h-3 flex items-center justify-center opacity-70 my-0.5">
            <svg viewBox="0 0 200 12" fill="none" className="w-full h-full heat-shimmer">
              <path
                d="M 0,6 Q 25,0 50,6 T 100,6 T 150,6 T 200,6"
                stroke="url(#heroHeatGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="heroHeatGrad" x1="0" y1="6" x2="200" y2="6" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="45%" stopColor="#f97316" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Hero Interactive Split: 3D Apparatus Visual (Left/Center) + Action Portal (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10 mt-2">
          
          {/* Prominent 3D Laboratory Apparatus */}
          <div className="lg:col-span-7 h-[380px] sm:h-[460px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative bg-slate-950">
            <LabCanvas />
          </div>

          {/* User Entry & Action Portal */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {!isAuthenticated || !currentUser ? (
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
                
                {/* Header Tabs: Sign In vs Sign Up */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthTab('signin')}
                      className={`text-xs font-extrabold pb-1 transition-all border-b-2 cursor-pointer ${
                        authTab === 'signin'
                          ? 'text-amber-400 border-amber-400'
                          : 'text-slate-400 border-transparent hover:text-slate-200'
                      }`}
                    >
                      Sign In to Lab
                    </button>
                    <span className="text-slate-600">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setAuthTab('signup')}
                      className={`text-xs font-extrabold pb-1 transition-all border-b-2 cursor-pointer ${
                        authTab === 'signup'
                          ? 'text-amber-400 border-amber-400'
                          : 'text-slate-400 border-transparent hover:text-slate-200'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Portal
                  </span>
                </div>

                {/* Role Switcher */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-slate-400">Select Role:</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleRoleToggle('STUDENT')}
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                      className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        role === 'TEACHER'
                          ? 'bg-indigo-500 text-white font-bold shadow-md'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Teacher
                    </button>
                  </div>
                </div>

                {/* Sign In Form */}
                {authTab === 'signin' ? (
                  <form onSubmit={handleSignInSubmit} className="flex flex-col gap-3 text-xs font-mono">
                    {signInError && (
                      <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-[11px]">
                        {signInError}
                      </div>
                    )}

                    <div>
                      <label className="text-slate-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="alex@student.edu"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-amber-500 transition-colors"
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
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 outline-none focus:border-amber-500 transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In as {role === 'STUDENT' ? 'Student' : 'Teacher'}
                    </button>

                    <div className="text-[10px] text-slate-500 text-center pt-0.5">
                      Demo Accounts: 
                      <span className="text-slate-300"> alex@student.edu</span> or 
                      <span className="text-slate-300"> vance@teacher.edu</span> (pass: password123)
                    </div>
                  </form>
                ) : (
                  /* Sign Up Form */
                  <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-2.5 text-xs font-mono">
                    {signUpError && (
                      <div className="p-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-[11px]">
                        {signUpError}
                      </div>
                    )}

                    <div>
                      <label className="text-slate-400 block mb-0.5">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Maya Patel"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-0.5">Email Address *</label>
                      <input
                        type="email"
                        placeholder="user@university.edu"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-0.5">Password *</label>
                      <input
                        type="password"
                        placeholder="Create password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create {role === 'STUDENT' ? 'Student' : 'Teacher'} Account
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* Signed-in User Welcome Card */
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-100">{currentUser.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {currentUser.institution}
                    </p>
                  </div>
                </div>

                {/* Primary Action Button: Launch Experiment Workstation */}
                <Link
                  href="/student/experiment/exp-thermal-rod"
                  className="py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer text-center"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Launch 3D Virtual Laboratory &rarr;
                </Link>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs font-mono">
                  <Link
                    href={isTeacher ? '/teacher/dashboard' : '/student/dashboard'}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Go to Dashboard &rarr;
                  </Link>

                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </section>

      {/* Feature Highlights Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full text-left">
        <div className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          1D Finite Difference Physics
        </div>
        <div className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Zero Fake Physics Engine
        </div>
        <div className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          T1–T9 Thermocouple Telemetry
        </div>
        <div className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Live Teacher Supervision
        </div>
      </section>

      {/* 3 Pillars Breakdown */}
      <section ref={pillarsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: 3D Apparatus */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-100">Interactive 3D Apparatus</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Realistic metallic rod (Copper, Aluminium, Steel), electrical heater glow, water cooling jacket, rotameter flow meter, and cutaway internal view modes.
          </p>
        </div>

        {/* Card 2: Physics Engine */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-100">Numerical Thermal Physics</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Governed by &rho; C_p A (&part;T/&part;t) = k A (&part;&sup2;T/&part;x&sup2;) + Q_in - Q_cooling - Q_loss. Temperatures evolve continuously to reach true steady state.
          </p>
        </div>

        {/* Card 3: Teacher Live Monitor */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="font-extrabold text-base text-slate-100">Live Lab Supervision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Supervise every student performing the experiment in real time. Inspect live voltage, water flow rate, thermocouples T1–T9, thermal gradient, and steady-state status.
          </p>
        </div>

      </section>

    </div>
  );
}
