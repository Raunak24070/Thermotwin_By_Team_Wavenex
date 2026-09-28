// ThermoTwin 1D Discretized Finite Difference Thermal Conduction Solver

import { SimulationState, MaterialProperties } from './types';
import { APPARATUS_CONFIG } from './materials';

export class Thermal1DSolver {
  private nodeCount: number;
  private rodLength: number;
  private diameter: number;
  private area: number;
  private perimeter: number;
  private dx: number;
  
  private temperatures: Float64Array;
  private rateOfChange: Float64Array;
  private timeHistory: { time: number; t1: number; t7: number }[] = [];
  private steadyStateCounter: number = 0;
  
  private material: MaterialProperties;
  private voltage: number = 0;
  private waterFlowLmin: number = 0;
  private timeSeconds: number = 0;
  private resistanceR: number = APPARATUS_CONFIG.heaterResistanceR;

  constructor(material: MaterialProperties, nodeCount: number = 50) {
    this.material = material;
    this.nodeCount = nodeCount;
    this.rodLength = APPARATUS_CONFIG.rodLength;
    this.diameter = APPARATUS_CONFIG.rodDiameter;
    this.area = APPARATUS_CONFIG.crossSectionArea;
    this.perimeter = Math.PI * this.diameter;
    this.dx = this.rodLength / (this.nodeCount - 1);
    
    // Initialize temperature profile at ambient (20°C)
    this.temperatures = new Float64Array(this.nodeCount);
    this.rateOfChange = new Float64Array(this.nodeCount);
    for (let i = 0; i < this.nodeCount; i++) {
      this.temperatures[i] = APPARATUS_CONFIG.ambientTemperatureTamb;
      this.rateOfChange[i] = 0;
    }
  }

  public setApparatusDimensions(diameterM: number, lengthM: number, resistanceR: number) {
    this.diameter = diameterM;
    this.rodLength = lengthM;
    this.resistanceR = resistanceR;
    this.area = Math.PI * Math.pow(diameterM / 2, 2);
    this.perimeter = Math.PI * this.diameter;
    this.dx = this.rodLength / (this.nodeCount - 1);
  }

  public setMaterial(material: MaterialProperties) {
    this.material = material;
  }

  public setVoltage(volts: number) {
    this.voltage = Math.max(0, Math.min(APPARATUS_CONFIG.maxVoltage, volts));
  }

  public setWaterFlow(flowLmin: number) {
    this.waterFlowLmin = Math.max(0, Math.min(APPARATUS_CONFIG.maxFlowRateLmin, flowLmin));
  }

  public reset(initialTemp: number = APPARATUS_CONFIG.ambientTemperatureTamb) {
    this.timeSeconds = 0;
    this.timeHistory = [];
    this.steadyStateCounter = 0;
    for (let i = 0; i < this.nodeCount; i++) {
      this.temperatures[i] = initialTemp;
      this.rateOfChange[i] = 0;
    }
  }

  /**
   * Numerical time integration step using explicit finite difference method
   * CFL Stability sub-stepping loop ensures numerical stability
   * @param dtSeconds Wall clock delta time in seconds
   */
  public step(dtSeconds: number): SimulationState {
    const k = this.material.thermalConductivity;
    const rho = this.material.density;
    const Cp = this.material.specificHeat;
    
    // Sub-step loop for CFL stability condition: dt <= 0.35 * (rho * Cp * dx^2) / (2 * k)
    const maxStableDt = Math.max(0.001, (0.35 * rho * Cp * Math.pow(this.dx, 2)) / (2 * k));
    const subSteps = Math.max(1, Math.ceil(dtSeconds / maxStableDt));
    const dt = dtSeconds / subSteps;
    
    const R = this.resistanceR;
    const current = this.voltage / R;
    const power = (this.voltage * this.voltage) / R; // P = V²/R = V*I
    
    // Cooling water mass flow rate (L/min -> kg/s)
    const waterMassFlowKgS = (this.waterFlowLmin / 60.0) * (APPARATUS_CONFIG.waterDensityRho / 1000.0);
    const CpWater = APPARATUS_CONFIG.waterSpecificHeatCp; // 4184 J/(kg·K)
    
    // Effective small heat loss coefficient through insulated outer casing (W/m²K)
    const hInsulation = 1.25;
    
    const newTemps = new Float64Array(this.nodeCount);
    
    for (let sub = 0; sub < subSteps; sub++) {
      this.timeSeconds += dt;
      
      for (let i = 0; i < this.nodeCount; i++) {
        const T_curr = this.temperatures[i];
        
        // 1. Thermal Conduction term: k * A * d²T/dx²
        let conduction = 0;
        if (i === 0) {
          conduction = (k * this.area * (this.temperatures[1] - T_curr)) / (this.dx * this.dx);
        } else if (i === this.nodeCount - 1) {
          conduction = (k * this.area * (this.temperatures[i - 1] - T_curr)) / (this.dx * this.dx);
        } else {
          conduction = (k * this.area * (this.temperatures[i + 1] - 2 * T_curr + this.temperatures[i - 1])) / (this.dx * this.dx);
        }
        
        // 2. Heat Source term Q_heater at hot end nodes (first 5 nodes, x = 0 to 0.05m)
        let heatInput = 0;
        if (i < 5) {
          heatInput = power / 5;
        }
        
        // 3. Water Cooling term Q_cooling at cooling jacket nodes (last 8 nodes, x = 0.42m to 0.50m)
        let heatCooling = 0;
        if (i >= this.nodeCount - 8 && waterMassFlowKgS > 0) {
          const hWater = 1250 * Math.pow(Math.max(0.1, this.waterFlowLmin) / 1.5, 0.8);
          const coolArea = this.perimeter * this.dx;
          heatCooling = hWater * coolArea * (T_curr - APPARATUS_CONFIG.ambientTemperatureTamb);
        }
        
        // 4. Heat Loss to ambient through insulation
        const heatLoss = hInsulation * (this.perimeter * this.dx) * (T_curr - APPARATUS_CONFIG.ambientTemperatureTamb);
        
        // Energy balance equation: (rho * Cp * A * dx) * dT/dt = conduction * dx + heatInput - heatCooling - heatLoss
        const nodeHeatCapacity = rho * Cp * this.area * this.dx;
        const netPower = (conduction * this.dx) + heatInput - heatCooling - heatLoss;
        const dTdt = netPower / nodeHeatCapacity;
        
        this.rateOfChange[i] = dTdt;
        newTemps[i] = Math.max(APPARATUS_CONFIG.ambientTemperatureTamb - 2, T_curr + dTdt * dt);
      }
      
      for (let i = 0; i < this.nodeCount; i++) {
        this.temperatures[i] = newTemps[i];
      }
    }

    // Interpolate sensor values T1..T7 at exact physical positions
    const getTempAtPosition = (posMeters: number): number => {
      const idx = Math.min(this.nodeCount - 1, Math.max(0, (posMeters / this.rodLength) * (this.nodeCount - 1)));
      const lower = Math.floor(idx);
      const upper = Math.min(this.nodeCount - 1, Math.ceil(idx));
      const frac = idx - lower;
      return this.temperatures[lower] * (1 - frac) + this.temperatures[upper] * frac;
    };

    const t1 = getTempAtPosition(APPARATUS_CONFIG.sensorPositions[0]); // 0.05m
    const t2 = getTempAtPosition(APPARATUS_CONFIG.sensorPositions[1]); // 0.10m
    const t3 = getTempAtPosition(APPARATUS_CONFIG.sensorPositions[2]); // 0.15m
    const t4 = getTempAtPosition(APPARATUS_CONFIG.sensorPositions[3]); // 0.20m
    const t5 = getTempAtPosition(APPARATUS_CONFIG.sensorPositions[4]); // 0.25m
    const t6 = getTempAtPosition(APPARATUS_CONFIG.sensorPositions[5]); // 0.30m
    const t7 = getTempAtPosition(APPARATUS_CONFIG.sensorPositions[6]); // 0.35m
    
    // T8 (water inlet = 20°C ambient)
    const t8 = APPARATUS_CONFIG.ambientTemperatureTamb;
    
    // Total heat absorbed by water: Q_water
    let qWaterTotal = 0;
    if (waterMassFlowKgS > 0) {
      for (let i = this.nodeCount - 8; i < this.nodeCount; i++) {
        const hWater = 1250 * Math.pow(Math.max(0.1, this.waterFlowLmin) / 1.5, 0.8);
        qWaterTotal += hWater * (this.perimeter * this.dx) * (this.temperatures[i] - APPARATUS_CONFIG.ambientTemperatureTamb);
      }
    }
    
    // Outlet water temperature T9 = T8 + Q_water / (m_dot * Cp)
    const deltaTWater = waterMassFlowKgS > 0 ? qWaterTotal / (waterMassFlowKgS * CpWater) : 0;
    const t9 = t8 + deltaTWater;
    
    // Total surface heat loss Q_loss
    let qLossTotal = 0;
    for (let i = 0; i < this.nodeCount; i++) {
      qLossTotal += hInsulation * (this.perimeter * this.dx) * (this.temperatures[i] - APPARATUS_CONFIG.ambientTemperatureTamb);
    }

    // Temperature Gradient dT/dx along T1-T7 via Linear Regression
    const xVals = APPARATUS_CONFIG.sensorPositions;
    const yVals = [t1, t2, t3, t4, t5, t6, t7];
    const n = 7;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let j = 0; j < n; j++) {
      sumX += xVals[j];
      sumY += yVals[j];
      sumXY += xVals[j] * yVals[j];
      sumXX += xVals[j] * xVals[j];
    }
    const regressionSlope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const tempGradient = Math.abs(regressionSlope); // |dT/dx| in °C/m

    // Calculate maximum rate of change |dT/dt|
    let maxRateOfChange = 0;
    for (let i = 0; i < this.nodeCount; i++) {
      const absRate = Math.abs(this.rateOfChange[i]);
      if (absRate > maxRateOfChange) {
        maxRateOfChange = absRate;
      }
    }

    // 4-Stage Steady State Stability Detection:
    // TRANSIENT -> APPROACHING_STEADY_STATE -> STEADY_STATE -> READY_TO_RECORD
    let steadyStateStatus: 'TRANSIENT' | 'APPROACHING_STEADY_STATE' | 'STEADY_STATE' | 'READY_TO_RECORD' = 'TRANSIENT';
    
    if (power > 0 && maxRateOfChange < APPARATUS_CONFIG.steadyStateThresholdDegCperSec && this.timeSeconds > 20) {
      this.steadyStateCounter += dtSeconds;
      if (this.steadyStateCounter >= 15.0) {
        steadyStateStatus = 'READY_TO_RECORD';
      } else {
        steadyStateStatus = 'STEADY_STATE';
      }
    } else if (maxRateOfChange < APPARATUS_CONFIG.approachingSteadyStateThresholdDegCperSec && this.timeSeconds > 10) {
      steadyStateStatus = 'APPROACHING_STEADY_STATE';
      this.steadyStateCounter = 0;
    } else {
      this.steadyStateCounter = 0;
    }

    // Fourier's Law Conductivity Calculation: k_exp = Q_rod / (A * |dT/dx|)
    let calculatedK: number | null = null;
    let errorPercentage: number | null = null;

    if (tempGradient > 0.5 && power > 0) {
      // Mean axial heat flux flowing through the insulated rod section
      const qRodMean = Math.max(0.1, (power + qWaterTotal) / 2.0);
      calculatedK = qRodMean / (this.area * tempGradient);
      errorPercentage = Math.abs((calculatedK - this.material.thermalConductivity) / this.material.thermalConductivity) * 100;
    }

    return {
      timeSeconds: this.timeSeconds,
      dt: dtSeconds,
      material: this.material,
      voltage: this.voltage,
      resistance: R,
      current,
      power,
      waterFlowLmin: this.waterFlowLmin,
      waterFlowKgS: waterMassFlowKgS,
      ambientTemp: APPARATUS_CONFIG.ambientTemperatureTamb,
      waterInletTemp: t8,
      nodeCount: this.nodeCount,
      dx: this.dx,
      temperatures: Array.from(this.temperatures),
      sensors: {
        t1, t2, t3, t4, t5, t6, t7, t8, t9
      },
      heatInput: power,
      heatRemovedByWater: qWaterTotal,
      heatLoss: Math.max(0, power - qWaterTotal),
      tempGradient,
      rateOfChangeMax: maxRateOfChange,
      steadyStateStatus,
      calculatedK: calculatedK ? Number(calculatedK.toFixed(2)) : null,
      errorPercentage: errorPercentage ? Number(errorPercentage.toFixed(2)) : null
    };
  }
}
