'use client';

import React from 'react';
import * as THREE from 'three';

export const LabBench3D: React.FC = () => {
  return (
    <group position={[0, -1.8, 0]}>
      {/* 1. Heavy Laboratory Slate Tabletop */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[8.5, 0.3, 4.0]} />
        <meshStandardMaterial
          color="#1e2530"
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Tabletop Metal Bevel Trim */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[8.6, 0.02, 4.1]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Grid Alignment Markings on Bench Surface */}
      {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
        <mesh key={`grid-x-${x}`} position={[x, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.01, 3.6]} />
          <meshBasicMaterial color="#475569" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* 2. Heavy-Duty Cast-Iron Bench Stands Holding the Apparatus */}
      {/* Stand Left (under x = -1.2) */}
      <group position={[-1.2, 0, 0]}>
        {/* Cast Iron Base Plate */}
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.12, 0.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* Vertical Support Column */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.6, 24]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* V-Clamp Collar holding the apparatus */}
        <mesh position={[0, 1.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.58, 0.06, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      {/* Stand Right (under x = +1.1) */}
      <group position={[1.1, 0, 0]}>
        {/* Cast Iron Base Plate */}
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.12, 0.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.7} />
        </mesh>

        {/* Vertical Support Column */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.6, 24]} />
          <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* V-Clamp Collar holding the apparatus */}
        <mesh position={[0, 1.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.58, 0.06, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      {/* Meter Console Pedestal Post (under x = -2.3) */}
      <group position={[-2.3, 0, 0]}>
        <mesh position={[0, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 0.1, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 2.9, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>

      {/* Rotameter Wall/Bench Mounting Bracket (behind x = 1.8, y = 0.2) */}
      <group position={[1.8, 0.2, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 1.2, 0.3]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      {/* Flexible Water Tube connecting Rotameter top to Cooling Jacket bottom */}
      <mesh position={[1.8, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.45, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Flexible Drain Tube leading off from Cooling Jacket top outlet */}
      <mesh position={[1.8, 2.8, 0.3]} rotation={[0.4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Electrical Wire Leads (Red (+) & Black (-)) from Console to Heater */}
      <group position={[-2.3, 2.0, 0]}>
        {/* Red Lead */}
        <mesh position={[0.1, -0.6, 0.1]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.6} />
        </mesh>
        {/* Black Lead */}
        <mesh position={[-0.1, -0.6, 0.1]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 1.2, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
