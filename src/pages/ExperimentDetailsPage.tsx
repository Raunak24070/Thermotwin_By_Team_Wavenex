import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Flame, 
  FlaskConical, 
  ArrowLeft, 
  Clock, 
  Layers, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Thermometer, 
  Droplets,
  Calendar,
  User,
  Building,
  AlertCircle
} from 'lucide-react';
import { useExperimentStore } from '../store/useExperimentStore';
import { SavedExperiment } from '../api/apiClient';

export const ExperimentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchExperimentById, isLoading, error } = useExperimentStore();

  const [experiment, setExperiment] = useState<SavedExperiment | null>(null);

  useEffect(() => {
    if (id) {
      fetchExperimentById(id).then((data) => {
        if (data) setExperiment(data);
      });
    }
  }, [id, fetchExperimentById]);

  if (isLoading && !experiment) {
    return (
      <div className="min-h-screen w-full bg-[#0D0F0E] text-[#F5F5F5] flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs text-[#7C827C]">Loading experiment record from MongoDB...</span>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="min-h-screen w-full bg-[#0D0F0E] text-[#F5F5F5] flex flex-col items-center justify-center font-mono p-4">
        <div className="p-6 bg-[#111312] border border-red-500/30 rounded-2xl max-w-md w-full text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <h2 className="text-base font-bold text-[#F5F5F5]">Experiment Not Found</h2>
          <p className="text-xs text-[#7C827C]">{error || 'Could not locate this experiment record.'}</p>
          <Link
            to="/experiments"
            className="px-4 py-2 bg-[#171918] border border-[#252825] hover:border-[#39FF14]/50 rounded-xl text-xs text-[#39FF14] font-bold"
          >
            &larr; Back to My Experiments
          </Link>
        </div>
      </div>
    );
  }

  const sensors = experiment.sensorReadings || {
    t1: 20, t2: 20, t3: 20, t4: 20, t5: 20, t6: 20, t7: 20, t8: 20, t9: 20
  };

  const createdDate = new Date(experiment.createdAt).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen w-full bg-[#0D0F0E] text-[#F5F5F5] flex flex-col font-mono select-none antialiased">
      
      {/* Header Bar */}
      <header className="h-16 bg-[#111312] border-b border-[#252825] px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#102713] border border-[#163D19] flex items-center justify-center glow-green-sm">
            <Flame className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-base tracking-tight text-[#F5F5F5] font-sans">
                THERMOTWIN
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#171918] border border-[#303330] text-[#39FF14] font-bold">
                SNAPSHOT DETAILS
              </span>
            </div>
            <span className="text-[11px] text-[#7C827C]">
              ID: {experiment._id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/experiments"
            className="px-3.5 py-2 rounded-xl bg-[#171918] border border-[#252825] hover:border-[#39FF14]/40 text-xs text-[#B5BBB5] hover:text-[#F5F5F5] flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Experiments</span>
          </Link>

          <button
            onClick={() => navigate('/lab')}
            className="px-4 py-2 rounded-xl bg-[#39FF14] hover:bg-[#4ADE2A] text-[#0D0F0E] font-black text-xs uppercase tracking-wider flex items-center gap-2 glow-green cursor-pointer transition-all"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Open in Lab</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Banner Summary */}
        <div className="bg-[#111312] border border-[#252825] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-2xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#102713] text-[#39FF14] border border-[#163D19] font-bold">
                {experiment.material.toUpperCase()} SPECIMEN
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-[#171918] text-[#38BDF8] border border-[#252825] font-bold">
                STATUS: {experiment.experimentStatus}
              </span>
            </div>

            <h1 className="text-2xl font-black text-[#F5F5F5] tracking-tight font-sans">
              {experiment.experimentName}
            </h1>

            <div className="flex items-center gap-4 text-xs text-[#7C827C] flex-wrap mt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Recorded: {createdDate}</span>
              </div>
            </div>
          </div>

          {/* Large Result Badge */}
          <div className="p-4 rounded-2xl bg-[#102713] border border-[#163D19] glow-green-sm flex flex-col items-center sm:items-end justify-center">
            <span className="text-[10px] text-[#8BEA63] font-bold uppercase tracking-wider">
              THERMAL CONDUCTIVITY (k)
            </span>
            <div className="text-3xl font-black text-[#39FF14] mt-0.5">
              {experiment.thermalConductivity ? experiment.thermalConductivity.toFixed(1) : '—'}
              <span className="text-xs font-normal text-[#8BEA63] ml-1.5">W/(m&middot;K)</span>
            </div>
          </div>
        </div>

        {/* Telemetry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Operating Boundary Conditions */}
          <div className="bg-[#111312] border border-[#252825] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#252825] pb-3">
              <Flame className="w-4 h-4 text-[#FF6B35]" />
              <h3 className="font-bold text-sm text-[#F5F5F5] uppercase">
                Heater &amp; Cooling Boundary State
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">HEATER VOLTAGE</span>
                <span className="font-bold text-base text-[#F59E0B]">{experiment.heaterVoltage.toFixed(1)} V</span>
              </div>

              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">ELECTRICAL POWER</span>
                <span className="font-bold text-base text-[#FF6B35]">{experiment.heaterPower.toFixed(1)} W</span>
              </div>

              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">COOLING WATER FLOW</span>
                <span className="font-bold text-base text-[#38BDF8]">{experiment.coolingWaterFlow.toFixed(2)} L/min</span>
              </div>

              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">TEMP GRADIENT |dT/dx|</span>
                <span className="font-bold text-base text-[#39FF14]">{experiment.temperatureGradient ? experiment.temperatureGradient.toFixed(1) : '—'} &deg;C/m</span>
              </div>
            </div>
          </div>

          {/* Card 2: Apparatus Physical Geometry */}
          <div className="bg-[#111312] border border-[#252825] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#252825] pb-3">
              <Layers className="w-4 h-4 text-[#39FF14]" />
              <h3 className="font-bold text-sm text-[#F5F5F5] uppercase">
                Apparatus Physical Dimensions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">ROD LENGTH</span>
                <span className="font-bold text-base text-[#F5F5F5]">{(experiment.rodLength * 1000).toFixed(0)} mm</span>
              </div>

              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">ROD DIAMETER</span>
                <span className="font-bold text-base text-[#F5F5F5]">{(experiment.rodDiameter * 1000).toFixed(1)} mm</span>
              </div>

              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">MATERIAL DENSITY</span>
                <span className="font-bold text-base text-[#F5F5F5]">{experiment.density || 8960} kg/m&sup3;</span>
              </div>

              <div className="p-3 bg-[#171918] rounded-xl border border-[#252825]">
                <span className="text-[#7C827C] text-[10px] block">SPECIFIC HEAT (Cp)</span>
                <span className="font-bold text-base text-[#F5F5F5]">{experiment.specificHeat || 385} J/(kg&middot;K)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Card 3: Thermocouple Distribution Matrix (T1 - T9) */}
        <div className="bg-[#111312] border border-[#252825] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#252825] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#39FF14]" />
              <h3 className="font-bold text-sm text-[#F5F5F5] uppercase">
                Recorded Thermocouple Temperatures (T1&ndash;T9)
              </h3>
            </div>
            <span className="text-[10px] text-[#7C827C]">T1 (HOT END) &rarr; T7 (COLD END) &bull; T8/T9 COOLANT</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 text-center text-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const key = `t${num}` as keyof typeof sensors;
              const val = sensors[key] || 20;
              const isCoolant = num >= 8;

              return (
                <div 
                  key={num}
                  className={`p-3 rounded-xl border flex flex-col gap-1 ${
                    isCoolant 
                      ? 'bg-[#1e293b]/30 border-[#0284c7]/40 text-[#38BDF8]' 
                      : 'bg-[#171918] border-[#252825] text-[#F5F5F5]'
                  }`}
                >
                  <span className="text-[10px] text-[#7C827C] font-bold">
                    {num === 8 ? 'T8 (In)' : num === 9 ? 'T9 (Out)' : `T${num}`}
                  </span>
                  <span className="text-base font-black">
                    {val.toFixed(1)}&deg;C
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </main>

    </div>
  );
};
