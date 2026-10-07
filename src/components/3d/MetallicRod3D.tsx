
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

// Multi-stop scientific thermal spectrum:
// 20°C: Cool Blue (#2563EB)
// 30°C: Cool Cyan (#38BDF8)
// 45°C: Warm Yellow (#F59E0B)
// 60°C: Fiery Orange (#FF6B35)
// 75°C+: Hot Red (#EF4444)
function getThermalSpectrumColor(tempC: number): THREE.Color {
  const t = Math.max(20.0, Math.min(80.0, tempC));

  if (t <= 20.2) {
    return new THREE.Color('#2563EB');
  } else if (t <= 30.0) {
    const factor = (t - 20.0) / 10.0;
    return new THREE.Color('#2563EB').lerp(new THREE.Color('#38BDF8'), factor);
  } else if (t <= 45.0) {
    const factor = (t - 30.0) / 15.0;
    return new THREE.Color('#38BDF8').lerp(new THREE.Color('#F59E0B'), factor);
  } else if (t <= 60.0) {
    const factor = (t - 45.0) / 15.0;
    return new THREE.Color('#F59E0B').lerp(new THREE.Color('#FF6B35'), factor);
  } else {
    const factor = Math.min(1.0, (t - 60.0) / 20.0);
    return new THREE.Color('#FF6B35').lerp(new THREE.Color('#EF4444'), factor);
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
        // Pure false-color thermography: Blue (20°C) -> Cyan -> Green -> Yellow -> Orange -> Red (70°C+)
        vertexColor = getThermalSpectrumColor(tempC);
      } else {
        // Normal & Cutaway Modes:
        // Visible physical heat conduction front!
        // Cold regions (20°C) show clear cool state, heating regions transition through thermal temper colors
        const thermalSpectrum = getThermalSpectrumColor(tempC);
        const heatRatio = Math.max(0.0, Math.min(1.0, (tempC - 20.0) / 45.0)); // 0 at 20°C, 1 at 65°C+
        
        if (heatRatio <= 0.02) {
          // Cold resting rod: deep cool blue-tinted metal surface
          vertexColor = baseMetalColor.clone().lerp(new THREE.Color('#1e3a8a'), 0.55);
        } else {
          // Active heat propagation: thermal spectrum visibly dominates while preserving metallic highlights
          vertexColor = baseMetalColor.clone().lerp(thermalSpectrum, 0.35 + heatRatio * 0.65);
        }
      }

      colorAttr.setXYZ(i, vertexColor.r, vertexColor.g, vertexColor.b);
    }
    
    colorAttr.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={viewMode === 'thermal' ? 0.2 : materialProps.roughness * 0.6}
          metalness={viewMode === 'thermal' ? 0.05 : materialProps.metalness * 0.5}
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
