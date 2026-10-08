
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface HeatFlowParticles3DProps {
  visible?: boolean;
}

export const HeatFlowParticles3D: React.FC<HeatFlowParticles3DProps> = ({ visible = true }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const arrowsGroupRef = useRef<THREE.Group>(null);
  const pCount = 140;

  // Initialize particle positions along rod length (x: -1.6 to +1.6)
  const { initialProgress, initialOffsets } = useMemo(() => {
    const progress = new Float32Array(pCount);
    const offsets = new Float32Array(pCount * 2); // radial angle & radius

    for (let i = 0; i < pCount; i++) {
      progress[i] = Math.random(); // 0.0 (heater) to 1.0 (cooler)
      offsets[i * 2] = Math.random() * Math.PI * 2; // angle around rod
      offsets[i * 2 + 1] = 0.27 + Math.random() * 0.06; // radius slightly above rod surface
    }
    return { initialProgress: progress, initialOffsets: offsets };
  }, [pCount]);

  const progressRef = useRef<Float32Array>(initialProgress);

  // Position and Color Buffers
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(pCount * 3);
    const col = new Float32Array(pCount * 3);
    return { positions: pos, colors: col };
  }, [pCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !visible) return;

    const liveSim = usePhysicsStore.getState().simState;
    const power = liveSim ? liveSim.power : 0;
    const heatFlux = liveSim ? Math.max(0.1, liveSim.heatInput) : 0.1;
    const isHeating = power > 0.05 || (liveSim && liveSim.sensors.t1 > 22.0);

    if (!isHeating) {
      pointsRef.current.visible = false;
      if (arrowsGroupRef.current) arrowsGroupRef.current.visible = false;
      return;
    }

    pointsRef.current.visible = true;
    if (arrowsGroupRef.current) arrowsGroupRef.current.visible = true;

    // Velocity strictly scales with heat flow magnitude Q = V × I
    const normPower = Math.min(1.0, Math.max(0.1, heatFlux / 9.6));
    const speed = (0.28 + normPower * 1.35) * delta;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;
    const prog = progressRef.current;

    for (let i = 0; i < pCount; i++) {
      // Advance particle along heat conduction vector (Heater -> Cooler)
      prog[i] += speed * (0.85 + (i % 5) * 0.08);
      if (prog[i] > 1.0) {
        prog[i] -= 1.0;
      }

      const p = prog[i];
      // Physical rod mapping: -1.6 (heater) to +1.6 (cooler)
      const x = -1.6 + p * 3.2;
      const angle = initialOffsets[i * 2] + p * 1.8;
      const r = initialOffsets[i * 2 + 1];

      posArr[i * 3]     = x;
      posArr[i * 3 + 1] = Math.sin(angle) * r;
      posArr[i * 3 + 2] = Math.cos(angle) * r;

      // Scientific thermal color spectrum:
      // p = 0.0: Hot Red (#EF4444)
      // p = 0.35: Fiery Orange (#FF6B35)
      // p = 0.65: Warm Amber (#F59E0B)
      // p = 0.85: Cool Cyan (#38BDF8)
      // p = 1.0: Cold Blue (#2563EB)
      if (p < 0.25) {
        colArr[i * 3]     = 0.94; // R
        colArr[i * 3 + 1] = 0.27; // G
        colArr[i * 3 + 2] = 0.27; // B (#EF4444)
      } else if (p < 0.55) {
        colArr[i * 3]     = 1.0;  // R
        colArr[i * 3 + 1] = 0.42; // G
        colArr[i * 3 + 2] = 0.21; // B (#FF6B35)
      } else if (p < 0.8) {
        colArr[i * 3]     = 0.96; // R
        colArr[i * 3 + 1] = 0.62; // G
        colArr[i * 3 + 2] = 0.04; // B (#F59E0B)
      } else {
        colArr[i * 3]     = 0.15; // R
        colArr[i * 3 + 1] = 0.55; // G
        colArr[i * 3 + 2] = 0.95; // B (#2563EB / #38BDF8)
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Pulse directional arrow indicators
    if (arrowsGroupRef.current) {
      const arrowTime = state.clock.elapsedTime * (1.5 + normPower * 3.0);
      arrowsGroupRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (mat) {
          const pulse = (Math.sin(arrowTime + idx * 1.2) + 1) * 0.5;
          mat.opacity = 0.3 + pulse * 0.6;
        }
      });
    }
  });

  // 5 Subtle directional chevron arrows spaced along the rod axis pointing Heater -> Cooler (+X)
  const arrowXPositions = [-1.1, -0.5, 0.0, 0.5, 1.1];

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Directional Chevron Arrows along Conduction Vector */}
      <group ref={arrowsGroupRef}>
        {arrowXPositions.map((x, idx) => (
          <group key={`arrow-${idx}`} position={[x, 0.42, 0]}>
            {/* Small Glowing Directional Cone pointing +X */}
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.04, 0.10, 16]} />
              <meshBasicMaterial 
                color={x < 0 ? '#ff6b35' : '#38bdf8'} 
                transparent 
                opacity={0.7} 
              />
            </mesh>
            <mesh position={[-0.07, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
              <meshBasicMaterial 
                color={x < 0 ? '#ff6b35' : '#38bdf8'} 
                transparent 
                opacity={0.6} 
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
