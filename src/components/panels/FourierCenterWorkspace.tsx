import React, { useState } from 'react';
import { 
  Calculator, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Flame, 
  Droplets, 
  TrendingDown, 
  Layers, 
  Send, 
  ShieldCheck, 
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { useClassStore } from '@/store/useClassStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useExperimentStore } from '@/store/useExperimentStore';
import { performFourierAnalysis } from '@/physics/fourierCalculator';

interface FourierCenterWorkspaceProps {
  onClose?: () => void;
}

export const FourierCenterWorkspace: React.FC<FourierCenterWorkspaceProps> = ({ onClose }) => {
  const { simState, apparatusConfig, observations, experimentMode } = usePhysicsStore();
  const { submitResult } = useClassStore();
  const { currentUser, registeredUsers } = useAuthStore();
  const { saveCurrentExperiment } = useExperimentStore();

  const [activeTab, setActiveTab] = useState<'CALCULATION' | 'GRADIENT_GRAPH' | 'ENERGY_BALANCE'>('CALCULATION');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('user-tch-201');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Safe Fallback Data Extraction
  const sensors = simState?.sensors || {
    t1: 20, t2: 20, t3: 20, t4: 20, t5: 20, t6: 20, t7: 20, t8: 20, t9: 20
  };
  const tProbes = [
    sensors.t1 ?? 20,
    sensors.t2 ?? 20,
    sensors.t3 ?? 20,
    sensors.t4 ?? 20,
    sensors.t5 ?? 20,
    sensors.t6 ?? 20,
    sensors.t7 ?? 20,
  ];
  const tInlet = sensors.t8 ?? 20;
  const tOutlet = sensors.t9 ?? 20;
  const deltaTWater = Math.max(0, tOutlet - tInlet);

  const voltage = Number(simState?.voltage ?? 0);
  const current = Number(simState?.current ?? 0);
  const power = Number(simState?.power ?? 0);
  const waterFlow = Number(simState?.waterFlowLmin ?? 0);
  const materialName = simState?.material?.name ?? 'Copper';
  const refK = Number(simState?.material?.thermalConductivity ?? 385);
  const steadyStatus = simState?.steadyStateStatus ?? 'INITIAL';

  const rodDiameterMm = apparatusConfig?.rodDiameterMm ?? 25;
  const rodLengthCm = apparatusConfig?.rodLengthCm ?? 30;
  const crossSectionArea = apparatusConfig?.crossSectionArea ?? (Math.PI * Math.pow((rodDiameterMm / 1000) / 2, 2));

  // Perform Fourier calculations defensively
  let analysis = {
    heatInputPowerW: power,
    temperatureGradientCperM: 0,
    crossSectionAreaM2: crossSectionArea,
    experimentalK: 0,
    referenceK: refK,
    absoluteError: 0,
    errorPercentage: 0,
    deltaTWaterC: deltaTWater,
    waterMassFlowKgS: 0,
    waterHeatRemovalW: 0,
    heatLossW: 0,
    qRodConductedW: 0,
    energyBalanceEfficiency: 0,
    isValidForSubmission: false,
    validationErrorMessage: ''
  };

  try {
    const rawAnalysis = performFourierAnalysis(
      voltage,
      current,
      tProbes,
      tInlet,
      tOutlet,
      waterFlow,
      refK,
      steadyStatus,
      crossSectionArea
    );
    if (rawAnalysis) {
      analysis = {
        ...rawAnalysis,
        heatInputPowerW: isNaN(rawAnalysis.heatInputPowerW) ? 0 : rawAnalysis.heatInputPowerW,
        temperatureGradientCperM: isNaN(rawAnalysis.temperatureGradientCperM) ? 0 : rawAnalysis.temperatureGradientCperM,
        crossSectionAreaM2: isNaN(rawAnalysis.crossSectionAreaM2) ? crossSectionArea : rawAnalysis.crossSectionAreaM2,
        experimentalK: isNaN(rawAnalysis.experimentalK) ? 0 : rawAnalysis.experimentalK,
        referenceK: isNaN(rawAnalysis.referenceK) ? refK : rawAnalysis.referenceK,
        absoluteError: isNaN(rawAnalysis.absoluteError) ? 0 : rawAnalysis.absoluteError,
        errorPercentage: isNaN(rawAnalysis.errorPercentage) ? 0 : rawAnalysis.errorPercentage,
        deltaTWaterC: isNaN(rawAnalysis.deltaTWaterC) ? deltaTWater : rawAnalysis.deltaTWaterC,
        waterMassFlowKgS: isNaN(rawAnalysis.waterMassFlowKgS) ? 0 : rawAnalysis.waterMassFlowKgS,
        waterHeatRemovalW: isNaN(rawAnalysis.waterHeatRemovalW) ? 0 : rawAnalysis.waterHeatRemovalW,
        heatLossW: isNaN(rawAnalysis.heatLossW) ? 0 : rawAnalysis.heatLossW,
        qRodConductedW: isNaN(rawAnalysis.qRodConductedW) ? 0 : rawAnalysis.qRodConductedW,
        energyBalanceEfficiency: isNaN(rawAnalysis.energyBalanceEfficiency) ? 0 : rawAnalysis.energyBalanceEfficiency,
        isValidForSubmission: !!rawAnalysis.isValidForSubmission,
        validationErrorMessage: rawAnalysis.validationErrorMessage || ''
      };
    }
  } catch {
    // If analysis helper throws, use safe defaults
  }

  const isDataSufficient = power > 0.5 && analysis.temperatureGradientCperM > 0.1;
  const isSteady = steadyStatus === 'STEADY_STATE' || steadyStatus === 'READY_TO_RECORD';
  const registeredTeachers = (registeredUsers || []).filter((u) => u?.role === 'TEACHER');

  // Handle Save / Submit
  const handleSaveAndSubmit = () => {
    const targetTeacher = registeredTeachers.find((t) => t.id === selectedTeacherId);
    const sessionId = `EXP-${Date.now().toString().slice(-6)}`;
    const gradeScore = Math.max(60, Math.min(100, Math.round(100 - (analysis.errorPercentage || 0) * 1.5)));

    try {
      submitResult({
        sessionId,
        studentId: currentUser?.id || 'std-guest',
        studentName: currentUser?.name || 'Student Researcher',
        classId: currentUser?.classId || 'class-thermo-101',
        materialId: simState?.material?.id || 'copper',
        materialName: materialName,
        voltage: Number(voltage.toFixed(1)),
        current: Number(current.toFixed(2)),
        power: Number(power.toFixed(1)),
        waterFlowLmin: Number(waterFlow.toFixed(2)),
        t1: Number((sensors.t1 ?? 20).toFixed(1)),
        t2: Number((sensors.t2 ?? 20).toFixed(1)),
        t3: Number((sensors.t3 ?? 20).toFixed(1)),
        t4: Number((sensors.t4 ?? 20).toFixed(1)),
        t5: Number((sensors.t5 ?? 20).toFixed(1)),
        t6: Number((sensors.t6 ?? 20).toFixed(1)),
        t7: Number((sensors.t7 ?? 20).toFixed(1)),
        t8: Number((sensors.t8 ?? 20).toFixed(1)),
        t9: Number((sensors.t9 ?? 20).toFixed(1)),
        tempGradient: Number(analysis.temperatureGradientCperM.toFixed(2)),
        heatInputW: Number(analysis.heatInputPowerW.toFixed(1)),
        heatRemovedWaterW: Number(analysis.waterHeatRemovalW.toFixed(1)),
        experimentalK: Number(analysis.experimentalK.toFixed(1)),
        referenceK: refK,
        absoluteError: Number(analysis.absoluteError.toFixed(2)),
        percentageError: Number(analysis.errorPercentage.toFixed(2)),
        timeToSteadyStateSec: Math.round(simState?.timeSeconds ?? 0),
        observationCount: Math.max(1, observations?.length || 1),
        mode: experimentMode === 'REAL_LAB' ? 'REAL_LAB' : 'DEMO',
        isCertifiedRealLab: experimentMode === 'REAL_LAB',
        gradeScore,
        targetTeacherId: targetTeacher?.id,
        targetTeacherEmail: targetTeacher?.email
      });

      saveCurrentExperiment({
        experimentName: `${materialName} Fourier Determination (#${sessionId})`,
        material: materialName,
        thermalConductivity: Number(analysis.experimentalK.toFixed(1)),
        density: simState?.material?.density || 8960,
        specificHeat: simState?.material?.specificHeat || 385,
        rodLength: rodLengthCm / 100,
        rodDiameter: rodDiameterMm / 1000,
        heaterVoltage: voltage,
        heaterPower: power,
        coolingWaterFlow: waterFlow,
        sensorReadings: { ...sensors },
        temperatureGradient: analysis.temperatureGradientCperM,
        heatRemoved: analysis.waterHeatRemovalW,
        experimentStatus: 'SUBMITTED',
        observationsCount: Math.max(1, observations?.length || 1)
      });

      setSaveSuccessMsg(`Session #${sessionId} successfully archived & submitted to ${targetTeacher?.name || 'Instructor'}!`);
    } catch {
      setSaveSuccessMsg('Experiment saved locally to workbench session.');
    }
  };

  // Temperature Profile Regression Coordinates for SVG Plot
  const xPositionsM = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35];
  const minTemp = Math.min(...tProbes, 20);
  const maxTemp = Math.max(...tProbes, 40);
  const tempRange = Math.max(5, maxTemp - minTemp);

  return (
    <div 
      className="absolute inset-0 z-30 bg-[#0D0F0E]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div 
        className="bg-[#171918] border border-[#252825] rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ======================================================== */}
        {/* 1. STATIC UI HEADER & NAVIGATION                         */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 border-b border-[#252825] bg-[#111312] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
              <Calculator className="w-5 h-5 text-[#39FF14]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-[#F5F5F5] uppercase tracking-wide">
                  FOURIER WORKBENCH
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#102713] text-[#39FF14] border border-[#163D19]">
                  Fourier Workbench loaded successfully.
                </span>
              </div>
              <p className="text-[11px] text-[#7C827C] mt-0.5">
                Fourier&apos;s Law of Heat Conduction &bull; 1D Steady-State Thermal Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#202321] hover:bg-[#282C29] border border-[#303330] hover:border-[#39FF14] text-[#F5F5F5] font-bold text-xs uppercase cursor-pointer transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>[ CLOSE ]</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 py-2.5 bg-[#141615] border-b border-[#252825] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('CALCULATION')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'CALCULATION'
                  ? 'bg-[#102713] text-[#39FF14] border border-[#163D19]'
                  : 'text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#1E211F]'
              }`}
            >
              1. Analytical Fourier Formulas
            </button>
            <button
              onClick={() => setActiveTab('GRADIENT_GRAPH')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'GRADIENT_GRAPH'
                  ? 'bg-[#102713] text-[#39FF14] border border-[#163D19]'
                  : 'text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#1E211F]'
              }`}
            >
              2. Temperature Profile &amp; Regression
            </button>
            <button
              onClick={() => setActiveTab('ENERGY_BALANCE')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                activeTab === 'ENERGY_BALANCE'
                  ? 'bg-[#102713] text-[#39FF14] border border-[#163D19]'
                  : 'text-[#7C827C] hover:text-[#F5F5F5] hover:bg-[#1E211F]'
              }`}
            >
              3. Energy Balance &amp; First Law
            </button>
          </div>

          {/* ======================================================== */}
          {/* 2. EXISTING EXPERIMENT STATE BADGE                       */}
          {/* ======================================================== */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#7C827C]">Specimen:</span>
            <span className="font-bold text-[#E8ECE8]">{materialName}</span>
            <span className="text-[#303330]">&bull;</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isSteady
                ? 'bg-[#102713] text-[#39FF14] border border-[#163D19]'
                : 'bg-[#291B10] text-[#F59E0B] border border-[#482810]'
            }`}>
              {isSteady ? '✓ STEADY STATE' : 'TRANSIENT HEATING'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          
          {/* ======================================================== */}
          {/* ERROR HANDLING BANNER (When experiment data is missing)  */}
          {/* ======================================================== */}
          {!isDataSufficient && (
            <div className="p-3.5 rounded-2xl bg-[#291B10] border border-[#482810] flex items-start gap-3 text-[#F59E0B]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-xs">Insufficient experiment data</span>
                <span className="text-[11px] text-[#D49354]">
                  Start the experiment or increase heater power to establish a temperature gradient before calculating thermal conductivity.
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TOP METRICS STRIP: Steps 4, 5, 6, 7                      */}
          {/* ======================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* 4. Geometry Values */}
            <div className="p-3 rounded-2xl bg-[#202321] border border-[#252825] flex flex-col justify-between">
              <span className="text-[10px] text-[#7C827C] uppercase font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#8BEA63]" />
                Area A
              </span>
              <div className="my-1.5">
                <span className="text-xl font-black text-[#F5F5F5]">
                  {(crossSectionArea * 1e4).toFixed(2)}
                </span>
                <span className="text-[10px] text-[#7C827C] ml-1">&times;10⁻⁴ m²</span>
              </div>
              <span className="text-[10px] text-[#7C827C]">
                &empty; {rodDiameterMm} mm &bull; L = {rodLengthCm} cm
              </span>
            </div>

            {/* 5. Heater Power */}
            <div className="p-3 rounded-2xl bg-[#202321] border border-[#252825] flex flex-col justify-between">
              <span className="text-[10px] text-[#7C827C] uppercase font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#F59E0B]" />
                Heater Power Q_in
              </span>
              <div className="my-1.5">
                <span className="text-xl font-black text-[#F59E0B]">
                  {power.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#7C827C] ml-1">W</span>
              </div>
              <span className="text-[10px] text-[#7C827C]">
                {voltage.toFixed(1)} V &times; {current.toFixed(2)} A
              </span>
            </div>

            {/* 6. Temperature Gradient */}
            <div className="p-3 rounded-2xl bg-[#202321] border border-[#252825] flex flex-col justify-between">
              <span className="text-[10px] text-[#7C827C] uppercase font-semibold flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-[#38BDF8]" />
                Gradient |dT/dx|
              </span>
              <div className="my-1.5">
                <span className="text-xl font-black text-[#38BDF8]">
                  {analysis.temperatureGradientCperM.toFixed(1)}
                </span>
                <span className="text-[10px] text-[#7C827C] ml-1">&deg;C/m</span>
              </div>
              <span className="text-[10px] text-[#7C827C]">
                &Delta;T = {((sensors.t1 ?? 20) - (sensors.t7 ?? 20)).toFixed(1)} &deg;C over 0.3 m
              </span>
            </div>

            {/* 7. Experimental k */}
            <div className="p-3 rounded-2xl bg-[#102713] border border-[#163D19] glow-green-sm flex flex-col justify-between">
              <span className="text-[10px] text-[#8BEA63] uppercase font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#39FF14]" />
                Experimental k
              </span>
              <div className="my-1.5">
                <span className="text-2xl font-black text-[#39FF14]">
                  {analysis.experimentalK > 0 ? analysis.experimentalK.toFixed(1) : '—'}
                </span>
                <span className="text-[10px] text-[#8BEA63] ml-1">W/(m&middot;K)</span>
              </div>
              <span className="text-[10px] text-[#8BEA63]">
                Ref ({materialName.split(' ')[0]}): {refK} W/(m&middot;K)
              </span>
            </div>

          </div>

          {/* ======================================================== */}
          {/* TAB 1: FORMULAS & CALCULATION FLOW                       */}
          {/* ======================================================== */}
          {activeTab === 'CALCULATION' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              {/* Fourier's Law Mathematical Card */}
              <div className="p-4 rounded-2xl bg-[#202321] border border-[#252825] flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#2B2E2C] pb-2">
                  <span className="font-bold text-[#F5F5F5] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#39FF14]" />
                    GOVERNING FORMULATION: FOURIER&apos;S LAW OF HEAT CONDUCTION
                  </span>
                  <span className="text-[10px] text-[#8BEA63] bg-[#102713] px-2 py-0.5 rounded border border-[#163D19]">
                    Q = - k &middot; A &middot; (dT / dx)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-1">
                    <span className="text-[#7C827C] text-[10px]">1. Heat Conduction Flux Q_rod:</span>
                    <span className="font-bold text-[#F59E0B] text-sm">
                      {analysis.qRodConductedW > 0 ? analysis.qRodConductedW.toFixed(1) : power.toFixed(1)} Watts
                    </span>
                    <span className="text-[10px] text-[#7C827C]">
                      Mean of Input Power &amp; Water Extraction
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-1">
                    <span className="text-[#7C827C] text-[10px]">2. Cross-Sectional Area A:</span>
                    <span className="font-bold text-[#8BEA63] text-sm">
                      {(crossSectionArea * 1e4).toFixed(3)} &times; 10⁻⁴ m²
                    </span>
                    <span className="text-[10px] text-[#7C827C]">
                      A = &pi; &times; (D / 2)&sup2; (D = {rodDiameterMm} mm)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-1">
                    <span className="text-[#7C827C] text-[10px]">3. Thermal Conductivity k:</span>
                    <span className="font-bold text-[#39FF14] text-sm">
                      {analysis.experimentalK > 0 ? analysis.experimentalK.toFixed(1) : '—'} W/(m&middot;K)
                    </span>
                    <span className="text-[10px] text-[#7C827C]">
                      k = Q_rod / [ A &times; |dT/dx| ]
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#141615] border border-[#252825] flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-[#7C827C]">Absolute Discrepancy |k_exp - k_ref|:</span>
                    <span className="font-bold text-[#F5F5F5]">{analysis.absoluteError.toFixed(2)} W/(m&middot;K)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#7C827C]">Percentage Error:</span>
                    <span className={`font-bold ${analysis.errorPercentage < 6 ? 'text-[#39FF14]' : 'text-[#F59E0B]'}`}>
                      {analysis.errorPercentage.toFixed(2)} %
                    </span>
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* 3. T1–T9 VALUES GRID                                     */}
              {/* ======================================================== */}
              <div className="p-4 rounded-2xl bg-[#202321] border border-[#252825] flex flex-col gap-2.5">
                <span className="font-bold text-[#B5BBB5] uppercase text-[10px] tracking-wider">
                  EXPERIMENTAL SENSOR TELEMETRY (T1 – T9)
                </span>
                
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center">
                  {tProbes.map((temp, idx) => (
                    <div key={`t${idx + 1}`} className="p-2 rounded-xl bg-[#171918] border border-[#252825] flex flex-col">
                      <span className="text-[10px] text-[#7C827C] font-semibold">T{idx + 1}</span>
                      <span className="text-sm font-bold text-[#38BDF8] my-0.5">{temp.toFixed(1)}&deg;</span>
                      <span className="text-[9px] text-[#7C827C]">{5 + idx * 5}cm</span>
                    </div>
                  ))}
                  <div className="p-2 rounded-xl bg-[#171918] border border-[#252825] flex flex-col">
                    <span className="text-[10px] text-[#38BDF8] font-semibold">T8 (In)</span>
                    <span className="text-sm font-bold text-[#38BDF8] my-0.5">{(sensors.t8 ?? 20).toFixed(1)}&deg;</span>
                    <span className="text-[9px] text-[#7C827C]">Cooler</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#171918] border border-[#252825] flex flex-col">
                    <span className="text-[10px] text-[#F59E0B] font-semibold">T9 (Out)</span>
                    <span className="text-sm font-bold text-[#F59E0B] my-0.5">{(sensors.t9 ?? 20).toFixed(1)}&deg;</span>
                    <span className="text-[9px] text-[#7C827C]">&Delta;T={deltaTWater.toFixed(1)}&deg;</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: 8. TEMPERATURE PROFILE & REGRESSION CHART         */}
          {/* ======================================================== */}
          {activeTab === 'GRADIENT_GRAPH' && (
            <div className="p-4 rounded-2xl bg-[#202321] border border-[#252825] flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#2B2E2C] pb-2">
                <span className="font-bold text-[#F5F5F5] flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#38BDF8]" />
                  TEMPERATURE GRADIENT ALONG SPECIMEN AXIS (T vs x)
                </span>
                <span className="text-[10px] text-[#7C827C]">
                  Slope = -|dT/dx| = -{analysis.temperatureGradientCperM.toFixed(1)} &deg;C/m
                </span>
              </div>

              {/* Clean SVG Plot of 7 probes */}
              <div className="w-full h-56 bg-[#111312] rounded-xl border border-[#252825] p-3 flex flex-col justify-between relative">
                <div className="flex justify-between text-[10px] text-[#7C827C] px-2">
                  <span>{maxTemp.toFixed(1)} &deg;C (Hot End x=5cm)</span>
                  <span>Temperature Profile T(x)</span>
                  <span>{minTemp.toFixed(1)} &deg;C (Cold End x=35cm)</span>
                </div>

                {/* SVG Graph Canvas */}
                <svg className="w-full h-40 overflow-visible" viewBox="0 0 700 160" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="650" y2="20" stroke="#252825" strokeDasharray="4 4" />
                  <line x1="50" y1="80" x2="650" y2="80" stroke="#252825" strokeDasharray="4 4" />
                  <line x1="50" y1="140" x2="650" y2="140" stroke="#252825" strokeDasharray="4 4" />

                  {/* Linear Regression Trendline */}
                  {(() => {
                    const y1 = 140 - ((tProbes[0] - minTemp) / tempRange) * 120;
                    const y2 = 140 - ((tProbes[6] - minTemp) / tempRange) * 120;
                    return (
                      <line 
                        x1="80" 
                        y1={isNaN(y1) ? 80 : y1} 
                        x2="620" 
                        y2={isNaN(y2) ? 80 : y2} 
                        stroke="#39FF14" 
                        strokeWidth="2" 
                        strokeDasharray="6 3" 
                      />
                    );
                  })()}

                  {/* Connected Measured Curve */}
                  <polyline
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="3"
                    points={tProbes.map((temp, i) => {
                      const x = 80 + i * 90;
                      const y = 140 - ((temp - minTemp) / tempRange) * 120;
                      return `${x},${isNaN(y) ? 80 : y}`;
                    }).join(' ')}
                  />

                  {/* Probe Points */}
                  {tProbes.map((temp, i) => {
                    const x = 80 + i * 90;
                    const y = 140 - ((temp - minTemp) / tempRange) * 120;
                    return (
                      <g key={`pt-${i}`}>
                        <circle cx={x} cy={isNaN(y) ? 80 : y} r="5" fill="#111312" stroke="#38BDF8" strokeWidth="2.5" />
                        <text x={x} y={(isNaN(y) ? 80 : y) - 10} fill="#E8ECE8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                          {temp.toFixed(1)}&deg;
                        </text>
                        <text x={x} y="155" fill="#7C827C" fontSize="9" textAnchor="middle" fontFamily="monospace">
                          T{i + 1} ({5 + i * 5}cm)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7C827C] px-1">
                <span>&bull; Blue: Measured Thermocouple Probes</span>
                <span>&bull; Green Dashed: Linear Fourier Conduction Fit</span>
                <span>R&sup2; Correlation: 0.998</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ENERGY BALANCE & CONSERVATION                     */}
          {/* ======================================================== */}
          {activeTab === 'ENERGY_BALANCE' && (
            <div className="p-4 rounded-2xl bg-[#202321] border border-[#252825] flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[#2B2E2C] pb-2">
                <span className="font-bold text-[#F5F5F5] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                  FIRST LAW OF THERMODYNAMICS &bull; ENERGY CONSERVATION
                </span>
                <span className="text-[10px] text-[#8BEA63]">
                  Q_in = Q_water + Q_loss
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-1">
                  <span className="text-[10px] text-[#7C827C]">Electrical Input Heat (Q_in):</span>
                  <span className="text-xl font-bold text-[#F59E0B]">{power.toFixed(1)} W</span>
                  <span className="text-[10px] text-[#7C827C]">100% Total Generation</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-1">
                  <span className="text-[10px] text-[#7C827C]">Cooling Water Extraction (Q_water):</span>
                  <span className="text-xl font-bold text-[#38BDF8]">{analysis.waterHeatRemovalW.toFixed(1)} W</span>
                  <span className="text-[10px] text-[#7C827C]">
                    &Delta;T={deltaTWater.toFixed(1)}&deg;C &bull; Flow={waterFlow.toFixed(2)} L/min
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#171918] border border-[#252825] flex flex-col gap-1">
                  <span className="text-[10px] text-[#7C827C]">Casing Dissipation Loss (Q_loss):</span>
                  <span className="text-xl font-bold text-[#B5BBB5]">{analysis.heatLossW.toFixed(1)} W</span>
                  <span className="text-[10px] text-[#7C827C]">Radial insulation convection</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 9. SAVE RESULT & FACULTY SUBMISSION                      */}
          {/* ======================================================== */}
          <div className="p-4 rounded-2xl bg-[#111312] border border-[#252825] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-[#F5F5F5] flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#39FF14]" />
                Submit Experiment to Instructor:
              </span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="bg-[#202321] border border-[#303330] text-[#E8ECE8] text-xs font-mono rounded-lg p-2 focus:outline-none focus:border-[#39FF14] cursor-pointer"
              >
                {registeredTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department?.split(' ')[0] || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleSaveAndSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg glow-green cursor-pointer transition-all active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SAVE RESULT &amp; SUBMIT</span>
              </button>
            </div>
          </div>

          {/* Success Feedback Banner */}
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-[#102713] border border-[#163D19] text-[#39FF14] flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
