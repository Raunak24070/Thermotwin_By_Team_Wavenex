
import React from 'react';
import { Text } from '@react-three/drei';

interface Meters3DProps {
  voltage: number;
  current: number;
  power: number;
  position?: [number, number, number];
}

export const Meters3D: React.FC<Meters3DProps> = ({
  voltage,
  current,
  power,
  position = [-2.3, 1.4, 0]
}) => {
  return (
    <group position={position}>
      {/* Voltmeter & Ammeter Main Console Box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.9, 0.4]} />
        <meshStandardMaterial color="#1a202c" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Voltmeter Display Screen Frame */}
      <mesh position={[-0.32, 0.12, 0.21]}>
        <planeGeometry args={[0.5, 0.35]} />
        <meshStandardMaterial color="#050811" roughness={0.2} />
      </mesh>

      {/* Ammeter Display Screen Frame */}
      <mesh position={[0.32, 0.12, 0.21]}>
        <planeGeometry args={[0.5, 0.35]} />
        <meshStandardMaterial color="#050811" roughness={0.2} />
      </mesh>

      {/* Pure 3D Text Geometry for Voltmeter */}
      <Text
        position={[-0.32, 0.22, 0.22]}
        fontSize={0.065}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
      >
        VOLTMETER
      </Text>
      <Text
        position={[-0.32, 0.05, 0.22]}
        fontSize={0.12}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        {`${voltage.toFixed(1)} V`}
      </Text>

      {/* Pure 3D Text Geometry for Ammeter */}
      <Text
        position={[0.32, 0.22, 0.22]}
        fontSize={0.065}
        color="#06b6d4"
        anchorX="center"
        anchorY="middle"
      >
        AMMETER
      </Text>
      <Text
        position={[0.32, 0.05, 0.22]}
        fontSize={0.12}
        color="#22d3ee"
        anchorX="center"
        anchorY="middle"
      >
        {`${current.toFixed(2)} A`}
      </Text>

      {/* Power Reading Banner Base */}
      <mesh position={[0, -0.25, 0.21]}>
        <planeGeometry args={[1.1, 0.2]} />
        <meshStandardMaterial color="#090d16" />
      </mesh>

      <Text
        position={[0, -0.25, 0.22]}
        fontSize={0.08}
        color="#34d399"
        anchorX="center"
        anchorY="middle"
      >
        {`POWER P = ${power.toFixed(1)} W`}
      </Text>
    </group>
  );
};
