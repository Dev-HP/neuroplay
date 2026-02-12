import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

/**
 * Personagem Jogável
 * Controla movimento, pulo e deslize
 */
export default function PlayerCharacter({ onCollision, gameState }) {
  const rigidBodyRef = useRef();
  const [isJumping, setIsJumping] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [collisionStart, setCollisionStart] = useState(null);
  
  const { jump, slide } = useKeyboardControls();

  // Detecta comandos do teclado
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (jump && !isJumping) {
      handleJump();
    }
    
    if (slide && !isSliding) {
      handleSlide();
    }
  }, [jump, slide, gameState]);

  const handleJump = () => {
    if (!rigidBodyRef.current || isJumping) return;
    
    setIsJumping(true);
    
    // Aplica impulso para cima
    rigidBodyRef.current.applyImpulse({ x: 0, y: 8, z: 0 }, true);
    
    // Reset após 1 segundo
    setTimeout(() => setIsJumping(false), 1000);
  };

  const handleSlide = () => {
    if (isSliding) return;
    
    setIsSliding(true);
    
    // Animação de deslize (reduz altura)
    setTimeout(() => setIsSliding(false), 800);
  };

  const handleCollisionEnter = ({ other }) => {
    if (other.rigidBodyObject?.userData?.type === 'obstacle') {
      const obstacle = other.rigidBodyObject.userData;
      const reactionTime = Date.now() - collisionStart;
      
      const action = isJumping ? 'jump' : isSliding ? 'slide' : 'none';
      
      onCollision(obstacle, action, reactionTime);
    }
  };

  useFrame(() => {
    if (!rigidBodyRef.current) return;
    
    // Mantém posição X fixa (movimento apenas em Z)
    const position = rigidBodyRef.current.translation();
    if (Math.abs(position.x) > 0.1) {
      rigidBodyRef.current.setTranslation({ x: 0, y: position.y, z: position.z }, true);
    }
  });

  const characterHeight = isSliding ? 0.5 : 1.0;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 1, 0]}
      type="dynamic"
      colliders="cuboid"
      onCollisionEnter={handleCollisionEnter}
      lockRotations
      enabledRotations={[false, false, false]}
    >
      {/* Corpo do personagem */}
      <mesh castShadow>
        <boxGeometry args={[0.8, characterHeight, 0.8]} />
        <meshStandardMaterial
          color={isJumping ? '#00ff00' : isSliding ? '#ffff00' : '#00aaff'}
          emissive={isJumping || isSliding ? '#ffffff' : '#000000'}
          emissiveIntensity={isJumping || isSliding ? 0.3 : 0}
        />
      </mesh>

      {/* Cabeça */}
      <mesh position={[0, characterHeight / 2 + 0.3, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Olhos (feedback visual) */}
      <mesh position={[-0.1, characterHeight / 2 + 0.35, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, characterHeight / 2 + 0.35, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </RigidBody>
  );
}
