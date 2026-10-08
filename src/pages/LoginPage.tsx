import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Flame, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  User, 
  GraduationCap, 
  Building, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useAuthStore, RegisterPayload } from '../store/useAuthStore';
import { UserRole } from '../types/db';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, registerUser, isLoading, error, clearError } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('STUDENT');
  const [regInstitution, setRegInstitution] = useState('Institute of Thermal Technology');
  const [regId, setRegId] = useState('');

  const redirectTarget = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setFormError('Please enter both email and password.');
      return;
    }

    const res = await loginUser(email.trim(), password);
    if (res.success) {
      navigate(redirectTarget, { replace: true });
    } else {
      setFormError(res.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const payload: RegisterPayload = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
      institution: regInstitution.trim(),
      studentIdNumber: regRole === 'STUDENT' ? (regId.trim() || undefined) : undefined,
      teacherIdNumber: regRole === 'TEACHER' ? (regId.trim() || undefined) : undefined
    };

    const res = await registerUser(payload);
    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setFormError(res.message || 'Registration failed.');
    }
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F0E] text-[#F5F5F5] flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono select-none antialiased">
      
      {/* Background CAD Ambient Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#163D19_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-[#111312] border border-[#252825] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green shadow-xl">
            <Flame className="w-7 h-7 text-[#39FF14] animate-pulse" />
          </div>

          <div className="flex flex-col items-center mt-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F5F5F5] font-sans">
                THERMOTWIN
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#171918] border border-[#303330] text-[#8BEA63] font-bold">
                v2.0
              </span>
            </div>
            <p className="text-xs text-[#8BEA63] font-bold tracking-wide mt-0.5">
              Thermal Conductivity Virtual Lab
            </p>
            <p className="text-[11px] text-[#7C827C] mt-0.5">
              Digital Twin &bull; 50-Node Explicit FDTD Heat Solver
            </p>
          </div>
        </div>

        {/* Auth Mode Tabs (Sign In / Register) */}
        <div className="grid grid-cols-2 p-1 bg-[#171918] rounded-xl border border-[#252825] text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setFormError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
              activeTab === 'LOGIN'
                ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm'
                : 'text-[#7C827C] hover:text-[#F5F5F5]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('REGISTER');
              setFormError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
              activeTab === 'REGISTER'
                ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm'
                : 'text-[#7C827C] hover:text-[#F5F5F5]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert Banner */}
        {(formError || error) && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-xs">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#B5BBB5] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Email Address / ID</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.rivera@university.edu"
                required
                className="w-full bg-[#171918] border border-[#252825] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555B55]"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#B5BBB5] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#171918] border border-[#252825] focus:border-[#39FF14] rounded-xl px-3.5 py-2.5 text-[#F5F5F5] outline-none transition-colors placeholder:text-[#555B55]"
              />
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-[11px] text-[#7C827C] pt-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#B5BBB5]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#303330] bg-[#171918] accent-[#39FF14]"
                />
                <span>Remember me on this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 py-3 bg-[#39FF14] hover:bg-[#4ADE2A] disabled:opacity-50 text-[#0D0F0E] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg glow-green flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0D0F0E] border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Station...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Virtual Lab</span>
                </>
              )}
            </button>

            {/* Fast Demo Accounts Helper */}
            <div className="mt-2 pt-3 border-t border-[#252825] flex flex-col gap-2">
              <span className="text-[10px] text-[#7C827C] uppercase tracking-wider text-center">
                QUICK DEMO ACCOUNTS (1-CLICK FILL)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('alex.rivera@university.edu', 'password123')}
                  className="p-2 rounded-lg bg-[#171918] border border-[#252825] hover:border-[#39FF14]/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-[#F5F5F5] group-hover:text-[#39FF14] block">Alex Rivera</span>
                  <span className="text-[#7C827C]">Student &bull; Station 101</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillQuickDemo('m.vance@university.edu', 'password123')}
                  className="p-2 rounded-lg bg-[#171918] border border-[#252825] hover:border-[#38BDF8]/50 text-left transition-colors cursor-pointer group"
                >
                  <span className="font-bold text-[#F5F5F5] group-hover:text-[#38BDF8] block">Dr. M. Vance</span>
                  <span className="text-[#7C827C]">Professor &bull; Admin</span>
                </button>
              </div>
            </div>

          </form>
        )}

        {/* 2. REGISTRATION FORM */}
        {activeTab === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3 text-xs">
            
            {/* Role Radio Pills */}
            <div className="flex flex-col gap-1">
              <label className="text-[#7C827C] text-[10px] uppercase">Select Lab Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('STUDENT')}
                  className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border text-xs font-bold transition-all cursor-pointer ${
                    regRole === 'STUDENT'
                      ? 'bg-[#102713] text-[#39FF14] border-[#163D19]'
                      : 'bg-[#171918] text-[#7C827C] border-[#252825]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegRole('TEACHER')}
                  className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border text-xs font-bold transition-all cursor-pointer ${
                    regRole === 'TEACHER'
                      ? 'bg-[#102713] text-[#38BDF8] border-[#0284c7]/40'
                      : 'bg-[#171918] text-[#7C827C] border-[#252825]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Faculty / Instructor</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[#B5BBB5] text-[11px]">Full Name</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                required
                className="w-full bg-[#171918] border border-[#252825] focus:border-[#39FF14] rounded-xl px-3 py-2 text-[#F5F5F5] outline-none placeholder:text-[#555B55]"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[#B5BBB5] text-[11px]">Email Address</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. elena@university.edu"
                required
                className="w-full bg-[#171918] border border-[#252825] focus:border-[#39FF14] rounded-xl px-3 py-2 text-[#F5F5F5] outline-none placeholder:text-[#555B55]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[#B5BBB5] text-[11px]">Password (min 6 characters)</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#171918] border border-[#252825] focus:border-[#39FF14] rounded-xl px-3 py-2 text-[#F5F5F5] outline-none placeholder:text-[#555B55]"
              />
            </div>

            {/* Institution */}
            <div className="flex flex-col gap-1">
              <label className="text-[#B5BBB5] text-[11px]">Institution / Department</label>
              <input
                type="text"
                value={regInstitution}
                onChange={(e) => setRegInstitution(e.target.value)}
                placeholder="e.g. Institute of Thermal Technology"
                className="w-full bg-[#171918] border border-[#252825] focus:border-[#39FF14] rounded-xl px-3 py-2 text-[#F5F5F5] outline-none placeholder:text-[#555B55]"
              />
            </div>

            {/* Submit Register */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 py-3 bg-[#39FF14] hover:bg-[#4ADE2A] disabled:opacity-50 text-[#0D0F0E] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg glow-green flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0D0F0E] border-t-transparent rounded-full animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account &amp; Enter Lab</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Footer Notice */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-[#7C827C] border-t border-[#252825] pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-[#39FF14]" />
          <span>MongoDB Protected &bull; Encrypted Session Auth</span>
        </div>

      </div>

    </div>
  );
};
