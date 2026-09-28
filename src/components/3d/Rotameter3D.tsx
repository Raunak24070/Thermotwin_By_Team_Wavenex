
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface Rotameter3DProps {
  flowRateLmin: number;
  position?: [number, number, number];
}

export const Rotameter3D: React.FC<Rotameter3DProps> = ({
  flowRateLmin: propFlow,
  position = [1.8, -1.6, 0]
}) => {
  const floatRef = useRef<THREE.Mesh>(null);
  const waterColumnRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Read live flow rate from store directly
    const liveSim = usePhysicsStore.getState().simState;
    const flow = liveSim ? liveSim.waterFlowLmin : propFlow;

    const normFlow = Math.min(1.0, Math.max(0.0, flow / 3.0));
    
    // Float bob height: at 0 L/min Y = -0.34, at 3 L/min Y = +0.36
    const baseY = -0.34 + normFlow * 0.70;
    
    // Physical hydro-eddy float flutter/oscillation when water is passing through
    const time = state.clock.elapsedTime;
    const flutter = normFlow > 0.02 ? Math.sin(time * 14.0) * 0.007 * normFlow : 0;
    const targetY = baseY + flutter;

    if (floatRef.current) {
      floatRef.current.position.y = THREE.MathUtils.lerp(floatRef.current.position.y, targetY, 0.12);
    }

    // Dynamic water column inside the glass tube
    if (waterColumnRef.current) {
      if (normFlow <= 0.01) {
        waterColumnRef.current.visible = false;
      } else {
        waterColumnRef.current.visible = true;
        // Scale water column height to match float position
        const waterHeight = Math.max(0.05, 0.45 + (floatRef.current?.position.y ?? targetY));
        waterColumnRef.current.scale.y = waterHeight / 0.9;
        waterColumnRef.current.position.y = -0.45 + waterHeight / 2;
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer Tapered Borosilicate Glass Meter Tube */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.08, 0.92, 24]} />
        <meshStandardMaterial
          color="#f8fafc"
          transparent
          opacity={0.32}
          roughness={0.08}
          metalness={0.15}
        />
      </mesh>

      {/* Internal Flowing Water Column */}
      <mesh ref={waterColumnRef} position={[0, -0.45, 0]} visible={false}>
        <cylinderGeometry args={[0.11, 0.07, 0.9, 20]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.35}
          roughness={0.2}
        />
      </mesh>

      {/* Graduated Calibrated Scale Rings (0.5, 1.0, 1.5, 2.0, 2.5, 3.0 L/min) */}
      {[-0.30, -0.16, -0.02, 0.12, 0.24, 0.36].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.075, 0.095, 20]} />
          <meshBasicMaterial color="#94a3b8" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Moving Precision Rotameter Float Bob (Anodized Red Aluminium Cone) */}
      <mesh ref={floatRef} position={[0, -0.34, 0]}>
        <coneGeometry args={[0.055, 0.1, 20]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#991b1b"
          emissiveIntensity={0.25}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Heavy Brass Meter Fittings (Top Inflow & Bottom Outflow Ports) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.25} />
      </mesh>

      {/* Connection Flange Bolts */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.11, 0.5, Math.sin(angle) * 0.11]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};
