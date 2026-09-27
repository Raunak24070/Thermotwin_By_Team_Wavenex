'use client';

import React, { useRef, useMemo } from 'react';
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
  const jacketGlassMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const outletPipeMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const waterFlowPointsRef = useRef<THREE.Points>(null);

  // Generate circulating water particles flowing from Inlet (Bottom T8) -> Swirling Jacket -> Outlet (Top T9)
  const { particlePositions, particleInitialProgress } = useMemo(() => {
    const count = 60;
    const positions = new Float32Array(count * 3);
    const progress = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      progress[i] = Math.random(); // 0.0 (inlet) to 1.0 (outlet)
      // Path calculation based on progress
      const p = progress[i];
      let x = (Math.random() - 0.5) * 0.35;
      let y = -0.65 + p * 1.30;
      let z = Math.sin(p * Math.PI * 3 + i) * 0.32;
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return { particlePositions: positions, particleInitialProgress: progress };
  }, []);

  const progressRef = useRef<Float32Array>(particleInitialProgress);

  useFrame((_, delta) => {
    const liveSim = usePhysicsStore.getState().simState;
    const flow = liveSim ? liveSim.waterFlowLmin : propFlow;
    const t8 = liveSim ? liveSim.sensors.t8 : propT8;
    const t9 = liveSim ? liveSim.sensors.t9 : propT9;

    const isActiveFlow = flow > 0.02;
    const normFlow = Math.min(1.0, Math.max(0.0, flow / 3.0));
    const deltaT = Math.max(0.0, t9 - t8);

    // 1. Water Particles Moving Upwards (T8 Inlet -> Jacket -> T9 Outlet)
    if (waterFlowPointsRef.current) {
      if (isActiveFlow) {
        waterFlowPointsRef.current.visible = true;
        const geom = waterFlowPointsRef.current.geometry;
        const posAttr = geom.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const progressArr = progressRef.current;
        const pCount = arr.length / 3;

        // Velocity strictly scales with rotameter flow rate
        const flowSpeed = (0.2 + normFlow * 1.4) * delta;

        for (let i = 0; i < pCount; i++) {
          progressArr[i] += flowSpeed;
          if (progressArr[i] > 1.0) {
            progressArr[i] -= 1.0;
          }

          const p = progressArr[i];
          // Spiral streamline trajectory around the metallic rod
          const spiralAngle = p * Math.PI * 4.0 + i;
          const radius = 0.32 + Math.sin(i * 1.5) * 0.06;

          arr[i * 3]     = (Math.sin(spiralAngle) * 0.25) + ((i % 5) - 2) * 0.04;
          arr[i * 3 + 1] = -0.65 + p * 1.30; // Flow direction: bottom (-0.65) to top (+0.65)
          arr[i * 3 + 2] = Math.cos(spiralAngle) * radius;
        }

        posAttr.needsUpdate = true;
      } else {
        waterFlowPointsRef.current.visible = false;
      }
    }

    // 2. Borosilicate Glass Jacket Visuals (Drained vs Active Flow)
    if (jacketGlassMaterialRef.current) {
      if (!isActiveFlow) {
        jacketGlassMaterialRef.current.color = new THREE.Color('#475569');
        jacketGlassMaterialRef.current.opacity = 0.22;
      } else {
        // Active water coolant stream
        jacketGlassMaterialRef.current.color = new THREE.Color('#0284c7');
        jacketGlassMaterialRef.current.opacity = 0.35 + normFlow * 0.35;
      }
    }

    // 3. Differential Thermal Coloration on Outlet Pipe (T9 responds to extracted heat ΔTw)
    if (outletPipeMaterialRef.current) {
      const normDeltaT = Math.min(1.0, deltaT / 6.0); // 0 to 6°C rise
      const coldWaterBlue = new THREE.Color('#0284c7');
      const warmTeal = new THREE.Color('#0d9488');
      const heatedAmber = new THREE.Color('#f59e0b');

      let outletColor: THREE.Color;
      if (normDeltaT < 0.5) {
        outletColor = coldWaterBlue.clone().lerp(warmTeal, normDeltaT * 2.0);
      } else {
        outletColor = warmTeal.clone().lerp(heatedAmber, (normDeltaT - 0.5) * 2.0);
      }

      outletPipeMaterialRef.current.color = outletColor;
      outletPipeMaterialRef.current.emissive = outletColor;
      outletPipeMaterialRef.current.emissiveIntensity = isActiveFlow ? (0.2 + normDeltaT * 0.5) : 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Outer Cooling Jacket Cylinder (Transparent Borosilicate Glass) */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.8, 32]} />
        <meshStandardMaterial
          ref={jacketGlassMaterialRef}
          color="#64748b"
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Internal Rod Interface Neoprene Gasket Seals */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.25, 0.48, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0.4, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ringGeometry args={[0.25, 0.48, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Circulating Water Stream Particles (Direction: T8 In -> Rod -> T9 Out) */}
      <points ref={waterFlowPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#38bdf8"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Water Inlet Pipe (Bottom / T8 - Cool Water Inflow) */}
      <group position={[0, -0.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.075, 0.075, 0.55, 16]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#0284c7"
            emissiveIntensity={0.25}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Hose Connector Barb */}
        <mesh position={[0, -0.28, 0]}>
          <torusGeometry args={[0.085, 0.02, 12, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Water Outlet Pipe (Top / T9 - Warm Water Outflow with Live Delta T) */}
      <group position={[0, 0.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.075, 0.075, 0.55, 16]} />
          <meshStandardMaterial
            ref={outletPipeMaterialRef}
            color="#0284c7"
            emissive="#0284c7"
            emissiveIntensity={0.25}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
        {/* Hose Connector Barb */}
        <mesh position={[0, 0.28, 0]}>
          <torusGeometry args={[0.085, 0.02, 12, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};
