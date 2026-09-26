'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Flame, LogIn, User, GraduationCap, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/db';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuthStore();

  const [roleTab, setRoleTab] = useState<UserRole>('STUDENT');
  const [email, setEmail] = useState('alex@student.edu');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleTabChange = (role: UserRole) => {
    setRoleTab(role);
    if (role === 'STUDENT') {
      setEmail('alex@student.edu');
      setPassword('password123');
    } else {
      setEmail('vance@teacher.edu');
      setPassword('password123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = loginUser(email, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Login failed.');
      return;
    }

    if (roleTab === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1">
            Sign In to ThermoTwin
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Virtual Thermal Laboratory &amp; Classroom Management System
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleTabChange('STUDENT')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              roleTab === 'STUDENT'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Student Account
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('TEACHER')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              roleTab === 'TEACHER'
                ? 'bg-indigo-500 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Teacher Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@student.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-amber-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Classroom
          </button>
        </form>

        {/* Register Redirect Link */}
        <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4 flex items-center justify-between">
          <span>Don't have a profile yet?</span>
          <Link href="/register" className="text-amber-400 font-bold hover:underline flex items-center gap-1">
            Create Account &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
