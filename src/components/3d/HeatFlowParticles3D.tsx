'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface HeatFlowParticles3DProps {
  visible?: boolean;
}

export const HeatFlowParticles3D: React.FC<HeatFlowParticles3DProps> = ({ visible = true }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const pCount = 90;

  // Initialize particle positions along rod length (x: -1.6 to +1.6)
  const { initialProgress, initialOffsets } = useMemo(() => {
    const progress = new Float32Array(pCount);
    const offsets = new Float32Array(pCount * 2); // radial angle & radius

    for (let i = 0; i < pCount; i++) {
      progress[i] = Math.random(); // 0.0 (heater) to 1.0 (cooler)
      offsets[i * 2] = Math.random() * Math.PI * 2; // angle around rod
      offsets[i * 2 + 1] = 0.28 + Math.random() * 0.08; // radius slightly above rod surface
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

  useFrame((_, delta) => {
    if (!pointsRef.current || !visible) return;

    const liveSim = usePhysicsStore.getState().simState;
    const power = liveSim ? liveSim.power : 0;
    const isHeating = power > 0.05 || (liveSim && liveSim.sensors.t1 > 22.0);

    if (!isHeating) {
      pointsRef.current.visible = false;
      return;
    }

    pointsRef.current.visible = true;
    const normPower = Math.min(1.0, Math.max(0.1, power / 9.6));
    const speed = (0.35 + normPower * 1.1) * delta;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;
    const prog = progressRef.current;

    for (let i = 0; i < pCount; i++) {
      // Advance particle along heat conduction vector (Heater -> Cooler)
      prog[i] += speed * (0.8 + (i % 5) * 0.1);
      if (prog[i] > 1.0) {
        prog[i] -= 1.0;
      }

      const p = prog[i];
      // Physical rod mapping: -1.6 (heater) to +1.6 (cooler)
      const x = -1.6 + p * 3.2;
      const angle = initialOffsets[i * 2] + p * 2.0;
      const r = initialOffsets[i * 2 + 1];

      posArr[i * 3]     = x;
      posArr[i * 3 + 1] = Math.sin(angle) * r;
      posArr[i * 3 + 2] = Math.cos(angle) * r;

      // Color maps to local temperature along the conduction vector:
      // p = 0.0: Hot glowing red/orange -> p = 0.5: Yellow/Green -> p = 1.0: Cyan/Blue
      if (p < 0.3) {
        // Red-orange hot zone
        colArr[i * 3]     = 0.98; // R
        colArr[i * 3 + 1] = 0.35 + p * 1.5; // G
        colArr[i * 3 + 2] = 0.08; // B
      } else if (p < 0.65) {
        // Yellow-green transition zone
        colArr[i * 3]     = 0.85 - (p - 0.3) * 1.5;
        colArr[i * 3 + 1] = 0.85;
        colArr[i * 3 + 2] = 0.15 + (p - 0.3) * 1.8;
      } else {
        // Cool cyan-blue cooling sink zone
        colArr[i * 3]     = 0.15;
        colArr[i * 3 + 1] = 0.65;
        colArr[i * 3 + 2] = 0.95;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
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
        size={0.045}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
