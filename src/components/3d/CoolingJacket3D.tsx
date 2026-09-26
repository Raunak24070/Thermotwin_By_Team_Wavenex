'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface CoolingJacket3DProps {
  flowRateLmin: number;
  t8?: number;
  t9?: number;
  position?: [number, number, number];
}

export const CoolingJacket3D: React.FC<CoolingJacket3DProps> = ({
  flowRateLmin: propFlow,
  t8: propT8 = 20.0,
  t9: propT9 = 20.0,
  position = [1.8, 0, 0]
}) => {
  const waterFlowMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const jacketGlassMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const outletPipeMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Read live physics state directly to guarantee instant synchronization
    const liveSim = usePhysicsStore.getState().simState;
    const flow = liveSim ? liveSim.waterFlowLmin : propFlow;
    const t8 = liveSim ? liveSim.sensors.t8 : propT8;
    const t9 = liveSim ? liveSim.sensors.t9 : propT9;

    const isActiveFlow = flow > 0.02;
    const normFlow = Math.min(1.0, Math.max(0.0, flow / 3.0));

    // 1. Particle animation: speed strictly scales with flow rate; stops completely at 0
    if (particleGroupRef.current) {
      if (isActiveFlow) {
        particleGroupRef.current.rotation.x += delta * (flow * 3.2);
        particleGroupRef.current.visible = true;
      } else {
        particleGroupRef.current.visible = false;
      }
    }

    // 2. Water Stream Material Opacity & Turbidity
    if (waterFlowMaterialRef.current) {
      if (!isActiveFlow) {
        waterFlowMaterialRef.current.opacity = 0.0;
      } else {
        waterFlowMaterialRef.current.opacity = 0.35 + normFlow * 0.45;
        waterFlowMaterialRef.current.emissiveIntensity = 0.3 + normFlow * 0.5;
      }
    }

    // 3. Jacket outer cylinder appearance (drained vs active water-filled)
    if (jacketGlassMaterialRef.current) {
      if (!isActiveFlow) {
        // Dry empty glass/acrylic jacket
        jacketGlassMaterialRef.current.color = new THREE.Color('#64748b');
        jacketGlassMaterialRef.current.opacity = 0.25;
      } else {
        // Filled with circulating coolant
        jacketGlassMaterialRef.current.color = new THREE.Color('#0284c7');
        jacketGlassMaterialRef.current.opacity = 0.45 + normFlow * 0.25;
      }
    }

    // 4. Differential Thermal Coloration: Inlet (T8) vs Outlet (T9)
    // Delta T = T9 - T8 (heat carried away by cooling water)
    if (outletPipeMaterialRef.current) {
      const deltaT = Math.max(0.0, t9 - t8);
      // Normalized temperature rise (0°C to ~8°C max rise in standard experiment)
      const normDeltaT = Math.min(1.0, deltaT / 8.0);

      const coldWaterBlue = new THREE.Color('#0284c7'); // 20°C
      const warmTeal = new THREE.Color('#0d9488');       // ~23°C
      const heatedAmber = new THREE.Color('#d97706');    // ~28°C+

      let outletColor: THREE.Color;
      if (normDeltaT < 0.5) {
        outletColor = coldWaterBlue.clone().lerp(warmTeal, normDeltaT * 2.0);
      } else {
        outletColor = warmTeal.clone().lerp(heatedAmber, (normDeltaT - 0.5) * 2.0);
      }

      outletPipeMaterialRef.current.color = outletColor;
      outletPipeMaterialRef.current.emissive = outletColor;
      outletPipeMaterialRef.current.emissiveIntensity = isActiveFlow ? 0.2 + normDeltaT * 0.5 : 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Outer Cooling Jacket Transparent Blue Housing */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.8, 32]} />
        <meshStandardMaterial
          ref={jacketGlassMaterialRef}
          color="#64748b"
          transparent
          opacity={0.25}
          roughness={0.15}
          metalness={0.7}
        />
      </mesh>

      {/* Internal Rod Interface Seal Collars */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.25, 0.48, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ringGeometry args={[0.25, 0.48, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Water Inlet Pipe (Bottom / T8 - Cool Water Inflow) */}
      <group position={[0, -0.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0284c7"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Hose Connector Barb */}
        <mesh position={[0, -0.3, 0]}>
          <torusGeometry args={[0.09, 0.02, 12, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Water Outlet Pipe (Top / T9 - Warm Water Outflow with Live Delta T) */}
      <group position={[0, 0.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial
            ref={outletPipeMaterialRef}
            color="#0284c7"
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Hose Connector Barb */}
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.09, 0.02, 12, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Internal Swirling Water Stream Particle Rings */}
      <group ref={particleGroupRef} visible={false}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r = 0.36;
          const xOffset = ((i % 3) - 1) * 0.2;
          return (
            <mesh key={i} position={[xOffset, Math.sin(angle) * r, Math.cos(angle) * r]}>
              <sphereGeometry args={[0.038, 12, 12]} />
              <meshStandardMaterial
                ref={i === 0 ? waterFlowMaterialRef : undefined}
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.4}
                transparent
                opacity={0.65}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};
