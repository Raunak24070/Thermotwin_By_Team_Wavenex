import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useAuthStore } from '@/store/useAuthStore';

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
  const { simState, runStatus, simSpeed, experimentMode, setExperimentMode, eventLog } = usePhysicsStore();
  const { currentUser } = useAuthStore();

  const isSteady = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';
  const isRunning = runStatus === 'RUNNING';

  return (
    <header className="h-14 bg-[#111312] border-b border-[#252825] px-4 flex items-center justify-between gap-3 select-none shrink-0 z-30">
      
      {/* LEFT: Branding & Experiment Scope */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
            <Flame className="w-4 h-4 text-[#39FF14]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-[#F5F5F5] font-sans">
                THERMOTWIN
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171918] border border-[#303330] text-[#8BEA63]">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#7C827C] font-mono">
              <span className="text-[#B5BBB5]">Thermal Conductivity Lab</span>
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
          {isSteady ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#39FF14]" />
          ) : (
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentStep === 2 ? 'bg-[#39FF14] text-[#0D0F0E]' : 'bg-[#252825] text-[#7C827C]'
            }`}>
              2
            </span>
          )}
          <span>02 EXPERIMENT</span>
          {isSteady && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-ping" />
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

      {/* RIGHT: Telemetry Status, Mode Switch, Profile */}
      <div className="flex items-center gap-2.5">
        
        {/* Connection Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#171918] border border-[#252825] text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse glow-green-sm" />
          <span className="text-[#39FF14] font-semibold">CONNECTED</span>
        </div>

        {/* Simulation State Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#171918] border border-[#252825] text-[11px] font-mono">
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

        {/* Experiment Mode Toggle (Demo vs Real Lab) */}
        <button
          onClick={() => setExperimentMode(experimentMode === 'DEMO' ? 'REAL_LAB' : 'DEMO')}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#171918] border border-[#252825] hover:border-[#303330] text-[11px] font-mono text-[#B5BBB5] transition-all cursor-pointer"
          title="Toggle between Quick Demo and Certified Real Lab Exam"
        >
          {experimentMode === 'REAL_LAB' ? (
            <>
              <GraduationCap className="w-3 h-3 text-[#38BDF8]" />
              <span className="text-[#38BDF8] font-bold">REAL LAB</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-[#39FF14]" />
              <span className="text-[#8BEA63] font-bold">DEMO MODE</span>
            </>
          )}
        </button>

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

        {/* Profile Pill */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-[#171918] border border-[#252825] hover:border-[#39FF14]/40 transition-all cursor-pointer group"
        >
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="User avatar"
            className="w-5 h-5 rounded-full border border-[#303330] object-cover group-hover:border-[#39FF14] transition-colors"
          />
          <span className="hidden sm:inline text-xs font-mono font-medium text-[#F5F5F5]">
            {currentUser?.name?.split(' ')[0] || 'User'}
          </span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#102713] text-[#39FF14] border border-[#163D19]">
            {currentUser?.role === 'TEACHER' ? 'FAC' : 'STD'}
          </span>
        </button>

      </div>

    </header>
  );
};
