import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Sparkles, 
  Cpu, 
  Sun, 
  Droplets, 
  Layers, 
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Gauge
} from 'lucide-react';
import { cinematicAudio } from './cinematicAudio';

interface CinematicIntroProps {
  onComplete: () => void;
}

// Canvas heat particle interface
interface HeatParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep onComplete reference stable to prevent useEffect re-execution
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Elapsed time in seconds
  const [elapsed, setElapsed] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSkip, setShowSkip] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<HeatParticle[]>([]);
  const hasTriggeredCompleteRef = useRef<boolean>(false);
  const hasShownSkipRef = useRef<boolean>(false);
  const lastStateUpdateRef = useRef<number>(0);

  // Sound cues triggered tracking
  const soundCuesTriggered = useRef<Record<string, boolean>>({});

  // Audio mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    cinematicAudio.setMuted(next);
  };

  const handleSkip = useCallback(() => {
    if (hasTriggeredCompleteRef.current) return;
    hasTriggeredCompleteRef.current = true;
    cinematicAudio.stopAll();
    setIsFadingOut(true);
    setTimeout(() => {
      onCompleteRef.current();
    }, 450);
  }, []);

  // Main Animation Loop: Mounted ONCE with [] dependencies
  useEffect(() => {
    startTimeRef.current = performance.now();
    cinematicAudio.startAmbientDrone();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle canvas dimensions with devicePixelRatio support
    let dpr = window.devicePixelRatio || 1;
    const handleResize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const particles = particlesRef.current;

    const renderLoop = (now: number) => {
      const timeSec = (now - startTimeRef.current) / 1000;

      // Throttle React state updates to ~20 FPS (every 50ms) to ensure smooth 60 FPS canvas loop
      if (now - lastStateUpdateRef.current > 50) {
        lastStateUpdateRef.current = now;
        setElapsed(timeSec);
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Show Skip button after 2.5s without restarting effect
      if (timeSec >= 2.5 && !hasShownSkipRef.current) {
        hasShownSkipRef.current = true;
        setShowSkip(true);
      }

      // Procedural audio cues
      if (timeSec >= 0.2 && !soundCuesTriggered.current.particleAppear) {
        soundCuesTriggered.current.particleAppear = true;
        cinematicAudio.playParticleAppear();
      }
      if (timeSec >= 2.0 && !soundCuesTriggered.current.scene1) {
        soundCuesTriggered.current.scene1 = true;
        cinematicAudio.playSceneTransition(260);
      }
      if (timeSec >= 2.8 && !soundCuesTriggered.current.scene2) {
        soundCuesTriggered.current.scene2 = true;
        cinematicAudio.playSceneTransition(340);
      }
      if (timeSec >= 3.6 && !soundCuesTriggered.current.scene3) {
        soundCuesTriggered.current.scene3 = true;
        cinematicAudio.playSceneTransition(420);
      }
      if (timeSec >= 4.4 && !soundCuesTriggered.current.scene4) {
        soundCuesTriggered.current.scene4 = true;
        cinematicAudio.playSceneTransition(500);
      }
      if (timeSec >= 5.2 && !soundCuesTriggered.current.rodConvergence) {
        soundCuesTriggered.current.rodConvergence = true;
        cinematicAudio.playThermalConductionSwell();
      }
      if (timeSec >= 8.2 && !soundCuesTriggered.current.fourier) {
        soundCuesTriggered.current.fourier = true;
        cinematicAudio.playFourierChime();
      }
      if (timeSec >= 11.2 && !soundCuesTriggered.current.digitalTwin) {
        soundCuesTriggered.current.digitalTwin = true;
        cinematicAudio.playDigitalTwinRise();
      }
      if (timeSec >= 12.8 && !soundCuesTriggered.current.logo) {
        soundCuesTriggered.current.logo = true;
        cinematicAudio.playLogoResolve();
      }

      // Automatic seamless handover trigger at 14.8s
      if (timeSec >= 14.8 && !hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true;
        setIsFadingOut(true);
        setTimeout(() => {
          cinematicAudio.stopAll();
          onCompleteRef.current();
        }, 500);
      }

      // Reset and clear Canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      // ============================================================
      // PARTICLE ENGINE PHASES
      // ============================================================

      // PHASE 1: Single Microscopic Glowing Heat Energy Packet (0.0s - 2.0s)
      if (timeSec < 2.0) {
        const cx = width / 2;
        const cy = height / 2;

        if (timeSec >= 0.1) {
          const tProgress = Math.min(1, (timeSec - 0.1) / 1.8);
          const px = cx + Math.sin(tProgress * Math.PI * 4) * 80;
          const py = cy + Math.cos(tProgress * Math.PI * 2.5) * 35;

          // Radial Heat Glow Bloom
          const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, 90);
          glowGrad.addColorStop(0, 'rgba(255, 107, 53, 0.65)');
          glowGrad.addColorStop(0.35, 'rgba(239, 68, 68, 0.25)');
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(px, py, 90, 0, Math.PI * 2);
          ctx.fill();

          // Outer Hot Core
          ctx.fillStyle = '#FF6B35';
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();

          // Inner White Ignition Core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Spawn trailing micro-embers
          if (Math.random() < 0.6) {
            particles.push({
              x: px + (Math.random() - 0.5) * 6,
              y: py + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2 - 0.8,
              radius: Math.random() * 2 + 1,
              color: '#FF6B35',
              alpha: 0.9,
              life: 0,
              maxLife: 35,
              trail: []
            });
          }
        }
      }

      // PHASE 2: Real-World Montage (2.0s - 5.2s)
      else if (timeSec >= 2.0 && timeSec < 5.2) {
        if (particles.length < 80) {
          const isHot = Math.random() < 0.65;
          particles.push({
            x: isHot ? Math.random() * width * 0.4 : width * 0.4 + Math.random() * width * 0.6,
            y: height * 0.25 + Math.random() * height * 0.5,
            vx: Math.random() * 3.5 + 2.0, // Strict directional flow: HOT -> COLD
            vy: (Math.random() - 0.5) * 1.5,
            radius: Math.random() * 2.2 + 1,
            color: isHot ? (Math.random() < 0.5 ? '#FF6B35' : '#EF4444') : '#38BDF8',
            alpha: Math.random() * 0.7 + 0.3,
            life: 0,
            maxLife: 55,
            trail: []
          });
        }
      }

      // PHASE 3: Particles converge into horizontal Metallic Rod (5.2s - 8.0s)
      else if (timeSec >= 5.2 && timeSec < 8.0) {
        const rodY = height / 2;
        const rodStartX = width * 0.22;
        const rodEndX = width * 0.78;
        const rodLength = rodEndX - rodStartX;

        // Draw horizontal metallic rod baseline
        ctx.fillStyle = '#171918';
        ctx.strokeStyle = '#303330';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rodStartX, rodY - 24, rodLength, 48, 8);
        ctx.fill();
        ctx.stroke();

        // Thermal gradient fill inside metallic rod
        const rodGrad = ctx.createLinearGradient(rodStartX, rodY, rodEndX, rodY);
        rodGrad.addColorStop(0.0, 'rgba(239, 68, 68, 0.7)');   // Hot Red
        rodGrad.addColorStop(0.25, 'rgba(255, 107, 53, 0.6)'); // Orange
        rodGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');  // Yellow
        rodGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.5)'); // Cyan
        rodGrad.addColorStop(1.0, 'rgba(37, 99, 235, 0.6)');   // Cold Blue
        ctx.fillStyle = rodGrad;
        ctx.beginPath();
        ctx.roundRect(rodStartX + 2, rodY - 22, rodLength - 4, 44, 6);
        ctx.fill();

        // Spawn axial conduction particles flowing HOT -> COLD
        if (particles.length < 90) {
          const frac = Math.random();
          let pColor = '#EF4444';
          if (frac > 0.75) pColor = '#2563EB';
          else if (frac > 0.55) pColor = '#38BDF8';
          else if (frac > 0.35) pColor = '#F59E0B';
          else if (frac > 0.15) pColor = '#FF6B35';

          particles.push({
            x: rodStartX + frac * rodLength,
            y: rodY + (Math.random() - 0.5) * 32,
            vx: Math.random() * 2.0 + 1.0,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2.2 + 0.8,
            color: pColor,
            alpha: 0.8,
            life: 0,
            maxLife: 45,
            trail: []
          });
        }
      }

      // PHASE 4: Fourier's Law Focus (8.0s - 11.0s)
      else if (timeSec >= 8.0 && timeSec < 11.0) {
        const rodY = height / 2 + 35;
        const rodStartX = width * 0.25;
        const rodEndX = width * 0.75;
        const rodLength = rodEndX - rodStartX;

        // Ambient thermal gradient bar
        const rodGrad = ctx.createLinearGradient(rodStartX, rodY, rodEndX, rodY);
        rodGrad.addColorStop(0.0, 'rgba(239, 68, 68, 0.5)');
        rodGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
        rodGrad.addColorStop(1.0, 'rgba(37, 99, 235, 0.45)');
        ctx.fillStyle = rodGrad;
        ctx.beginPath();
        ctx.roundRect(rodStartX, rodY - 14, rodLength, 28, 6);
        ctx.fill();

        if (particles.length < 45) {
          particles.push({
            x: rodStartX + Math.random() * rodLength,
            y: rodY + (Math.random() - 0.5) * 18,
            vx: Math.random() * 1.5 + 0.8,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.8 + 0.8,
            color: '#FF6B35',
            alpha: 0.7,
            life: 0,
            maxLife: 40,
            trail: []
          });
        }
      }

      // PHASE 5: Digital Twin Reveal (11.0s - 14.8s)
      else if (timeSec >= 11.0) {
        if (particles.length < 50) {
          const isHot = Math.random() < 0.6;
          particles.push({
            x: Math.random() * width,
            y: height * 0.4 + Math.random() * height * 0.3,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            radius: Math.random() * 1.5 + 0.6,
            color: isHot ? '#FF6B35' : '#39FF14',
            alpha: 0.5,
            life: 0,
            maxLife: 50,
            trail: []
          });
        }
      }

      // Update and draw existing particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        p.trail.unshift({ x: p.x, y: p.y });
        if (p.trail.length > 5) p.trail.pop();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const lifeRatio = 1 - p.life / p.maxLife;
        const drawAlpha = p.alpha * lifeRatio;

        // Draw particle trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.radius * 0.8;
          ctx.globalAlpha = drawAlpha * 0.5;
          ctx.stroke();
        }

        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = drawAlpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Run ONCE on mount

  // Active scene states based on monotonic elapsed
  const isBlackScreen = elapsed >= 0.0 && elapsed < 2.0;
  const isMontage = elapsed >= 2.0 && elapsed < 5.2;
  const montageScene = Math.min(3, Math.floor((elapsed - 2.0) / 0.8)); // 0: Sun, 1: CPU, 2: Engine, 3: Wall
  const isRodReveal = elapsed >= 5.2 && elapsed < 8.0;
  const isFourier = elapsed >= 8.0 && elapsed < 11.0;
  const isDigitalTwin = elapsed >= 11.0 && elapsed < 13.0;
  const isLogoReveal = elapsed >= 12.5 && elapsed < 14.8;

  // Sensor reveal progress in Phase 3 (5.2s - 8.0s)
  const sensorRevealStage = Math.max(0, Math.min(9, Math.floor(((elapsed - 5.4) / 2.2) * 9)));

  return (
    <div
      ref={containerRef}
      id="cinematic-intro-root"
      className="fixed inset-0 select-none overflow-hidden flex flex-col items-center justify-center"
      style={{
        zIndex: 99999,
        backgroundColor: '#000000',
        transition: 'opacity 500ms ease',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto'
      }}
    >
      {/* Underlying 60FPS Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* ============================================================ */}
      {/* STAGE 1: BLACK SCREEN & "HEAT IS EVERYWHERE" (0:00 - 0:02)    */}
      {/* ============================================================ */}
      {isBlackScreen && (
        <div 
          className="text-center flex flex-col items-center gap-3 px-6 transition-opacity duration-700"
          style={{ 
            zIndex: 20,
            opacity: elapsed >= 0.3 ? 1 : 0 
          }}
        >
          <h1 
            style={{
              fontSize: 'clamp(24px, 4vw, 38px)',
              fontWeight: 300,
              letterSpacing: '0.22em',
              color: '#F5F5F5',
              textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(255, 107, 53, 0.4)'
            }}
          >
            Heat is everywhere.
          </h1>
          {elapsed >= 0.8 && (
            <span 
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#7C827C',
                letterSpacing: '0.18em',
                textTransform: 'uppercase'
              }}
            >
              ENERGY IN CONSTANT MOTION &bull; CONDUCTION &bull; CONVECTION &bull; RADIATION
            </span>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* STAGE 2: REAL-WORLD ENGINEERING MONTAGE (0:02 - 0:05.2)      */}
      {/* ============================================================ */}
      {isMontage && (
        <div 
          className="w-full max-w-4xl px-6 flex flex-col items-center gap-6"
          style={{ zIndex: 20 }}
        >
          {/* Active Montage Scenario Display */}
          <div 
            style={{
              width: '100%',
              height: '280px',
              borderRadius: '24px',
              backgroundColor: 'rgba(13, 15, 14, 0.88)',
              border: '1px solid #252825',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}
          >
            {/* Top HUD Tag */}
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#252825] pb-2">
              <span className="text-[#39FF14] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                SCENARIO 0{montageScene + 1}/04 &bull; REAL-WORLD THERMAL PHENOMENON
              </span>
              <span className="text-[#7C827C]">
                t = {elapsed.toFixed(1)}s &bull; VECTOR: HOT &rarr; COLD
              </span>
            </div>

            {/* SCENE 0: Sun → Building (Solar Radiation) */}
            {montageScene === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-lg">
                  {/* Sun */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#EF4444] shadow-[0_0_35px_#FF6B35] flex items-center justify-center">
                      <Sun className="w-8 h-8 text-[#FFFFFF] animate-spin" style={{ animationDuration: '20s' }} />
                    </div>
                    <span className="text-[11px] font-mono text-[#FF6B35] font-bold">SOLAR RADIATION</span>
                    <span className="text-[9px] font-mono text-[#7C827C]">1000 W/m&sup2; Influx</span>
                  </div>

                  {/* Radiant Heat Flow Arrows */}
                  <div className="flex flex-col items-center gap-1 text-[#FF6B35]">
                    <div className="flex items-center gap-1 animate-pulse">
                      <div className="w-14 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]" />
                      <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#F59E0B]">Radiant Wave Front</span>
                  </div>

                  {/* Building Facade */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-28 h-24 rounded-2xl bg-[#171918] border-2 border-[#FF6B35]/60 flex flex-col justify-end p-2 relative shadow-lg">
                      <div className="w-full h-8 bg-[#EF4444]/30 rounded flex items-center justify-center text-[10px] font-mono text-[#EF4444] font-bold">
                        Hot Facade 58&deg;C
                      </div>
                      <div className="w-full h-8 bg-[#2563EB]/20 rounded mt-1 flex items-center justify-center text-[10px] font-mono text-[#38BDF8]">
                        Interior 22&deg;C
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#F5F5F5] font-bold">CIVIL INFRASTRUCTURE</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 1: CPU / Laptop Processor Die */}
            {montageScene === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-lg">
                  {/* Silicon Chip Die */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/20 border-2 border-[#EF4444] shadow-[0_0_30px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center gap-1">
                      <Cpu className="w-7 h-7 text-[#EF4444] animate-pulse" />
                      <span className="text-[8px] font-mono text-[#FF6B35]">T_die = 95&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#EF4444] font-bold">SILICON DIE</span>
                    <span className="text-[9px] font-mono text-[#7C827C]">120W TDP Thermal Load</span>
                  </div>

                  {/* Heat Pipe Conduction */}
                  <div className="flex flex-col items-center gap-1 text-[#FF6B35]">
                    <div className="flex items-center gap-1 animate-pulse">
                      <div className="w-14 h-0.5 bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#38BDF8]" />
                      <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#F59E0B]">Heat Pipe Conduction</span>
                  </div>

                  {/* Vapour Chamber / Fin Array */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-28 h-24 rounded-2xl bg-[#171918] border border-[#38BDF8]/60 flex flex-col justify-between p-2 shadow-lg">
                      <div className="flex justify-between gap-1 h-12 items-end">
                        <div className="w-2 h-10 bg-[#38BDF8] rounded-t animate-pulse" />
                        <div className="w-2 h-8 bg-[#38BDF8] rounded-t" />
                        <div className="w-2 h-11 bg-[#38BDF8] rounded-t animate-pulse" />
                        <div className="w-2 h-7 bg-[#38BDF8] rounded-t" />
                        <div className="w-2 h-10 bg-[#38BDF8] rounded-t" />
                      </div>
                      <span className="text-[9px] font-mono text-[#38BDF8] text-center">Fins: 38&deg;C Exhaust</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#38BDF8] font-bold">THERMAL SOLUTION</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: Combustion Engine & Radiator */}
            {montageScene === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-lg">
                  {/* Engine Combustion */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/25 border-2 border-[#EF4444] shadow-[0_0_30px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center gap-1">
                      <Flame className="w-7 h-7 text-[#EF4444] animate-bounce" />
                      <span className="text-[8px] font-mono text-[#FF6B35]">850&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#EF4444] font-bold">ENGINE BLOCK</span>
                    <span className="text-[9px] font-mono text-[#FF6B35]">Combustion Chamber</span>
                  </div>

                  {/* Coolant Loop */}
                  <div className="flex flex-col items-center gap-1 text-[#38BDF8]">
                    <div className="flex items-center gap-1 animate-pulse">
                      <div className="w-14 h-0.5 bg-gradient-to-r from-[#EF4444] to-[#2563EB]" />
                      <ChevronRight className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#38BDF8]">Liquid Coolant Flux</span>
                  </div>

                  {/* Radiator Heat Exchanger */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-28 h-24 rounded-2xl bg-[#171918] border border-[#2563EB]/60 flex flex-col items-center justify-center gap-1.5 p-2 shadow-lg">
                      <Droplets className="w-7 h-7 text-[#38BDF8] animate-pulse" />
                      <span className="text-[9px] font-mono text-[#38BDF8]">Radiator Matrix</span>
                      <span className="text-[9px] font-mono text-[#7C827C]">Inlet: 22&deg;C Water</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#38BDF8] font-bold">HEAT EXCHANGER</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 3: Industrial Wall Conduction */}
            {montageScene === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-lg">
                  {/* Hot Outer Zone */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/20 border border-[#EF4444] flex flex-col items-center justify-center shadow-lg">
                      <span className="text-xs font-bold font-mono text-[#EF4444]">HOT</span>
                      <span className="text-[10px] font-mono text-[#EF4444]">80&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#EF4444] font-bold">T_HIGH</span>
                  </div>

                  {/* Multi-layer Wall Cross Section */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center border border-[#303330] rounded-xl overflow-hidden shadow-xl">
                      <div className="w-12 h-20 bg-gradient-to-r from-[#EF4444]/60 to-[#FF6B35]/60 flex items-center justify-center">
                        <span className="text-[8px] font-mono -rotate-90 text-white font-bold">STEEL</span>
                      </div>
                      <div className="w-16 h-20 bg-gradient-to-r from-[#FF6B35]/40 to-[#F59E0B]/40 flex items-center justify-center border-x border-[#303330]">
                        <span className="text-[8px] font-mono -rotate-90 text-white font-bold">INSULATION</span>
                      </div>
                      <div className="w-12 h-20 bg-gradient-to-r from-[#38BDF8]/40 to-[#2563EB]/40 flex items-center justify-center">
                        <span className="text-[8px] font-mono -rotate-90 text-white font-bold">CONCRETE</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#F59E0B]">dT/dx Gradient Barrier</span>
                  </div>

                  {/* Cool Inner Zone */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/20 border border-[#2563EB] flex flex-col items-center justify-center shadow-lg">
                      <span className="text-xs font-bold font-mono text-[#38BDF8]">COOL</span>
                      <span className="text-[10px] font-mono text-[#38BDF8]">24&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#38BDF8] font-bold">T_LOW</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Narration Card */}
            <div className="pt-2 border-t border-[#252825] flex items-center justify-center">
              <p className="text-xs sm:text-sm text-[#F5F5F5] font-sans text-center max-w-2xl font-medium tracking-wide">
                &ldquo;From buildings to electronics, vehicles to industrial systems, controlling heat is an engineering challenge.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STAGE 3: METALLIC ROD CONVERGENCE & T1-T9 SENSORS (0:05.2 - 0:08) */}
      {/* ============================================================ */}
      {isRodReveal && (
        <div 
          className="w-full max-w-4xl px-4 flex flex-col items-center gap-6"
          style={{ zIndex: 20 }}
        >
          {/* Header Concept */}
          <div className="text-center flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-[#FF6B35] font-bold tracking-widest uppercase">
              CONTROLLED EXPERIMENTAL APPARATUS
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-[#F5F5F5]">
              Linear Thermal Conduction &bull; Fourier Rod
            </h2>
          </div>

          {/* Sequential T1 to T9 Thermocouple Markers */}
          <div className="w-full flex justify-between items-center px-4 max-w-3xl mt-16 font-mono text-xs">
            {/* Heater Indicator (Left) */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-[#EF4444]/30 border border-[#EF4444] flex items-center justify-center animate-pulse shadow-[0_0_15px_#EF4444]">
                <Flame className="w-4 h-4 text-[#EF4444]" />
              </div>
              <span className="text-[9px] text-[#EF4444] font-bold">HEATER</span>
              <span className="text-[8px] text-[#7C827C]">100 W</span>
            </div>

            {/* Sequential T1 to T9 sensor pills */}
            {[
              { id: 'T1', val: '82.4°C', color: '#EF4444' },
              { id: 'T2', val: '78.1°C', color: '#FF6B35' },
              { id: 'T3', val: '74.6°C', color: '#FF6B35' },
              { id: 'T4', val: '68.9°C', color: '#F59E0B' },
              { id: 'T5', val: '62.3°C', color: '#F59E0B' },
              { id: 'T6', val: '54.7°C', color: '#38BDF8' },
              { id: 'T7', val: '46.2°C', color: '#38BDF8' },
              { id: 'T8', val: '37.8°C', color: '#2563EB' },
              { id: 'T9', val: '28.5°C', color: '#2563EB' }
            ].map((sensor, idx) => (
              <div
                key={sensor.id}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  idx < sensorRevealStage ? 'opacity-100 scale-100' : 'opacity-20 scale-90'
                }`}
              >
                <div 
                  className="w-7 h-7 rounded-lg bg-[#171918] border flex items-center justify-center text-[10px] font-bold shadow-md"
                  style={{ borderColor: idx < sensorRevealStage ? sensor.color : '#303330', color: sensor.color }}
                >
                  {sensor.id}
                </div>
                <span className="text-[9px] text-[#F5F5F5] font-semibold">
                  {idx < sensorRevealStage ? sensor.val : '--.-°C'}
                </span>
              </div>
            ))}

            {/* Cooling Water (Right) */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/30 border border-[#2563EB] flex items-center justify-center animate-pulse shadow-[0_0_15px_#2563EB]">
                <Droplets className="w-4 h-4 text-[#38BDF8]" />
              </div>
              <span className="text-[9px] text-[#38BDF8] font-bold">COOLING</span>
              <span className="text-[8px] text-[#7C827C]">20.0°C</span>
            </div>
          </div>

          {/* Voiceover Prompt */}
          <div className="mt-8 text-center">
            <p className="text-sm sm:text-base text-[#F5F5F5] font-medium tracking-wide">
              &ldquo;But how do we actually understand and measure this heat transfer?&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STAGE 4: FOURIER'S LAW MATHEMATICAL PRINCIPLE (0:08 - 0:11)   */}
      {/* ============================================================ */}
      {isFourier && (
        <div 
          className="w-full max-w-3xl px-4 flex flex-col items-center gap-8 font-mono"
          style={{ zIndex: 20 }}
        >
          {/* Section Header */}
          <div className="text-center flex flex-col items-center gap-1">
            <span className="text-[10px] text-[#39FF14] font-bold tracking-widest uppercase">
              FUNDAMENTAL GOVERNING LAW
            </span>
            <h2 className="text-2xl font-bold font-sans text-[#F5F5F5] tracking-tight">
              FOURIER&apos;S LAW OF HEAT CONDUCTION
            </h2>
          </div>

          {/* Master Equation Card */}
          <div 
            style={{
              padding: '24px 36px',
              borderRadius: '24px',
              backgroundColor: 'rgba(23, 25, 24, 0.95)',
              border: '1px solid rgba(57, 255, 20, 0.3)',
              boxShadow: '0 0 35px rgba(57, 255, 20, 0.15)',
              textAlign: 'center'
            }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F5F5F5] tracking-wider">
              <span className="text-[#FF6B35]">Q</span>
              <span className="text-[#7C827C] mx-3">=</span>
              <span className="text-[#EF4444]">&minus;</span>
              <span className="text-[#39FF14] mx-1">k</span>
              <span className="text-[#F59E0B] mx-1">A</span>
              <span className="text-[#38BDF8] ml-2">(dT / dx)</span>
            </div>
          </div>

          {/* 3 Physical Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {/* Temperature Gradient */}
            <div className="p-4 rounded-xl bg-[#171918]/80 border border-[#38BDF8]/40 flex flex-col items-center gap-2 text-center">
              <TrendingDown className="w-5 h-5 text-[#38BDF8]" />
              <span className="text-xs font-bold text-[#38BDF8]">TEMPERATURE GRADIENT</span>
              <span className="text-[10px] text-[#7C827C]">dT / dx &bull; Spatial temperature differential along axial length</span>
            </div>

            {/* Heat Flow Rate */}
            <div className="p-4 rounded-xl bg-[#171918]/80 border border-[#FF6B35]/40 flex flex-col items-center gap-2 text-center">
              <Flame className="w-5 h-5 text-[#FF6B35]" />
              <span className="text-xs font-bold text-[#FF6B35]">HEAT FLOW RATE</span>
              <span className="text-[10px] text-[#7C827C]">Q (Watts) &bull; Energy flux driven across cross-sectional area A</span>
            </div>

            {/* Thermal Conductivity */}
            <div className="p-4 rounded-xl bg-[#171918]/80 border border-[#39FF14]/40 flex flex-col items-center gap-2 text-center">
              <Sparkles className="w-5 h-5 text-[#39FF14]" />
              <span className="text-xs font-bold text-[#39FF14]">THERMAL CONDUCTIVITY</span>
              <span className="text-[10px] text-[#7C827C]">k (W/m&middot;K) &bull; Intrinsic material conduction property</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STAGE 5: DIGITAL TWIN REVEAL & THERMOTWIN BRAND (0:11 - 0:14.8)*/}
      {/* ============================================================ */}
      {(isDigitalTwin || isLogoReveal) && (
        <div 
          className="w-full max-w-3xl px-4 flex flex-col items-center gap-6 font-mono text-center"
          style={{ zIndex: 20 }}
        >
          {/* Logo Mark with signature #39FF14 glow */}
          <div className="w-20 h-20 rounded-3xl bg-[#102713] border-2 border-[#163D19] flex items-center justify-center shadow-[0_0_40px_rgba(57,255,20,0.35)]">
            <Flame className="w-10 h-10 text-[#39FF14] animate-pulse" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-sans tracking-tight text-[#F5F5F5]">
              THERMO<span className="text-[#39FF14]">TWIN</span>
            </h1>
            <p className="text-sm sm:text-base font-sans text-[#B5BBB5] max-w-md font-medium tracking-wide">
              From Heat Transfer Theory to a Digital Engineering Experience
            </p>
          </div>

          {/* Engineering System Badges */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md text-[11px] pt-2">
            <div className="p-2.5 rounded-xl bg-[#171918]/90 border border-[#252825]">
              <span className="text-[#39FF14] font-bold block">SIMULATION</span>
              <span className="text-[#7C827C]">50-Node FDTD</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#171918]/90 border border-[#252825]">
              <span className="text-[#39FF14] font-bold block">TELEMETRY</span>
              <span className="text-[#7C827C]">T1&ndash;T9 Live Bus</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#171918]/90 border border-[#252825]">
              <span className="text-[#39FF14] font-bold block">DIGITAL TWIN</span>
              <span className="text-[#7C827C]">3D WebGL Lab</span>
            </div>
          </div>

          <span className="text-[11px] text-[#7C827C] animate-pulse mt-2">
            HANDING OVER TO LIVE WORKSPACE &bull; 60 FPS NUMERICAL SOLVER READY
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* FLOATING CONTROLS: MUTE SOUND & SKIP INTRO                   */}
      {/* ============================================================ */}
      <div 
        className="absolute bottom-6 right-6 flex items-center gap-3 font-mono text-xs"
        style={{ zIndex: 30 }}
      >
        {/* Sound Mute Toggle */}
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-xl bg-[#171918]/90 hover:bg-[#202321] border border-[#252825] text-[#B5BBB5] hover:text-[#F5F5F5] transition-colors cursor-pointer backdrop-blur-md"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#EF4444]" /> : <Volume2 className="w-4 h-4 text-[#39FF14]" />}
        </button>

        {/* Skip Button (appears after 2.5s) */}
        {showSkip && (
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-xl bg-[#171918]/90 hover:bg-[#202321] border border-[#303330] hover:border-[#39FF14]/50 text-[#B5BBB5] hover:text-[#39FF14] transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>SKIP INTRO</span>
          </button>
        )}
      </div>

      {/* Progress Timeline Indicator Bar at the bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-[#171918]"
        style={{ zIndex: 30 }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#FF6B35] via-[#F59E0B] to-[#39FF14] transition-all duration-100"
          style={{ width: `${Math.min(100, (elapsed / 14.8) * 100)}%` }}
        />
      </div>
    </div>
  );
};
