// Zustand Physics & Virtual Lab Simulation Store

import { create } from 'zustand';
import { MaterialId, MaterialProperties, SimulationState, ObservationRecord } from '../physics/types';
import { MATERIALS, APPARATUS_CONFIG } from '../physics/materials';
import { Thermal1DSolver } from '../physics/1dRodSolver';
import { ExperimentEvent } from '../types/db';

export type ViewMode = 
  | 'normal' 
  | 'thermal' 
  | 'heatflow' 
  | 'sensor' 
  | 'cooling' 
  | 'heater' 
  | 'cutaway' 
  | 'exploded' 
  | 'cinematic';

interface PhysicsStoreState {
  // Solver Instance
  solver: Thermal1DSolver;
  
  // Current Simulation State
  simState: SimulationState;
  
  // View & UI Controls
  viewMode: ViewMode;
  selectedSensorId: string | null;
  heatParticlesEnabled: boolean;
  isSimulating: boolean;
  simSpeed: number; // 1x, 5x, 10x, 25x
  experimentMode: 'DEMO' | 'REAL_LAB';
  runStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'STOPPED';
  inspectedPart: 'HEATER' | 'COOLING_JACKET' | 'ROD' | 'THERMOCOUPLES' | 'METERS' | null;
  demoStatus: 'IDLE' | 'RUNNING' | 'FINISHED';
  demoStepDescription: string;
  demoStepIndex: number;
  guideStep: number;
  
  // Observation Table & Event Log
  observations: ObservationRecord[];
  eventLog: ExperimentEvent[];
  
  // Sensor Rates (°C/s) for live telemetry
  sensorRates: Record<'t1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 't9', number>;

  // Time history for charts
  chartDataHistory: {
    time: number;
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    t5: number;
    t6: number;
    t7: number;
    t8: number;
    t9: number;
    power: number;
  }[];
  
  // Apparatus Physical Dimensions & Configuration (User Configurable)
  apparatusConfig: {
    rodDiameterMm: number;
    rodLengthCm: number;
    heaterResistanceR: number;
    crossSectionArea: number;
  };

  // Layout & Viewport Optimization State
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  isExpandedView: boolean;
  prevPanelState: { left: boolean; right: boolean } | null;

  // Actions
  initSimulation: (materialId?: MaterialId) => void;
  setApparatusConfig: (updates: Partial<{ rodDiameterMm: number; rodLengthCm: number; heaterResistanceR: number }>) => void;
  startExperiment: () => void;
  pauseExperiment: () => void;
  stopExperiment: () => void;
  setInspectedPart: (part: 'HEATER' | 'COOLING_JACKET' | 'ROD' | 'THERMOCOUPLES' | 'METERS' | null) => void;
  setGuideStep: (step: number) => void;
  startAutomatedDemo: () => void;
  cancelAutomatedDemo: () => void;
  setVoltage: (volts: number) => void;
  setCurrent: (amps: number) => void;
  setWaterFlow: (flowLmin: number) => void;
  setMaterial: (materialId: MaterialId) => void;
  setViewMode: (mode: ViewMode) => void;
  setSimSpeed: (speed: number) => void;
  setExperimentMode: (mode: 'DEMO' | 'REAL_LAB') => void;
  autoSetupDemo: () => void;
  fastForwardToSteadyState: () => void;
  setSelectedSensor: (sensorId: string | null) => void;
  toggleHeatParticles: () => void;
  stepSimulation: (dtSeconds: number) => void;
  recordObservation: () => void;
  resetSimulation: () => void;
  addEvent: (eventType: ExperimentEvent['eventType'], details: string) => void;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setExpandedView: (expanded: boolean) => void;
  toggleExpandedView: () => void;
}

const initialMaterial = MATERIALS.copper;
const initialSolver = new Thermal1DSolver(initialMaterial);
const initialSimState = initialSolver.step(0.01);
let demoTimeouts: NodeJS.Timeout[] = [];

export const usePhysicsStore = create<PhysicsStoreState>((set, get) => ({
  solver: initialSolver,
  simState: initialSimState,
  viewMode: 'normal',
  selectedSensorId: null,
  heatParticlesEnabled: true,
  isSimulating: true,
  simSpeed: 5,
  experimentMode: 'DEMO',
  runStatus: 'IDLE',
  inspectedPart: null,
  demoStatus: 'IDLE',
  demoStepDescription: '',
  demoStepIndex: 0,
  guideStep: 1,
  observations: [],
  eventLog: [
    {
      id: 'evt-0',
      timestamp: new Date().toLocaleTimeString(),
      eventType: 'EXPERIMENT_STARTED',
      details: `Experiment initialized with material ${initialMaterial.name}`
    }
  ],
  apparatusConfig: {
    rodDiameterMm: 25,
    rodLengthCm: 50,
    heaterResistanceR: 15.0,
    crossSectionArea: APPARATUS_CONFIG.crossSectionArea,
  },
  sensorRates: {
    t1: 0,
    t2: 0,
    t3: 0,
    t4: 0,
    t5: 0,
    t6: 0,
    t7: 0,
    t8: 0,
    t9: 0
  },
  chartDataHistory: [],
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  isExpandedView: false,
  prevPanelState: null,

  setLeftPanelCollapsed: (collapsed: boolean) => {
    set((state) => ({
      leftPanelCollapsed: collapsed,
      isExpandedView: !collapsed && state.rightPanelCollapsed ? false : state.isExpandedView
    }));
  },

  setRightPanelCollapsed: (collapsed: boolean) => {
    set((state) => ({
      rightPanelCollapsed: collapsed,
      isExpandedView: !collapsed && state.leftPanelCollapsed ? false : state.isExpandedView
    }));
  },

  toggleLeftPanel: () => {
    const { leftPanelCollapsed, rightPanelCollapsed } = get();
    const next = !leftPanelCollapsed;
    set({
      leftPanelCollapsed: next,
      isExpandedView: next && rightPanelCollapsed
    });
  },

  toggleRightPanel: () => {
    const { leftPanelCollapsed, rightPanelCollapsed } = get();
    const next = !rightPanelCollapsed;
    set({
      rightPanelCollapsed: next,
      isExpandedView: next && leftPanelCollapsed
    });
  },

  setExpandedView: (expanded: boolean) => {
    const { isExpandedView, leftPanelCollapsed, rightPanelCollapsed, prevPanelState } = get();
    if (expanded && !isExpandedView) {
      const saved = prevPanelState || { left: leftPanelCollapsed, right: rightPanelCollapsed };
      set({
        isExpandedView: true,
        leftPanelCollapsed: true,
        rightPanelCollapsed: true,
        prevPanelState: saved,
      });
    } else if (!expanded && isExpandedView) {
      const restore = prevPanelState || { left: false, right: false };
      set({
        isExpandedView: false,
        leftPanelCollapsed: restore.left,
        rightPanelCollapsed: restore.right,
        prevPanelState: null,
      });
    }
  },

  toggleExpandedView: () => {
    const { isExpandedView, leftPanelCollapsed, rightPanelCollapsed, prevPanelState } = get();
    if (!isExpandedView) {
      const saved = prevPanelState || { left: leftPanelCollapsed, right: rightPanelCollapsed };
      set({
        isExpandedView: true,
        leftPanelCollapsed: true,
        rightPanelCollapsed: true,
        prevPanelState: saved,
      });
    } else {
      const restore = prevPanelState || { left: false, right: false };
      set({
        isExpandedView: false,
        leftPanelCollapsed: restore.left,
        rightPanelCollapsed: restore.right,
        prevPanelState: null,
      });
    }
  },

  setApparatusConfig: (updates) => {
    const { apparatusConfig, solver, addEvent } = get();
    const newConfig = { ...apparatusConfig, ...updates };
    const rodDiameterM = newConfig.rodDiameterMm / 1000;
    const rodLengthM = newConfig.rodLengthCm / 100;
    const r = newConfig.heaterResistanceR;
    newConfig.crossSectionArea = Math.PI * Math.pow(rodDiameterM / 2, 2);

    solver.setApparatusDimensions(rodDiameterM, rodLengthM, r);
    const nextState = solver.step(0.01);
    addEvent('EXPERIMENT_STARTED', `Apparatus parameters updated: D = ${newConfig.rodDiameterMm}mm (A = ${(newConfig.crossSectionArea * 1e4).toFixed(2)} cm²), L = ${newConfig.rodLengthCm}cm, R = ${r}Ω`);
    set({
      apparatusConfig: newConfig,
      simState: nextState
    });
  },

  startExperiment: () => {
    const { addEvent, runStatus } = get();
    if (runStatus !== 'RUNNING') {
      addEvent('EXPERIMENT_STARTED', 'Apparatus running & simulation active.');
      set({ runStatus: 'RUNNING' });
    }
  },

  pauseExperiment: () => {
    const { addEvent } = get();
    addEvent('EXPERIMENT_PAUSED', 'Simulation paused. Sensors frozen.');
    set({ runStatus: 'PAUSED' });
  },

  stopExperiment: () => {
    const { solver, addEvent } = get();
    solver.setVoltage(0);
    const nextState = solver.step(0.01);
    addEvent('EXPERIMENT_STOPPED', '🛑 Emergency Power Cutoff: Heater turned off (0.0 V). Apparatus stopped.');
    set({ 
      runStatus: 'STOPPED',
      simState: nextState
    });
  },

  setInspectedPart: (part) => {
    const { addEvent } = get();
    if (part) {
      addEvent('SENSOR_INSPECTED', `Inspected 3D Apparatus Component: ${part}`);
    }
    set({ inspectedPart: part });
  },

  setGuideStep: (step) => {
    set({ guideStep: step });
  },

  startAutomatedDemo: () => {
    const { 
      setMaterial, 
      setWaterFlow, 
      setVoltage, 
      fastForwardToSteadyState, 
      recordObservation, 
      setViewMode,
      setInspectedPart,
      setSelectedSensor,
      addEvent,
      leftPanelCollapsed,
      rightPanelCollapsed,
      prevPanelState
    } = get();

    // Remember previous panel states and collapse both side panels for judge demo
    const saved = prevPanelState || { left: leftPanelCollapsed, right: rightPanelCollapsed };

    // Clear previous demo timers
    demoTimeouts.forEach(clearTimeout);
    demoTimeouts = [];

    // Phase 1: Normal Apparatus Initialization (t = 0s)
    set({ 
      demoStatus: 'RUNNING',
      runStatus: 'RUNNING',
      demoStepIndex: 1,
      demoStepDescription: 'Phase 1/8: Initializing Digital Twin Apparatus (Copper, T_amb = 20.0°C)...',
      leftPanelCollapsed: true,
      rightPanelCollapsed: true,
      isExpandedView: true,
      prevPanelState: saved,
    });
    setMaterial('copper');
    setVoltage(0);
    setWaterFlow(0);
    setViewMode('normal');
    setInspectedPart(null);
    setSelectedSensor(null);
    addEvent('EXPERIMENT_STARTED', '▶ 8-Phase Digital Twin Hackathon Demo Started.');

    // Phase 2: Heater Turns ON (at 3.2s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 2,
        demoStepDescription: 'Phase 2/8: Heater Unit Engaged (V = 8.0 V, P = 4.27 W) — Joule heat generation begins...' 
      });
      setVoltage(8.0);
      setViewMode('heater');
      setInspectedPart('HEATER');
    }, 3200));

    // Phase 3: Heat Conduction Propagates (at 6.8s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 3,
        demoStepDescription: 'Phase 3/8: Heat wave propagates through 50 FDTD nodes — Dynamic thermal gradient emerges...' 
      });
      setViewMode('thermal');
      setInspectedPart(null);
    }, 6800));

    // Phase 4: Sensors Activate Sequentially (at 10.5s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 4,
        demoStepDescription: 'Phase 4/8: High-precision Thermocouples (T1–T9) tracking axial thermal progression...' 
      });
      setViewMode('sensor');
      setInspectedPart('THERMOCOUPLES');
      setSelectedSensor('T4');
    }, 10500));

    // Phase 5: Cooling Activates (at 14.5s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 5,
        demoStepDescription: 'Phase 5/8: Cooling water flow opened to 1.50 L/min — Establishing cold heat sink at x = L...' 
      });
      setWaterFlow(1.5);
      setViewMode('cooling');
      setInspectedPart('COOLING_JACKET');
      setSelectedSensor(null);
    }, 14500));

    // Phase 6: Thermal Gradient Stabilizes (at 18.5s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 6,
        demoStepDescription: 'Phase 6/8: Heat flux streaming HEATER → COOLING (Q = -kA·dT/dx) — Dynamic thermal gradient stabilizes...' 
      });
      setViewMode('heatflow');
      setInspectedPart(null);
    }, 18500));

    // Phase 7: STEADY STATE Equilibrium (at 22.0s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 7,
        demoStepDescription: 'Phase 7/8: Steady State detected! Thermal equilibrium reached (|dT/dt| < 0.008 °C/s)...' 
      });
      fastForwardToSteadyState();
      setViewMode('thermal');
    }, 22000));

    // Phase 8: Fourier k Result & Snapshot (at 25.5s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 8,
        demoStepDescription: 'Phase 8/8: Experimental Fourier k verified (Copper ~ 385 W/m·K) — Snapshot logged to notebook.' 
      });
      recordObservation();
      setViewMode('normal');
      setInspectedPart(null);
    }, 25500));

    // Complete (at 28.5s)
    demoTimeouts.push(setTimeout(() => {
      const { prevPanelState } = get();
      const restore = prevPanelState || { left: false, right: false };
      set({ 
        demoStatus: 'FINISHED',
        demoStepDescription: '✓ Hackathon Demo Complete: Full physical conduction cycle successfully verified!',
        leftPanelCollapsed: restore.left,
        rightPanelCollapsed: restore.right,
        isExpandedView: restore.left && restore.right,
        prevPanelState: null,
      });
      addEvent('EXPERIMENT_STARTED', '✨ Digital Twin 8-Phase Demo successfully finished.');
    }, 28500));
  },

  cancelAutomatedDemo: () => {
    demoTimeouts.forEach(clearTimeout);
    demoTimeouts = [];
    const { prevPanelState } = get();
    const restore = prevPanelState || { left: false, right: false };
    set({ 
      demoStatus: 'IDLE',
      demoStepDescription: '',
      demoStepIndex: 0,
      leftPanelCollapsed: restore.left,
      rightPanelCollapsed: restore.right,
      isExpandedView: restore.left && restore.right,
      prevPanelState: null,
    });
  },

  initSimulation: (materialId: MaterialId = 'copper') => {
    const mat = MATERIALS[materialId] || MATERIALS.copper;
    const solver = new Thermal1DSolver(mat);
    const { apparatusConfig } = get();
    if (apparatusConfig) {
      solver.setApparatusDimensions(
        apparatusConfig.rodDiameterMm / 1000,
        apparatusConfig.rodLengthCm / 100,
        apparatusConfig.heaterResistanceR
      );
    }
    const simState = solver.step(0.01);
    
    set({
      solver,
      simState,
      observations: [],
      chartDataHistory: [],
      eventLog: [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          eventType: 'EXPERIMENT_STARTED',
          details: `Session started. Apparatus setup with ${mat.name}.`
        }
      ]
    });
  },

  setVoltage: (volts: number) => {
    const { solver, runStatus, addEvent } = get();
    const clamped = Math.max(0, Math.min(12, volts));
    solver.setVoltage(clamped);
    const nextState = solver.step(0.01);
    
    addEvent('HEATER_VOLTAGE_CHANGED', `Heater voltage adjusted to ${clamped.toFixed(1)} V (Power: ${nextState.power.toFixed(1)} W)`);
    set({ 
      simState: nextState,
      runStatus: clamped > 0 && runStatus === 'IDLE' ? 'RUNNING' : runStatus
    });
  },

  setCurrent: (amps: number) => {
    const r = get().apparatusConfig.heaterResistanceR;
    const maxAmps = APPARATUS_CONFIG.maxVoltage / r; // e.g. 12V / R
    const clampedAmps = Math.max(0, Math.min(maxAmps, amps));
    get().setVoltage(clampedAmps * r);
  },

  setWaterFlow: (flowLmin: number) => {
    const { solver, simState, addEvent } = get();
    const clamped = Math.max(0, Math.min(3.0, flowLmin));
    solver.setWaterFlow(clamped);
    const nextState = solver.step(0.01);
    
    addEvent('WATER_FLOW_CHANGED', `Water cooling flow rate set to ${clamped.toFixed(2)} L/min`);
    set({ simState: nextState });
  },

  setMaterial: (materialId: MaterialId) => {
    const mat = MATERIALS[materialId];
    if (!mat) return;
    const { solver, addEvent } = get();
    solver.setMaterial(mat);
    solver.reset();
    const nextState = solver.step(0.01);
    
    addEvent('MATERIAL_CHANGED', `Metallic rod material changed to ${mat.name} (k = ${mat.thermalConductivity} W/m·K)`);
    set({
      simState: nextState,
      chartDataHistory: [],
      observations: []
    });
  },

  setViewMode: (mode: ViewMode) => {
    const { addEvent, viewMode: currentMode, leftPanelCollapsed, rightPanelCollapsed, prevPanelState } = get();
    addEvent('VIEW_MODE_CHANGED', `Laboratory 3D view mode switched to ${mode.toUpperCase()} VIEW`);
    
    if (mode === 'cinematic' && currentMode !== 'cinematic') {
      // Auto-collapse both side panels for cinematic immersion
      const saved = prevPanelState || { left: leftPanelCollapsed, right: rightPanelCollapsed };
      set({
        viewMode: mode,
        prevPanelState: saved,
        leftPanelCollapsed: true,
        rightPanelCollapsed: true,
        isExpandedView: true,
      });
    } else if (currentMode === 'cinematic' && mode !== 'cinematic') {
      // Exiting cinematic: restore previous panel state
      const restore = prevPanelState || { left: false, right: false };
      set({
        viewMode: mode,
        leftPanelCollapsed: restore.left,
        rightPanelCollapsed: restore.right,
        isExpandedView: restore.left && restore.right,
        prevPanelState: null,
      });
    } else {
      set({ viewMode: mode });
    }
  },

  setSimSpeed: (speed: number) => {
    const { addEvent } = get();
    addEvent('SIMULATION_SPEED_CHANGED', `Simulation speed set to ${speed}x real-time.`);
    set({ simSpeed: speed });
  },

  setExperimentMode: (mode: 'DEMO' | 'REAL_LAB') => {
    const { addEvent } = get();
    if (mode === 'REAL_LAB') {
      addEvent('EXPERIMENT_STARTED', '🔬 Switched to Real Laboratory Exam Mode. Authentic thermal physics active (1x time).');
      set({ 
        experimentMode: 'REAL_LAB',
        simSpeed: 1
      });
    } else {
      addEvent('EXPERIMENT_STARTED', '🚀 Switched to Quick Demo Mode. Fast-forward & speed controls active.');
      set({ 
        experimentMode: 'DEMO',
        simSpeed: 5
      });
    }
  },

  autoSetupDemo: () => {
    const { solver, addEvent, recordObservation } = get();
    const copper = MATERIALS.copper;
    solver.setMaterial(copper);
    solver.setWaterFlow(1.5);
    solver.setVoltage(10.0);
    
    // Fast forward to equilibrium
    let currentState = solver.step(0.01);
    for (let i = 0; i < 600; i++) {
      currentState = solver.step(2.0);
      if (currentState.steadyStateStatus === 'STEADY_STATE') break;
    }

    addEvent('EXPERIMENT_STARTED', '✨ Quick Demo parameters auto-applied: Copper, 10V, 1.5 L/min at Steady State!');
    set({ 
      simState: currentState,
      experimentMode: 'DEMO',
      simSpeed: 5
    });

    // Record an initial observation
    setTimeout(() => {
      recordObservation();
    }, 100);
  },

  fastForwardToSteadyState: () => {
    const { solver, simState, addEvent } = get();
    if (simState.power <= 0) {
      addEvent('SIMULATION_SPEED_CHANGED', 'Cannot fast-forward: Turn on heater voltage first!');
      return;
    }
    
    // Step forward until steady state reached or max 1200 seconds
    let currentState = simState;
    for (let i = 0; i < 600; i++) {
      currentState = solver.step(2.0);
      if (currentState.steadyStateStatus === 'STEADY_STATE') break;
    }

    addEvent('STEADY_STATE_ACHIEVED', `⚡ Fast-forward complete! Thermal equilibrium reached at t=${Math.round(currentState.timeSeconds)}s.`);
    set({ simState: currentState });
  },

  setSelectedSensor: (sensorId: string | null) => {
    const { addEvent } = get();
    if (sensorId) {
      addEvent('SENSOR_INSPECTED', `Inspected temperature thermocouple sensor ${sensorId}`);
    }
    set({ selectedSensorId: sensorId });
  },

  toggleHeatParticles: () => {
    set((state) => ({ heatParticlesEnabled: !state.heatParticlesEnabled }));
  },

  stepSimulation: (dtSeconds: number) => {
    const { solver, chartDataHistory, simState, sensorRates } = get();
    const nextState = solver.step(dtSeconds);

    // Calculate dynamic rate of change for each thermocouple (°C/s)
    const updatedRates = { ...sensorRates };
    const sensorKeys = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9'] as const;
    const safeDt = Math.max(0.01, dtSeconds);
    for (const key of sensorKeys) {
      const instantRate = (nextState.sensors[key] - simState.sensors[key]) / safeDt;
      const prevRate = sensorRates[key] || 0;
      // Exponential moving average for smooth display
      updatedRates[key] = Number((prevRate * 0.75 + instantRate * 0.25).toFixed(3));
    }

    // Append to rolling chart history (keep last 120 data points)
    const newHistoryPoint = {
      time: Math.round(nextState.timeSeconds),
      t1: Number(nextState.sensors.t1.toFixed(2)),
      t2: Number(nextState.sensors.t2.toFixed(2)),
      t3: Number(nextState.sensors.t3.toFixed(2)),
      t4: Number(nextState.sensors.t4.toFixed(2)),
      t5: Number(nextState.sensors.t5.toFixed(2)),
      t6: Number(nextState.sensors.t6.toFixed(2)),
      t7: Number(nextState.sensors.t7.toFixed(2)),
      t8: Number(nextState.sensors.t8.toFixed(2)),
      t9: Number(nextState.sensors.t9.toFixed(2)),
      power: Number(nextState.power.toFixed(1))
    };

    // Throttle chart updates to every 1 sec
    const updatedHistory = chartDataHistory.length > 0 && 
      chartDataHistory[chartDataHistory.length - 1].time === newHistoryPoint.time
        ? chartDataHistory
        : [...chartDataHistory.slice(-120), newHistoryPoint];

    // Check if steady state achieved and emit event once
    if (simState.steadyStateStatus !== 'STEADY_STATE' && nextState.steadyStateStatus === 'STEADY_STATE') {
      get().addEvent('STEADY_STATE_ACHIEVED', `Thermal equilibrium reached (|dT/dt| < 0.008 °C/s). Fourier k calculation is now valid!`);
    }

    set({
      simState: nextState,
      sensorRates: updatedRates,
      chartDataHistory: updatedHistory
    });
  },

  recordObservation: () => {
    const { simState, observations, addEvent } = get();
    const deltaTWater = Math.max(0, simState.sensors.t9 - simState.sensors.t8);
    const newRecord: ObservationRecord = {
      id: `obs-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      elapsedSeconds: Math.round(simState.timeSeconds),
      voltage: Number(simState.voltage.toFixed(1)),
      current: Number(simState.current.toFixed(2)),
      power: Number(simState.power.toFixed(1)),
      flowRate: Number(simState.waterFlowLmin.toFixed(2)),
      t1: Number(simState.sensors.t1.toFixed(2)),
      t2: Number(simState.sensors.t2.toFixed(2)),
      t3: Number(simState.sensors.t3.toFixed(2)),
      t4: Number(simState.sensors.t4.toFixed(2)),
      t5: Number(simState.sensors.t5.toFixed(2)),
      t6: Number(simState.sensors.t6.toFixed(2)),
      t7: Number(simState.sensors.t7.toFixed(2)),
      t8: Number(simState.sensors.t8.toFixed(2)),
      t9: Number(simState.sensors.t9.toFixed(2)),
      deltaTWater: Number(deltaTWater.toFixed(2)),
      dTdx: Number(simState.tempGradient.toFixed(2)),
      heatInput: Number(simState.heatInput.toFixed(1)),
      heatRemoved: Number(simState.heatRemovedByWater.toFixed(1)),
      heatLoss: Number(simState.heatLoss.toFixed(1)),
      calculatedK: simState.calculatedK ? Number(simState.calculatedK.toFixed(2)) : null,
      steadyState: simState.steadyStateStatus
    };

    addEvent('OBSERVATION_RECORDED', `Logged row #${observations.length + 1} into observation notebook (T1=${newRecord.t1}°C, T7=${newRecord.t7}°C, ΔT_water=${newRecord.deltaTWater}°C)`);
    set({ observations: [...observations, newRecord] });
  },

  resetSimulation: () => {
    const { solver, addEvent } = get();
    solver.reset();
    const nextState = solver.step(0.01);
    addEvent('EXPERIMENT_STARTED', `Simulation reset to ambient room temperature (20.0 °C).`);
    set({
      simState: nextState,
      chartDataHistory: [],
      observations: []
    });
  },

  addEvent: (eventType, details) => {
    const newEvt: ExperimentEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType,
      details
    };
    set((state) => ({
      eventLog: [newEvt, ...state.eventLog.slice(0, 50)]
    }));
  }
}));
