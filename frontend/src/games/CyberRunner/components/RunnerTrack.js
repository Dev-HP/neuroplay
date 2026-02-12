import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

/**
 * Pista do Runner
 * Cria ilusão de movimento infinito
 */
export default function RunnerTrack({ speed, difficulty }) {
  const trackRef = useRef();
  const trackLength = 100;

  useFrame((state, delta) => {
    if (!trackRef.current) return;
    
    // Move pista para trás (ilusão de movimento para frente)
    trackRef.current.position.z += speed * delta * 10;
    
    // Reset quando passar do limite
    if (trackRef.current.position.z > trackLength) {
      trackRef.current.position.z = -trackLength;
    }
  });

  return (
    <group>
      {/* Pista principal */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          ref={trackRef}
          position={[0, -0.5, 0]}
          receiveShadow
        >
          <boxGeometry args={[10, 1, trackLength * 2]} />
          <meshStandardMaterial
            color="#1a1f3a"
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
      </RigidBody>

      {/* Grid visual (efeito cyberpunk) */}
      <gridHelper
        args={[trackLength * 2, 50, '#00ffff', '#003366']}
        position={[0, 0.01, 0]}
      />

      {/* Paredes laterais (guias visuais) */}
      <mesh position={[-5.5, 1, 0]}>
        <boxGeometry args={[0.2, 2, trackLength * 2]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      <mesh position={[5.5, 1, 0]}>
        <boxGeometry args={[0.2, 2, trackLength * 2]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
