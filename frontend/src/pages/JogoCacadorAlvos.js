import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import audioManager from '../shared/utils/audioManager';
import aiAdaptation from '../shared/utils/aiAdaptation';
import ParticleSystem from '../shared/components/ParticleSystem';
import EmergencyStop from '../shared/components/EmergencyStop';
import errorCascadeDetector from '../shared/utils/errorCascadeDetector';
import useGameStore from '../store/gameStore';
import './JogoCacadorAlvos.css';

// Componente do personagem (nave espacial)
function Spaceship({ position, onMove }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      <coneGeometry args={[0.5, 1.5, 8]} />
      <meshStandardMaterial color={hovered ? '#FFD93D' : '#667eea'} emissive="#667eea" emissiveIntensity={0.5} />
    </mesh>
  );
}

// Componente de alvo
function Target({ position, onCollect, id, type = 'good' }) {
  const meshRef = useRef();
  const [collected, setCollected] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 3 + id) * 0.05;
    }
  });

  const handleClick = () => {
    if (!collected) {
      setCollected(true);
      onCollect(type, id);
    }
  };

  if (collected) return null;

  const color = type === 'good' ? '#6BCB77' : type === 'bonus' ? '#FFD93D' : '#FF6B6B';

  return (
    <mesh ref={meshRef} position={position} onClick={handleClick}>
      {type === 'bonus' ? (
        <octahedronGeometry args={[0.4]} />
      ) : (
        <sphereGeometry args={[0.3, 16, 16]} />
      )}
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.8}
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  );
}

// Componente de obstáculo
function Obstacle({ position, onCollision, id }) {
  const meshRef = useRef();
  const [hit, setHit] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !hit) {
      meshRef.current.rotation.x += 0.03;
      meshRef.current.rotation.z += 0.02;
    }
  });

  const handleClick = () => {
    if (!hit) {
      setHit(true);
      onCollision(id);
    }
  };

  if (hit) return null;

  return (
    <mesh ref={meshRef} position={position} onClick={handleClick}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial 
        color="#FF6B6B" 
        emissive="#d32f2f" 
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

// Componente principal do jogo
function JogoCacadorAlvos({ user }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, finished
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [targets, setTargets] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({
    collected: 0,
    missed: 0,
    collisions: 0,
    accuracy: 100
  });
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState('success');
  const [shipPosition] = useState([0, 0, 0]);
  const [targetTimestamps, setTargetTimestamps] = useState({});
  const [reactionTimes, setReactionTimes] = useState([]);
  const gameStartTime = useRef(null);
  const addPoints = useGameStore(state => state.addPoints);

  useEffect(() => {
    audioManager.init();
    aiAdaptation.init();
  }, []);

  const finishGame = useCallback(async () => {
    setGameState('finished');
    addPoints(score);

    const gameTime = (Date.now() - gameStartTime.current) / 1000;
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((sum, rt) => sum + rt.reactionTime, 0) / reactionTimes.length
      : 0;
    
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/progresso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aluno_id: user.id,
          atividade_id: 2,
          pontos: score,
          tempo_gasto: Math.floor(gameTime),
          acertos: stats.collected,
          erros: stats.collisions,
          reaction_times: reactionTimes,
          avg_reaction_time: Math.round(avgReactionTime)
        })
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }

    const insights = aiAdaptation.generateInsights();
    console.log('Insights da IA:', insights);
  }, [score, stats, user.id, addPoints, reactionTimes]);

  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, finishGame]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setStats({ collected: 0, missed: 0, collisions: 0, accuracy: 100 });
    gameStartTime.current = Date.now();
    spawnTargets();
    spawnObstacles();
    audioManager.playMelody([
      { pitch: 'C5', duration: 0.1 },
      { pitch: 'E5', duration: 0.1 },
      { pitch: 'G5', duration: 0.2 }
    ]);
  };

  const spawnTargets = () => {
    const newTargets = [];
    const count = 5 + level * 2;
    const now = performance.now();
    const newTimestamps = {};
    
    for (let i = 0; i < count; i++) {
      const type = Math.random() > 0.8 ? 'bonus' : 'good';
      const targetId = Date.now() + i;
      newTargets.push({
        id: targetId,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5 + 2,
          (Math.random() - 0.5) * 10
        ],
        type
      });
      newTimestamps[targetId] = now;
    }
    
    setTargets(newTargets);
    setTargetTimestamps(newTimestamps);
  };

  const spawnObstacles = () => {
    const newObstacles = [];
    const count = Math.min(level * 2, 10);
    
    for (let i = 0; i < count; i++) {
      newObstacles.push({
        id: Date.now() + i + 1000,
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5 + 2,
          (Math.random() - 0.5) * 10
        ]
      });
    }
    
    setObstacles(newObstacles);
  };

  const handleCollectTarget = (type, id) => {
    const reactionTime = performance.now() - (targetTimestamps[id] || 0);
    
    setReactionTimes(prev => [...prev, {
      timestamp: Date.now(),
      reactionTime: Math.round(reactionTime),
      targetType: type,
      targetId: id
    }]);
    
    const points = type === 'bonus' ? 50 : 20;
    const comboBonus = combo * 5;
    const totalPoints = points + comboBonus;
    
    setScore(prev => prev + totalPoints);
    setCombo(prev => prev + 1);
    setStats(prev => ({
      ...prev,
      collected: prev.collected + 1,
      accuracy: ((prev.collected + 1) / (prev.collected + prev.missed + 1)) * 100
    }));

    // Registrar acerto no detector de cascata
    errorCascadeDetector.addAttempt(true);

    // Remover alvo coletado
    setTargets(prev => prev.filter(t => t.id !== id));

    // Efeitos visuais e sonoros
    audioManager.play('success');
    setParticleType(type === 'bonus' ? 'achievement' : 'success');
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 500);

    // Verificar se coletou todos os alvos
    if (targets.length <= 1) {
      levelUp();
    }

    // Analisar performance com IA
    aiAdaptation.analyzePerformance({
      accuracy: stats.accuracy,
      reactionTime: 500,
      errorsCount: stats.collisions,
      successStreak: combo,
      timeSpent: (Date.now() - gameStartTime.current) / 1000,
      difficultyLevel: level
    });
  };

  const handleCollision = (id) => {
    setScore(prev => Math.max(0, prev - 10));
    setCombo(0);
    setStats(prev => ({
      ...prev,
      collisions: prev.collisions + 1,
      accuracy: (prev.collected / (prev.collected + prev.missed + prev.collisions + 1)) * 100
    }));

    // Detectar cascata de erros
    const cascadeResult = errorCascadeDetector.addAttempt(false);
    if (cascadeResult.cascade) {
      console.warn('⚠️ Cascata de erros detectada!', cascadeResult);
      // Reduzir dificuldade automaticamente
      if (level > 1) {
        setLevel(prev => Math.max(1, prev - 1));
      }
    }

    // Remover obstáculo
    setObstacles(prev => prev.filter(o => o.id !== id));

    audioManager.play('error');
    setParticleType('error');
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 300);
  };

  const levelUp = () => {
    setLevel(prev => prev + 1);
    setTimeLeft(prev => prev + 15);
    audioManager.play('achievement');
    
    setTimeout(() => {
      spawnTargets();
      spawnObstacles();
    }, 1000);
  };



  return (
    <div className="jogo-cacador-container">
      <EmergencyStop onStop={() => setGameState('ready')} />
      <ParticleSystem type={particleType} active={showParticles} />
      
      <div className="game-header">
        <button onClick={() => navigate('/aluno')} className="btn-voltar">
          ← Voltar
        </button>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Pontos:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Nível:</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Tempo:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          {combo > 0 && (
            <motion.div 
              className="combo-display"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              🔥 Combo x{combo}
            </motion.div>
          )}
        </div>
      </div>

      {gameState === 'ready' && (
        <motion.div 
          className="start-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1>🚀 Caçador de Alvos</h1>
          <p>Colete as esferas verdes e douradas!</p>
          <p>Evite os cubos vermelhos!</p>
          <button onClick={startGame} className="btn btn-primary btn-large">
            Iniciar Missão
          </button>
        </motion.div>
      )}

      {gameState === 'finished' && (
        <motion.div 
          className="finish-overlay"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>🎉 Missão Completa!</h1>
          <div className="final-stats">
            <div className="final-stat">
              <span className="final-label">Pontuação Final:</span>
              <span className="final-value">{score}</span>
            </div>
            <div className="final-stat">
              <span className="final-label">Alvos Coletados:</span>
              <span className="final-value">{stats.collected}</span>
            </div>
            <div className="final-stat">
              <span className="final-label">Precisão:</span>
              <span className="final-value">{stats.accuracy.toFixed(1)}%</span>
            </div>
            <div className="final-stat">
              <span className="final-label">Nível Alcançado:</span>
              <span className="final-value">{level}</span>
            </div>
          </div>
          <div className="final-buttons">
            <button onClick={startGame} className="btn btn-primary">
              Jogar Novamente
            </button>
            <button onClick={() => navigate('/aluno')} className="btn btn-secondary">
              Menu Principal
            </button>
          </div>
        </motion.div>
      )}

      <Canvas className="game-canvas">
        <PerspectiveCamera makeDefault position={[0, 5, 10]} />
        <OrbitControls enableZoom={false} enablePan={false} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#667eea" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {gameState === 'playing' && (
          <>
            <Spaceship position={shipPosition} />
            
            {targets.map(target => (
              <Target
                key={target.id}
                id={target.id}
                position={target.position}
                type={target.type}
                onCollect={handleCollectTarget}
              />
            ))}
            
            {obstacles.map(obstacle => (
              <Obstacle
                key={obstacle.id}
                id={obstacle.id}
                position={obstacle.position}
                onCollision={handleCollision}
              />
            ))}
          </>
        )}
      </Canvas>
    </div>
  );
}

export default JogoCacadorAlvos;
