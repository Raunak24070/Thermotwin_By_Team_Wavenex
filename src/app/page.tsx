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
  Zap,
  CheckCircle2,
  Layers,
  LogOut,
  Play,
  BookOpen
} from 'lucide-react';
import { gsap } from 'gsap';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/db';
import { ThermoTwinLogo } from '@/components/ui/ThermoTwinLogo';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, loginUser, registerUser, logout } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Auth Tab State on Home Page
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('STUDENT');

  // Sign In Form States (Initialized empty - no dummy accounts)
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpInstitution, setSignUpInstitution] = useState('');
  const [signUpId, setSignUpId] = useState('');
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Entrance Animation
  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
    );
  }, []);

  const handleRoleToggle = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    const res = loginUser(signInEmail, signInPassword);
    if (!res.success) {
      setSignInError(res.message || 'Invalid credentials. Please verify your email and password.');
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
      institution: signUpInstitution.trim() || 'Institute of Thermal Technology',
      studentIdNumber: role === 'STUDENT' ? signUpId.trim() : undefined,
      teacherIdNumber: role === 'TEACHER' ? signUpId.trim() : undefined
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
    <div className="flex flex-col gap-12 py-8 max-w-5xl mx-auto px-4">
      
      {/* Hero Header & Simple Login Section */}
      <section 
        ref={heroRef}
        className="flex flex-col items-center gap-8 text-center relative"
      >
        {/* Subtle Ambient Background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title & Description */}
        <div className="flex flex-col items-center gap-3 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-mono font-semibold shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            THERMOTWIN &bull; DIGITAL TWIN LABORATORY
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight max-w-2xl">
            Virtual Thermal Conduction Laboratory
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Determination of Thermal Conductivity of a Metallic Rod according to YCCE September 2026 academic standards.
          </p>
        </div>

        {/* Simple & Lightweight Login / Account Portal Card */}
        <div className="w-full max-w-md z-10">
          {!isAuthenticated || !currentUser ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left backdrop-blur-sm">
              
              {/* Tabs: Sign In vs Create Account */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => { setAuthTab('signin'); setSignInError(null); }}
                    className={`text-sm font-extrabold pb-1 transition-all border-b-2 cursor-pointer ${
                      authTab === 'signin'
                        ? 'text-amber-400 border-amber-400'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthTab('signup'); setSignUpError(null); }}
                    className={`text-sm font-extrabold pb-1 transition-all border-b-2 cursor-pointer ${
                      authTab === 'signup'
                        ? 'text-amber-400 border-amber-400'
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    Register Profile
                  </button>
                </div>

                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Access Portal
                </span>
              </div>

              {/* Role Switcher */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-slate-400">Account Type:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleRoleToggle('STUDENT')}
                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
                    className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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

              {/* Sign In Form */}
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
                      placeholder="e.g. name@institution.edu"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Password</label>
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In as {role === 'STUDENT' ? 'Student' : 'Faculty'}
                  </button>

                  <div className="pt-2 text-center text-[11px] text-slate-500">
                    <Link href="/student/experiment/thermal_conductivity" className="text-amber-400 hover:underline">
                      Or launch Guest / Practice Experiment &rarr;
                    </Link>
                  </div>
                </form>
              ) : (
                /* Sign Up Form */
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
                      placeholder="e.g. Maya Patel"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. user@institution.edu"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Password *</label>
                    <input
                      type="password"
                      placeholder="Create secure password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Institution / College</label>
                    <input
                      type="text"
                      placeholder="Institute of Thermal Technology"
                      value={signUpInstitution}
                      onChange={(e) => setSignUpInstitution(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">
                      {role === 'STUDENT' ? 'Student ID / Roll No' : 'Faculty ID Number'}
                    </label>
                    <input
                      type="text"
                      placeholder={role === 'STUDENT' ? 'e.g. 2026-ME-042' : 'e.g. FAC-THERMO-01'}
                      value={signUpId}
                      onChange={(e) => setSignUpId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 uppercase tracking-wider"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create {role === 'STUDENT' ? 'Student' : 'Faculty'} Profile
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Signed-in User Welcome Card */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-left">
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
                href="/student/experiment/thermal_conductivity"
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

      </section>

      {/* Feature Highlights Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full text-left">
        <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          1D FDTD Thermal Conduction
        </div>
        <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          User-Configurable Dimensions
        </div>
        <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          T1–T9 Thermocouple Telemetry
        </div>
        <div className="bg-slate-900/70 border border-slate-800/90 p-4 rounded-xl flex items-center gap-3 text-xs text-slate-200 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Targeted Faculty Review
        </div>
      </section>

      {/* 3 Pillars Breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: 3D Apparatus */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-100">Interactive 3D Apparatus</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test metallic specimens (Copper, Aluminium, Steel) with dynamic incandescence heater glow, water cooling jacket, rotameter flow, and thermal wave propagation.
          </p>
        </div>

        {/* Card 2: Physics Engine */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-100">Numerical Thermal Physics</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Governed by Fourier&apos;s Law Q = &minus;k A (dT/dx). Continuous sub-stepped explicit diffusion solver with steady-state detection.
          </p>
        </div>

        {/* Card 3: Teacher Live Monitor */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Activity className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="font-extrabold text-base text-slate-100">Academic Review Queue</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect student experimental observation notebooks, temperature gradients, energy balances, and submitted thermal conductivity k calculations.
          </p>
        </div>

      </section>

      {/* Experiment Guide Footer Link */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-slate-300">
            Need the physical formula, sensor positions, or experiment parameters?
          </span>
        </div>
        <Link
          href="/experiment-guide"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
        >
          View Experiment Guide &rarr;
        </Link>
      </div>

    </div>
  );
}
