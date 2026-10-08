
import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { ViewMode } from '@/store/usePhysicsStore';

interface InsulationShell3DProps {
  viewMode: ViewMode;
  rodLength?: number;
  outerRadius?: number;
}

export const InsulationShell3D: React.FC<InsulationShell3DProps> = ({
  viewMode,
  rodLength = 3.2,
  outerRadius = 0.55
}) => {
  if (viewMode === 'thermal' || viewMode === 'heatflow') {
    // Hide solid insulation shell completely in Thermal & Heat Flow modes so the continuous temperature gradient is 100% visible
    return null;
  }

  const isCutaway = viewMode === 'cutaway';

  // In Normal mode, apparatus has a wide observation cutout along the top-front (where thermocouples enter),
  // covered by a transparent borosilicate inspection shield, ensuring the metal rod and its thermal response
  // are clearly visible from standard camera angles.
  // In Cutaway mode, the cutaway angle is wide (180 degrees) for internal cross-sectional inspection.
  const thetaStart = isCutaway ? Math.PI * 0.25 : Math.PI * 0.22;
  const thetaLength = isCutaway ? Math.PI * 1.5 : Math.PI * 1.45;

  return (
    <group position={[-0.2, 0, 0]}>
      {/* 1. Insulating Shell Outer Housing (Industrial Slate/Charcoal Asbestos-Free Casing) */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry
          args={[
            outerRadius,
            outerRadius,
            rodLength,
            36,
            1,
            true, // open ended
            thetaStart,
            thetaLength
          ]}
        />
        <meshStandardMaterial
          color={isCutaway ? '#1e293b' : '#475569'}
          roughness={isCutaway ? 0.2 : 0.75}
          metalness={isCutaway ? 0.6 : 0.25}
          transparent={isCutaway}
          opacity={isCutaway ? 0.35 : 1.0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Transparent Inspection Shield over Observation Port (Protective Borosilicate Glass) */}
      {!isCutaway && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[
              outerRadius + 0.005,
              outerRadius + 0.005,
              rodLength,
              36,
              1,
              true,
              thetaStart + thetaLength, // covers the open observation arc
              Math.PI * 2 - thetaLength
            ]}
          />
          <meshStandardMaterial
            color="#cbd5e1"
            transparent
            opacity={0.18}
            roughness={0.1}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 3. Internal Thermal Insulation Layer Wall (Glass Wool / Ceramic Fiber, visible through cutaway) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[
            outerRadius - 0.08,
            outerRadius - 0.08,
            rodLength - 0.04,
            36,
            1,
            true,
            thetaStart,
            thetaLength
          ]}
        />
        <meshStandardMaterial
          color="#94a3b8"
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. Left Mounting Flange & End Cap Collar */}
      <mesh position={[-rodLength / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.26, outerRadius, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* 5. Right Mounting Flange & End Cap Collar */}
      <mesh position={[rodLength / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ringGeometry args={[0.26, outerRadius, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* 6. Precision Reinforcement Bands (Stainless Steel Retention Rings) */}
      {[-0.8, 0, 0.8].map((x, idx) => (
        <mesh key={idx} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry
            args={[
              outerRadius + 0.01,
              outerRadius + 0.01,
              0.04,
              36,
              1,
              true,
              thetaStart,
              thetaLength
            ]}
          />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 7. Professional Engineering Cutaway Callout Labels */}
      {isCutaway && (
        <group>
          {/* HEATER Callout */}
          <group position={[-2.1, 0.8, 0]}>
            <Text fontSize={0.075} color="#f59e0b" anchorX="center">
              HEATER
            </Text>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
          </group>

          {/* SPECIMEN ROD Callout */}
          <group position={[0, 0.8, 0]}>
            <Text fontSize={0.075} color="#39FF14" anchorX="center">
              SPECIMEN ROD
            </Text>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
              <meshBasicMaterial color="#39FF14" />
            </mesh>
          </group>

          {/* THERMOCOUPLE Callout */}
          <group position={[-0.9, 1.15, 0]}>
            <Text fontSize={0.07} color="#38bdf8" anchorX="center">
              THERMOCOUPLE
            </Text>
            <mesh position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.22, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* COOLING JACKET Callout */}
          <group position={[1.8, 0.85, 0]}>
            <Text fontSize={0.075} color="#38bdf8" anchorX="center">
              COOLING JACKET
            </Text>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.25, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* INSULATION Callout */}
          <group position={[-0.2, -0.85, 0]}>
            <Text fontSize={0.075} color="#94a3b8" anchorX="center">
              INSULATION
            </Text>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.22, 8]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
