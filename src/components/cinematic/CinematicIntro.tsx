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
  Gauge,
  Activity,
  Binary,
  Maximize2
} from 'lucide-react';
import { cinematicAudio } from './cinematicAudio';

interface CinematicIntroProps {
  onComplete: () => void;
}

// Particle interface
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
  type?: 'ember' | 'conduction' | 'vortex' | 'coolant';
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable callback ref to eliminate effect restarts
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

  // Audio cues tracking
  const soundCuesTriggered = useRef<Record<string, boolean>>({});

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

      // Throttle React state updates to ~20 FPS for silky-smooth 60 FPS canvas loop
      if (now - lastStateUpdateRef.current > 48) {
        lastStateUpdateRef.current = now;
        setElapsed(timeSec);
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Reveal Skip button at 2.5s
      if (timeSec >= 2.5 && !hasShownSkipRef.current) {
        hasShownSkipRef.current = true;
        setShowSkip(true);
      }

      // Synchronize audio beats with visual events
      if (timeSec >= 0.3 && !soundCuesTriggered.current.particleAppear) {
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

      // Clear Canvas & Reset Matrix
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      // ============================================================
      // STAGE 1: ENERGY ORIGIN & RADIAL PULSE (0.0s - 2.0s)
      // ============================================================
      if (timeSec < 2.0) {
        const cx = width / 2;
        const cy = height / 2;

        if (timeSec >= 0.25) {
          // Radial energy shockwave ring expanding on appearance
          const shockProgress = Math.min(1, (timeSec - 0.25) / 1.1);
          if (shockProgress < 1.0) {
            const shockRadius = shockProgress * 180;
            const shockAlpha = (1 - shockProgress) * 0.55;
            ctx.beginPath();
            ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 107, 53, ${shockAlpha})`;
            ctx.lineWidth = 2 * (1 - shockProgress);
            ctx.stroke();

            // Inner harmonic ring
            ctx.beginPath();
            ctx.arc(cx, cy, shockRadius * 0.55, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${shockAlpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Organic floating energy packet motion
          const tProgress = Math.min(1, (timeSec - 0.25) / 1.75);
          const px = cx + Math.sin(tProgress * Math.PI * 3.5) * 65;
          const py = cy + Math.cos(tProgress * Math.PI * 2.2) * 28;

          // Volumetric heat glow bloom
          const pulseScale = 1 + Math.sin(timeSec * 8) * 0.12;
          const bloomRadius = 85 * pulseScale;
          const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, bloomRadius);
          glowGrad.addColorStop(0, 'rgba(255, 107, 53, 0.7)');
          glowGrad.addColorStop(0.28, 'rgba(239, 68, 68, 0.35)');
          glowGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.08)');
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(px, py, bloomRadius, 0, Math.PI * 2);
          ctx.fill();

          // Outer glowing heat aura
          ctx.fillStyle = '#FF6B35';
          ctx.beginPath();
          ctx.arc(px, py, 4.5 * pulseScale, 0, Math.PI * 2);
          ctx.fill();

          // White-hot plasma core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 2.0, 0, Math.PI * 2);
          ctx.fill();

          // Orbiting micro-embers (3 orbiting satellite energy packets)
          for (let k = 0; k < 3; k++) {
            const orbitAngle = timeSec * 6 + (k * (Math.PI * 2 / 3));
            const orbitR = 14 + Math.sin(timeSec * 4 + k) * 3;
            const ox = px + Math.cos(orbitAngle) * orbitR;
            const oy = py + Math.sin(orbitAngle) * orbitR;
            ctx.fillStyle = k === 0 ? '#FFFFFF' : '#FF6B35';
            ctx.beginPath();
            ctx.arc(ox, oy, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Trailing micro-embers
          if (Math.random() < 0.65) {
            particles.push({
              x: px + (Math.random() - 0.5) * 4,
              y: py + (Math.random() - 0.5) * 4,
              vx: (Math.random() - 0.5) * 1.8,
              vy: (Math.random() - 0.5) * 1.8 - 0.6,
              radius: Math.random() * 1.8 + 0.8,
              color: Math.random() < 0.3 ? '#FFFFFF' : '#FF6B35',
              alpha: 0.9,
              life: 0,
              maxLife: 32,
              trail: [],
              type: 'ember'
            });
          }
        }
      }

      // ============================================================
      // STAGE 2: REAL-WORLD MONTAGE MATCH-TRANSITIONS (2.0s - 5.2s)
      // ============================================================
      else if (timeSec >= 2.0 && timeSec < 5.2) {
        // Continuous directional heat flux particles (Hot -> Cold)
        if (particles.length < 85) {
          const isHot = Math.random() < 0.68;
          particles.push({
            x: isHot ? Math.random() * width * 0.42 : width * 0.42 + Math.random() * width * 0.58,
            y: height * 0.28 + Math.random() * height * 0.44,
            vx: Math.random() * 3.8 + 2.2, // Consistent physical drift: HOT -> COLD
            vy: (Math.random() - 0.5) * 1.2,
            radius: Math.random() * 2.2 + 1.0,
            color: isHot ? (Math.random() < 0.5 ? '#FF6B35' : '#EF4444') : '#38BDF8',
            alpha: Math.random() * 0.65 + 0.35,
            life: 0,
            maxLife: 50,
            trail: [],
            type: 'ember'
          });
        }
      }

      // ============================================================
      // STAGE 3: PARTICLE VORTEX CONVERGENCE & METALLIC ROD (5.2s - 8.0s)
      // ============================================================
      else if (timeSec >= 5.2 && timeSec < 8.0) {
        const rodY = height / 2;
        const rodStartX = width * 0.20;
        const rodEndX = width * 0.80;
        const rodLength = rodEndX - rodStartX;

        // VORTEX CONVERGENCE (5.2s - 5.8s): Particles curve into the rod axis
        if (timeSec < 5.8 && particles.length < 90) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 120 + Math.random() * 180;
          const targetX = rodStartX + Math.random() * rodLength;
          particles.push({
            x: targetX + Math.cos(angle) * dist,
            y: rodY + Math.sin(angle) * dist,
            vx: -Math.cos(angle) * 6.5,
            vy: -Math.sin(angle) * 6.5,
            radius: Math.random() * 2.0 + 1.0,
            color: '#FF6B35',
            alpha: 0.8,
            life: 0,
            maxLife: 28,
            trail: [],
            type: 'vortex'
          });
        }

        // METALLIC ROD VISUALIZATION (Emerges at t >= 5.4s)
        if (timeSec >= 5.4) {
          const rodProgress = Math.min(1, (timeSec - 5.4) / 0.6);
          const currentLength = rodLength * rodProgress;

          // Shadow beneath rod
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.ellipse(width / 2, rodY + 36, currentLength / 2, 14, 0, 0, Math.PI * 2);
          ctx.fill();

          // Metallic rod base body (Brushed Dark Graphite with specular bevel)
          ctx.fillStyle = '#171918';
          ctx.strokeStyle = '#303330';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(rodStartX, rodY - 26, currentLength, 52, 10);
          ctx.fill();
          ctx.stroke();

          // Metallic top specular highlight line
          const specGrad = ctx.createLinearGradient(rodStartX, rodY - 24, rodStartX + currentLength, rodY - 24);
          specGrad.addColorStop(0.0, 'rgba(255, 107, 53, 0.4)');
          specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)');
          specGrad.addColorStop(1.0, 'rgba(56, 189, 248, 0.3)');
          ctx.strokeStyle = specGrad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rodStartX + 6, rodY - 22);
          ctx.lineTo(rodStartX + currentLength - 6, rodY - 22);
          ctx.stroke();

          // DYNAMIC THERMAL GRADIENT PROPAGATION: Heat physically propagates left to right
          const heatFrontRatio = Math.min(1, Math.max(0, (timeSec - 5.6) / 2.2));
          const thermalGrad = ctx.createLinearGradient(rodStartX, rodY, rodStartX + currentLength, rodY);
          thermalGrad.addColorStop(0.0, 'rgba(239, 68, 68, 0.85)'); // Hot Red
          thermalGrad.addColorStop(Math.min(1, heatFrontRatio * 0.3), 'rgba(255, 107, 53, 0.75)'); // Orange
          thermalGrad.addColorStop(Math.min(1, heatFrontRatio * 0.6), 'rgba(245, 158, 11, 0.65)'); // Yellow
          thermalGrad.addColorStop(Math.min(1, heatFrontRatio * 0.85), 'rgba(56, 189, 248, 0.6)'); // Cyan
          thermalGrad.addColorStop(1.0, 'rgba(37, 99, 235, 0.7)'); // Cool Blue
          
          ctx.fillStyle = thermalGrad;
          ctx.beginPath();
          ctx.roundRect(rodStartX + 3, rodY - 23, currentLength - 6, 46, 8);
          ctx.fill();

          // Left Heater Activation Glow
          const heaterGlow = ctx.createRadialGradient(rodStartX, rodY, 0, rodStartX, rodY, 70);
          heaterGlow.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
          heaterGlow.addColorStop(0.5, 'rgba(255, 107, 53, 0.2)');
          heaterGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = heaterGlow;
          ctx.beginPath();
          ctx.arc(rodStartX, rodY, 70, 0, Math.PI * 2);
          ctx.fill();

          // Right Cooling Jacket Glow
          const coolGlow = ctx.createRadialGradient(rodStartX + currentLength, rodY, 0, rodStartX + currentLength, rodY, 65);
          coolGlow.addColorStop(0, 'rgba(37, 99, 235, 0.45)');
          coolGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
          coolGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = coolGlow;
          ctx.beginPath();
          ctx.arc(rodStartX + currentLength, rodY, 65, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spawn axial conduction particles flowing HOT -> COLD
        if (particles.length < 95 && timeSec >= 5.6) {
          const frac = Math.random();
          let pColor = '#EF4444';
          if (frac > 0.75) pColor = '#2563EB';
          else if (frac > 0.55) pColor = '#38BDF8';
          else if (frac > 0.35) pColor = '#F59E0B';
          else if (frac > 0.15) pColor = '#FF6B35';

          particles.push({
            x: rodStartX + frac * rodLength,
            y: rodY + (Math.random() - 0.5) * 32,
            vx: Math.random() * 2.2 + 1.2,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2.0 + 0.8,
            color: pColor,
            alpha: 0.85,
            life: 0,
            maxLife: 42,
            trail: [],
            type: 'conduction'
          });
        }
      }

      // ============================================================
      // STAGE 4: FOURIER'S LAW MATHEMATICAL FOCUS (8.0s - 11.0s)
      // ============================================================
      else if (timeSec >= 8.0 && timeSec < 11.0) {
        const rodY = height / 2 + 50;
        const rodStartX = width * 0.22;
        const rodEndX = width * 0.78;
        const rodLength = rodEndX - rodStartX;

        // Simplified, elegant thermal rod bar
        const rodGrad = ctx.createLinearGradient(rodStartX, rodY, rodEndX, rodY);
        rodGrad.addColorStop(0.0, 'rgba(239, 68, 68, 0.6)');
        rodGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
        rodGrad.addColorStop(1.0, 'rgba(37, 99, 235, 0.5)');
        ctx.fillStyle = rodGrad;
        ctx.beginPath();
        ctx.roundRect(rodStartX, rodY - 15, rodLength, 30, 8);
        ctx.fill();

        // Directional Heat Flow Vector Arrows on rod
        const arrowStep = rodLength / 6;
        for (let a = 1; a < 6; a++) {
          const ax = rodStartX + a * arrowStep;
          ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ax - 10, rodY);
          ctx.lineTo(ax + 10, rodY);
          ctx.lineTo(ax + 4, rodY - 4);
          ctx.moveTo(ax + 10, rodY);
          ctx.lineTo(ax + 4, rodY + 4);
          ctx.stroke();
        }

        if (particles.length < 50) {
          particles.push({
            x: rodStartX + Math.random() * rodLength,
            y: rodY + (Math.random() - 0.5) * 18,
            vx: Math.random() * 1.8 + 1.0,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.8 + 0.8,
            color: '#FF6B35',
            alpha: 0.75,
            life: 0,
            maxLife: 38,
            trail: [],
            type: 'conduction'
          });
        }
      }

      // ============================================================
      // STAGE 5: DIGITAL TWIN REVEAL & BRAND (11.0s - 14.8s)
      // ============================================================
      else if (timeSec >= 11.0) {
        // Subtle Digital Engineering Perspective Grid beneath apparatus
        const gridHorizon = height * 0.55;
        ctx.strokeStyle = 'rgba(48, 51, 48, 0.28)';
        ctx.lineWidth = 1;

        // Horizontal perspective lines
        for (let l = 0; l < 6; l++) {
          const gy = gridHorizon + (l * l * 8) + 10;
          if (gy < height) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(width, gy);
            ctx.stroke();
          }
        }

        // Receding vertical perspective rays
        for (let r = -6; r <= 6; r++) {
          const gx = width / 2 + r * 110;
          ctx.beginPath();
          ctx.moveTo(width / 2 + r * 20, gridHorizon);
          ctx.lineTo(gx, height);
          ctx.stroke();
        }

        // Brand laser scan sweep at t >= 12.6s
        if (timeSec >= 12.6 && timeSec < 13.8) {
          const scanProgress = (timeSec - 12.6) / 1.2;
          const scanX = width * scanProgress;
          const scanGrad = ctx.createLinearGradient(scanX - 40, 0, scanX + 40, 0);
          scanGrad.addColorStop(0, 'rgba(57, 255, 20, 0)');
          scanGrad.addColorStop(0.5, 'rgba(57, 255, 20, 0.45)');
          scanGrad.addColorStop(1, 'rgba(57, 255, 20, 0)');
          ctx.fillStyle = scanGrad;
          ctx.fillRect(scanX - 40, height * 0.2, 80, height * 0.4);
        }

        // Ambient lime green & heat telemetry particles
        if (particles.length < 55) {
          const isBrand = Math.random() < 0.65;
          particles.push({
            x: Math.random() * width,
            y: height * 0.35 + Math.random() * height * 0.4,
            vx: (Math.random() - 0.5) * 1.0,
            vy: (Math.random() - 0.5) * 1.0,
            radius: Math.random() * 1.6 + 0.6,
            color: isBrand ? '#39FF14' : '#FF6B35',
            alpha: 0.55,
            life: 0,
            maxLife: 45,
            trail: [],
            type: 'ember'
          });
        }
      }

      // ============================================================
      // PARTICLE ENGINE UPDATE & DRAW
      // ============================================================
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

        // Draw particle trail with soft motion blur
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.radius * 0.85;
          ctx.globalAlpha = drawAlpha * 0.45;
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
  }, []);

  // Narrative scene milestones
  const isBlackScreen = elapsed >= 0.0 && elapsed < 2.0;
  const isMontage = elapsed >= 2.0 && elapsed < 5.2;
  const montageScene = Math.min(3, Math.floor((elapsed - 2.0) / 0.8)); // 0: Sun, 1: CPU, 2: Engine, 3: Wall
  const isRodReveal = elapsed >= 5.2 && elapsed < 8.0;
  const isFourier = elapsed >= 8.0 && elapsed < 11.0;
  const isDigitalTwin = elapsed >= 11.0 && elapsed < 13.0;
  const isLogoReveal = elapsed >= 12.5 && elapsed < 14.8;

  // Sensor sequential illumination based on physical heat wave front reaching each position
  const sensorRevealStage = Math.max(0, Math.min(9, Math.floor(((elapsed - 5.5) / 2.2) * 9)));

  return (
    <div
      ref={containerRef}
      id="cinematic-intro-root"
      className="fixed inset-0 select-none overflow-hidden flex flex-col items-center justify-center font-sans"
      style={{
        zIndex: 99999,
        backgroundColor: '#000000',
        transition: 'opacity 500ms ease',
        opacity: isFadingOut ? 0 : 1,
        pointerEvents: isFadingOut ? 'none' : 'auto'
      }}
    >
      {/* 60FPS Particles & Volumetric Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />

      {/* ============================================================ */}
      {/* STAGE 1: ENERGY ORIGIN & "HEAT IS EVERYWHERE" (0:00 - 0:02)    */}
      {/* ============================================================ */}
      {isBlackScreen && (
        <div 
          className="text-center flex flex-col items-center gap-3 px-6"
          style={{ 
            zIndex: 20,
            opacity: elapsed >= 0.35 ? 1 : 0,
            transform: `translateY(${Math.max(0, (1.2 - elapsed) * 14)}px)`,
            filter: `blur(${Math.max(0, (0.7 - elapsed) * 6)}px)`,
            transition: 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <h1 
            style={{
              fontSize: 'clamp(26px, 4.5vw, 42px)',
              fontWeight: 300,
              letterSpacing: '0.24em',
              color: '#F5F5F5',
              textTransform: 'uppercase',
              textShadow: '0 0 25px rgba(255, 107, 53, 0.5)'
            }}
          >
            Heat is everywhere.
          </h1>
          {elapsed >= 0.8 && (
            <span 
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#7C827C',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                opacity: Math.min(1, (elapsed - 0.8) / 0.5)
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
          {/* Active Montage Scenario Display with subtle camera zoom */}
          <div 
            style={{
              width: '100%',
              height: '300px',
              borderRadius: '24px',
              backgroundColor: 'rgba(17, 19, 18, 0.92)',
              border: '1px solid #303330',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              transform: `scale(${1.0 + ((elapsed - 2.0) % 0.8) * 0.04})`,
              transition: 'transform 800ms linear'
            }}
          >
            {/* Top HUD Tag */}
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#252825] pb-2.5">
              <span className="text-[#39FF14] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
                SCENARIO 0{montageScene + 1}/04 &bull; REAL-WORLD THERMAL PHENOMENON
              </span>
              <span className="text-[#7C827C]">
                t = {elapsed.toFixed(1)}s &bull; VECTOR: HOT &rarr; COLD
              </span>
            </div>

            {/* SCENE 0: Sun → Building Roof & Facade (Solar Radiation) */}
            {montageScene === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-xl">
                  {/* Sun Source */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#EF4444] shadow-[0_0_35px_#FF6B35] flex items-center justify-center">
                      <Sun className="w-8 h-8 text-[#FFFFFF] animate-spin" style={{ animationDuration: '24s' }} />
                    </div>
                    <span className="text-[11px] font-mono text-[#FF6B35] font-bold">SOLAR RADIATION</span>
                    <span className="text-[9px] font-mono text-[#7C827C]">1000 W/m&sup2; Influx</span>
                  </div>

                  {/* Radiant Heat Flow Arrows */}
                  <div className="flex flex-col items-center gap-1 text-[#FF6B35]">
                    <div className="flex items-center gap-1 animate-pulse">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]" />
                      <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#F59E0B]">Radiant Wave Front</span>
                  </div>

                  {/* Building Envelope */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-32 h-24 rounded-2xl bg-[#171918] border-2 border-[#FF6B35]/60 flex flex-col justify-end p-2 relative shadow-lg">
                      <div className="w-full h-8 bg-[#EF4444]/30 rounded flex items-center justify-center text-[10px] font-mono text-[#EF4444] font-bold">
                        Roof Facade 58&deg;C
                      </div>
                      <div className="w-full h-8 bg-[#2563EB]/25 rounded mt-1 flex items-center justify-center text-[10px] font-mono text-[#38BDF8]">
                        Interior 22&deg;C
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#F5F5F5] font-bold">CIVIL INFRASTRUCTURE</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 1: CPU Silicon Die & Heat Pipe (Electronics Thermal Solution) */}
            {montageScene === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-xl">
                  {/* Silicon Chip Die Hotspot */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/25 border-2 border-[#EF4444] shadow-[0_0_35px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center gap-1">
                      <Cpu className="w-7 h-7 text-[#EF4444] animate-pulse" />
                      <span className="text-[8px] font-mono text-[#FF6B35]">T_die = 95&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#EF4444] font-bold">SILICON DIE</span>
                    <span className="text-[9px] font-mono text-[#7C827C]">120W TDP Thermal Load</span>
                  </div>

                  {/* Heat Pipe Conduction */}
                  <div className="flex flex-col items-center gap-1 text-[#FF6B35]">
                    <div className="flex items-center gap-1 animate-pulse">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#38BDF8]" />
                      <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#F59E0B]">Phase Change Heat Pipe</span>
                  </div>

                  {/* Vapour Chamber / Fin Array */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-32 h-24 rounded-2xl bg-[#171918] border border-[#38BDF8]/60 flex flex-col justify-between p-2 shadow-lg">
                      <div className="flex justify-between gap-1 h-12 items-end">
                        <div className="w-2 h-10 bg-[#38BDF8] rounded-t animate-pulse" />
                        <div className="w-2 h-8 bg-[#38BDF8] rounded-t" />
                        <div className="w-2 h-11 bg-[#38BDF8] rounded-t animate-pulse" />
                        <div className="w-2 h-7 bg-[#38BDF8] rounded-t" />
                        <div className="w-2 h-10 bg-[#38BDF8] rounded-t" />
                      </div>
                      <span className="text-[9px] font-mono text-[#38BDF8] text-center">Fins: 38&deg;C Exhaust</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#38BDF8] font-bold">VAPOUR CHAMBER</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: Engine Combustion Chamber & Coolant Radiator */}
            {montageScene === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-xl">
                  {/* Engine Combustion Block */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/25 border-2 border-[#EF4444] shadow-[0_0_35px_rgba(239,68,68,0.55)] flex flex-col items-center justify-center gap-1">
                      <Flame className="w-7 h-7 text-[#EF4444] animate-bounce" />
                      <span className="text-[8px] font-mono text-[#FF6B35]">850&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#EF4444] font-bold">ENGINE BLOCK</span>
                    <span className="text-[9px] font-mono text-[#FF6B35]">Combustion Chamber</span>
                  </div>

                  {/* Coolant Loop */}
                  <div className="flex flex-col items-center gap-1 text-[#38BDF8]">
                    <div className="flex items-center gap-1 animate-pulse">
                      <div className="w-16 h-0.5 bg-gradient-to-r from-[#EF4444] to-[#2563EB]" />
                      <ChevronRight className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#38BDF8]">Fluid Convection Flux</span>
                  </div>

                  {/* Radiator Matrix */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-32 h-24 rounded-2xl bg-[#171918] border border-[#2563EB]/60 flex flex-col items-center justify-center gap-1.5 p-2 shadow-lg">
                      <Droplets className="w-7 h-7 text-[#38BDF8] animate-pulse" />
                      <span className="text-[9px] font-mono text-[#38BDF8]">Radiator Core</span>
                      <span className="text-[9px] font-mono text-[#7C827C]">Inlet: 22&deg;C Coolant</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#38BDF8] font-bold">HEAT EXCHANGER</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 3: 1D Conduction across Building Wall Insulation Barrier */}
            {montageScene === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                <div className="flex items-center justify-around w-full max-w-xl">
                  {/* Hot Outer Zone */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/25 border border-[#EF4444] flex flex-col items-center justify-center shadow-lg">
                      <span className="text-xs font-bold font-mono text-[#EF4444]">HOT</span>
                      <span className="text-[10px] font-mono text-[#EF4444]">80&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#EF4444] font-bold">T_HIGH</span>
                  </div>

                  {/* Multi-layer Wall Section: 1D Conduction */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center border border-[#303330] rounded-xl overflow-hidden shadow-xl">
                      <div className="w-14 h-20 bg-gradient-to-r from-[#EF4444]/65 to-[#FF6B35]/65 flex items-center justify-center">
                        <span className="text-[8px] font-mono -rotate-90 text-white font-bold">STEEL</span>
                      </div>
                      <div className="w-18 h-20 bg-gradient-to-r from-[#FF6B35]/45 to-[#F59E0B]/45 flex items-center justify-center border-x border-[#303330]">
                        <span className="text-[8px] font-mono -rotate-90 text-white font-bold">INSULATION</span>
                      </div>
                      <div className="w-14 h-20 bg-gradient-to-r from-[#38BDF8]/45 to-[#2563EB]/45 flex items-center justify-center">
                        <span className="text-[8px] font-mono -rotate-90 text-white font-bold">CONCRETE</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#F59E0B]">1D Conduction &bull; dT/dx</span>
                  </div>

                  {/* Cool Inner Zone */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/25 border border-[#2563EB] flex flex-col items-center justify-center shadow-lg">
                      <span className="text-xs font-bold font-mono text-[#38BDF8]">COOL</span>
                      <span className="text-[10px] font-mono text-[#38BDF8]">24&deg;C</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#38BDF8] font-bold">T_LOW</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Documentary Caption */}
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
          <div className="text-center flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#FF6B35] font-bold tracking-widest uppercase">
              CONTROLLED EXPERIMENTAL APPARATUS
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-sans text-[#F5F5F5]">
              Linear Thermal Conduction &bull; Fourier Rod
            </h2>
          </div>

          {/* Sequential T1 to T9 Thermocouple Markers with Vertical Probes */}
          <div className="w-full flex justify-between items-center px-4 max-w-3xl mt-14 font-mono text-xs">
            {/* Heater Indicator (Left) */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/30 border border-[#EF4444] flex items-center justify-center animate-pulse shadow-[0_0_20px_#EF4444]">
                <Flame className="w-5 h-5 text-[#EF4444]" />
              </div>
              <span className="text-[9px] text-[#EF4444] font-bold">HEATER</span>
              <span className="text-[8px] text-[#7C827C]">100 W</span>
            </div>

            {/* Sequential T1 to T9 sensor probes */}
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
            ].map((sensor, idx) => {
              const isIlluminated = idx < sensorRevealStage;
              return (
                <div
                  key={sensor.id}
                  className={`flex flex-col items-center gap-1 transition-all duration-400 ${
                    isIlluminated ? 'opacity-100 scale-100' : 'opacity-25 scale-90'
                  }`}
                >
                  <div 
                    className="w-7 h-7 rounded-lg bg-[#171918] border flex items-center justify-center text-[10px] font-bold shadow-md transition-colors"
                    style={{ 
                      borderColor: isIlluminated ? sensor.color : '#303330', 
                      color: isIlluminated ? sensor.color : '#7C827C',
                      boxShadow: isIlluminated ? `0 0 10px ${sensor.color}44` : 'none'
                    }}
                  >
                    {sensor.id}
                  </div>
                  <span className="text-[9px] text-[#F5F5F5] font-semibold">
                    {isIlluminated ? sensor.val : '--.-°C'}
                  </span>
                  {/* Subtle vertical probe lead down to rod */}
                  <div 
                    className="w-0.5 h-3 rounded transition-colors"
                    style={{ backgroundColor: isIlluminated ? sensor.color : '#303330' }}
                  />
                </div>
              );
            })}

            {/* Cooling Water Indicator (Right) */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB]/30 border border-[#2563EB] flex items-center justify-center animate-pulse shadow-[0_0_20px_#2563EB]">
                <Droplets className="w-5 h-5 text-[#38BDF8]" />
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
          className="w-full max-w-3xl px-4 flex flex-col items-center gap-7 font-mono"
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

          {/* Master Equation Card with Scientific Highlighting */}
          <div 
            style={{
              padding: '26px 42px',
              borderRadius: '24px',
              backgroundColor: 'rgba(23, 25, 24, 0.96)',
              border: '1px solid rgba(57, 255, 20, 0.35)',
              boxShadow: '0 0 45px rgba(57, 255, 20, 0.16)',
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

          {/* 3 Physical Columns connecting to experiment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {/* Temperature Gradient */}
            <div className="p-4 rounded-xl bg-[#171918]/90 border border-[#38BDF8]/40 flex flex-col items-center gap-2 text-center shadow-lg">
              <TrendingDown className="w-5 h-5 text-[#38BDF8]" />
              <span className="text-xs font-bold text-[#38BDF8]">TEMPERATURE GRADIENT</span>
              <span className="text-[10px] text-[#7C827C]">dT / dx &bull; Spatial temperature differential along axial length</span>
            </div>

            {/* Heat Flow Rate */}
            <div className="p-4 rounded-xl bg-[#171918]/90 border border-[#FF6B35]/40 flex flex-col items-center gap-2 text-center shadow-lg">
              <Flame className="w-5 h-5 text-[#FF6B35]" />
              <span className="text-xs font-bold text-[#FF6B35]">HEAT FLOW RATE</span>
              <span className="text-[10px] text-[#7C827C]">Q (Watts) &bull; Energy flux driven across cross-sectional area A</span>
            </div>

            {/* Thermal Conductivity */}
            <div className="p-4 rounded-xl bg-[#171918]/90 border border-[#39FF14]/40 flex flex-col items-center gap-2 text-center shadow-lg">
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
          <div className="w-20 h-20 rounded-3xl bg-[#102713] border-2 border-[#163D19] flex items-center justify-center shadow-[0_0_45px_rgba(57,255,20,0.4)]">
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

          {/* Digital Twin Telemetry Badges */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md text-[11px] pt-1">
            <div className="p-2.5 rounded-xl bg-[#171918]/90 border border-[#252825] shadow-md">
              <span className="text-[#39FF14] font-bold block">SIMULATION</span>
              <span className="text-[#7C827C]">50-Node FDTD</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#171918]/90 border border-[#252825] shadow-md">
              <span className="text-[#39FF14] font-bold block">TELEMETRY</span>
              <span className="text-[#7C827C]">T1&ndash;T9 Live Bus</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#171918]/90 border border-[#252825] shadow-md">
              <span className="text-[#39FF14] font-bold block">DIGITAL TWIN</span>
              <span className="text-[#7C827C]">3D WebGL Lab</span>
            </div>
          </div>

          <span className="text-[11px] text-[#7C827C] animate-pulse mt-2">
            INITIALIZING WORKSPACE &bull; PREPARING DIGITAL TWIN APPARATUS...
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
          className="p-2.5 rounded-xl bg-[#171918]/90 hover:bg-[#202321] border border-[#252825] text-[#B5BBB5] hover:text-[#F5F5F5] transition-colors cursor-pointer backdrop-blur-md shadow-lg"
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
