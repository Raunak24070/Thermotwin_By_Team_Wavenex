'use client';

import React from 'react';
import { Text } from '@react-three/drei';

interface ApparatusLabels3DProps {
  visible?: boolean;
}

export const ApparatusLabels3D: React.FC<ApparatusLabels3DProps> = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heater Section Label */}
      <group position={[-2.3, -0.65, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.2, 0.22]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.03, 0.01]}
          fontSize={0.065}
          color="#f59e0b"
          anchorX="center"
          anchorY="middle"
        >
          HEATER UNIT (x = 0)
        </Text>
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.045}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          Electrical Resistance Band
        </Text>
      </group>

      {/* 2. Thermal Insulation Shell Label */}
      <group position={[-0.2, -0.85, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.8, 0.22]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.03, 0.01]}
          fontSize={0.065}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
        >
          INSULATED SPECIMEN TUBE
        </Text>
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.045}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          d = 25 mm &bull; L = 500 mm (1D Conduction)
        </Text>
      </group>

      {/* 3. Cooling Water Jacket Label */}
      <group position={[1.8, 0.0, 0.7]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.4, 0.22]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.03, 0.01]}
          fontSize={0.065}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          COOLING JACKET (x = L)
        </Text>
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.045}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          Forced Convection Heat Sink
        </Text>
      </group>

      {/* 4. Rotameter Label */}
      <group position={[1.8, -2.2, 0.2]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.3, 0.22]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.03, 0.01]}
          fontSize={0.065}
          color="#22d3ee"
          anchorX="center"
          anchorY="middle"
        >
          ROTAMETER FLOWMETER
        </Text>
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.045}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          0.0 – 3.0 L/min Water Flow Rate
        </Text>
      </group>

      {/* 5. Voltmeter & Ammeter Console Label */}
      <group position={[-2.3, 2.0, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.4, 0.2]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.02, 0.01]}
          fontSize={0.065}
          color="#a7f3d0"
          anchorX="center"
          anchorY="middle"
        >
          INSTRUMENTATION CONSOLE
        </Text>
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.045}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          Digital Voltmeter & Ammeter
        </Text>
      </group>
    </group>
  );
};
