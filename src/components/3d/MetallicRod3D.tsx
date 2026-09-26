'use client';

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

// Multi-stop scientific thermography color spectrum
// Accurately calibrated to the experimental range: 20°C (ambient) to 70°C+ (heater maximum)
function getThermalColor(tempC: number): THREE.Color {
  const t = Math.max(20.0, Math.min(75.0, tempC));
  
  // Color stops: [temp, hex]
  // 20°C: Deep Cool Blue (#1e40af)
  // 28°C: Cyan (#06b6d4)
  // 36°C: Green (#10b981)
  // 46°C: Yellow (#eab308)
  // 58°C: Warm Orange (#f97316)
  // 70°C: Radiant Crimson Red (#dc2626)
  if (t <= 28.0) {
    const factor = (t - 20.0) / 8.0;
    return new THREE.Color('#1e40af').lerp(new THREE.Color('#06b6d4'), factor);
  } else if (t <= 36.0) {
    const factor = (t - 28.0) / 8.0;
    return new THREE.Color('#06b6d4').lerp(new THREE.Color('#10b981'), factor);
  } else if (t <= 46.0) {
    const factor = (t - 36.0) / 10.0;
    return new THREE.Color('#10b981').lerp(new THREE.Color('#eab308'), factor);
  } else if (t <= 58.0) {
    const factor = (t - 46.0) / 12.0;
    return new THREE.Color('#eab308').lerp(new THREE.Color('#f97316'), factor);
  } else {
    const factor = Math.min(1.0, (t - 58.0) / 12.0);
    return new THREE.Color('#f97316').lerp(new THREE.Color('#dc2626'), factor);
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
  const rodMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const hotEndLightRef = useRef<THREE.PointLight>(null);

  // Build discretized cylinder geometry along X-axis
  const { geometry } = useMemo(() => {
    const radialSegments = 32;
    const heightSegments = 80; // High resolution along length for silky smooth gradient
    
    // Create cylinder along Y axis first, then rotate to X axis
    const geom = new THREE.CylinderGeometry(rodRadius, rodRadius, rodLength, radialSegments, heightSegments);
    geom.rotateZ(-Math.PI / 2); // Orient along X-axis: -L/2 (left, heater) to +L/2 (right, cooler)

    const count = geom.attributes.position.count;
    const colors = new Float32Array(count * 3);
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return { geometry: geom };
  }, [rodLength, rodRadius]);

  // Dynamic vertex color and emissive update every animation frame (60 FPS)
  useFrame(() => {
    if (!geometry || !meshRef.current) return;
    
    // Always read live physics simulation state directly from store to guarantee 0 latency
    const liveSimState = usePhysicsStore.getState().simState || propSimState;
    const temps = liveSimState.temperatures;
    const nodeCount = temps.length;
    if (!temps || nodeCount === 0) return;

    const posAttr = geometry.attributes.position;
    const colorAttr = geometry.attributes.color;
    const count = posAttr.count;

    const baseMetalColor = new THREE.Color(materialProps.colorHex);
    const hotEndTemp = temps[0] || 20.0;

    // Update dynamic hot-end radiative point light
    if (hotEndLightRef.current) {
      const heatFactor = Math.max(0, Math.min(1.0, (hotEndTemp - 20.0) / 40.0));
      hotEndLightRef.current.intensity = heatFactor * 2.2;
    }

    for (let i = 0; i < count; i++) {
      const xPos = posAttr.getX(i); // Ranges from -rodLength/2 (-2.0) to +rodLength/2 (+2.0)
      
      // Continuous spatial temperature interpolation:
      // In 3D space: x = -1.6 is physical x = 0.0m (heater junction)
      //              x = +1.6 is physical x = 0.50m (cooling jacket junction)
      const xClamped = Math.max(-1.6, Math.min(1.6, xPos));
      const normPhysicalX = (xClamped + 1.6) / 3.2; // 0.0 (left/hot) to 1.0 (right/cold)
      
      // Continuous interpolation between 50 discrete solver nodes
      const floatNodeIndex = normPhysicalX * (nodeCount - 1);
      const lowerNode = Math.floor(floatNodeIndex);
      const upperNode = Math.min(nodeCount - 1, Math.ceil(floatNodeIndex));
      const frac = floatNodeIndex - lowerNode;
      
      const tLower = temps[lowerNode] !== undefined ? temps[lowerNode] : 20.0;
      const tUpper = temps[upperNode] !== undefined ? temps[upperNode] : 20.0;
      const tempC = tLower * (1 - frac) + tUpper * frac;

      let vertexColor: THREE.Color;
      if (viewMode === 'thermal') {
        // Pure false-color scientific thermography mapping
        vertexColor = getThermalColor(tempC);
      } else {
        // Authentic metal surface with vivid live thermal heat temper coloration & incandescence
        const thermalRamp = getThermalColor(tempC);
        const heatWeight = Math.max(0.0, Math.min(1.0, (tempC - 20.0) / 45.0)); // 0 at 20°C, 1 at 65°C+
        
        if (heatWeight <= 0.01) {
          // Cold resting metal
          vertexColor = baseMetalColor;
        } else {
          // Heat temper blend: metal retains metallic highlights while visibly heating up
          vertexColor = baseMetalColor.clone().lerp(thermalRamp, heatWeight * 0.72);
        }
      }

      colorAttr.setXYZ(i, vertexColor.r, vertexColor.g, vertexColor.b);
    }
    
    colorAttr.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]} castShadow receiveShadow>
        {viewMode === 'thermal' ? (
          <meshStandardMaterial
            ref={rodMaterialRef}
            vertexColors
            roughness={0.25}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial
            ref={rodMaterialRef}
            vertexColors
            roughness={materialProps.roughness}
            metalness={materialProps.metalness}
          />
        )}
      </mesh>

      {/* Dynamic thermal radiative point light near the heated junction */}
      <pointLight
        ref={hotEndLightRef}
        position={[-1.6, 0.45, 0.2]}
        color="#ff5500"
        intensity={0}
        distance={2.5}
        decay={2}
      />
    </group>
  );
};
