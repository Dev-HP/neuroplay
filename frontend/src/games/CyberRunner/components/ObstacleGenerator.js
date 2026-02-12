import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import Obstacle from './Obstacle';

/**
 * Gerador de Obstáculos
 * Cria obstáculos Go/No-Go proceduralmente
 */
export default function ObstacleGenerator({ speed, difficulty, gameState }) {
  const [obstacles, setObstacles] = useState([]);
  const nextSpawnTime = useRef(0);
  const obstacleIdCounter = useRef(0);

  // Configurações por dificuldade
  const difficultyConfig = {
    easy: {
      spawnInterval: 3.0, // segundos
      goRatio: 0.7, // 70% Go, 30% No-Go
      speed: 1.0
    },
    medium: {
      spawnInterval: 2.0,
      goRatio: 0.6,
      speed: 1.3
    },
    hard: {
      spawnInterval: 1.5,
      goRatio: 0.5,
      speed: 1.8
    }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.easy;

  useFrame((state) => {
    if (gameState !== 'playing') return;

    const currentTime = state.clock.getElapsedTime();

    // Spawn novo obstáculo
    if (currentTime >= nextSpawnTime.current) {
      spawnObstacle();
      nextSpawnTime.current = currentTime + config.spawnInterval;
    }

    // Remove obstáculos que passaram
    setObstacles(prev =>
      prev.filter(obs => obs.position[2] < 15)
    );
  });

  const spawnObstacle = () => {
    const isGo = Math.random() < config.goRatio;
    
    const newObstacle = {
      id: obstacleIdCounter.current++,
      type: isGo ? 'go' : 'nogo',
      position: [0, 0.5, -30], // Spawn longe
      speed: config.speed
    };

    setObstacles(prev => [...prev, newObstacle]);
  };

  return (
    <group>
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          type={obstacle.type}
          initialPosition={obstacle.position}
          speed={obstacle.speed * speed}
        />
      ))}
    </group>
  );
}
