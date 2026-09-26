// Fourier's Law & Heat Balance Calculation Helper

import { APPARATUS_CONFIG } from './materials';

export interface FourierAnalysisResult {
  heatInputPowerW: number;        // Q_input = V * I
  temperatureGradientCperM: number; // |dT/dx|
  crossSectionAreaM2: number;     // A
  experimentalK: number;          // k_exp = Q_rod / (A * |dT/dx|)
  referenceK: number;             // k_ref
  absoluteError: number;          // |k_exp - k_ref|
  errorPercentage: number;        // |k_exp - k_ref| / k_ref * 100
  deltaTWaterC: number;           // ΔTwater = T9 - T8
  waterMassFlowKgS: number;       // ṁ = ρw * flowRate
  waterHeatRemovalW: number;      // Q_water = ṁ * Cp * (T9 - T8)
  heatLossW: number;              // Q_loss = Q_input - Q_water
  qRodConductedW: number;         // Q_rod = (Q_input + Q_water) / 2
  energyBalanceEfficiency: number;// (Q_water + Q_loss) / Q_input * 100%
  isValidForSubmission: boolean;
  validationErrorMessage?: string;
}

export function performFourierAnalysis(
  voltage: number,
  current: number,
  t1ToT7: number[],
  tInlet: number,
  tOutlet: number,
  flowRateLmin: number,
  refK: number,
  steadyStateStatus: string
): FourierAnalysisResult {
  const powerW = voltage * current;
  const area = APPARATUS_CONFIG.crossSectionArea;
  const cpWater = APPARATUS_CONFIG.waterSpecificHeatCp; // 4184 J/(kg·K)
  const rhoWater = APPARATUS_CONFIG.waterDensityRho;     // 1000 kg/m³
  
  // Linear regression to find exact slope dT/dx over sensor positions x1..x7
  const xVals = APPARATUS_CONFIG.sensorPositions; // [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35]
  const yVals = t1ToT7;
  const n = Math.min(xVals.length, yVals.length);
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += xVals[i];
    sumY += yVals[i];
    sumXY += xVals[i] * yVals[i];
    sumXX += xVals[i] * xVals[i];
  }
  
  const slope = (n * sumXX - sumX * sumX) !== 0 
    ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) 
    : 0;
  const dTdx = Math.abs(slope); // |dT/dx| in °C/m

  // Water cooling temperature delta: ΔTwater = T9 - T8
  const deltaTWater = Math.max(0, tOutlet - tInlet);

  // Mass flow: ṁ = ρw * flowRate (L/min -> kg/s)
  const massFlowKgS = (flowRateLmin / 60.0) * (rhoWater / 1000.0);

  // Heat removed by water: Q_water = ṁ * Cp * (T9 - T8)
  const qWater = massFlowKgS * cpWater * deltaTWater;
  
  // Heat loss: Q_loss = Q_input - Q_water (not artificially forced)
  const qLoss = Math.max(0, powerW - qWater);
  const energyBalanceEff = powerW > 0 ? ((qWater + qLoss) / powerW) * 100 : 0;

  // Mean heat flowing through the insulated rod section: Q_rod = (Q_in + Q_water) / 2
  const qRod = powerW > 0 ? Math.max(0.1, (powerW + qWater) / 2.0) : 0;

  // Experimental thermal conductivity: k_exp = Q_rod / (A * |dT/dx|)
  let expK = 0;
  if (qRod > 0 && dTdx > 0.1 && area > 0) {
    expK = qRod / (area * dTdx);
  }

  const absError = Math.abs(expK - refK);
  const errorPct = refK > 0 ? (absError / refK) * 100 : 0;

  // Check for NaN or Infinity
  const hasNanOrInf = [
    powerW, dTdx, qWater, qLoss, expK, ...t1ToT7, tInlet, tOutlet
  ].some((v) => isNaN(v) || !isFinite(v));

  // Validation conditions
  let isValid = true;
  let errorMsg = '';

  if (hasNanOrInf) {
    isValid = false;
    errorMsg = 'Physics numerical instability detected (NaN/Infinity). Please reset simulation.';
  } else if (powerW < 1.0) {
    isValid = false;
    errorMsg = 'Heater voltage is too low. Adjust heater to at least 4.0 – 12.0 V.';
  } else if (flowRateLmin < APPARATUS_CONFIG.minFlowRateForSubmission) {
    isValid = false;
    errorMsg = 'Cooling water flow rate is too low. Set water valve to at least 0.50 L/min.';
  } else if (steadyStateStatus !== 'STEADY_STATE' && steadyStateStatus !== 'READY_TO_RECORD') {
    isValid = false;
    errorMsg = 'System has not reached Steady State yet (|dT/dt| < 0.008 °C/s stability condition not met).';
  } else if (dTdx < 2.0) {
    isValid = false;
    errorMsg = 'Insufficient thermal gradient along the rod (|dT/dx| < 2.0 °C/m).';
  }

  return {
    heatInputPowerW: Number(powerW.toFixed(2)),
    temperatureGradientCperM: Number(dTdx.toFixed(2)),
    crossSectionAreaM2: area,
    experimentalK: Number(expK.toFixed(2)),
    referenceK: refK,
    absoluteError: Number(absError.toFixed(2)),
    errorPercentage: Number(errorPct.toFixed(2)),
    deltaTWaterC: Number(deltaTWater.toFixed(2)),
    waterMassFlowKgS: Number(massFlowKgS.toFixed(4)),
    waterHeatRemovalW: Number(qWater.toFixed(2)),
    heatLossW: Number(qLoss.toFixed(2)),
    qRodConductedW: Number(qRod.toFixed(2)),
    energyBalanceEfficiency: Number(energyBalanceEff.toFixed(1)),
    isValidForSubmission: isValid,
    validationErrorMessage: errorMsg || undefined
  };
}
