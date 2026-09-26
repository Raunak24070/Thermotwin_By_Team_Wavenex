'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Flame, 
  FlaskConical, 
  GraduationCap, 
  Activity, 
  FileSpreadsheet, 
  BarChart3,
  LogIn,
  UserPlus,
  LogOut,
  User
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const isTeacher = currentUser?.role === 'TEACHER';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                ThermoTwin<span className="text-amber-500 font-light">Web</span>
              </span>
              <span className="block text-[10px] font-mono text-slate-400 -mt-1 tracking-widest uppercase">
                3D Virtual Thermal Laboratory
              </span>
            </div>
          </Link>

          {/* Authenticated Navigation Links */}
          {isAuthenticated && currentUser ? (
            <nav className="hidden md:flex items-center gap-1">
              {isTeacher ? (
                <>
                  <Link
                    href="/teacher/dashboard"
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === '/teacher/dashboard'
                        ? 'bg-slate-800 text-amber-400 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/teacher/live-lab"
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname.startsWith('/teacher/live-lab')
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Live Lab Monitor
                  </Link>
                  <Link
                    href="/teacher/classes"
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === '/teacher/classes'
                        ? 'bg-slate-800 text-amber-400 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Classes &amp; Assignments
                  </Link>
                  <Link
                    href="/teacher/results"
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === '/teacher/results'
                        ? 'bg-slate-800 text-amber-400 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Submissions
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === '/student/dashboard'
                        ? 'bg-slate-800 text-amber-400 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/student/experiment/exp-thermal-rod"
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname.startsWith('/student/experiment')
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4 text-amber-400" />
                    Enter 3D Virtual Lab
                  </Link>
                  <Link
                    href="/student/history"
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      pathname === '/student/history'
                        ? 'bg-slate-800 text-amber-400 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Attempt History
                  </Link>
                </>
              )}
            </nav>
          ) : null}

          {/* User Profile & Auth Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 p-1 px-2 rounded-xl transition-all ${
                    pathname === '/profile' ? 'bg-slate-800 border border-amber-500/40' : 'hover:bg-slate-800/60'
                  }`}
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                  <div className="text-left text-xs hidden sm:block">
                    <span className="block font-semibold text-slate-200 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] text-amber-400 font-mono">
                      {currentUser.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register Profile
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
