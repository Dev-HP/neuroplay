import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useTelemetry } from '../shared/useTelemetry';
import { FeedbackSystem } from '../shared/FeedbackSystem';
import PlayerCharacter from './components/PlayerCharacter';
import RunnerTrack from './components/RunnerTrack';
import ObstacleGenerator from './components/ObstacleGenerator';
import MathPortalSystem from './components/MathPortalSystem';
import GameUI from './components/GameUI';
import './CyberRunner.css';

/**
 * CYBER-RUNNER - Módulo 1: Controle Inibitório
 * 
 * Endless Runner 2.5D que treina:
 * - Controle inibitório motor (Go/No-Go)
 * - Raciocínio aritmético (Dual-Task)
 * - Memória de trabalho
 * 
 * Baseado em evidências científicas de meta-análise 2025
 */
export default function CyberRunner() {
  const { logEvent, sessionId } = useTelemetry('cyber_runner');
  const feedbackSystem = useRef(new FeedbackSystem());
  
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [difficulty, setDifficulty] = useState('easy');
  const [speed, setSpeed] = useState(1.0);
  
  const [stats, setStats] = useState({
    correctResponses: 0,
    incorrectResponses: 0,
    totalReactionTime: 0,
    responseCount: 0
  });

  useEffect(() => {
    // Log início do jogo
    if (gameState === 'playing') {
      logEvent({
        event_type: 'game_start',
        difficulty,
        initial_speed: speed
      });
    }
  }, [gameState]);

  const handleObstacleCollision = (obstacle, action, reactionTime) => {
    const isCorrect = (
      (obstacle.type === 'go' && action === 'jump') ||
      (obstacle.type === 'nogo' && action === 'slide')
    );

    // Log telemetria
    logEvent({
      event_type: 'go_nogo_response',
      obstacle_type: obstacle.type,
      player_action: action,
      reaction_time_ms: Math.round(reactionTime),
      was_correct: isCorrect,
      current_speed: speed,
      current_score: score
    });

    // Atualiza estatísticas
    setStats(prev => ({
      correctResponses: prev.correctResponses + (isCorrect ? 1 : 0),
      incorrectResponses: prev.incorrectResponses + (isCorrect ? 0 : 1),
      totalReactionTime: prev.totalReactionTime + reactionTime,
      responseCount: prev.responseCount + 1
    }));

    if (isCorrect) {
      // Feedback positivo
      feedbackSystem.current.triggerSuccess();
      setScore(prev => prev + 10);
    } else {
      // Feedback negativo
      feedbackSystem.current.triggerError();
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          handleGameOver();
        }
        return newLives;
      });
    }
  };

  const handleMathAnswer = (isCorrect, equation, reactionTime) => {
    // Log telemetria matemática
    logEvent({
      event_type: 'math_solve',
      equation: equation.question,
      was_correct: isCorrect,
      reaction_time_ms: Math.round(reactionTime),
      current_score: score
    });

    if (isCorrect) {
      feedbackSystem.current.triggerSuccess(1.5);
      setScore(prev => prev + 50); // Bônus maior para matemática
    } else {
      feedbackSystem.current.triggerError(0.8);
    }
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    
    const avgReactionTime = stats.responseCount > 0 
      ? stats.totalReactionTime / stats.responseCount 
      : 0;

    logEvent({
      event_type: 'game_over',
      final_score: score,
      correct_responses: stats.correctResponses,
      incorrect_responses: stats.incorrectResponses,
      avg_reaction_time_ms: Math.round(avgReactionTime),
      accuracy: stats.responseCount > 0 
        ? (stats.correctResponses / stats.responseCount) 
        : 0
    });
  };

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setStats({
      correctResponses: 0,
      incorrectResponses: 0,
      totalReactionTime: 0,
      responseCount: 0
    });
  };

  const handlePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const handleRestart = () => {
    handleStart();
  };

  return (
    <div className="cyber-runner-container">
      <GameUI
        gameState={gameState}
        score={score}
        lives={lives}
        stats={stats}
        onStart={handleStart}
        onPause={handlePause}
        onRestart={handleRestart}
      />

      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows
        className="cyber-runner-canvas"
      >
        {/* Iluminação */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Física */}
        <Physics gravity={[0, -9.81, 0]} timeStep="vary">
          {gameState === 'playing' && (
            <>
              <RunnerTrack speed={speed} difficulty={difficulty} />
              
              <PlayerCharacter
                onCollision={handleObstacleCollision}
                gameState={gameState}
              />
              
              <ObstacleGenerator
                speed={speed}
                difficulty={difficulty}
                gameState={gameState}
              />
              
              <MathPortalSystem
                interval={45000}
                difficulty={difficulty}
                onAnswer={handleMathAnswer}
                gameState={gameState}
              />
            </>
          )}
        </Physics>

        {/* Efeitos visuais */}
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
