import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

/**
 * Obstáculo Individual
 * Verde = Go (pular)
 * Vermelho = No-Go (deslizar)
 */
export default function Obstacle({ type, initialPosition, speed }) {
  const rigidBodyRef = useRef();
  const meshRef = useRef();

  const isGo = type === 'go';
  const color = isGo ? '#00ff00' : '#ff0000';
  const emissiveColor = isGo ? '#00ff00' : '#ff0000';

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;

    // Move obstáculo em direção ao jogador
    const currentPos = rigidBodyRef.current.translation();
    rigidBodyRef.current.setTranslation({
      x: currentPos.x,
      y: currentPos.y,
      z: currentPos.z + speed * delta * 10
    }, true);

    // Animação de pulso
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPosition}
      type="kinematicPosition"
      colliders="cuboid"
      sensor
      userData={{ type: 'obstacle', obstacleType: type }}
    >
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[2, isGo ? 2 : 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Ícone visual */}
      <mesh position={[0, 0, 0.6]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
        />
      </mesh>
    </RigidBody>
  );
}
