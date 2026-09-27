'use client';

import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { SENSORS } from '@/physics/sensors';
import { SimulationState } from '@/physics/types';

interface Sensors3DProps {
  simState: SimulationState;
  selectedSensorId: string | null;
  onSelectSensor: (sensorId: string | null) => void;
}

// Converts sensor temperature to live indicator bead color
function getSensorBeadColor(tempC: number, isWaterIn: boolean): { color: string; emissive: string; intensity: number } {
  if (isWaterIn) {
    return { color: '#0284c7', emissive: '#0369a1', intensity: 0.3 };
  }
  
  const t = Math.max(20.0, Math.min(70.0, tempC));
  const norm = (t - 20.0) / 45.0; // 0.0 at 20°C, 1.0 at 65°C+

  if (norm < 0.2) {
    return { color: '#64748b', emissive: '#334155', intensity: 0.1 };
  } else if (norm < 0.45) {
    return { color: '#06b6d4', emissive: '#0891b2', intensity: 0.35 };
  } else if (norm < 0.7) {
    return { color: '#f59e0b', emissive: '#d97706', intensity: 0.6 };
  } else {
    return { color: '#ef4444', emissive: '#dc2626', intensity: 0.85 };
  }
}

export const Sensors3D: React.FC<Sensors3DProps> = ({
  simState,
  selectedSensorId,
  onSelectSensor
}) => {
  const [hoveredSensorId, setHoveredSensorId] = React.useState<string | null>(null);

  // Map 0..0.5m rod length to -1.6 to +1.6 in 3D space
  const mapPositionTo3D = (posMeters: number): number => {
    return -1.6 + (posMeters / 0.5) * 3.2;
  };

  const getSensorTemperature = (id: string): number => {
    const key = id.toLowerCase() as keyof typeof simState.sensors;
    return simState.sensors[key] || 20.0;
  };

  return (
    <group>
      {SENSORS.map((sensor, idx) => {
        const isSelected = selectedSensorId === sensor.id;
        const tempC = getSensorTemperature(sensor.id);
        const beadThermal = getSensorBeadColor(tempC, sensor.type === 'water_in');

        let posX = mapPositionTo3D(sensor.positionX);
        let posZ = 0;

        // Alternating staggered heights for T1-T7 so labels NEVER collide
        // Even indices: lower (y = 0.52), Odd indices: upper (y = 0.96)
        const isStaggeredHigh = idx % 2 === 1;
        let postHeight = isStaggeredHigh ? 0.85 : 0.42;
        let headPosY = postHeight + 0.05;
        let labelPosY = headPosY + 0.16;

        if (sensor.type === 'water_in') {
          posX = 1.8;
          headPosY = -0.95;
          labelPosY = -1.15;
          postHeight = 0.4;
        } else if (sensor.type === 'water_out') {
          posX = 1.8;
          headPosY = 0.95;
          labelPosY = 1.15;
          postHeight = 0.4;
        }

        return (
          <group key={sensor.id} position={[posX, 0, posZ]}>
            {/* 1. Vertical Thermocouple Stem Pin */}
            {sensor.type === 'rod' && (
              <mesh position={[0, postHeight / 2 + 0.28, 0]}>
                <cylinderGeometry args={[0.015, 0.015, postHeight, 12]} />
                <meshStandardMaterial
                  color={isSelected ? '#f59e0b' : '#94a3b8'}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
            )}

            {/* 2. Interactive Thermocouple Head Sensor Bead (Coupled to live temperature) */}
            <mesh
              position={[0, sensor.type === 'rod' ? headPosY + 0.28 : headPosY, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSensor(isSelected ? null : sensor.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredSensorId(sensor.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHoveredSensorId(null);
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.075, 20, 20]} />
              <meshStandardMaterial
                color={isSelected || hoveredSensorId === sensor.id ? '#fbbf24' : beadThermal.color}
                emissive={isSelected || hoveredSensorId === sensor.id ? '#f59e0b' : beadThermal.emissive}
                emissiveIntensity={isSelected ? 0.95 : hoveredSensorId === sensor.id ? 0.8 : beadThermal.intensity}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Selection & Hover Highlight Ring */}
            {(isSelected || hoveredSensorId === sensor.id) && (
              <mesh 
                position={[0, sensor.type === 'rod' ? headPosY + 0.28 : headPosY, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <ringGeometry args={[0.10, 0.14, 24]} />
                <meshBasicMaterial
                  color={isSelected ? '#fbbf24' : '#38bdf8'}
                  transparent
                  opacity={isSelected ? 0.95 : 0.75}
                />
              </mesh>
            )}

            {/* 3. Dark Backdrop Plate for Label Chip */}
            <mesh
              position={[0, sensor.type === 'rod' ? labelPosY + 0.28 : labelPosY, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSensor(isSelected ? null : sensor.id);
              }}
            >
              <planeGeometry args={[0.36, 0.16]} />
              <meshBasicMaterial 
                color={isSelected ? '#1e293b' : '#090d16'} 
                transparent 
                opacity={0.88} 
              />
            </mesh>

            {/* 4. Crisp Staggered 3D Sensor Text Label */}
            <Text
              position={[0, sensor.type === 'rod' ? labelPosY + 0.31 : labelPosY + 0.03, 0.01]}
              fontSize={0.065}
              color={isSelected ? '#fbbf24' : '#f8fafc'}
              anchorX="center"
              anchorY="middle"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSensor(isSelected ? null : sensor.id);
              }}
            >
              {sensor.id}
            </Text>
            
            <Text
              position={[0, sensor.type === 'rod' ? labelPosY + 0.25 : labelPosY - 0.03, 0.01]}
              fontSize={0.055}
              color={isSelected ? '#fef08a' : '#38bdf8'}
              anchorX="center"
              anchorY="middle"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSensor(isSelected ? null : sensor.id);
              }}
            >
              {`${tempC.toFixed(1)}°C`}
            </Text>
          </group>
        );
      })}
    </group>
  );
};
