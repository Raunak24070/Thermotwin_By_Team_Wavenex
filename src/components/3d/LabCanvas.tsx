'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { usePhysicsStore } from '@/store/usePhysicsStore';
import { MetallicRod3D } from './MetallicRod3D';
import { Heater3D } from './Heater3D';
import { InsulationShell3D } from './InsulationShell3D';
import { CoolingJacket3D } from './CoolingJacket3D';
import { Rotameter3D } from './Rotameter3D';
import { Meters3D } from './Meters3D';
import { Sensors3D } from './Sensors3D';
import { LabBench3D } from './LabBench3D';
import { ApparatusLabels3D } from './ApparatusLabels3D';
import { Apparatus3DHUD } from '../ui/Apparatus3DHUD';
import { Flame, Droplets, Layers, Thermometer, Gauge, Tag, X } from 'lucide-react';
import { SENSORS } from '@/physics/sensors';

export const LabCanvas: React.FC = () => {
  const { 
    simState, 
    viewMode, 
    selectedSensorId, 
    setSelectedSensor,
    inspectedPart,
    setInspectedPart
  } = usePhysicsStore();

  const [show3DLabels, setShow3DLabels] = React.useState<boolean>(true);

  // Selected sensor details
  const selectedSensor = selectedSensorId ? SENSORS.find((s) => s.id === selectedSensorId) : null;
  const selectedSensorTemp = selectedSensorId 
    ? (simState.sensors[selectedSensorId.toLowerCase() as keyof typeof simState.sensors] || 20.0) 
    : null;

  return (
    <div className="w-full h-full relative bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      {/* 3D View Mode Badge & Labels Toggle */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="px-3 py-1 bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-mono font-semibold tracking-wide backdrop-blur-md shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          3D VIEW: {viewMode.toUpperCase()}
        </span>

        <button
          onClick={() => setShow3DLabels(!show3DLabels)}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 shadow-md backdrop-blur-md cursor-pointer ${
            show3DLabels
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          {show3DLabels ? 'Labels: ON' : 'Labels: OFF'}
        </button>
      </div>

      {/* 3D Interactive Hotspot Selection Pills */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 flex-wrap justify-end">
        <span className="text-[10px] font-mono font-semibold text-slate-400 mr-1 hidden sm:inline">
          INSPECT:
        </span>
        <button
          onClick={() => setInspectedPart(inspectedPart === 'HEATER' ? null : 'HEATER')}
          className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 shadow-md backdrop-blur-md ${
            inspectedPart === 'HEATER'
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-slate-900/90 text-amber-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Heater
        </button>

        <button
          onClick={() => setInspectedPart(inspectedPart === 'COOLING_JACKET' ? null : 'COOLING_JACKET')}
          className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 shadow-md backdrop-blur-md ${
            inspectedPart === 'COOLING_JACKET'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900/90 text-cyan-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          Cooler
        </button>

        <button
          onClick={() => setInspectedPart(inspectedPart === 'ROD' ? null : 'ROD')}
          className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 shadow-md backdrop-blur-md ${
            inspectedPart === 'ROD'
              ? 'bg-indigo-500 text-slate-950 border-indigo-400'
              : 'bg-slate-900/90 text-indigo-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Rod
        </button>

        <button
          onClick={() => setInspectedPart(inspectedPart === 'THERMOCOUPLES' ? null : 'THERMOCOUPLES')}
          className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 shadow-md backdrop-blur-md ${
            inspectedPart === 'THERMOCOUPLES'
              ? 'bg-rose-500 text-slate-950 border-rose-400'
              : 'bg-slate-900/90 text-rose-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          Sensors
        </button>

        <button
          onClick={() => setInspectedPart(inspectedPart === 'METERS' ? null : 'METERS')}
          className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 shadow-md backdrop-blur-md ${
            inspectedPart === 'METERS'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
              : 'bg-slate-900/90 text-emerald-300 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          Meters
        </button>
      </div>

      {/* Floating 3D Component Inspection HUD */}
      <Apparatus3DHUD />

      {/* Sensor Detail Inspection Card (Clicking any sensor displays ID, location, temperature) */}
      {selectedSensor && selectedSensorTemp !== null && (
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/95 border border-sky-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md text-slate-100 w-72 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-xs text-sky-300">
                {selectedSensor.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedSensor(null)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Position along rod (x):</span>
              <span className="font-bold text-slate-200">
                {selectedSensor.type === 'rod' 
                  ? `${(selectedSensor.positionX * 100).toFixed(0)} cm (${selectedSensor.positionX.toFixed(2)} m)` 
                  : 'Cooling Jacket Port'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sensor Role:</span>
              <span className="font-bold text-slate-200">
                {selectedSensor.type === 'rod' 
                  ? 'Rod Surface Thermocouple' 
                  : selectedSensor.type === 'water_in' 
                  ? 'Water Inlet Temp (T8)' 
                  : 'Water Outlet Temp (T9)'}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-xs">
              <span className="text-slate-300">Live Reading:</span>
              <span className="font-extrabold text-amber-400">{selectedSensorTemp.toFixed(2)} °C</span>
            </div>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1.8, 5.2], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#090d16']} />
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.65} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow shadow-mapSize={1024} />
        <pointLight position={[-3, 2, 2]} intensity={0.8} color="#ffaa55" />
        <pointLight position={[3, -2, 2]} intensity={0.6} color="#55aaff" />

        <Suspense fallback={null}>
          {/* Realistic Laboratory Slate Table & Heavy Mounting Clamps */}
          <LabBench3D />

          {/* 3D Component Annotations & Leader Labels */}
          <ApparatusLabels3D visible={show3DLabels} />

          <group position={[0, 0, 0]}>
            {/* Metallic Rod with dynamic thermal vertex colors */}
            <group onClick={(e) => { e.stopPropagation(); setInspectedPart('ROD'); }}>
              <MetallicRod3D
                materialProps={simState.material}
                simState={simState}
                viewMode={viewMode}
              />
            </group>

            {/* Electrical Heater Section */}
            <group onClick={(e) => { e.stopPropagation(); setInspectedPart('HEATER'); }}>
              <Heater3D
                powerWatts={simState.power}
                voltage={simState.voltage}
                position={[-2.3, 0, 0]}
              />
            </group>

            {/* Insulation Casing Shell */}
            <InsulationShell3D
              viewMode={viewMode}
            />

            {/* Cooling Water Jacket & Flowmeter */}
            <group onClick={(e) => { e.stopPropagation(); setInspectedPart('COOLING_JACKET'); }}>
              <CoolingJacket3D
                flowRateLmin={simState.waterFlowLmin}
                t8={simState.sensors.t8}
                t9={simState.sensors.t9}
                position={[1.8, 0, 0]}
              />
              <Rotameter3D
                flowRateLmin={simState.waterFlowLmin}
                position={[1.8, -1.6, 0]}
              />
            </group>

            {/* Digital Electrical Instruments */}
            <group onClick={(e) => { e.stopPropagation(); setInspectedPart('METERS'); }}>
              <Meters3D
                voltage={simState.voltage}
                current={simState.current}
                power={simState.power}
                position={[-2.3, 1.4, 0]}
              />
            </group>

            {/* T1-T9 Sensors */}
            <group onClick={(e) => { e.stopPropagation(); setInspectedPart('THERMOCOUPLES'); }}>
              <Sensors3D
                simState={simState}
                selectedSensorId={selectedSensorId}
                onSelectSensor={setSelectedSensor}
              />
            </group>
          </group>

          {/* Laboratory Bench Shadow Plane */}
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.6}
            scale={12}
            blur={2}
            far={4}
          />
        </Suspense>

        {/* Orbit Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2.5}
          maxDistance={9.0}
        />
      </Canvas>
    </div>
  );
};
