
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { MaterialProperties, SimulationState } from '@/physics/types';
import { usePhysicsStore, ViewMode } from '@/store/usePhysicsStore';

interface MetallicRod3DProps {
  materialProps: MaterialProperties;
  simState: SimulationState;
  viewMode: ViewMode;
  rodLength?: number;
  rodRadius?: number;
}

// Multi-stop scientific thermal spectrum adhering to specification:
// COLD:     #2563EB (20°C)
// COOL:     #38BDF8 (~35°C)
// WARM:     #F59E0B (~55°C)
// HOT:      #FF6B35 (~75°C)
// VERY HOT: #EF4444 (~100°C+)
export function getThermalSpectrumColor(tempC: number, minT: number = 20.0, maxT: number = 95.0): THREE.Color {
  const t = Math.max(minT, Math.min(maxT, tempC));
  const span = Math.max(5.0, maxT - minT);
  const norm = (t - minT) / span; // 0.0 to 1.0

  const cCold    = new THREE.Color('#2563EB');
  const cCool    = new THREE.Color('#38BDF8');
  const cWarm    = new THREE.Color('#F59E0B');
  const cHot     = new THREE.Color('#FF6B35');
  const cVeryHot = new THREE.Color('#EF4444');

  if (norm <= 0.25) {
    return cCold.lerp(cCool, norm / 0.25);
  } else if (norm <= 0.50) {
    return cCool.lerp(cWarm, (norm - 0.25) / 0.25);
  } else if (norm <= 0.75) {
    return cWarm.lerp(cHot, (norm - 0.50) / 0.25);
  } else {
    return cHot.lerp(cVeryHot, (norm - 0.75) / 0.25);
  }
}

export const MetallicRod3D: React.FC<MetallicRod3DProps> = ({
  materialProps,
  simState: propSimState,
  viewMode,
  rodLength = 4.0,
  rodRadius = 0.25
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const hotEndLightRef = useRef<THREE.PointLight>(null);
  const midRodLightRef = useRef<THREE.PointLight>(null);

  // High-resolution cylinder geometry with 100 height segments along X axis
  // Enables a continuous, seamless heat-propagation wave front
  const { geometry } = useMemo(() => {
    const radialSegments = 32;
    const heightSegments = 100;
    
    const geom = new THREE.CylinderGeometry(rodRadius, rodRadius, rodLength, radialSegments, heightSegments);
    geom.rotateZ(-Math.PI / 2); // Orient along X-axis: -rodLength/2 (left, heater) to +rodLength/2 (right, cooler)

    const count = geom.attributes.position.count;
    const colors = new Float32Array(count * 3);
    
    // Initialize with resting cold ambient blue (20.0°C)
    const initialColdColor = new THREE.Color('#1e3a8a');
    for (let i = 0; i < count; i++) {
      colors[i * 3]     = initialColdColor.r;
      colors[i * 3 + 1] = initialColdColor.g;
      colors[i * 3 + 2] = initialColdColor.b;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return { geometry: geom };
  }, [rodLength, rodRadius]);

  // 60 FPS live physics coupling: updates vertex colors strictly from solver node temperatures
  useFrame(() => {
    if (!geometry || !meshRef.current) return;
    
    const liveSimState = usePhysicsStore.getState().simState || propSimState;
    const temps = liveSimState.temperatures;
    const nodeCount = temps.length;
    if (!temps || nodeCount === 0) return;

    const posAttr = geometry.attributes.position;
    const colorAttr = geometry.attributes.color;
    const count = posAttr.count;

    const hotEndTemp = temps[0] || 20.0;
    const midTemp = temps[Math.floor(nodeCount / 2)] || 20.0;
    const maxT = Math.max(70.0, ...temps);
    const minT = Math.min(20.0, ...temps);

    // Radiative point lights illuminating the apparatus proportionally to actual thermal state
    if (hotEndLightRef.current) {
      const heatFactor = Math.max(0, Math.min(1.0, (hotEndTemp - 22.0) / 40.0));
      hotEndLightRef.current.intensity = heatFactor * 3.5;
    }
    if (midRodLightRef.current) {
      const midHeatFactor = Math.max(0, Math.min(1.0, (midTemp - 25.0) / 35.0));
      midRodLightRef.current.intensity = midHeatFactor * 1.8;
    }

    const isThermalOrHeatFlow = viewMode === 'thermal' || viewMode === 'heatflow';
    const isSensorMode = viewMode === 'sensor';
    const baseMetalColor = new THREE.Color(materialProps.colorHex);

    for (let i = 0; i < count; i++) {
      const xPos = posAttr.getX(i); // Ranges from -rodLength/2 (-2.0) to +rodLength/2 (+2.0)
      
      // Physical rod mapping:
      // x = -1.6 in 3D is physical x = 0.0m (heater junction)
      // x = +1.6 in 3D is physical x = 0.50m (cooling jacket junction)
      const xClamped = Math.max(-1.6, Math.min(1.6, xPos));
      const normPhysicalX = (xClamped + 1.6) / 3.2; // 0.0 (heater) to 1.0 (cooler)
      
      // Interpolate between discrete solver nodes (50 finite difference nodes)
      const floatNodeIndex = normPhysicalX * (nodeCount - 1);
      const lowerNode = Math.floor(floatNodeIndex);
      const upperNode = Math.min(nodeCount - 1, Math.ceil(floatNodeIndex));
      const frac = floatNodeIndex - lowerNode;
      
      const tLower = temps[lowerNode] !== undefined ? temps[lowerNode] : 20.0;
      const tUpper = temps[upperNode] !== undefined ? temps[upperNode] : 20.0;
      const tempC = tLower * (1 - frac) + tUpper * frac;

      let vertexColor: THREE.Color;
      
      if (isThermalOrHeatFlow) {
        // Continuous scientific thermography: Cold (#2563EB) -> Cool (#38BDF8) -> Warm (#F59E0B) -> Hot (#FF6B35) -> Very Hot (#EF4444)
        vertexColor = getThermalSpectrumColor(tempC, minT, maxT);
      } else if (isSensorMode) {
        // Sensor Mode: Dim apparatus slightly to make thermocouples the hero
        const baseCold = baseMetalColor.clone().multiplyScalar(0.35);
        const thermalSpectrum = getThermalSpectrumColor(tempC, minT, maxT);
        vertexColor = baseCold.lerp(thermalSpectrum, 0.25);
      } else {
        // Normal, Cutaway, Exploded, Cooler, Heater Modes:
        // Visible physical heat conduction front!
        const thermalSpectrum = getThermalSpectrumColor(tempC, minT, maxT);
        const heatRatio = Math.max(0.0, Math.min(1.0, (tempC - 20.0) / 45.0)); // 0 at 20°C, 1 at 65°C+
        
        if (heatRatio <= 0.02) {
          // Cold resting rod: deep cool blue-tinted metal surface
          vertexColor = baseMetalColor.clone().lerp(new THREE.Color('#1e3a8a'), 0.45);
        } else {
          // Active heat propagation: thermal spectrum visibly dominates while preserving metallic highlights
          vertexColor = baseMetalColor.clone().lerp(thermalSpectrum, 0.35 + heatRatio * 0.65);
        }
      }

      colorAttr.setXYZ(i, vertexColor.r, vertexColor.g, vertexColor.b);
    }
    
    colorAttr.needsUpdate = true;
  });

  const isSensorDimmed = viewMode === 'sensor';

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={viewMode === 'thermal' ? 0.2 : isSensorDimmed ? 0.8 : materialProps.roughness * 0.6}
          metalness={viewMode === 'thermal' ? 0.05 : isSensorDimmed ? 0.1 : materialProps.metalness * 0.5}
        />
      </mesh>

      {/* Dynamic thermal point lights illuminating the rod and bench as heat propagates */}
      <pointLight
        ref={hotEndLightRef}
        position={[-1.6, 0.45, 0.3]}
        color="#ff4400"
        intensity={0}
        distance={3.0}
        decay={2}
      />
      <pointLight
        ref={midRodLightRef}
        position={[0, 0.45, 0.3]}
        color="#ffaa00"
        intensity={0}
        distance={2.5}
        decay={2}
      />
    </group>
  );
};
