'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface Heater3DProps {
  powerWatts: number;
  voltage: number;
  position?: [number, number, number];
}

export const Heater3D: React.FC<Heater3DProps> = ({
  powerWatts: propPower,
  voltage: propVoltage,
  position = [-2.3, 0, 0]
}) => {
  const coilMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const heaterLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    // Read live physics state directly to guarantee instant 0-latency coupling
    const liveSim = usePhysicsStore.getState().simState;
    const power = liveSim ? liveSim.power : propPower;

    const isHeating = power > 0.05;
    // Max rated power is ~9.6W (12V on 15 ohms), normalized up to 10W
    const normPower = Math.min(1.0, Math.max(0.0, power / 10.0));

    if (coilMaterialRef.current) {
      if (!isHeating) {
        // Power = 0 W: Completely inactive / cold nichrome wire
        coilMaterialRef.current.color = new THREE.Color('#27272a');
        coilMaterialRef.current.emissive = new THREE.Color('#000000');
        coilMaterialRef.current.emissiveIntensity = 0.0;
        coilMaterialRef.current.roughness = 0.45;
        coilMaterialRef.current.metalness = 0.85;
      } else {
        // Power > 0 W: Dynamically shifts from dull red -> bright glowing orange -> incandescent gold
        const time = state.clock.elapsedTime;
        // Subtle electrical incandescence micro-flicker
        const shimmer = 1.0 + Math.sin(time * 12.0) * 0.035 * normPower;

        const coldRed = new THREE.Color('#991b1b');
        const fieryOrange = new THREE.Color('#ea580c');
        const hotGold = new THREE.Color('#facc15');

        let coilColor: THREE.Color;
        let emissiveColor: THREE.Color;

        if (normPower < 0.5) {
          const factor = normPower / 0.5;
          coilColor = coldRed.clone().lerp(fieryOrange, factor);
          emissiveColor = coldRed.clone().lerp(new THREE.Color('#dc2626'), factor);
        } else {
          const factor = (normPower - 0.5) / 0.5;
          coilColor = fieryOrange.clone().lerp(hotGold, factor);
          emissiveColor = new THREE.Color('#dc2626').lerp(new THREE.Color('#f97316'), factor);
        }

        coilMaterialRef.current.color = coilColor;
        coilMaterialRef.current.emissive = emissiveColor;
        coilMaterialRef.current.emissiveIntensity = (0.4 + normPower * 3.6) * shimmer;
        coilMaterialRef.current.roughness = Math.max(0.1, 0.4 - normPower * 0.25);
        coilMaterialRef.current.metalness = 0.5;
      }
    }

    if (heaterLightRef.current) {
      if (!isHeating) {
        heaterLightRef.current.intensity = 0;
      } else {
        heaterLightRef.current.intensity = normPower * 3.5;
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer Ceramic Heater Insulation Casing (Cylinder along X axis) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.6, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Ceramic Core Insulation Lining */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 0.58, 32, 1, true]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* Heating Element Coil Rings (3 parallel nichrome bands) */}
      {[-0.15, 0.0, 0.15].map((xOffset, idx) => (
        <mesh key={idx} position={[xOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.31, 0.035, 16, 32]} />
          <meshStandardMaterial
            ref={idx === 1 ? coilMaterialRef : undefined}
            color="#27272a"
            emissive="#000000"
            emissiveIntensity={0}
            roughness={0.45}
            metalness={0.85}
          />
        </mesh>
      ))}

      {/* Internal Point Light casting real dynamic thermal glow onto rod and casing */}
      <pointLight
        ref={heaterLightRef}
        position={[0, 0, 0]}
        color="#ff5500"
        intensity={0}
        distance={2.5}
        decay={2}
      />

      {/* Electrical Terminal Binding Posts (+ / -) */}
      <mesh position={[-0.1, 0.45, 0.15]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
        <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.1, 0.45, -0.15]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
};
