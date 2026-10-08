import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { usePhysicsStore, ViewMode } from '@/store/usePhysicsStore';
import { MetallicRod3D } from './MetallicRod3D';
import { Heater3D } from './Heater3D';
import { InsulationShell3D } from './InsulationShell3D';
import { CoolingJacket3D } from './CoolingJacket3D';
import { Rotameter3D } from './Rotameter3D';
import { Meters3D } from './Meters3D';
import { Sensors3D } from './Sensors3D';
import { LabBench3D } from './LabBench3D';
import { ApparatusLabels3D } from './ApparatusLabels3D';
import { HeatFlowParticles3D } from './HeatFlowParticles3D';
import { Apparatus3DHUD } from '../ui/Apparatus3DHUD';
import { 
  Flame, 
  Droplets, 
  Layers, 
  Thermometer, 
  Gauge, 
  Tag, 
  X, 
  Eye, 
  Activity, 
  Sparkles, 
  Play, 
  RotateCcw, 
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  Scan,
  Compass,
  ArrowRight
} from 'lucide-react';
import { SENSORS } from '@/physics/sensors';

// Responsive Camera & Viewport Resize Handler for Three.js
function CanvasResizeHandler() {
  const { gl, camera } = useThree();
  useEffect(() => {
    const handleResize = () => {
      if (camera && gl) {
        const parent = gl.domElement.parentElement;
        if (parent) {
          const width = parent.clientWidth;
          const height = parent.clientHeight;
          if (width > 0 && height > 0) {
            (camera as THREE.PerspectiveCamera).aspect = width / height;
            (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
            gl.setSize(width, height);
          }
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [gl, camera]);
  return null;
}

// Cinematic Waypoint Milestones for 7.8s Tour
const CINEMATIC_STAGES = [
  { start: 0.0, end: 1.2, name: 'APPARATUS OVERVIEW', desc: 'Full grounded engineering digital twin' },
  { start: 1.2, end: 2.8, name: 'HEAT GENERATION', desc: 'Electrical Joule heating (P = V × I)' },
  { start: 2.8, end: 4.4, name: 'HEAT CONDUCTION', desc: 'Fourier 1D wavefront through 50 FDTD nodes' },
  { start: 4.4, end: 5.8, name: 'TEMPERATURE MEASUREMENT', desc: 'High-precision thermocouple array T1–T9' },
  { start: 5.8, end: 6.8, name: 'HEAT REMOVAL', desc: 'Forced convection water cooling jacket' },
  { start: 6.8, end: 7.8, name: 'DIGITAL TWIN EQUILIBRIUM', desc: 'Full apparatus operating in steady state' },
];

// Cinematic Camera Controller with automated flight path & smooth focus interpolation
function CameraController({
  inspectedPart,
  selectedSensorId,
  viewMode,
  onCinematicFinish,
  onCinematicStageChange
}: {
  inspectedPart: string | null;
  selectedSensorId: string | null;
  viewMode: ViewMode;
  onCinematicFinish: () => void;
  onCinematicStageChange: (stage: string) => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cinematicClockRef = useRef<number>(0);
  const prevStageRef = useRef<string>('');

  useFrame((_, delta) => {
    // 1. Automated Cinematic Flight Path
    if (viewMode === 'cinematic') {
      cinematicClockRef.current += delta;
      const t = cinematicClockRef.current;

      // Determine active stage
      const currentStage = CINEMATIC_STAGES.find((s) => t >= s.start && t < s.end) || CINEMATIC_STAGES[CINEMATIC_STAGES.length - 1];
      if (currentStage && currentStage.name !== prevStageRef.current) {
        prevStageRef.current = currentStage.name;
        onCinematicStageChange(currentStage.name);
      }

      let camPos = new THREE.Vector3(0, 1.8, 5.2);
      let lookTarget = new THREE.Vector3(0, 0, 0);

      if (t < 1.2) {
        // Stage 1: Overview
        camPos.set(0, 1.8, 5.2);
        lookTarget.set(0, 0, 0);
      } else if (t < 2.8) {
        // Stage 2: Heater close-up
        const p = (t - 1.2) / 1.6;
        camPos.lerpVectors(new THREE.Vector3(0, 1.8, 5.2), new THREE.Vector3(-2.4, 0.85, 2.0), p);
        lookTarget.lerpVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-2.3, 0.15, 0), p);
      } else if (t < 4.4) {
        // Stage 3: Follow conduction into rod (Pass T1 -> T4)
        const p = (t - 2.8) / 1.6;
        camPos.lerpVectors(new THREE.Vector3(-2.4, 0.85, 2.0), new THREE.Vector3(-0.3, 0.95, 2.4), p);
        lookTarget.lerpVectors(new THREE.Vector3(-2.3, 0.15, 0), new THREE.Vector3(-0.1, 0.2, 0), p);
      } else if (t < 5.8) {
        // Stage 4: Sensor array perspective
        const p = (t - 4.4) / 1.4;
        camPos.lerpVectors(new THREE.Vector3(-0.3, 0.95, 2.4), new THREE.Vector3(0.8, 1.1, 2.6), p);
        lookTarget.lerpVectors(new THREE.Vector3(-0.1, 0.2, 0), new THREE.Vector3(0.8, 0.35, 0), p);
      } else if (t < 6.8) {
        // Stage 5: Cooling jacket close-up
        const p = (t - 5.8) / 1.0;
        camPos.lerpVectors(new THREE.Vector3(0.8, 1.1, 2.6), new THREE.Vector3(1.9, 0.75, 2.2), p);
        lookTarget.lerpVectors(new THREE.Vector3(0.8, 0.35, 0), new THREE.Vector3(1.8, 0, 0), p);
      } else if (t < 7.8) {
        // Stage 6: Smooth pull-back reveal
        const p = (t - 6.8) / 1.0;
        camPos.lerpVectors(new THREE.Vector3(1.9, 0.75, 2.2), new THREE.Vector3(0, 1.8, 5.2), p);
        lookTarget.lerpVectors(new THREE.Vector3(1.8, 0, 0), new THREE.Vector3(0, 0, 0), p);
      } else {
        // Tour complete
        cinematicClockRef.current = 0;
        onCinematicFinish();
        return;
      }

      camera.position.lerp(camPos, 0.15);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookTarget, 0.15);
        controlsRef.current.update();
      }
      return;
    } else {
      cinematicClockRef.current = 0;
    }

    // 2. Standard Interactive Target Framing
    let targetPos = new THREE.Vector3(0, 1.8, 5.2);
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    if (viewMode === 'exploded') {
      targetPos.set(0, 2.2, 5.8);
      targetLookAt.set(0, 0.2, 0);
    } else if (selectedSensorId) {
      const sensor = SENSORS.find((s) => s.id === selectedSensorId);
      const posX = sensor && sensor.type === 'rod' ? -1.6 + (sensor.positionX / 0.5) * 3.2 : 1.8;
      targetPos.set(posX, 0.85, 2.4);
      targetLookAt.set(posX, 0.35, 0);
    } else {
      switch (inspectedPart) {
        case 'HEATER':
          targetPos.set(-2.3, 0.85, 2.4);
          targetLookAt.set(-2.3, 0.15, 0);
          break;
        case 'COOLING_JACKET':
          targetPos.set(1.8, 0.8, 2.4);
          targetLookAt.set(1.8, 0, 0);
          break;
        case 'METERS':
          targetPos.set(-2.3, 1.7, 2.2);
          targetLookAt.set(-2.3, 1.4, 0);
          break;
        case 'THERMOCOUPLES':
          targetPos.set(0, 1.4, 3.4);
          targetLookAt.set(0, 0.35, 0);
          break;
        case 'ROD':
          targetPos.set(0, 1.2, 3.8);
          targetLookAt.set(0, 0, 0);
          break;
        default:
          targetPos.set(0, 1.8, 5.2);
          targetLookAt.set(0, 0, 0);
          break;
      }
    }

    const factor = Math.min(1.0, delta * 3.6);
    camera.position.lerp(targetPos, factor);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt, factor);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 + 0.1}
      minDistance={1.6}
      maxDistance={9.5}
    />
  );
}

// 3D Apparatus Assembly with animated exploded offsets and alignment guides
function ApparatusAssembly3D({
  viewMode,
  simState,
  selectedSensorId,
  setSelectedSensor,
  setInspectedPart,
  heatParticlesEnabled,
  show3DLabels
}: {
  viewMode: ViewMode;
  simState: any;
  selectedSensorId: string | null;
  setSelectedSensor: (id: string | null) => void;
  setInspectedPart: (part: any) => void;
  heatParticlesEnabled: boolean;
  show3DLabels: boolean;
}) {
  const explodedFactor = useRef<number>(0);
  const heaterGroupRef = useRef<THREE.Group>(null);
  const shellGroupRef = useRef<THREE.Group>(null);
  const coolerGroupRef = useRef<THREE.Group>(null);
  const metersGroupRef = useRef<THREE.Group>(null);
  const guideLinesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const target = viewMode === 'exploded' ? 1.0 : 0.0;
    explodedFactor.current = THREE.MathUtils.lerp(explodedFactor.current, target, delta * 4.5);
    const f = explodedFactor.current;

    // Controlled sub-assembly translations along coordinate axes
    if (heaterGroupRef.current) {
      heaterGroupRef.current.position.set(-2.3 - 1.35 * f, 0, 0);
    }
    if (shellGroupRef.current) {
      shellGroupRef.current.position.set(-0.2, 1.35 * f, 0.45 * f);
    }
    if (coolerGroupRef.current) {
      coolerGroupRef.current.position.set(1.8 + 1.35 * f, 0, 0);
    }
    if (metersGroupRef.current) {
      metersGroupRef.current.position.set(-2.3 - 0.65 * f, 1.4 + 0.95 * f, 0);
    }
    if (guideLinesRef.current) {
      guideLinesRef.current.visible = f > 0.05;
    }
  });

  const isCutaway = viewMode === 'cutaway';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Alignment Axes / Guide Lines in Exploded View */}
      <group ref={guideLinesRef} visible={false}>
        {/* Left assembly axis connecting Heater to Rod */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([-3.8, 0, 0, 0, 0, 0, 0, 0, 0, 3.4, 0, 0]), 3]}
            />
          </bufferGeometry>
          <lineDashedMaterial
            color="#39FF14"
            dashSize={0.12}
            gapSize={0.06}
            transparent
            opacity={0.7}
          />
        </lineSegments>
      </group>

      {/* 2. Anchor Specimen Rod (Centered at origin) */}
      <group 
        onClick={(e) => { e.stopPropagation(); setInspectedPart('ROD'); }}
        onDoubleClick={(e) => { e.stopPropagation(); setInspectedPart('ROD'); }}
      >
        <MetallicRod3D
          materialProps={simState.material}
          simState={simState}
          viewMode={viewMode}
        />
      </group>

      {/* 3. Electrical Heater Section (Slides left along -X in exploded view) */}
      <group
        ref={heaterGroupRef}
        position={[-2.3, 0, 0]}
        onClick={(e) => { e.stopPropagation(); setInspectedPart('HEATER'); }}
        onDoubleClick={(e) => { e.stopPropagation(); setInspectedPart('HEATER'); }}
      >
        <Heater3D
          powerWatts={simState.power}
          voltage={simState.voltage}
          position={[0, 0, 0]}
        />
        {viewMode === 'exploded' && (
          <Text
            position={[0, 0.75, 0]}
            fontSize={0.09}
            color="#fbbf24"
            anchorX="center"
          >
            HEATER ASSEMBLY
          </Text>
        )}
      </group>

      {/* 4. Insulation Shell (Slides up +Y and forward +Z in exploded view) */}
      <group ref={shellGroupRef} position={[-0.2, 0, 0]}>
        <InsulationShell3D viewMode={viewMode} />
        {viewMode === 'exploded' && (
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.09}
            color="#cbd5e1"
            anchorX="center"
          >
            CERAMIC INSULATION CASING
          </Text>
        )}
      </group>

      {/* 5. Cooling Water Jacket & Rotameter (Slides right along +X in exploded view) */}
      <group
        ref={coolerGroupRef}
        position={[1.8, 0, 0]}
        onClick={(e) => { e.stopPropagation(); setInspectedPart('COOLING_JACKET'); }}
        onDoubleClick={(e) => { e.stopPropagation(); setInspectedPart('COOLING_JACKET'); }}
      >
        <CoolingJacket3D
          flowRateLmin={simState.waterFlowLmin}
          t8={simState.sensors.t8}
          t9={simState.sensors.t9}
          position={[0, 0, 0]}
        />
        <Rotameter3D
          flowRateLmin={simState.waterFlowLmin}
          position={[0, -1.6, 0]}
        />
        {viewMode === 'exploded' && (
          <Text
            position={[0, 0.85, 0]}
            fontSize={0.09}
            color="#38bdf8"
            anchorX="center"
          >
            COOLING JACKET & HEAT SINK
          </Text>
        )}
      </group>

      {/* 6. Digital Instrumentation Meters (Slides up-left in exploded view) */}
      <group
        ref={metersGroupRef}
        position={[-2.3, 1.4, 0]}
        onClick={(e) => { e.stopPropagation(); setInspectedPart('METERS'); }}
        onDoubleClick={(e) => { e.stopPropagation(); setInspectedPart('METERS'); }}
      >
        <Meters3D
          voltage={simState.voltage}
          current={simState.current}
          power={simState.power}
          position={[0, 0, 0]}
        />
      </group>

      {/* 7. Thermocouple Probes T1–T9 */}
      <group 
        onClick={(e) => { e.stopPropagation(); setInspectedPart('THERMOCOUPLES'); }}
        onDoubleClick={(e) => { e.stopPropagation(); setInspectedPart('THERMOCOUPLES'); }}
      >
        <Sensors3D
          simState={simState}
          selectedSensorId={selectedSensorId}
          onSelectSensor={setSelectedSensor}
        />
      </group>

      {/* 8. Directional Heat Flow Particles (Active in heatflow mode or when enabled) */}
      <HeatFlowParticles3D visible={viewMode === 'heatflow' || heatParticlesEnabled} />

      {/* 9. Component Annotations in Normal Mode */}
      <ApparatusLabels3D visible={show3DLabels && viewMode === 'normal'} />
    </group>
  );
}

export const LabCanvas: React.FC = () => {
  const { 
    simState, 
    viewMode, 
    setViewMode,
    selectedSensorId, 
    setSelectedSensor,
    inspectedPart,
    setInspectedPart,
    heatParticlesEnabled,
    demoStatus,
    demoStepDescription,
    demoStepIndex,
    startAutomatedDemo,
    cancelAutomatedDemo,
    sensorRates,
    isExpandedView,
    toggleExpandedView
  } = usePhysicsStore();

  const [show3DLabels, setShow3DLabels] = useState<boolean>(true);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [cinematicStage, setCinematicStage] = useState<string>('APPARATUS OVERVIEW');

  // Contextual engineering descriptions for hover inspection
  const PART_CONTEXT: Record<string, { title: string; mat: string; k: string; desc: string }> = {
    HEATER: {
      title: 'Electrical Joule Heater',
      mat: 'Nichrome Wire (15.0 Ω)',
      k: 'P = V × I',
      desc: `Provides constant heat flux Q_in = ${simState.power.toFixed(1)} W at rod boundary x = 0.`
    },
    COOLING_JACKET: {
      title: 'Water Cooling Jacket (Heat Sink)',
      mat: 'Borosilicate Glass & Copper Sleeve',
      k: `Flow: ${simState.waterFlowLmin.toFixed(2)} L/min`,
      desc: `Forced convection heat sink at x = L. Removes Q_out = ${simState.heatRemovedByWater.toFixed(1)} W.`
    },
    ROD: {
      title: 'Metallic Conduction Specimen',
      mat: `${simState.material.name} (${simState.material.chemicalSymbol})`,
      k: `k = ${simState.material.thermalConductivity} W/m·K`,
      desc: `1D Fourier heat conduction: Q = -kA(dT/dx). Diameter: 25 mm, Length: 500 mm.`
    },
    THERMOCOUPLES: {
      title: 'Thermocouple Array (T1–T9)',
      mat: 'Type-K Chromel/Alumel',
      k: '9 Telemetry Channels',
      desc: `Measures temperature distribution at 5 cm axial intervals. Max rate: ${(simState.rateOfChangeMax || 0).toFixed(3)} °C/s.`
    },
    METERS: {
      title: 'Dimmer-Stat Instrumentation',
      mat: 'Digital Multimeter & Variac',
      k: `${simState.voltage.toFixed(1)} V | ${simState.current.toFixed(2)} A`,
      desc: `Measures heater electrical voltage, current, and total input power P.`
    },
  };

  const selectedSensor = selectedSensorId ? SENSORS.find((s) => s.id === selectedSensorId) : null;
  const selectedSensorTemp = selectedSensorId 
    ? (simState.sensors[selectedSensorId.toLowerCase() as keyof typeof simState.sensors] || 20.0) 
    : null;
  const selectedSensorRate = selectedSensorId
    ? (sensorRates ? sensorRates[selectedSensorId.toLowerCase() as keyof typeof sensorRates] || 0.0 : 0.0)
    : 0.0;

  // Format elapsed time (MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dynamic temperature range for Thermal Legend
  const temps = simState.temperatures || [];
  const maxTemp = temps.length > 0 ? Math.max(70.0, Math.max(...temps)) : 70.0;
  const minTemp = temps.length > 0 ? Math.min(20.0, Math.min(...temps)) : 20.0;
  const isSteady = simState.steadyStateStatus === 'STEADY_STATE';
  const isCoolingLow = simState.waterFlowLmin < 0.25 && simState.power > 0.5;

  return (
    <div 
      className="w-full h-full relative bg-[#0D0F0E] overflow-hidden select-none"
      onClick={() => {
        // Clicking empty space deselects sensor and returns to overview
        setSelectedSensor(null);
        setInspectedPart(null);
      }}
    >
      {/* ============================================================== */}
      {/* 1. TOP DIGITAL TWIN COMPACT CONTROL BAR                        */}
      {/* ============================================================== */}
      <div 
        className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* UNIFIED 3D CONTROLS (Single row/wrap bar, no redundant FOCUS section) */}
        <div className="flex items-center gap-1 p-1 bg-[#141715]/95 border border-[#252825] rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto overflow-x-auto max-w-full font-mono scrollbar-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold text-[#7C827C] border-r border-[#252825] hidden sm:flex">
            <Scan className="w-3 h-3 text-[#39FF14]" />
            <span>MODE</span>
          </div>

          {([
            { id: 'normal',   label: 'NORMAL',   icon: Eye },
            { id: 'thermal',  label: 'THERMAL',  icon: Layers },
            { id: 'heatflow', label: 'HEAT FLOW',icon: Activity },
            { id: 'sensor',   label: 'SENSORS',  icon: Thermometer },
            { id: 'cooling',  label: 'COOLER',   icon: Droplets },
            { id: 'heater',   label: 'HEATER',   icon: Flame },
            { id: 'cutaway',  label: 'X-RAY',    icon: Compass },
            { id: 'exploded', label: 'EXPLODED', icon: Maximize2 },
            { id: 'cinematic',label: 'CINEMATIC',icon: Sparkles },
          ] as const).map(({ id, label, icon: Icon }) => {
            const isActive = viewMode === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setViewMode(id);
                  if (id === 'heater') setInspectedPart('HEATER');
                  else if (id === 'cooling') setInspectedPart('COOLING_JACKET');
                  else if (id === 'sensor') setInspectedPart('THERMOCOUPLES');
                  else if (id === 'normal' || id === 'exploded' || id === 'cinematic') setInspectedPart(null);
                }}
                className={`px-1.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold tracking-tight transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm shadow-sm'
                    : 'text-[#8A928A] hover:text-[#F5F5F5] hover:bg-[#1C201D]'
                }`}
                title={`Switch to ${label} view`}
              >
                <Icon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isActive ? 'text-[#39FF14]' : 'text-[#656C65]'}`} />
                {label}
              </button>
            );
          })}

          {/* DEMO MODE Trigger Pill */}
          <button
            onClick={() => {
              if (demoStatus === 'RUNNING') {
                cancelAutomatedDemo();
              } else {
                startAutomatedDemo();
              }
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-extrabold tracking-wide transition-all flex items-center gap-1 cursor-pointer border whitespace-nowrap ${
              demoStatus === 'RUNNING'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-[#102713] to-[#1e3a1f] text-[#39FF14] border-[#163D19] hover:border-[#39FF14] glow-green-sm'
            }`}
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            {demoStatus === 'RUNNING' ? 'STOP DEMO' : 'DEMO MODE'}
          </button>

          {/* Subtle Divider */}
          <div className="h-3.5 w-px bg-[#282B28] mx-0.5" />

          {/* Integrated Focus Targets (Compact, no redundant second row) */}
          {([
            { id: null,               label: 'Overview', icon: Eye },
            { id: 'HEATER',           label: 'Heater',   icon: Flame },
            { id: 'COOLING_JACKET',   label: 'Cooler',   icon: Droplets },
            { id: 'ROD',              label: 'Rod',      icon: Layers },
            { id: 'THERMOCOUPLES',    label: 'Sensors',  icon: Thermometer },
            { id: 'METERS',           label: 'Meters',   icon: Gauge },
          ] as const).map(({ id, label, icon: Icon }) => {
            const isInspected = inspectedPart === id;
            return (
              <button
                key={label}
                onClick={() => {
                  setSelectedSensor(null);
                  setInspectedPart(id as any);
                }}
                onMouseEnter={() => id && setHoveredPart(id)}
                onMouseLeave={() => setHoveredPart(null)}
                className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isInspected
                    ? 'bg-[#102713] text-[#39FF14] border border-[#163D19]'
                    : 'text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#1C201D]'
                }`}
                title={`Focus camera on ${label}`}
              >
                <Icon className="w-2.5 h-2.5" />
                <span className="hidden md:inline">{label}</span>
              </button>
            );
          })}

          {/* Labels Toggle */}
          <button
            onClick={() => setShow3DLabels(!show3DLabels)}
            className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold border transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              show3DLabels
                ? 'bg-[#102713] text-[#39FF14] border-[#163D19]'
                : 'text-[#656C65] border-[#252825] hover:text-[#F5F5F5]'
            }`}
            title="Toggle 3D Component Labels"
          >
            <Tag className="w-2.5 h-2.5" />
            <span className="hidden lg:inline">{show3DLabels ? 'Labels: ON' : 'Labels: OFF'}</span>
          </button>
        </div>

        {/* RIGHT: EXPAND VIEW PRESENTATION BUTTON */}
        <div className="flex items-center gap-1 p-1 bg-[#141715]/95 border border-[#252825] rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto font-mono shrink-0">
          <button
            onClick={toggleExpandedView}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isExpandedView
                ? 'bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm'
                : 'bg-[#1C201D] text-[#E8ECE8] border border-[#282C29] hover:border-[#39FF14]/50 hover:text-[#39FF14]'
            }`}
            title={isExpandedView ? 'Exit Expanded View (Press F or ESC)' : 'Expand 3D Viewport (Press F)'}
          >
            {isExpandedView ? (
              <>
                <Minimize2 className="w-3 h-3 text-[#39FF14]" />
                <span className="font-extrabold tracking-wider">⛶ EXIT EXPANDED</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3 text-[#39FF14]" />
                <span className="font-extrabold tracking-wider">⛶ EXPAND VIEW</span>
              </>
            )}
            <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 bg-[#111312] rounded border border-[#303330] text-[#7C827C]">
              F
            </kbd>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FLOATING DIGITAL TWIN TELEMETRY HUD (Top-Left Corner)        */}
      {/* ============================================================== */}
      <div 
        className="absolute top-14 left-2.5 z-10 bg-[#111312]/92 border border-[#252825] rounded-xl p-2.5 shadow-2xl backdrop-blur-md font-mono text-[10px] text-[#A2A8A2] w-56 sm:w-60 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#202321] pb-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse glow-green-sm" />
            <span className="font-extrabold text-[#F5F5F5] tracking-wider text-[10px]">DIGITAL TWIN HUD</span>
          </div>
          {isSteady ? (
            <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-[#102713] text-[#39FF14] border border-[#163D19] glow-green-sm">
              ✓ STEADY
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[8px] font-semibold bg-[#1C201D] text-[#8A928A]">
              TRANSIENT
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-[9.5px]">
          <div className="flex justify-between">
            <span className="text-[#656C65]">MATERIAL:</span>
            <span className="font-bold text-[#F5F5F5] uppercase">
              {simState.material.name} ({simState.material.chemicalSymbol})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#656C65]">SOLVER:</span>
            <span className="font-bold text-[#38BDF8]">50 NODE 1D FDTD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#656C65]">SIM TIME:</span>
            <span className="font-bold text-[#F5F5F5]">{formatTime(simState.timeSeconds)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#656C65]">HEAT INPUT (Qin):</span>
            <span className="font-bold text-[#FF6B35]">{simState.heatInput.toFixed(2)} W</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#656C65]">HEAT REMOVED:</span>
            <span className="font-bold text-[#38BDF8]">{simState.heatRemovedByWater.toFixed(2)} W</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-[#202321]">
            <span className="text-[#656C65]">GRADIENT (dT/dx):</span>
            <span className="font-bold text-[#F59E0B]">
              {simState.tempGradient ? `${simState.tempGradient.toFixed(1)} °C/m` : 'Measuring...'}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODE 2: THERMAL MODE DYNAMIC LEGEND (Bottom-Center)          */}
      {/* ============================================================== */}
      {viewMode === 'thermal' && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#111312]/95 border border-[#252825] rounded-2xl p-3 shadow-2xl backdrop-blur-md font-mono text-[11px] flex flex-col items-center gap-2 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between w-full min-w-[280px] sm:min-w-[340px] text-[10px] text-[#A2A8A2]">
            <span className="font-bold text-[#2563EB] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              {minTemp.toFixed(1)}°C COLD
            </span>
            <span className="text-[#656C65] font-semibold">CONTINUOUS FDTD GRADIENT</span>
            <span className="font-bold text-[#EF4444] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              {maxTemp.toFixed(1)}°C HOT
            </span>
          </div>

          {/* Continuous multi-stop CSS gradient strictly matching the 3D rod */}
          <div className="w-full h-3 rounded-full shadow-inner bg-gradient-to-r from-[#2563EB] via-[#38BDF8] via-[#F59E0B] via-[#FF6B35] to-[#EF4444] border border-[#252825]" />

          <div className="flex items-center justify-between w-full text-[10px] text-[#656C65] px-1">
            <span>T1 Hot End: <strong className="text-[#FF6B35]">{simState.sensors.t1.toFixed(1)}°C</strong></span>
            <span>T7 Cold End: <strong className="text-[#38BDF8]">{simState.sensors.t7.toFixed(1)}°C</strong></span>
            <span>ΔT: <strong className="text-[#F5F5F5]">{(simState.sensors.t1 - simState.sensors.t7).toFixed(1)}°C</strong></span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODE 3: HEAT FLOW TELEMETRY OVERLAY                         */}
      {/* ============================================================== */}
      {viewMode === 'heatflow' && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#111312]/95 border border-[#FF6B35]/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md font-mono text-[11px] flex flex-col gap-1.5 min-w-[320px] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#252825] pb-1.5 text-xs">
            <span className="font-extrabold text-[#FF6B35] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#FF6B35] animate-pulse" />
              HEAT FLOW (CONDUCTION)
            </span>
            <span className="text-[#39FF14] font-bold">ACTIVE FLUX</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[#656C65]">RATE (Q):</span>
            <span className="font-extrabold text-[#F5F5F5]">{simState.heatInput.toFixed(2)} W</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[#656C65]">DIRECTION:</span>
            <span className="font-bold text-[#38BDF8] flex items-center gap-1">
              HEATER <ArrowRight className="w-3 h-3" /> COOLING
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-[#A2A8A2] pt-1 border-t border-[#252825]">
            <span>FOURIER LAW:</span>
            <span className="font-semibold text-[#F59E0B]">Q = -k · A · (dT/dx)</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODE 5: COOLING SYSTEM TELEMETRY OVERLAY                     */}
      {/* ============================================================== */}
      {viewMode === 'cooling' && (
        <div 
          className={`absolute bottom-4 z-20 bg-[#111312]/95 border border-[#38BDF8]/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md font-mono text-[11px] flex flex-col gap-1.5 min-w-[320px] pointer-events-auto transition-all ${
            inspectedPart ? 'right-4' : 'left-1/2 -translate-x-1/2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#252825] pb-1.5 text-xs">
            <span className="font-extrabold text-[#38BDF8] flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#38BDF8]" />
              COOLING SYSTEM TELEMETRY
            </span>
            {isCoolingLow ? (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-950/80 text-red-400 border border-red-700 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> ⚠ COOLING FLOW LOW
              </span>
            ) : (
              <span className="text-[#39FF14] font-bold">NORMAL FLOW</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div>
              <span className="text-[#656C65] block">FLOW RATE:</span>
              <span className="font-bold text-[#F5F5F5]">{simState.waterFlowLmin.toFixed(2)} L/min</span>
            </div>
            <div>
              <span className="text-[#656C65] block">HEAT REMOVED:</span>
              <span className="font-bold text-[#38BDF8]">{simState.heatRemovedByWater.toFixed(2)} W</span>
            </div>
            <div>
              <span className="text-[#656C65] block">INLET (T8):</span>
              <span className="font-bold text-[#2563EB]">{simState.sensors.t8.toFixed(1)} °C</span>
            </div>
            <div>
              <span className="text-[#656C65] block">OUTLET (T9):</span>
              <span className="font-bold text-[#38BDF8]">{simState.sensors.t9.toFixed(1)} °C</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODE 6: HEATER POWER TELEMETRY OVERLAY                       */}
      {/* ============================================================== */}
      {viewMode === 'heater' && (
        <div 
          className={`absolute bottom-4 z-20 bg-[#111312]/95 border border-[#FF6B35]/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md font-mono text-[11px] flex flex-col gap-1.5 min-w-[300px] pointer-events-auto transition-all ${
            inspectedPart ? 'right-4' : 'left-1/2 -translate-x-1/2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#252825] pb-1.5 text-xs">
            <span className="font-extrabold text-[#FF6B35] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#FF6B35]" />
              HEATER POWER TELEMETRY
            </span>
            <span className="text-[#39FF14] font-bold">JOULE SOURCE</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
            <div>
              <span className="text-[#656C65] block">VOLTAGE:</span>
              <span className="font-bold text-[#F59E0B]">{simState.voltage.toFixed(1)} V</span>
            </div>
            <div>
              <span className="text-[#656C65] block">CURRENT:</span>
              <span className="font-bold text-[#F5F5F5]">{simState.current.toFixed(2)} A</span>
            </div>
            <div>
              <span className="text-[#656C65] block">POWER:</span>
              <span className="font-bold text-[#39FF14]">{simState.power.toFixed(2)} W</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODE 8: EXPLODED VIEW OVERLAY & RESET ASSEMBLY               */}
      {/* ============================================================== */}
      {viewMode === 'exploded' && (
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#111312]/95 border border-[#39FF14]/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md font-mono text-[11px] flex items-center justify-between gap-4 pointer-events-auto min-w-[340px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="font-bold text-[#F5F5F5] flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-[#39FF14]" />
              EXPLODED MECHANICAL ASSEMBLY
            </div>
            <div className="text-[10px] text-[#656C65]">Components separated along primary coordinate axes</div>
          </div>
          <button
            onClick={() => setViewMode('normal')}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-[#102713] text-[#39FF14] border border-[#163D19] hover:border-[#39FF14] glow-green-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET ASSEMBLY
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODE 9: CINEMATIC TOUR BANNER                               */}
      {/* ============================================================== */}
      {viewMode === 'cinematic' && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#111312]/95 border border-[#39FF14]/50 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md font-mono flex items-center justify-between gap-6 pointer-events-auto min-w-[380px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <div className="text-[10px] font-bold text-[#39FF14] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              CINEMATIC TOUR
            </div>
            <div className="text-sm font-extrabold text-[#F5F5F5] tracking-tight">{cinematicStage}</div>
          </div>
          <button
            onClick={() => setViewMode('normal')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1C201D] text-[#A2A8A2] hover:text-[#F5F5F5] border border-[#252825] hover:border-[#39FF14] transition-all cursor-pointer"
          >
            EXIT CINEMATIC
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. HACKATHON DEMO MODE PROGRESS BANNER                         */}
      {/* ============================================================== */}
      {demoStatus === 'RUNNING' && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#111312]/95 border border-[#39FF14] rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md font-mono flex items-center justify-between gap-6 pointer-events-auto min-w-[420px] max-w-[90vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold text-[#39FF14] tracking-wider flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-current" />
                HACKATHON DEMO: PHASE {demoStepIndex}/8
              </span>
              <span className="text-[9px] text-[#656C65]">REAL SIMULATION</span>
            </div>
            <div className="text-xs font-bold text-[#F5F5F5] line-clamp-1">{demoStepDescription}</div>
            {/* Progress bar */}
            <div className="w-full bg-[#1C201D] h-1.5 rounded-full mt-2 overflow-hidden border border-[#252825]">
              <div 
                className="bg-[#39FF14] h-full transition-all duration-300 glow-green-sm" 
                style={{ width: `${(demoStepIndex / 8) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => cancelAutomatedDemo()}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1C201D] text-amber-400 border border-[#252825] hover:border-amber-400 transition-all cursor-pointer whitespace-nowrap"
          >
            CANCEL DEMO
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 10. HOVER CONTEXT TOOLTIP                                       */}
      {/* ============================================================== */}
      {hoveredPart && PART_CONTEXT[hoveredPart] && (
        <div className="absolute top-16 right-3 z-20 max-w-[280px] bg-[#111312]/95 border border-[#252825] rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in duration-150 font-mono">
          <div className="text-xs font-extrabold text-[#39FF14] mb-1">{PART_CONTEXT[hoveredPart].title}</div>
          <div className="text-[10px] text-[#A2A8A2] mb-1">
            <span className="text-[#656C65]">SPEC:</span> {PART_CONTEXT[hoveredPart].mat}
          </div>
          <div className="text-[10px] text-[#38BDF8] mb-1.5">
            <span className="text-[#656C65]">METRIC:</span> {PART_CONTEXT[hoveredPart].k}
          </div>
          <div className="text-[10px] text-[#8A928A] leading-relaxed border-t border-[#202321] pt-1.5">
            {PART_CONTEXT[hoveredPart].desc}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. SENSOR DETAIL INSPECTION CARD (T1–T9 Clicked)               */}
      {/* ============================================================== */}
      {selectedSensor && selectedSensorTemp !== null && (
        <div 
          className="absolute bottom-4 right-4 z-20 bg-[#111312]/95 border border-[#39FF14]/60 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-[#F5F5F5] w-72 font-mono pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-[#202321] pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#39FF14]" />
              <span className="font-extrabold text-xs text-[#39FF14]">
                {selectedSensor.name} ({selectedSensor.id})
              </span>
            </div>
            <button
              onClick={() => setSelectedSensor(null)}
              className="p-1 hover:bg-[#1C201D] text-[#8A928A] hover:text-[#F5F5F5] rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#656C65]">POSITION (x):</span>
              <span className="font-bold text-[#F5F5F5]">
                {selectedSensor.type === 'rod' 
                  ? `${(selectedSensor.positionX * 100).toFixed(0)} cm (${selectedSensor.positionX.toFixed(2)} m)` 
                  : selectedSensor.type === 'water_in' ? 'Water Inlet' : 'Water Outlet'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#656C65]">RATE (dT/dt):</span>
              <span className={`font-bold ${Math.abs(selectedSensorRate) < 0.008 ? 'text-[#39FF14]' : selectedSensorRate > 0 ? 'text-[#FF6B35]' : 'text-[#38BDF8]'}`}>
                {selectedSensorRate >= 0 ? '+' : ''}{selectedSensorRate.toFixed(3)} °C/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#656C65]">STATUS:</span>
              <span className="font-bold text-[#39FF14]">
                {Math.abs(selectedSensorRate) < 0.008 ? '● STABLE' : selectedSensorRate > 0 ? '▲ HEATING' : '▼ COOLING'}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-[#202321] text-xs">
              <span className="text-[#A2A8A2]">LIVE READING:</span>
              <span className="font-extrabold text-[#39FF14] text-sm">{selectedSensorTemp.toFixed(2)} °C</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating 3D Component Inspection HUD for Controls */}
      <Apparatus3DHUD />

      {/* ============================================================== */}
      {/* 12. THREE.JS / WEBGL MASTER CANVAS                              */}
      {/* ============================================================== */}
      <Canvas
        camera={{ position: [0, 1.8, 5.2], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <CanvasResizeHandler />
        <color attach="background" args={['#0D0F0E']} />
        
        {/* Physically grounded lighting setup */}
        <ambientLight intensity={viewMode === 'sensor' ? 0.35 : 0.65} />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.4} 
          castShadow 
          shadow-mapSize={[1024, 1024]} 
          shadow-camera-near={0.5}
          shadow-camera-far={25}
        />
        <pointLight position={[-3, 2, 2]} intensity={0.7} color="#ffaa55" />
        <pointLight position={[3, -2, 2]} intensity={0.5} color="#55aaff" />

        <Suspense fallback={null}>
          {/* Engineering Slate Table & Precision Coordinate Grid */}
          <LabBench3D />

          {/* Interactive 3D Apparatus Sub-Assemblies */}
          <ApparatusAssembly3D
            viewMode={viewMode}
            simState={simState}
            selectedSensorId={selectedSensorId}
            setSelectedSensor={setSelectedSensor}
            setInspectedPart={setInspectedPart}
            heatParticlesEnabled={heatParticlesEnabled}
            show3DLabels={show3DLabels}
          />

          {/* Soft Ground Contact Shadows */}
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.65}
            scale={12}
            blur={2.2}
            far={4.5}
          />
        </Suspense>

        {/* Dynamic Camera Controller */}
        <CameraController
          inspectedPart={inspectedPart}
          selectedSensorId={selectedSensorId}
          viewMode={viewMode}
          onCinematicFinish={() => setViewMode('normal')}
          onCinematicStageChange={setCinematicStage}
        />
      </Canvas>
    </div>
  );
};
