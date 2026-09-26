// ThermoTwin Material Properties & Centralized Apparatus Parameters Registry

import { MaterialProperties, MaterialId } from './types';

export const MATERIALS: Record<MaterialId, MaterialProperties> = {
  copper: {
    id: 'copper',
    name: 'Copper (Pure)',
    chemicalSymbol: 'Cu',
    thermalConductivity: 385.0, // W/(m·K)
    density: 8960.0,            // kg/m³
    specificHeat: 385.0,        // J/(kg·K)
    colorHex: '#b87333',
    roughness: 0.25,
    metalness: 0.85,
    description: 'High thermal conductivity metal. Responds quickly to temperature changes with steep thermal gradients.'
  },
  aluminium: {
    id: 'aluminium',
    name: 'Aluminium Alloy (6061)',
    chemicalSymbol: 'Al',
    thermalConductivity: 205.0, // W/(m·K)
    density: 2700.0,            // kg/m³
    specificHeat: 900.0,        // J/(kg·K)
    colorHex: '#d8d8d8',
    roughness: 0.35,
    metalness: 0.75,
    description: 'Moderate thermal conductivity with lightweight density. Standard engineering metallic rod material.'
  },
  steel: {
    id: 'steel',
    name: 'Stainless Steel (304)',
    chemicalSymbol: 'Fe-Cr-Ni',
    thermalConductivity: 50.2,  // W/(m·K)
    density: 7850.0,            // kg/m³
    specificHeat: 490.0,        // J/(kg·K)
    colorHex: '#808890',
    roughness: 0.4,
    metalness: 0.9,
    description: 'Low thermal conductivity metal. Reaches steady state slowly with large temperature drops across length.'
  }
};

/**
 * Centralized Physical Apparatus Configuration
 * All dimensions, fluid constants, sensor placements, and resistance properties
 */
export const APPARATUS_CONFIG = {
  // Rod Geometry
  rodLength: 0.50,            // L = 50 cm = 0.50 m
  rodDiameter: 0.025,         // D = 25 mm = 0.025 m
  crossSectionArea: Math.PI * Math.pow(0.025 / 2, 2), // A = 4.9087 × 10⁻⁴ m² (≈ 4.91 × 10⁻⁴ m²)
  surfaceArea: Math.PI * 0.025 * 0.50,                // 0.03927 m²
  
  // Electrical Heater Specifications
  heaterResistanceR: 15.0,    // 15.0 Ohms
  maxVoltage: 12.0,           // 12.0 Volts
  minVoltageForSubmission: 4.0,

  // Cooling Fluid (Water) Specifications
  waterSpecificHeatCp: 4184.0, // Cp = 4184 J/(kg·K)
  waterDensityRho: 1000.0,     // ρw = 1000 kg/m³ (1 kg/L)
  maxFlowRateLmin: 3.0,        // 3.0 L/min
  minFlowRateForSubmission: 0.2, // 0.2 L/min

  // Ambient Environment
  ambientTemperatureTamb: 20.0, // Tamb = 20.0 °C

  // Thermocouple Probes T1 - T7 Placement Along Rod Length (in meters)
  sensorPositions: [
    0.05, // T1 = 5 cm (0.05 m)
    0.10, // T2 = 10 cm (0.10 m)
    0.15, // T3 = 15 cm (0.15 m)
    0.20, // T4 = 20 cm (0.20 m)
    0.25, // T5 = 25 cm (0.25 m)
    0.30, // T6 = 30 cm (0.30 m)
    0.35  // T7 = 35 cm (0.35 m)
  ] as const,

  // Steady-State Stability Threshold: Maximum allowable |dT/dt| rate
  steadyStateThresholdDegCperSec: 0.008,
  approachingSteadyStateThresholdDegCperSec: 0.04
};

// Aliases for backward compatibility
export const DEFAULT_ROD_GEOMETRY = {
  length: APPARATUS_CONFIG.rodLength,
  diameter: APPARATUS_CONFIG.rodDiameter,
  crossSectionArea: APPARATUS_CONFIG.crossSectionArea,
  surfaceArea: APPARATUS_CONFIG.surfaceArea
};

export const HEATER_RESISTANCE = APPARATUS_CONFIG.heaterResistanceR;
export const AMBIENT_TEMP = APPARATUS_CONFIG.ambientTemperatureTamb;
export const SENSOR_POSITIONS = APPARATUS_CONFIG.sensorPositions;
