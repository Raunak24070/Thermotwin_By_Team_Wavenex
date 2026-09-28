
import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePhysicsStore } from '@/store/usePhysicsStore';

interface Heater3DProps {
  powerWatts: number;
  voltage: number;
  position?: [number, number, number];
}

export const Heater3D: React.FC<Heater3DProps> = ({
  powerWatts: propPower,
  voltage: propVoltage,
  position = [-2.3, 0, 0]
}) => {
  const coilGroupRef = useRef<THREE.Group>(null);
  const coilMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const heaterLightRef = useRef<THREE.PointLight>(null);
  const shimmerParticlesRef = useRef<THREE.Points>(null);

  // Generate subtle convective heat shimmer particles above the heater
  const { shimmerPositions, shimmerInitials } = useMemo(() => {
    const pCount = 30;
    const pos = new Float32Array(pCount * 3);
    const inits = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const x = (Math.random() - 0.5) * 0.45;
      const y = 0.35 + Math.random() * 0.7;
      const z = (Math.random() - 0.5) * 0.4;
      pos[i * 3]     = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      inits[i * 3]     = x;
      inits[i * 3 + 1] = y;
      inits[i * 3 + 2] = z;
    }
    return { shimmerPositions: pos, shimmerInitials: inits };
  }, []);

  useFrame((state, delta) => {
    // Read live physics state directly to guarantee 0-latency coupling
    const liveSim = usePhysicsStore.getState().simState;
    const power = liveSim ? liveSim.power : propPower;

    const isHeating = power > 0.05;
    // Normalized power: 0.0 to 1.0 (rated up to ~9.6W for 12V/15Ω)
    const normPower = Math.min(1.0, Math.max(0.0, power / 9.6));

    // 1. Dynamic Coil Incandescence Glow
    if (coilMaterialRef.current) {
      if (!isHeating) {
        // Cold resting nichrome wire
        coilMaterialRef.current.color = new THREE.Color('#27272a');
        coilMaterialRef.current.emissive = new THREE.Color('#000000');
        coilMaterialRef.current.emissiveIntensity = 0.0;
        coilMaterialRef.current.roughness = 0.5;
        coilMaterialRef.current.metalness = 0.85;
      } else {
        // Active Heating: shifts dynamically with power P = V × I
        const time = state.clock.elapsedTime;
        const microFlicker = 1.0 + Math.sin(time * 10.0) * 0.04 * normPower;

        const dullRed    = new THREE.Color('#991b1b');
        const fieryOrange= new THREE.Color('#ea580c');
        const incandescentGold = new THREE.Color('#facc15');

        let coilColor: THREE.Color;
        let emissiveColor: THREE.Color;

        if (normPower < 0.4) {
          const factor = normPower / 0.4;
          coilColor = dullRed.clone().lerp(fieryOrange, factor);
          emissiveColor = dullRed.clone().lerp(new THREE.Color('#dc2626'), factor);
        } else {
          const factor = (normPower - 0.4) / 0.6;
          coilColor = fieryOrange.clone().lerp(incandescentGold, factor);
          emissiveColor = new THREE.Color('#dc2626').lerp(new THREE.Color('#fbbf24'), factor);
        }

        coilMaterialRef.current.color = coilColor;
        coilMaterialRef.current.emissive = emissiveColor;
        coilMaterialRef.current.emissiveIntensity = (0.5 + normPower * 3.8) * microFlicker;
        coilMaterialRef.current.roughness = Math.max(0.05, 0.4 - normPower * 0.3);
        coilMaterialRef.current.metalness = 0.3;
      }
    }

    // 2. Point Light casting real dynamic thermal illumination
    if (heaterLightRef.current) {
      heaterLightRef.current.intensity = isHeating ? (0.6 + normPower * 4.2) : 0;
    }

    // 3. Convective Rising Thermal Shimmer Animation above heater
    if (shimmerParticlesRef.current) {
      if (isHeating) {
        shimmerParticlesRef.current.visible = true;
        const geom = shimmerParticlesRef.current.geometry;
        const posAttr = geom.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const pCount = arr.length / 3;

        for (let i = 0; i < pCount; i++) {
          arr[i * 3 + 1] += delta * (0.35 + normPower * 0.85); // Rise upwards
          // Horizontal wavy drift
          arr[i * 3] += Math.sin(state.clock.elapsedTime * 4.0 + i) * 0.0015;

          // Loop back down when rising above ceiling
          if (arr[i * 3 + 1] > 1.25) {
            arr[i * 3 + 1] = 0.35 + Math.random() * 0.15;
            arr[i * 3] = shimmerInitials[i * 3];
          }
        }
        posAttr.needsUpdate = true;
      } else {
        shimmerParticlesRef.current.visible = false;
      }
    }
  });

  return (
    <group position={position}>
      {/* Outer Ceramic Heater Casing with Open Observation Window on Top */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry
          args={[
            0.38,
            0.38,
            0.6,
            32,
            1,
            true, // open-ended cylinder with viewing cutout
            Math.PI * 0.15,
            Math.PI * 1.7
          ]}
        />
        <meshStandardMaterial
          color="#334155"
          roughness={0.65}
          metalness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Internal Ceramic Heat Core Reflector */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.31, 0.31, 0.58, 32, 1, true]} />
        <meshStandardMaterial color="#475569" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Shared Nichrome Heating Coil Bands (All 3 actively glow with power P) */}
      <group ref={coilGroupRef}>
        <meshStandardMaterial
          ref={coilMaterialRef}
          color="#27272a"
          emissive="#000000"
          emissiveIntensity={0}
          roughness={0.5}
          metalness={0.85}
        />
        {[-0.16, 0.0, 0.16].map((xOffset, idx) => (
          <mesh
            key={idx}
            position={[xOffset, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            material={coilMaterialRef.current || undefined}
          >
            <torusGeometry args={[0.315, 0.038, 16, 32]} />
          </mesh>
        ))}
      </group>

      {/* Dynamic Thermal Point Light casting glowing ambient warmth */}
      <pointLight
        ref={heaterLightRef}
        position={[0, 0.25, 0.1]}
        color="#ff5500"
        intensity={0}
        distance={3.2}
        decay={2}
      />

      {/* Convective Heat Shimmer Particles above the heater */}
      <points ref={shimmerParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[shimmerPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color="#fb923c"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Electrical Terminal Binding Posts (+ / -) */}
      <mesh position={[-0.1, 0.45, 0.15]}>
        <cylinderGeometry args={[0.035, 0.035, 0.25, 12]} />
        <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.1, 0.45, 0.15]}>
        <cylinderGeometry args={[0.035, 0.035, 0.25, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Heavy Steel Mounting Clamps */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.55, 0.15, 0.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  );
};
