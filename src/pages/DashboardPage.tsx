import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Flame, 
  FlaskConical, 
  Cpu, 
  Activity, 
  BookOpen, 
  History, 
  LogOut, 
  User, 
  ChevronRight, 
  Sliders, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap, 
  Building,
  Radio,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useExperimentStore } from '../store/useExperimentStore';
import { ProfileModal } from '../components/modals/ProfileModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { experiments, fetchExperiments } = useExperimentStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0F0E] text-[#F5F5F5] flex flex-col font-mono select-none antialiased">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-16 bg-[#111312] border-b border-[#252825] px-6 flex items-center justify-between z-30 shrink-0">
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
            <Flame className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-[#F5F5F5] font-sans">
                THERMOTWIN
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#171918] border border-[#303330] text-[#8BEA63] font-bold">
                DASHBOARD
              </span>
            </div>
            <span className="text-[11px] text-[#7C827C]">
              Thermal Conductivity Virtual Lab &bull; Engineering Station
            </span>
          </div>
        </div>

        {/* User Session Area & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-[#171918] border border-[#252825] hover:border-[#39FF14]/50 transition-all cursor-pointer group"
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-7 h-7 rounded-lg border border-[#303330] object-cover group-hover:border-[#39FF14] transition-colors"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#F5F5F5] leading-tight">
                {currentUser?.name || 'Engineer'}
              </span>
              <span className="text-[10px] text-[#8BEA63]">
                {currentUser?.role === 'TEACHER' ? 'Faculty Admin' : 'Student Operator'}
              </span>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#171918] border border-[#303330] rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="p-2.5 border-b border-[#252825]">
                <span className="text-[10px] text-[#7C827C] uppercase block">Signed in as</span>
                <span className="text-xs font-bold text-[#F5F5F5] truncate block">{currentUser?.email}</span>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#202321] text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-[#39FF14]" />
                <span>Station Profile</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/experiments');
                }}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#202321] text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <History className="w-4 h-4 text-[#38BDF8]" />
                <span>My Experiments</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/lab');
                }}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-[#202321] text-[#B5BBB5] hover:text-[#39FF14] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FlaskConical className="w-4 h-4 text-[#39FF14]" />
                <span>Virtual Lab Session</span>
              </button>

              <div className="h-px bg-[#252825] my-1" />

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </header>

      {/* 2. DASHBOARD BODY */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-8 justify-center">
        
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#252825] pb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-[#102713] text-[#39FF14] border border-[#163D19] font-bold">
                STATION ONLINE
              </span>
              <span className="text-xs text-[#7C827C]">&bull; ME 302 THERMODYNAMICS LAB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight font-sans">
              Welcome, {currentUser?.name || 'Engineer'}
            </h1>
            <p className="text-xs text-[#B5BBB5]">
              ThermoTwin &bull; 1D Discretized Heat Conduction &bull; Fourier's Law Verification Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/experiments"
              className="px-4 py-2 rounded-xl bg-[#171918] border border-[#252825] hover:border-[#38BDF8]/50 text-xs text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-all cursor-pointer font-bold"
            >
              <History className="w-4 h-4 text-[#38BDF8]" />
              <span>Saved Runs ({experiments.length})</span>
            </Link>
          </div>
        </div>

        {/* 3. HERO CARD: "ENTER LAB" */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-[#121E14] via-[#111312] to-[#151716] border-2 border-[#163D19] hover:border-[#39FF14]/60 rounded-3xl p-8 shadow-2xl transition-all duration-300">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#39FF14]/15 transition-all" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            
            <div className="flex items-start gap-5 max-w-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#102713] border border-[#39FF14]/50 flex items-center justify-center glow-green shrink-0">
                <FlaskConical className="w-9 h-9 sm:w-11 sm:h-11 text-[#39FF14] animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#102713] text-[#39FF14] border border-[#163D19]">
                    3D DIGITAL TWIN V2
                  </span>
                  <span className="text-[11px] font-mono text-[#7C827C]">
                    50-NODE EXPLICIT FDTD SOLVER
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#F5F5F5] tracking-tight font-sans">
                  Thermal Conductivity Apparatus
                </h2>

                <p className="text-xs text-[#B5BBB5] leading-relaxed">
                  Perform real-time thermal diffusion experiments on cylindrical specimens of Copper, Aluminium, and Stainless Steel. Monitor 9 thermocouple channels (T1–T9), control heater wattage, regulate fluid cooling jackets, and verify Fourier's law with live analytical gradient regression.
                </p>
              </div>
            </div>

            {/* Prominent ENTER LAB Button */}
            <button
              onClick={() => navigate('/lab')}
              className="w-full lg:w-auto px-8 py-5 rounded-2xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 glow-green cursor-pointer shadow-2xl hover:scale-102 transition-all shrink-0"
            >
              <FlaskConical className="w-5 h-5" />
              <span>ENTER LAB</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

          </div>

          {/* Quick Features Row */}
          <div className="mt-8 pt-6 border-t border-[#163D19]/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2 text-[#B5BBB5]">
              <Cpu className="w-4 h-4 text-[#39FF14]" />
              <span>FDTD 50 Nodes</span>
            </div>
            <div className="flex items-center gap-2 text-[#B5BBB5]">
              <Activity className="w-4 h-4 text-[#39FF14]" />
              <span>T1–T9 Telemetry</span>
            </div>
            <div className="flex items-center gap-2 text-[#B5BBB5]">
              <Sparkles className="w-4 h-4 text-[#39FF14]" />
              <span>10 Digital Twin Modes</span>
            </div>
            <div className="flex items-center gap-2 text-[#B5BBB5]">
              <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
              <span>Steady-State Detector</span>
            </div>
          </div>

        </div>

        {/* 4. SECONDARY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: My Experiments */}
          <div className="bg-[#111312] border border-[#252825] hover:border-[#303330] rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#202321] border border-[#303330] flex items-center justify-center">
                  <History className="w-5 h-5 text-[#38BDF8]" />
                </div>
                <span className="text-xs font-mono font-bold text-[#8BEA63] bg-[#102713] px-2 py-0.5 rounded border border-[#163D19]">
                  {experiments.length} SAVED
                </span>
              </div>
              <h3 className="font-bold text-base text-[#F5F5F5] mt-1">My Experiments</h3>
              <p className="text-xs text-[#7C827C] leading-relaxed">
                Review your saved experimental telemetry, calculated thermal conductivities, sensor snapshots, and MongoDB archives.
              </p>
            </div>

            <Link
              to="/experiments"
              className="mt-2 py-2.5 px-4 bg-[#171918] hover:bg-[#202321] border border-[#252825] rounded-xl text-xs font-bold text-[#38BDF8] flex items-center justify-between transition-colors"
            >
              <span>View Saved Runs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Station Telemetry */}
          <div className="bg-[#111312] border border-[#252825] hover:border-[#303330] rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#202321] border border-[#303330] flex items-center justify-center">
                  <User className="w-5 h-5 text-[#39FF14]" />
                </div>
                <span className="text-[10px] text-[#7C827C]">OPERATOR</span>
              </div>
              <h3 className="font-bold text-base text-[#F5F5F5] mt-1">Station Credentials</h3>
              <div className="flex flex-col gap-1.5 text-xs text-[#B5BBB5] pt-1">
                <div className="flex justify-between">
                  <span className="text-[#7C827C]">ID:</span>
                  <span className="font-bold text-[#F5F5F5]">{currentUser?.studentIdNumber || 'STN-101'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C827C]">Role:</span>
                  <span className="text-[#39FF14] font-bold">{currentUser?.role || 'STUDENT'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7C827C]">Institution:</span>
                  <span className="truncate max-w-[150px]">{currentUser?.institution || 'Institute of Thermal Tech'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="mt-2 py-2.5 px-4 bg-[#171918] hover:bg-[#202321] border border-[#252825] rounded-xl text-xs font-bold text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Edit Profile</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Apparatus Specs */}
          <div className="bg-[#111312] border border-[#252825] hover:border-[#303330] rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#202321] border border-[#303330] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="text-[10px] text-[#7C827C]">ISO 22007-2</span>
              </div>
              <h3 className="font-bold text-base text-[#F5F5F5] mt-1">Apparatus Specs</h3>
              <p className="text-xs text-[#7C827C] leading-relaxed">
                Standard specimen length 500 mm, diameter 25 mm. Tested materials: Pure Copper (385 W/mK), Aluminium 6061 (205 W/mK), AISI 304 Stainless Steel (16 W/mK).
              </p>
            </div>

            <button
              onClick={() => navigate('/lab')}
              className="mt-2 py-2.5 px-4 bg-[#171918] hover:bg-[#202321] border border-[#252825] rounded-xl text-xs font-bold text-[#F59E0B] flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Launch Experiment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

    </div>
  );
};
