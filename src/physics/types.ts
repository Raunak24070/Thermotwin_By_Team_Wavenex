// ThermoTwin Physics Engine Types & Constants

export type MaterialId = 'copper' | 'aluminium' | 'steel';

export interface MaterialProperties {
  id: MaterialId;
  name: string;
  chemicalSymbol: string;
  thermalConductivity: number; // k in W/(m·K)
  density: number;             // ρ in kg/m³
  specificHeat: number;        // Cp in J/(kg·K)
  colorHex: string;
  roughness: number;
  metalness: number;
  description: string;
}

export interface RodGeometry {
  length: number;           // L in meters (e.g. 0.5m)
  diameter: number;         // d in meters (e.g. 0.025m = 25mm)
  crossSectionArea: number; // A = π*r² in m²
  surfaceArea: number;      // Perimeter * length in m²
}

export interface SensorConfig {
  id: string;               // e.g. 'T1', 'T2'... 'T9'
  name: string;
  positionX: number;        // Position along rod (0 to L) in meters
  type: 'rod' | 'water_in' | 'water_out';
  description: string;
}

export interface SimulationState {
  timeSeconds: number;
  dt: number;
  material: MaterialProperties;
  
  // Controls
  voltage: number;          // V (0 - 12V)
  resistance: number;       // R (ohms, e.g. 15 Ω)
  current: number;          // I = V/R
  power: number;            // P = V * I (Watts)
  
  waterFlowLmin: number;    // L/min (0 - 3 L/min)
  waterFlowKgS: number;     // kg/s
  ambientTemp: number;      // °C (20.0 °C)
  waterInletTemp: number;   // °C (20.0 °C)
  
  // Spatial Discretization
  nodeCount: number;
  dx: number;
  temperatures: number[];   // °C array of length nodeCount
  
  // Derived Sensor Readings
  sensors: {
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    t5: number;
    t6: number;
    t7: number;
    t8: number; // Water In
    t9: number; // Water Out
  };
  
  // Energetics
  heatInput: number;        // Q_in (Watts)
  heatRemovedByWater: number;// Q_water (Watts)
  heatLoss: number;         // Q_loss (Watts)
  
  // Analysis
  tempGradient: number;     // dT/dx in °C/m along T1-T7
  rateOfChangeMax: number;  // max |dT/dt| in °C/s over recent window
  steadyStateStatus: 'TRANSIENT' | 'APPROACHING_STEADY_STATE' | 'STEADY_STATE' | 'READY_TO_RECORD';
  
  calculatedK: number | null;// Experimental thermal conductivity W/(m·K)
  errorPercentage: number | null;
}

export interface ObservationRecord {
  id: string;
  timestamp: string;
  elapsedSeconds: number;
  voltage: number;
  current: number;
  power: number;
  flowRate: number;
  t1: number;
  t2: number;
  t3: number;
  t4: number;
  t5: number;
  t6: number;
  t7: number;
  t8: number;
  t9: number;
  deltaTWater: number;        // ΔTwater = T9 - T8 (°C)
  dTdx: number;               // Temperature Gradient (°C/m)
  heatInput: number;          // Heat Input Q_in (W)
  heatRemoved: number;        // Heat Removed Q_water (W)
  heatLoss: number;           // Heat Loss Q_loss (W)
  calculatedK: number | null; // Experimental k (W/m·K)
  steadyState: string;
}
