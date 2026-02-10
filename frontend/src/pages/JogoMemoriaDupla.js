import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import audioManager from '../utils/audioManager';
import aiAdaptation from '../utils/aiAdaptation';
import ParticleSystem from '../components/ParticleSystem';
import EmergencyStop from '../components/EmergencyStop';
import errorCascadeDetector from '../utils/errorCascadeDetector';
import useGameStore from '../store/gameStore';
import './JogoMemoriaDupla.css';

// Dual N-Back Game - Treino de memória de trabalho
function JogoMemoriaDupla({ user }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('ready');
  const [nBackLevel, setNBackLevel] = useState(1); // 1-back, 2-back, 3-back
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingStimulus, setShowingStimulus] = useState(false);
  const [stats, setStats] = useState({
    visualCorrect: 0,
    audioCorrect: 0,
    visualWrong: 0,
    audioWrong: 0
  });
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState('success');
  const [feedback, setFeedback] = useState(null);
  
  const gameStartTime = useRef(null);
  const addPoints = useGameStore(state => state.addPoints);

  // Posições do grid 3x3
  const gridPositions = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2]
  ];

  // Sons/letras para estímulo auditivo
  const audioStimuli = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const audioNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  useEffect(() => {
    audioManager.init();
    aiAdaptation.init();
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRound(0);
    setStats({ visualCorrect: 0, audioCorrect: 0, visualWrong: 0, audioWrong: 0 });
    gameStartTime.current = Date.now();
    generateSequence();
  };

  const generateSequence = useCallback(() => {
    const length = 20 + nBackLevel * 5; // Sequência mais longa para níveis maiores
    const newSequence = [];

    for (let i = 0; i < length; i++) {
      // Decidir se haverá match (30% de chance)
      const shouldMatchVisual = i >= nBackLevel && Math.random() < 0.3;
      const shouldMatchAudio = i >= nBackLevel && Math.random() < 0.3;

      const visualPos = shouldMatchVisual 
        ? newSequence[i - nBackLevel].visual
        : Math.floor(Math.random() * 9);
      
      const audioIdx = shouldMatchAudio
        ? newSequence[i - nBackLevel].audio
        : Math.floor(Math.random() * audioStimuli.length);

      newSequence.push({
        visual: visualPos,
        audio: audioIdx,
        visualMatch: shouldMatchVisual,
        audioMatch: shouldMatchAudio
      });
    }

    setSequence(newSequence);
    setCurrentIndex(0);
    setShowingStimulus(true);
  }, [nBackLevel, audioStimuli.length]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const nextStimulus = useCallback(() => {
    if (currentIndex >= sequence.length - 1) {
      finishRound();
      return;
    }

    setCurrentIndex(prev => prev + 1);
    
    // Tocar som correspondente
    const current = sequence[currentIndex + 1];
    audioManager.playNote(audioNotes[current.audio], 0.3);
  }, [currentIndex, sequence, audioNotes, finishRound]);

  useEffect(() => {
    if (gameState === 'playing' && showingStimulus) {
      const timer = setTimeout(() => {
        nextStimulus();
      }, 2500); // 2.5 segundos por estímulo

      return () => clearTimeout(timer);
    }
  }, [gameState, showingStimulus, nextStimulus]);

  const handleResponse = (type) => {
    if (!showingStimulus || currentIndex < nBackLevel) return;

    const current = sequence[currentIndex];
    const isCorrect = type === 'visual' ? current.visualMatch : current.audioMatch;

    // Feedback visual e sonoro
    if (isCorrect) {
      setScore(prev => prev + 10 * nBackLevel);
      setStats(prev => ({
        ...prev,
        [`${type}Correct`]: prev[`${type}Correct`] + 1
      }));
      audioManager.play('success');
      showFeedback('✓', 'success');
      setParticleType('success');
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 300);
    } else {
      setStats(prev => ({
        ...prev,
        [`${type}Wrong`]: prev[`${type}Wrong`] + 1
      }));
      audioManager.play('error');
      showFeedback('✗', 'error');
    }
  };

  const showFeedback = (symbol, type) => {
    setFeedback({ symbol, type });
    setTimeout(() => setFeedback(null), 500);
  };

  const finishRound = useCallback(() => {
    setShowingStimulus(false);
    setRound(prev => prev + 1);

    // Calcular performance
    const totalVisual = stats.visualCorrect + stats.visualWrong;
    const totalAudio = stats.audioCorrect + stats.audioWrong;
    const visualAccuracy = totalVisual > 0 ? (stats.visualCorrect / totalVisual) * 100 : 0;
    const audioAccuracy = totalAudio > 0 ? (stats.audioCorrect / totalAudio) * 100 : 0;
    const overallAccuracy = (visualAccuracy + audioAccuracy) / 2;

    // IA adapta dificuldade
    aiAdaptation.analyzePerformance({
      accuracy: overallAccuracy,
      reactionTime: 1000,
      errorsCount: stats.visualWrong + stats.audioWrong,
      successStreak: stats.visualCorrect + stats.audioCorrect
    });

    // Decidir se avança de nível
    if (round >= 2 && overallAccuracy > 75 && nBackLevel < 3) {
      setTimeout(() => {
        setNBackLevel(prev => prev + 1);
        audioManager.play('achievement');
        alert(`Parabéns! Avançou para ${nBackLevel + 1}-Back!`);
        generateSequence();
        setShowingStimulus(true);
      }, 2000);
    } else if (round >= 3) {
      finishGame();
    } else {
      setTimeout(() => {
        generateSequence();
        setShowingStimulus(true);
      }, 2000);
    }
  }, [round, stats, nBackLevel, generateSequence, finishGame]);

  const finishGame = useCallback(async () => {
    setGameState('finished');
    addPoints(score);

    const gameTime = (Date.now() - gameStartTime.current) / 1000;
    
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
          atividade_id: 3,
          pontos: score,
          tempo_gasto: Math.floor(gameTime),
          acertos: stats.visualCorrect + stats.audioCorrect,
          erros: stats.visualWrong + stats.audioWrong
        })
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  }, [score, stats, user.id, addPoints]);

  const currentStimulus = sequence[currentIndex];

  return (
    <div className="jogo-memoria-dupla-container">
      <EmergencyStop onStop={() => setGameState('ready')} />
      <ParticleSystem type={particleType} active={showParticles} />

      <div className="game-header">
        <button onClick={() => navigate('/aluno')} className="btn-voltar">
          ← Voltar
        </button>
        <div className="game-info">
          <div className="info-item">
            <span className="info-label">Nível:</span>
            <span className="info-value">{nBackLevel}-Back</span>
          </div>
          <div className="info-item">
            <span className="info-label">Rodada:</span>
            <span className="info-value">{round + 1}/4</span>
          </div>
          <div className="info-item">
            <span className="info-label">Pontos:</span>
            <span className="info-value">{score}</span>
          </div>
        </div>
      </div>

      {gameState === 'ready' && (
        <motion.div 
          className="start-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1>🧠 Memória Dupla</h1>
          <div className="instructions">
            <h2>Como Jogar:</h2>
            <p>1. Observe a posição iluminada no grid</p>
            <p>2. Ouça a letra/som apresentado</p>
            <p>3. Clique "Visual" se a posição for igual a {nBackLevel} passo(s) atrás</p>
            <p>4. Clique "Áudio" se o som for igual a {nBackLevel} passo(s) atrás</p>
            <p>5. Você pode clicar ambos se os dois coincidirem!</p>
          </div>
          <button onClick={startGame} className="btn btn-primary btn-large">
            Começar Treino
          </button>
        </motion.div>
      )}

      {gameState === 'playing' && showingStimulus && (
        <div className="game-area">
          <div className="stimulus-display">
            <div className="grid-container">
              {gridPositions.map((pos, idx) => (
                <motion.div
                  key={idx}
                  className={`grid-cell ${currentStimulus && currentStimulus.visual === idx ? 'active' : ''}`}
                  animate={currentStimulus && currentStimulus.visual === idx ? {
                    scale: [1, 1.2, 1],
                    backgroundColor: ['#667eea', '#FFD93D', '#667eea']
                  } : {}}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>

            <div className="audio-display">
              <motion.div
                className="audio-letter"
                key={currentIndex}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {currentStimulus && audioStimuli[currentStimulus.audio]}
              </motion.div>
            </div>
          </div>

          <div className="response-buttons">
            <motion.button
              className="response-btn visual-btn"
              onClick={() => handleResponse('visual')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentIndex < nBackLevel}
            >
              👁️ Visual Match
            </motion.button>
            <motion.button
              className="response-btn audio-btn"
              onClick={() => handleResponse('audio')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={currentIndex < nBackLevel}
            >
              🔊 Áudio Match
            </motion.button>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`feedback-popup ${feedback.type}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {feedback.symbol}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="progress-indicator">
            <div 
              className="progress-bar"
              style={{ width: `${(currentIndex / sequence.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <motion.div 
          className="finish-screen"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1>🎉 Treino Completo!</h1>
          <div className="final-stats">
            <div className="stat-card">
              <span className="stat-title">Pontuação Final</span>
              <span className="stat-number">{score}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Nível Alcançado</span>
              <span className="stat-number">{nBackLevel}-Back</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Acertos Visuais</span>
              <span className="stat-number">{stats.visualCorrect}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Acertos Auditivos</span>
              <span className="stat-number">{stats.audioCorrect}</span>
            </div>
          </div>
          <div className="final-buttons">
            <button onClick={startGame} className="btn btn-primary">
              Treinar Novamente
            </button>
            <button onClick={() => navigate('/aluno')} className="btn btn-secondary">
              Menu Principal
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default JogoMemoriaDupla;
