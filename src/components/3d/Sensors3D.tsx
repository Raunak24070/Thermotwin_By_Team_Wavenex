
import React, { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { SENSORS } from '@/physics/sensors';
import { SimulationState } from '@/physics/types';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface Sensors3DProps {
  simState: SimulationState;
  selectedSensorId: string | null;
  onSelectSensor: (sensorId: string | null) => void;
}

// Converts sensor temperature to live indicator bead color adhering to spec
function getSensorBeadColor(tempC: number, isWaterIn: boolean): { color: string; emissive: string; intensity: number } {
  if (isWaterIn) {
    return { color: '#0284c7', emissive: '#0369a1', intensity: 0.4 };
  }
  
  const t = Math.max(20.0, Math.min(85.0, tempC));
  const norm = (t - 20.0) / 60.0;

  if (norm < 0.2) {
    return { color: '#2563eb', emissive: '#1d4ed8', intensity: 0.25 };
  } else if (norm < 0.45) {
    return { color: '#38bdf8', emissive: '#0284c7', intensity: 0.45 };
  } else if (norm < 0.7) {
    return { color: '#f59e0b', emissive: '#d97706', intensity: 0.7 };
  } else {
    return { color: '#ef4444', emissive: '#dc2626', intensity: 0.95 };
  }
}

export const Sensors3D: React.FC<Sensors3DProps> = ({
  simState,
  selectedSensorId,
  onSelectSensor
}) => {
  const [hoveredSensorId, setHoveredSensorId] = React.useState<string | null>(null);
  const { viewMode, sensorRates } = usePhysicsStore();
  const pulseRef = useRef<number>(1.0);

  useFrame((state) => {
    // Subtle rhythmic pulse for sensor telemetry beacons
    pulseRef.current = 1.0 + Math.sin(state.clock.elapsedTime * 4.5) * 0.22;
  });

  const mapPositionTo3D = (posMeters: number): number => {
    return -1.6 + (posMeters / 0.5) * 3.2;
  };

  const getSensorTemperature = (id: string): number => {
    const key = id.toLowerCase() as keyof typeof simState.sensors;
    return simState.sensors[key] || 20.0;
  };

  const getSensorRate = (id: string): number => {
    const key = id.toLowerCase() as keyof typeof sensorRates;
    return sensorRates ? sensorRates[key] || 0.0 : 0.0;
  };

  const isSensorMode = viewMode === 'sensor';

  return (
    <group>
      {SENSORS.map((sensor, idx) => {
        const isSelected = selectedSensorId === sensor.id;
        const isHovered = hoveredSensorId === sensor.id;
        const isAnySelected = !!selectedSensorId;
        const isDimmed = isAnySelected && !isSelected;

        const tempC = getSensorTemperature(sensor.id);
        const rate = getSensorRate(sensor.id);
        const beadThermal = getSensorBeadColor(tempC, sensor.type === 'water_in');

        let posX = mapPositionTo3D(sensor.positionX);
        let posZ = 0;

        // Alternating staggered heights for T1-T7 so labels NEVER collide
        const isStaggeredHigh = idx % 2 === 1;
        let postHeight = isStaggeredHigh ? 0.88 : 0.44;
        let headPosY = postHeight + 0.05;
        let labelPosY = headPosY + (isSensorMode || isSelected ? 0.22 : 0.16);

        if (sensor.type === 'water_in') {
          posX = 1.8;
          headPosY = -0.95;
          labelPosY = -1.22;
          postHeight = 0.4;
        } else if (sensor.type === 'water_out') {
          posX = 1.8;
          headPosY = 0.95;
          labelPosY = 1.24;
          postHeight = 0.4;
        }

        // Stability indicator
        const isStable = Math.abs(rate) < 0.008;
        const statusText = isStable 
          ? '● STABLE' 
          : rate > 0 
          ? `▲ +${rate.toFixed(2)}` 
          : `▼ ${rate.toFixed(2)}`;

        const statusColor = isStable ? '#39FF14' : rate > 0 ? '#f59e0b' : '#38bdf8';

        return (
          <group key={sensor.id} position={[posX, 0, posZ]}>
            {/* 1. Vertical Thermocouple Stem Pin */}
            {sensor.type === 'rod' && (
              <mesh position={[0, postHeight / 2 + 0.28, 0]}>
                <cylinderGeometry args={[isSelected ? 0.022 : 0.015, isSelected ? 0.022 : 0.015, postHeight, 12]} />
                <meshStandardMaterial
                  color={isSelected ? '#39FF14' : isSensorMode ? '#38bdf8' : isDimmed ? '#475569' : '#94a3b8'}
                  emissive={isSelected ? '#39FF14' : isSensorMode ? '#0284c7' : '#000000'}
                  emissiveIntensity={isSelected ? 0.5 : isSensorMode ? 0.2 : 0}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
            )}

            {/* 2. Interactive Thermocouple Head Sensor Bead */}
            <mesh
              position={[0, sensor.type === 'rod' ? headPosY + 0.28 : headPosY, 0]}
              scale={isSelected ? [1.3, 1.3, 1.3] : isSensorMode ? [1.15, 1.15, 1.15] : [1, 1, 1]}
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
                color={isSelected ? '#39FF14' : isHovered ? '#fbbf24' : isDimmed ? '#334155' : beadThermal.color}
                emissive={isSelected ? '#39FF14' : isHovered ? '#f59e0b' : beadThermal.emissive}
                emissiveIntensity={
                  isSelected 
                    ? 1.4 * pulseRef.current 
                    : isSensorMode 
                    ? 1.1 * pulseRef.current * beadThermal.intensity 
                    : isHovered 
                    ? 0.9 
                    : isDimmed 
                    ? 0.1 
                    : beadThermal.intensity
                }
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Selection & Hover Highlight Ring (Lime green #39FF14 for selected) */}
            {(isSelected || isHovered || isSensorMode) && (
              <mesh 
                position={[0, sensor.type === 'rod' ? headPosY + 0.28 : headPosY, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <ringGeometry args={[isSelected ? 0.11 : 0.09, isSelected ? 0.16 : 0.13, 24]} />
                <meshBasicMaterial
                  color={isSelected ? '#39FF14' : isHovered ? '#fbbf24' : '#38bdf8'}
                  transparent
                  opacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.45}
                />
              </mesh>
            )}

            {/* Axial position marker collar on the rod surface */}
            {(isSelected || isHovered || isSensorMode) && sensor.type === 'rod' && (
              <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.258, isSelected ? 0.02 : 0.012, 12, 32]} />
                <meshBasicMaterial
                  color={isSelected ? '#39FF14' : isHovered ? '#fbbf24' : '#38bdf8'}
                  transparent
                  opacity={isSelected ? 0.95 : 0.6}
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
              <planeGeometry args={[isSensorMode || isSelected ? 0.44 : 0.36, isSensorMode || isSelected ? 0.24 : 0.16]} />
              <meshBasicMaterial 
                color={isSelected ? '#0f2913' : '#090d16'} 
                transparent 
                opacity={isDimmed ? 0.4 : 0.92} 
              />
            </mesh>

            {/* Subtle Lime Green Border for Selected Sensor Tag */}
            {isSelected && (
              <lineSegments position={[0, sensor.type === 'rod' ? labelPosY + 0.28 : labelPosY, 0.005]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(0.44, 0.24)]} />
                <lineBasicMaterial color="#39FF14" linewidth={2} />
              </lineSegments>
            )}

            {/* 4. Sensor ID */}
            <Text
              position={[0, sensor.type === 'rod' ? labelPosY + (isSensorMode || isSelected ? 0.35 : 0.31) : labelPosY + (isSensorMode || isSelected ? 0.07 : 0.03), 0.01]}
              fontSize={isSelected ? 0.075 : 0.065}
              color={isSelected ? '#39FF14' : isDimmed ? '#64748b' : '#f8fafc'}
              anchorX="center"
              anchorY="middle"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSensor(isSelected ? null : sensor.id);
              }}
            >
              {sensor.id}
            </Text>
            
            {/* Live Temperature Reading */}
            <Text
              position={[0, sensor.type === 'rod' ? labelPosY + (isSensorMode || isSelected ? 0.27 : 0.25) : labelPosY - (isSensorMode || isSelected ? 0.01 : 0.03), 0.01]}
              fontSize={isSelected ? 0.065 : 0.055}
              color={isSelected ? '#ffffff' : isDimmed ? '#475569' : '#38bdf8'}
              anchorX="center"
              anchorY="middle"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSensor(isSelected ? null : sensor.id);
              }}
            >
              {`${tempC.toFixed(1)}°C`}
            </Text>

            {/* Rate of Change & Stability Status (Shown in sensor mode or when selected) */}
            {(isSensorMode || isSelected) && (
              <Text
                position={[0, sensor.type === 'rod' ? labelPosY + 0.19 : labelPosY - 0.08, 0.01]}
                fontSize={0.042}
                color={statusColor}
                anchorX="center"
                anchorY="middle"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSensor(isSelected ? null : sensor.id);
                }}
              >
                {statusText}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};
