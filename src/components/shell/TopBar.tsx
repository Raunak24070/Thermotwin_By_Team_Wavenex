import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radio, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Flame, 
  User, 
  BookOpen, 
  Bell, 
  SlidersHorizontal,
  GraduationCap,
  Sparkles,
  Save,
  History,
  LayoutDashboard,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useExperimentStore } from '@/store/useExperimentStore';

interface TopBarProps {
  currentStep: 1 | 2 | 3;
  onSelectStep: (step: 1 | 2 | 3) => void;
  onOpenProfile: () => void;
  onOpenGuide: () => void;
  onOpenNotifications: () => void;
  onReplayIntro?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentStep,
  onSelectStep,
  onOpenProfile,
  onOpenGuide,
  onOpenNotifications,
  onReplayIntro
}) => {
  const navigate = useNavigate();
  const { simState, runStatus, simSpeed, experimentMode, setExperimentMode, eventLog, apparatusConfig, observations } = usePhysicsStore();
  const { currentUser, logout } = useAuthStore();
  const { saveCurrentExperiment, isSaving } = useExperimentStore();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const isSteady = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';
  const isRunning = runStatus === 'RUNNING';

  const handleSaveExperiment = async () => {
    const res = await saveCurrentExperiment({
      experimentName: `${simState.material.name} Lab Run #${Date.now().toString().slice(-4)}`,
      material: simState.material.name,
      thermalConductivity: simState.calculatedK || simState.material.thermalConductivity,
      density: simState.material.density,
      specificHeat: simState.material.specificHeat,
      rodLength: apparatusConfig.rodLengthCm / 100,
      rodDiameter: apparatusConfig.rodDiameterMm / 1000,
      heaterVoltage: simState.voltage,
      heaterPower: simState.power,
      coolingWaterFlow: simState.waterFlowLmin,
      sensorReadings: {
        t1: simState.sensors.t1,
        t2: simState.sensors.t2,
        t3: simState.sensors.t3,
        t4: simState.sensors.t4,
        t5: simState.sensors.t5,
        t6: simState.sensors.t6,
        t7: simState.sensors.t7,
        t8: simState.sensors.t8,
        t9: simState.sensors.t9
      },
      temperatureGradient: Math.abs(simState.sensors.t1 - simState.sensors.t7) / (apparatusConfig.rodLengthCm / 100),
      heatRemoved: (simState.waterFlowLmin / 60) * 4184 * Math.max(0, simState.sensors.t9 - simState.sensors.t8),
      experimentStatus: isSteady ? 'STEADY_STATE' : 'COMPLETED',
      observationsCount: observations.length
    });

    if (res.success) {
      setSaveSuccessMsg('Saved to MongoDB!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 bg-[#111312] border-b border-[#252825] px-4 flex items-center justify-between gap-3 select-none shrink-0 z-30">
      
      {/* LEFT: Branding & Experiment Scope */}
      <div className="flex items-center gap-3 shrink-0">
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm group-hover:border-[#39FF14] transition-colors">
            <Flame className="w-4 h-4 text-[#39FF14]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-[#F5F5F5] font-sans group-hover:text-[#39FF14] transition-colors">
                THERMOTWIN
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171918] border border-[#303330] text-[#8BEA63]">
                LAB
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#7C827C] font-mono">
              <span className="text-[#B5BBB5]">Virtual Conduction Station</span>
              <span>&bull;</span>
              <span className="text-[#8BEA63] font-semibold">{simState.material.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER: 3-Step Navigation Flow */}
      <div className="hidden md:flex items-center bg-[#171918] border border-[#252825] p-1 rounded-xl shadow-inner gap-1">
        
        {/* Step 01: Configure */}
        <button
          onClick={() => onSelectStep(1)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
            currentStep === 1
              ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm font-bold'
              : 'text-[#B5BBB5] hover:text-[#F5F5F5] hover:bg-[#202321]'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            currentStep === 1 ? 'bg-[#39FF14] text-[#0D0F0E]' : 'bg-[#252825] text-[#7C827C]'
          }`}>
            1
          </span>
          <span>01 CONFIGURE</span>
        </button>

        <div className="w-4 h-px bg-[#303330]" />

        {/* Step 02: Experiment */}
        <button
          onClick={() => onSelectStep(2)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
            currentStep === 2
              ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm font-bold'
              : isSteady
              ? 'text-[#8BEA63] hover:text-[#F5F5F5] hover:bg-[#202321]'
              : 'text-[#B5BBB5] hover:text-[#F5F5F5] hover:bg-[#202321]'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            currentStep === 2 ? 'bg-[#39FF14] text-[#0D0F0E]' : isSteady ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-[#252825] text-[#7C827C]'
          }`}>
            2
          </span>
          <span>02 EXPERIMENT</span>
          {isSteady && (
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
          )}
        </button>

        <div className="w-4 h-px bg-[#303330]" />

        {/* Step 03: Analyze & Submit */}
        <button
          onClick={() => onSelectStep(3)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
            currentStep === 3
              ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm font-bold'
              : 'text-[#B5BBB5] hover:text-[#F5F5F5] hover:bg-[#202321]'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
            currentStep === 3 ? 'bg-[#39FF14] text-[#0D0F0E]' : 'bg-[#252825] text-[#7C827C]'
          }`}>
            3
          </span>
          <span>03 ANALYZE &amp; SUBMIT</span>
        </button>

      </div>

      {/* RIGHT CONTROLS & USER MENU */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#171918] border border-[#252825] text-xs font-mono">
          {isRunning ? (
            <>
              <Activity className="w-3 h-3 text-[#39FF14] animate-pulse" />
              <span className="text-[#39FF14] font-bold">RUNNING</span>
              <span className="text-[10px] text-[#7C827C]">({simSpeed}x)</span>
            </>
          ) : runStatus === 'PAUSED' ? (
            <>
              <Clock className="w-3 h-3 text-[#F59E0B]" />
              <span className="text-[#F59E0B] font-bold">PAUSED</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#555B55]" />
              <span className="text-[#B5BBB5]">IDLE</span>
            </>
          )}
        </div>

        {/* SAVE EXPERIMENT TO MONGODB BUTTON */}
        <button
          onClick={handleSaveExperiment}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102713] border border-[#163D19] hover:border-[#39FF14] text-[#39FF14] hover:bg-[#163D19]/60 font-mono text-xs font-bold transition-all cursor-pointer"
          title="Save current experiment snapshot to MongoDB"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Run'}</span>
        </button>

        {/* Save confirmation toast */}
        {saveSuccessMsg && (
          <div className="fixed top-16 right-6 z-50 bg-[#102713] border border-[#39FF14] text-[#39FF14] px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Event Log / Notification Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-1.5 rounded-lg bg-[#171918] border border-[#252825] hover:border-[#303330] text-[#B5BBB5] hover:text-[#F5F5F5] transition-all cursor-pointer"
          title="Experiment Event Log"
        >
          <Bell className="w-4 h-4" />
          {eventLog.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#39FF14] text-[#0D0F0E] rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
              {Math.min(9, eventLog.length)}
            </span>
          )}
        </button>

        {/* Cinematic Intro Replay */}
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#171918] border border-[#252825] hover:border-[#39FF14]/50 text-[#B5BBB5] hover:text-[#39FF14] transition-all cursor-pointer font-mono text-xs"
            title="Replay 15-Second Cinematic Opening ('Heat is everywhere')"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
            <span className="text-[11px] font-semibold text-[#F5F5F5] group-hover:text-[#39FF14]">Intro</span>
          </button>
        )}

        {/* SOP Protocol Guide */}
        <button
          onClick={onOpenGuide}
          className="p-1.5 rounded-lg bg-[#171918] border border-[#252825] hover:border-[#303330] text-[#B5BBB5] hover:text-[#F5F5F5] transition-all cursor-pointer"
          title="10-Step Laboratory Protocol Guide"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* User Session Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-lg bg-[#171918] border border-[#252825] hover:border-[#39FF14]/40 transition-all cursor-pointer group"
          >
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt="User avatar"
              className="w-5 h-5 rounded-full border border-[#303330] object-cover group-hover:border-[#39FF14] transition-colors"
            />
            <span className="hidden sm:inline text-xs font-mono font-medium text-[#F5F5F5]">
              {currentUser?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#7C827C]" />
          </button>

          {/* User Menu Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#171918] border border-[#303330] rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 text-xs font-mono animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 border-b border-[#252825]">
                <span className="text-[10px] text-[#7C827C] block truncate">{currentUser?.email}</span>
                <span className="text-[10px] text-[#39FF14] font-bold">
                  {currentUser?.role === 'TEACHER' ? 'Faculty Member' : 'Student Operator'}
                </span>
              </div>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#202321] text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#39FF14]" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate('/experiments');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#202321] text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>My Experiments</span>
              </button>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onOpenProfile();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-[#202321] text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Profile</span>
              </button>

              <div className="h-px bg-[#252825] my-0.5" />

              <button
                onClick={handleLogout}
                className="w-full px-2.5 py-1.5 rounded-lg text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
