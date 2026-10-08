import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  Award, 
  Sparkles, 
  ArrowRight, 
  RotateCcw,
  Sliders,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Thermometer
} from 'lucide-react';
import { TopBar } from './TopBar';
import { IconRail, ActiveTool } from './IconRail';
import { ConfigurePanel } from '../panels/ConfigurePanel';
import { ApparatusInspector } from '../panels/ApparatusInspector';
import { ExperimentPanel } from '../panels/ExperimentPanel';
import { LiveTelemetryInspector } from '../panels/LiveTelemetryInspector';
import { AnalysisPanel } from '../panels/AnalysisPanel';
import { FourierCenterWorkspace } from '../panels/FourierCenterWorkspace';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { ResultReportInspector } from '../panels/ResultReportInspector';
import { CollapsibleGraphPanel } from '../panels/CollapsibleGraphPanel';
import { LabCanvas } from '../3d/LabCanvas';

// Modals
import { ObservationModal } from '../modals/ObservationModal';
import { ReportPreviewModal } from '../modals/ReportPreviewModal';
import { LiveLabMonitorModal } from '../modals/LiveLabMonitorModal';
import { ClassroomModal } from '../modals/ClassroomModal';
import { SOPProtocolModal } from '../modals/SOPProtocolModal';
import { ProfileModal } from '../modals/ProfileModal';
import { EventLogModal } from '../modals/EventLogModal';
import { CinematicIntro } from '../cinematic/CinematicIntro';

import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRealtimeMonitorStore } from '@/store/useRealtimeMonitorStore';

export const AppShell: React.FC = () => {
  // Cinematic 15-second opening animation state ("Heat is everywhere")
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('nointro') === '1') return false;
      return !sessionStorage.getItem('thermotwin_intro_seen');
    }
    return true;
  });

  // Core Workflow Step: 1 (Configure) -> 2 (Experiment) -> 3 (Analyze & Submit)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Left Icon Rail Active Tool
  const [activeTool, setActiveTool] = useState<ActiveTool>('LAB');

  // Modal / Drawer visibility states
  const [isObservationOpen, setIsObservationOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isLiveMonitorOpen, setIsLiveMonitorOpen] = useState<boolean>(false);
  const [isClassroomOpen, setIsClassroomOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isEventLogOpen, setIsEventLogOpen] = useState<boolean>(false);
  const [isFourierOpen, setIsFourierOpen] = useState<boolean>(false);

  // Physics & User Stores
  const { 
    initSimulation, 
    stepSimulation, 
    simState, 
    runStatus, 
    recordObservation,
    leftPanelCollapsed,
    rightPanelCollapsed,
    isExpandedView,
    toggleLeftPanel,
    toggleRightPanel,
    setExpandedView,
    toggleExpandedView
  } = usePhysicsStore();
  const { currentUser } = useAuthStore();
  const { updateStudentTelemetry } = useRealtimeMonitorStore();

  // Smoothly dispatch window resize events across the 350ms transition so Three.js canvas dynamically updates
  useEffect(() => {
    const startTime = performance.now();
    const duration = 380;
    let animId: number;

    const triggerResize = (now: number) => {
      window.dispatchEvent(new Event('resize'));
      if (now - startTime < duration) {
        animId = requestAnimationFrame(triggerResize);
      }
    };

    animId = requestAnimationFrame(triggerResize);
    return () => cancelAnimationFrame(animId);
  }, [leftPanelCollapsed, rightPanelCollapsed, isExpandedView]);

  // Global Keyboard Shortcuts (F to toggle Expanded View, ESC to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleExpandedView();
      } else if (e.key === 'Escape') {
        if (isExpandedView) {
          e.preventDefault();
          setExpandedView(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleExpandedView, setExpandedView, isExpandedView]);

  const lastTimeRef = useRef<number>(performance.now());
  const reqAnimRef = useRef<number | null>(null);

  // Initialize simulation on mount
  useEffect(() => {
    initSimulation('copper');
  }, [initSimulation]);

  // Main High-Frequency Physics Integration Loop
  useEffect(() => {
    const loop = (timeNow: number) => {
      const dtMs = timeNow - lastTimeRef.current;
      lastTimeRef.current = timeNow;

      const state = usePhysicsStore.getState();
      const isStopped = state.runStatus === 'STOPPED';
      const isPaused = state.runStatus === 'PAUSED';
      const isRunning = state.runStatus === 'RUNNING';
      const isHeating = state.simState.voltage > 0;
      const hasResidualHeat = state.simState.sensors.t1 > 20.05;

      // Integrate physics when running or active thermal flux
      if (!isStopped && !isPaused && (isRunning || isHeating || hasResidualHeat)) {
        const speed = state.simSpeed;
        const dtSec = Math.min(dtMs / 1000, 0.1);
        stepSimulation(dtSec * speed);
      }

      // Stream live telemetry to multi-student monitor
      if (currentUser) {
        const currentSim = usePhysicsStore.getState().simState;
        updateStudentTelemetry(currentUser.id, {
          studentId: currentUser.id,
          studentName: currentUser.name,
          sessionId: `EXP-2026-4401`,
          materialId: currentSim.material.id,
          materialName: currentSim.material.name,
          voltage: Number(currentSim.voltage.toFixed(1)),
          current: Number(currentSim.current.toFixed(2)),
          power: Number(currentSim.power.toFixed(1)),
          waterFlowLmin: Number(currentSim.waterFlowLmin.toFixed(2)),
          t1: Number(currentSim.sensors.t1.toFixed(1)),
          t2: Number(currentSim.sensors.t2.toFixed(1)),
          t3: Number(currentSim.sensors.t3.toFixed(1)),
          t4: Number(currentSim.sensors.t4.toFixed(1)),
          t5: Number(currentSim.sensors.t5.toFixed(1)),
          t6: Number(currentSim.sensors.t6.toFixed(1)),
          t7: Number(currentSim.sensors.t7.toFixed(1)),
          t8: Number(currentSim.sensors.t8.toFixed(1)),
          t9: Number(currentSim.sensors.t9.toFixed(1)),
          steadyStateStatus: currentSim.steadyStateStatus,
          lastUpdatedTime: 'Just now',
          isOnline: true
        });
      }

      reqAnimRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    reqAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
    };
  }, [stepSimulation, updateStudentTelemetry, currentUser]);

  // Handle Left Icon Rail Click
  const handleSelectTool = (tool: ActiveTool) => {
    setActiveTool(tool);
    switch (tool) {
      case 'LAB':
        // Return to main experiment view
        break;
      case 'SIMULATION':
        setCurrentStep(2);
        break;
      case 'SENSORS':
        setCurrentStep(2);
        setRightPanelCollapsed(false);
        break;
      case 'OBSERVATIONS':
        setIsObservationOpen(true);
        break;
      case 'FOURIER':
        setCurrentStep(3);
        setIsFourierOpen(true);
        break;
      case 'REPORT':
        setIsReportOpen(true);
        break;
      case 'LIVE_MONITOR':
        setIsLiveMonitorOpen(true);
        break;
      case 'CLASSROOM':
        setIsClassroomOpen(true);
        break;
      case 'GUIDE':
        setIsGuideOpen(true);
        break;
      case 'SETTINGS':
        setIsProfileOpen(true);
        break;
    }
  };

  const isSteady = simState.steadyStateStatus === 'STEADY_STATE' || simState.steadyStateStatus === 'READY_TO_RECORD';

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0D0F0E] text-[#F5F5F5] flex flex-col font-sans select-none antialiased">
      
      {/* 1. TOP NAVIGATION BAR */}
      <TopBar
        currentStep={currentStep}
        onSelectStep={(step) => {
          setCurrentStep(step);
          if (step === 3) setIsFourierOpen(true);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenNotifications={() => setIsEventLogOpen(true)}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* 2. MAIN APPLICATION WORKSPACE GRID */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* PERSISTENT LEFT ICON RAIL (64px) */}
        <IconRail
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
        />

        {/* CONTEXTUAL LEFT PANEL (Animated collapse between 320px and 48px rail) */}
        <aside 
          className={`h-full shrink-0 z-10 transition-all duration-300 ease-in-out border-r border-[#252825] bg-[#171918] flex flex-col overflow-hidden ${
            leftPanelCollapsed ? 'w-12' : 'w-80'
          }`}
        >
          {leftPanelCollapsed ? (
            /* Collapsed narrow rail (48px) */
            <div 
              className="w-12 h-full flex flex-col items-center py-3 justify-between select-none cursor-pointer group hover:bg-[#1C201D] transition-colors"
              onClick={toggleLeftPanel}
              title="Click to expand Left Panel"
            >
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLeftPanel();
                  }}
                  className="w-8 h-8 rounded-lg bg-[#202321] hover:bg-[#282C29] border border-[#303330] hover:border-[#39FF14] text-[#B5BBB5] hover:text-[#39FF14] flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title="Expand Left Panel (›)"
                >
                  <ChevronRight className="w-4 h-4 text-[#39FF14]" />
                </button>

                <div className="flex flex-col items-center gap-2.5 pt-2 text-[#7C827C]">
                  <span className="text-sm select-none" title="Apparatus">🧪</span>
                  <span className="text-sm select-none" title="Configuration">⚙</span>
                  <span className="text-sm select-none" title="Thermal Conduction">🔥</span>
                </div>
              </div>

              {/* Rotated badge label */}
              <div 
                className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#7C827C] group-hover:text-[#39FF14] transition-colors py-4 uppercase"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                <span>{currentStep === 1 ? 'CONFIG' : currentStep === 2 ? 'EXPERIMENT' : 'ANALYSIS'}</span>
              </div>

              <div className="w-2 h-2 rounded-full bg-[#39FF14]/50 animate-pulse" />
            </div>
          ) : (
            /* Expanded full panel */
            <div className="w-80 h-full flex flex-col relative overflow-hidden">
              {currentStep === 1 ? (
                <ConfigurePanel 
                  onContinue={() => setCurrentStep(2)} 
                  onCollapse={toggleLeftPanel}
                />
              ) : currentStep === 2 ? (
                <ExperimentPanel
                  onContinueToAnalyze={() => {
                    setCurrentStep(3);
                    setIsFourierOpen(true);
                  }}
                  onOpenRecordModal={() => setIsObservationOpen(true)}
                  onCollapse={toggleLeftPanel}
                />
              ) : (
                <AnalysisPanel
                  onBackToExperiment={() => setCurrentStep(2)}
                  onOpenNotebook={() => setIsObservationOpen(true)}
                  onCollapse={toggleLeftPanel}
                />
              )}
            </div>
          )}
        </aside>

        {/* CENTER WORKSPACE: 3D DIGITAL TWIN HERO OR FOURIER WORKBENCH */}
        <main className="flex-1 flex flex-col h-full bg-[#111312] overflow-hidden relative z-0">
          
          {/* Steady State Compact Professional Alert Pill (Floats over Step 02) */}
          {currentStep === 2 && isSteady && (
            <div className="absolute top-3 left-4 right-4 z-20 pointer-events-none flex justify-center animate-in fade-in slide-in-from-top duration-300">
              <div className="pointer-events-auto bg-[#102713]/95 backdrop-blur-md border border-[#39FF14]/60 text-[#F5F5F5] px-4 py-2.5 rounded-2xl shadow-2xl glow-green flex items-center justify-between gap-4 max-w-xl w-full font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#39FF14] text-[#0D0F0E] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="font-black text-[#39FF14] block tracking-wide">
                      STEADY STATE DETECTED
                    </span>
                    <span className="text-[10px] text-[#B5BBB5]">
                      Thermal stability achieved (|dT/dt| &lt; 0.008 &deg;C/s). Fourier k is scientifically valid!
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      recordObservation();
                      setIsObservationOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#39FF14] text-[#0D0F0E] font-bold text-xs uppercase cursor-pointer hover:bg-[#4ADE2A] transition-all"
                  >
                    Record
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep(3);
                      setIsFourierOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#171918] border border-[#303330] text-[#8BEA63] font-bold text-xs uppercase cursor-pointer hover:text-[#F5F5F5] transition-all"
                  >
                    Analyze &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Central Workspace Body: 3D Digital Twin Hero ALWAYS active */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* 3D Digital Twin Viewport (Hero Element - NEVER UNMOUNTS) */}
            <div className="flex-1 w-full h-full relative">
              <LabCanvas />
            </div>

            {/* Collapsible Real-Time Temperature Graph Panel */}
            <CollapsibleGraphPanel />

            {/* Step 03: Fourier Workbench Analysis Environment (Workspace Modal / Drawer) */}
            {isFourierOpen && (
              <ErrorBoundary fallbackMessage="Insufficient experiment data for Fourier calculation.">
                <FourierCenterWorkspace onClose={() => setIsFourierOpen(false)} />
              </ErrorBoundary>
            )}
          </div>

        </main>

        {/* RIGHT PROPERTIES / TELEMETRY / RESULT INSPECTOR (Animated collapse between 320px and 48px rail) */}
        <aside 
          className={`h-full shrink-0 z-10 transition-all duration-300 ease-in-out border-l border-[#252825] bg-[#171918] flex flex-col overflow-hidden ${
            rightPanelCollapsed ? 'w-12' : 'w-80'
          }`}
        >
          {rightPanelCollapsed ? (
            /* Collapsed narrow rail (48px) */
            <div 
              className="w-12 h-full flex flex-col items-center py-3 justify-between select-none cursor-pointer group hover:bg-[#1C201D] transition-colors"
              onClick={toggleRightPanel}
              title="Click to expand Properties Inspector"
            >
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRightPanel();
                  }}
                  className="w-8 h-8 rounded-lg bg-[#202321] hover:bg-[#282C29] border border-[#303330] hover:border-[#39FF14] text-[#B5BBB5] hover:text-[#39FF14] flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title="Expand Properties Inspector (‹)"
                >
                  <ChevronLeft className="w-4 h-4 text-[#39FF14]" />
                </button>

                <div className="flex flex-col items-center gap-2.5 pt-2 text-[#7C827C]">
                  <Layers className="w-4 h-4 text-[#7C827C]" />
                  <Activity className="w-4 h-4 text-[#39FF14]" />
                  <Thermometer className="w-4 h-4 text-[#38BDF8]" />
                </div>
              </div>

              {/* Rotated badge label */}
              <div 
                className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#7C827C] group-hover:text-[#39FF14] transition-colors py-4 uppercase"
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
              >
                <span>{currentStep === 1 ? 'PROPERTIES' : currentStep === 2 ? 'TELEMETRY' : 'REPORT'}</span>
              </div>

              <div className="w-2 h-2 rounded-full bg-[#39FF14]/50 animate-pulse" />
            </div>
          ) : (
            /* Expanded full inspector */
            <div className="w-80 h-full flex flex-col relative overflow-hidden">
              <ErrorBoundary fallbackMessage="Inspector component temporarily unavailable.">
                {currentStep === 1 ? (
                  <ApparatusInspector onCollapse={toggleRightPanel} />
                ) : currentStep === 2 ? (
                  <LiveTelemetryInspector
                    onQuickRecord={() => {
                      recordObservation();
                      setIsObservationOpen(true);
                    }}
                    onCollapse={toggleRightPanel}
                  />
                ) : (
                  <ResultReportInspector
                    onOpenReportPreview={() => setIsReportOpen(true)}
                    onCollapse={toggleRightPanel}
                  />
                )}
              </ErrorBoundary>
            </div>
          )}
        </aside>

      </div>

      {/* 3. EMBEDDED MODALS & DRAWERS (All inside the SAME single page!) */}
      <ObservationModal
        isOpen={isObservationOpen}
        onClose={() => setIsObservationOpen(false)}
      />

      <ReportPreviewModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={() => {
          setIsReportOpen(false);
        }}
      />

      <LiveLabMonitorModal
        isOpen={isLiveMonitorOpen}
        onClose={() => setIsLiveMonitorOpen(false)}
      />

      <ClassroomModal
        isOpen={isClassroomOpen}
        onClose={() => setIsClassroomOpen(false)}
      />

      <SOPProtocolModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <EventLogModal
        isOpen={isEventLogOpen}
        onClose={() => setIsEventLogOpen(false)}
      />

      {/* 4. 15-SECOND CINEMATIC OPENING ANIMATION ("Heat is Everywhere") */}
      {showIntro && (
        <CinematicIntro onComplete={() => {
          setShowIntro(false);
          try { sessionStorage.setItem('thermotwin_intro_seen', 'true'); } catch {}
        }} />
      )}

    </div>
  );
};
