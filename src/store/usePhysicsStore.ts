// Zustand Physics & Virtual Lab Simulation Store

import { create } from 'zustand';
import { MaterialId, MaterialProperties, SimulationState, ObservationRecord } from '../physics/types';
import { MATERIALS } from '../physics/materials';
import { Thermal1DSolver } from '../physics/1dRodSolver';
import { ExperimentEvent } from '../types/db';

export type ViewMode = 'normal' | 'thermal' | 'cutaway';

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
  
  // Actions
  initSimulation: (materialId?: MaterialId) => void;
  startExperiment: () => void;
  pauseExperiment: () => void;
  stopExperiment: () => void;
  setInspectedPart: (part: 'HEATER' | 'COOLING_JACKET' | 'ROD' | 'THERMOCOUPLES' | 'METERS' | null) => void;
  setGuideStep: (step: number) => void;
  startAutomatedDemo: () => void;
  cancelAutomatedDemo: () => void;
  setVoltage: (volts: number) => void;
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
  chartDataHistory: [],

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
      solver, 
      setMaterial, 
      setWaterFlow, 
      setVoltage, 
      fastForwardToSteadyState, 
      recordObservation, 
      setViewMode,
      addEvent 
    } = get();

    // Clear previous demo timers
    demoTimeouts.forEach(clearTimeout);
    demoTimeouts = [];

    set({ 
      demoStatus: 'RUNNING',
      runStatus: 'RUNNING',
      demoStepIndex: 1,
      demoStepDescription: 'Step 1/6: Selecting Copper specimen (k = 385 W/m·K)...'
    });
    setMaterial('copper');
    addEvent('EXPERIMENT_STARTED', '▶ Automated Instant Demo Started.');

    // Step 2: Turn on water cooling (at 1.5s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 2,
        demoStepDescription: 'Step 2/6: Opening Cooling Water valve to 1.50 L/min to establish cold heat sink...' 
      });
      setWaterFlow(1.5);
    }, 1500));

    // Step 3: Turn on heater voltage (at 3.0s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 3,
        demoStepDescription: 'Step 3/6: Setting electrical heater voltage to 10.0 V (Heat Power = 20.0 W)...' 
      });
      setVoltage(10.0);
    }, 3000));

    // Step 4: Show thermal view & fast forward heat diffusion (at 4.5s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 4,
        demoStepDescription: 'Step 4/6: Visualizing heat diffusion across 3D rod & thermocouples...' 
      });
      setViewMode('thermal');
    }, 4500));

    // Step 5: Jump to steady state equilibrium (at 6.0s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 5,
        demoStepDescription: 'Step 5/6: Thermal equilibrium reached! |dT/dt| < 0.008 °C/s detected.' 
      });
      fastForwardToSteadyState();
    }, 6000));

    // Step 6: Log observation & complete (at 7.5s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStepIndex: 6,
        demoStepDescription: 'Step 6/6: Logging snapshot to lab notebook & calculating Fourier k...' 
      });
      recordObservation();
    }, 7500));

    // Finished (at 9.0s)
    demoTimeouts.push(setTimeout(() => {
      set({ 
        demoStatus: 'FINISHED',
        demoStepDescription: 'Demo Complete! View Fourier results and temperature gradient below.' 
      });
      addEvent('EXPERIMENT_STARTED', '✨ Automated Demo successfully finished.');
    }, 9000));
  },

  cancelAutomatedDemo: () => {
    demoTimeouts.forEach(clearTimeout);
    demoTimeouts = [];
    set({ 
      demoStatus: 'IDLE',
      demoStepDescription: '',
      demoStepIndex: 0
    });
  },

  initSimulation: (materialId: MaterialId = 'copper') => {
    const mat = MATERIALS[materialId] || MATERIALS.copper;
    const solver = new Thermal1DSolver(mat);
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
    const { addEvent } = get();
    addEvent('VIEW_MODE_CHANGED', `Laboratory 3D view mode switched to ${mode.toUpperCase()} VIEW`);
    set({ viewMode: mode });
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
    const { solver, chartDataHistory, simState } = get();
    const nextState = solver.step(dtSeconds);

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
