import React, { useEffect, useRef, useState } from 'react';
import './EchoTemple.css';
import { getAudioFeedback } from '../../shared/utils/audioFeedback';
import { AdaptiveDifficulty } from '../CyberRunnerCanvas/adaptiveDifficulty';
import { SensorySettings, loadSensorySettings, applySensorySettings } from '../../shared/components/SensorySettings';
import { useAchievementSystem } from '../../features/achievements';

const EchoTemple = () => {
  const canvasRef = useRef(null);
  const { trackEvent } = useAchievementSystem();
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState('encoding'); // encoding, retention, recall
  const [stats, setStats] = useState({ acertos: 0, erros: 0 });
  const [sequencesCompleted, setSequencesCompleted] = useState(0);
  const [maxSequenceLength, setMaxSequenceLength] = useState(0);
  const [adaptiveMessage, setAdaptiveMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const gameRef = useRef(null);
  const audioRef = useRef(null);
  const adaptiveSystemRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    // Carrega e aplica configurações sensoriais
    const settings = loadSensorySettings('default');
    const audio = getAudioFeedback();
    applySensorySettings(settings, canvas, audio);

    // Estado do jogo
    const game = {
      player: {
        x: 640,
        y: 360,
        size: 40,
        gridX: 2,
        gridY: 2,
        moving: false,
        targetX: 640,
        targetY: 360
      },
      grid: {
        cols: 5,
        rows: 5,
        cellSize: 100,
        offsetX: 390,
        offsetY: 110
      },
      sequence: [],
      currentStep: 0,
      showingSequence: false,
      sequenceTimer: 0,
      retentionTimer: 0,
      platforms: [],
      collectibles: [],
      nBackItem: null,
      keys: {},
      animationId: null,
      particles: []
    };

    gameRef.current = game;

    // Inicializa sistema adaptativo
    if (!adaptiveSystemRef.current) {
      adaptiveSystemRef.current = new AdaptiveDifficulty();
    }
    const adaptiveSystem = adaptiveSystemRef.current;

    // Inicializa áudio após primeira interação
    const initAudio = async () => {
      if (!audioRef.current) {
        audioRef.current = getAudioFeedback();
        await audioRef.current.init();
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    // GERAR SEQUÊNCIA DE PLATAFORMAS
    const generateSequence = () => {
      // Usa parâmetros adaptativos para determinar comprimento
      const params = adaptiveSystem.getParams();
      const baseLength = 3;
      const adaptiveLength = Math.floor(params.speed / 2); // speed varia de 3-15
      const length = Math.min(baseLength + adaptiveLength, 10); // Máximo 10
      
      const sequence = [];
      
      for (let i = 0; i < length; i++) {
        const col = Math.floor(Math.random() * game.grid.cols);
        const row = Math.floor(Math.random() * game.grid.rows);
        sequence.push({ col, row, number: i + 1 });
      }
      
      game.sequence = sequence;
      game.currentStep = 0;
      game.attemptStartTime = Date.now();
      
      // Cria plataformas
      game.platforms = sequence.map(s => ({
        col: s.col,
        row: s.row,
        number: s.number,
        visible: false,
        correct: false
      }));
    };

    // CRIAR PARTÍCULAS
    const createParticles = (x, y, color, count = 15) => {
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 40,
          color,
          size: Math.random() * 6 + 2
        });
      }
    };

    // DESENHAR GRID
    const drawGrid = () => {
      const { cols, rows, cellSize, offsetX, offsetY } = game.grid;
      
      // Fundo do templo
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Estrelas de fundo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 100; i++) {
        const x = (i * 137) % canvas.width;
        const y = (i * 73) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
      }
      
      // Grid de plataformas
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;
          
          // Borda da célula
          ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellSize, cellSize);
          
          // Coordenadas (debug)
          if (gameState === 'playing' && phase === 'encoding') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = '12px Arial';
            ctx.fillText(`${col},${row}`, x + 5, y + 15);
          }
        }
      }
    };

    // DESENHAR PLATAFORMAS
    const drawPlatforms = () => {
      const { cellSize, offsetX, offsetY } = game.grid;
      
      game.platforms.forEach(platform => {
        const x = offsetX + platform.col * cellSize;
        const y = offsetY + platform.row * cellSize;
        
        if (phase === 'encoding' && game.showingSequence) {
          // Mostra sequência
          const isCurrentStep = game.sequence[game.currentStep] &&
                               game.sequence[game.currentStep].col === platform.col &&
                               game.sequence[game.currentStep].row === platform.row;
          
          if (isCurrentStep) {
            // Plataforma brilhando
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(x + 10, y + 10, cellSize - 20, cellSize - 20);
            
            // Número
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(platform.number, x + cellSize / 2, y + cellSize / 2 + 15);
            ctx.shadowBlur = 0;
          }
        } else if (phase === 'recall') {
          // Mostra plataformas pisadas
          if (platform.correct) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.fillRect(x + 10, y + 10, cellSize - 20, cellSize - 20);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓', x + cellSize / 2, y + cellSize / 2 + 12);
          }
        }
      });
    };

    // DESENHAR JOGADOR
    const drawPlayer = () => {
      const p = game.player;
      
      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + p.size / 2 + 5, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Corpo do explorador
      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffd700';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Olhos
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(p.x - 8, p.y - 5, 4, 0, Math.PI * 2);
      ctx.arc(p.x + 8, p.y - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Boca
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y + 5, 8, 0, Math.PI);
      ctx.stroke();
    };

    // DESENHAR PARTÍCULAS
    const drawParticles = () => {
      game.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 40;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;
    };

    // DESENHAR HUD
    const drawHUD = () => {
      // Pontos
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`PONTOS: ${score}`, 20, 30);
      
      // Nível
      ctx.fillText(`NÍVEL: ${level}`, 20, 60);
      
      // Fase
      const phaseText = {
        encoding: '📖 MEMORIZE',
        retention: '⏳ AGUARDE',
        recall: '🎯 LEMBRE-SE'
      };
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(phaseText[phase] || '', 640, 50);
      
      // Precisão
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 100;
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`PRECISÃO: ${precisao}%`, 1260, 30);
      
      // Mensagem de ajuste adaptativo
      if (adaptiveMessage) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(340, 80, 600, 60);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(adaptiveMessage, 640, 115);
      }
      
      // Timer de retenção
      if (phase === 'retention' && game.retentionTimer > 0) {
        const seconds = Math.ceil(game.retentionTimer / 60);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(seconds, 640, 360);
      }
    };

    // CONTROLES
    const handleKeyDown = (e) => {
      game.keys[e.key] = true;
      
      if (gameState === 'menu') {
        if (e.key === ' ') {
          setGameState('playing');
          resetGame();
        } else if (e.key === 'c' || e.key === 'C') {
          setShowSettings(true);
        }
      } else if (gameState === 'playing' && phase === 'recall' && !game.player.moving) {
        let newGridX = game.player.gridX;
        let newGridY = game.player.gridY;
        
        if (e.key === 'ArrowUp' && newGridY > 0) newGridY--;
        else if (e.key === 'ArrowDown' && newGridY < game.grid.rows - 1) newGridY++;
        else if (e.key === 'ArrowLeft' && newGridX > 0) newGridX--;
        else if (e.key === 'ArrowRight' && newGridX < game.grid.cols - 1) newGridX++;
        
        if (newGridX !== game.player.gridX || newGridY !== game.player.gridY) {
          game.player.gridX = newGridX;
          game.player.gridY = newGridY;
          game.player.targetX = game.grid.offsetX + newGridX * game.grid.cellSize + game.grid.cellSize / 2;
          game.player.targetY = game.grid.offsetY + newGridY * game.grid.cellSize + game.grid.cellSize / 2;
          game.player.moving = true;
          
          checkPlatform(newGridX, newGridY);
        }
      } else if (gameState === 'gameover' && e.key === ' ') {
        setGameState('menu');
      }
    };

    const handleKeyUp = (e) => {
      game.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // VERIFICAR PLATAFORMA
    const checkPlatform = (col, row) => {
      const expectedPlatform = game.sequence[game.currentStep];
      const reactionTime = Date.now() - game.attemptStartTime;
      
      if (expectedPlatform && expectedPlatform.col === col && expectedPlatform.row === row) {
        // Acertou!
        const platform = game.platforms.find(p => p.col === col && p.row === row);
        if (platform) platform.correct = true;
        
        // Registra tentativa no sistema adaptativo
        const result = adaptiveSystem.recordAttempt({
          correct: true,
          reactionTime: reactionTime,
          type: 'memory'
        });
        
        // Aplica ajustes se houver
        if (result) {
          setAdaptiveMessage(result.message);
          setTimeout(() => setAdaptiveMessage(null), 3000);
        }
        
        setScore(s => s + 50 + (level * 10));
        setStats(st => ({ ...st, acertos: st.acertos + 1 }));
        createParticles(game.player.targetX, game.player.targetY, '#00ff00', 20);
        
        // Feedback auditivo
        audioRef.current?.onCorrectAnswer(game.currentStep);
        
        game.currentStep++;
        game.attemptStartTime = Date.now();
        
        // Completou sequência?
        if (game.currentStep >= game.sequence.length) {
          // Som de nível completo
          audioRef.current?.onLevelComplete();
          
          // Track sequence completion
          setSequencesCompleted(c => {
            const newCount = c + 1;
            trackEvent('sequence_completed', {
              game: 'echo-temple',
              totalCompleted: newCount,
              sequenceLength: game.sequence.length
            });
            return newCount;
          });
          
          // Track max sequence length
          setMaxSequenceLength(m => {
            const newMax = Math.max(m, game.sequence.length);
            if (newMax > m) {
              trackEvent('sequence_length', {
                game: 'echo-temple',
                length: newMax
              });
            }
            return newMax;
          });
          
          setTimeout(() => {
            setLevel(l => l + 1);
            startNewRound();
          }, 1000);
        }
      } else {
        // Errou!
        // Registra tentativa no sistema adaptativo
        const result = adaptiveSystem.recordAttempt({
          correct: false,
          reactionTime: reactionTime,
          type: 'memory'
        });
        
        // Aplica ajustes se houver
        if (result) {
          setAdaptiveMessage(result.message);
          setTimeout(() => setAdaptiveMessage(null), 3000);
        }
        
        setStats(st => ({ ...st, erros: st.erros + 1 }));
        createParticles(game.player.targetX, game.player.targetY, '#ff0000', 15);
        
        // Feedback auditivo
        audioRef.current?.onIncorrectAnswer();
        
        // Volta para início
        setTimeout(() => {
          game.player.gridX = 2;
          game.player.gridY = 2;
          game.player.x = 640;
          game.player.y = 360;
          game.currentStep = 0;
          game.platforms.forEach(p => p.correct = false);
          game.attemptStartTime = Date.now();
        }, 500);
      }
    };

    // INICIAR NOVA RODADA
    const startNewRound = () => {
      generateSequence();
      setPhase('encoding');
      game.showingSequence = true;
      game.currentStep = 0;
      game.sequenceTimer = 0;
      
      // Reseta jogador
      game.player.gridX = 2;
      game.player.gridY = 2;
      game.player.x = 640;
      game.player.y = 360;
    };

    const resetGame = () => {
      setScore(0);
      setLevel(1);
      setStats({ acertos: 0, erros: 0 });
      setAdaptiveMessage(null);
      game.particles = [];
      
      // Reseta sistema adaptativo
      adaptiveSystem.reset();
      
      startNewRound();
    };

    // UPDATE
    const update = () => {
      if (gameState !== 'playing') return;

      // Move jogador suavemente
      if (game.player.moving) {
        const dx = game.player.targetX - game.player.x;
        const dy = game.player.targetY - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 5) {
          game.player.x = game.player.targetX;
          game.player.y = game.player.targetY;
          game.player.moving = false;
        } else {
          game.player.x += (dx / dist) * 8;
          game.player.y += (dy / dist) * 8;
        }
      }

      // Fase de codificação (mostra sequência)
      if (phase === 'encoding' && game.showingSequence) {
        game.sequenceTimer++;
        
        // Usa parâmetros adaptativos para velocidade de apresentação
        const params = adaptiveSystem.getParams();
        const presentationSpeed = Math.max(60, 120 - params.speed * 5); // 60-120 frames
        
        if (game.sequenceTimer % presentationSpeed === 0) {
          game.currentStep++;
          
          if (game.currentStep >= game.sequence.length) {
            game.showingSequence = false;
            setPhase('retention');
            
            // Tempo de retenção adaptativo
            const retentionTime = Math.max(120, 240 - params.speed * 10); // 120-240 frames (2-4s)
            game.retentionTimer = retentionTime;
          }
        }
      }

      // Fase de retenção (espera)
      if (phase === 'retention') {
        game.retentionTimer--;
        
        if (game.retentionTimer <= 0) {
          setPhase('recall');
          game.currentStep = 0;
          game.attemptStartTime = Date.now();
        }
      }

      // Atualiza partículas
      game.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          game.particles.splice(index, 1);
        }
      });
    };

    // DRAW
    const draw = () => {
      if (gameState === 'menu') {
        drawMenu();
      } else if (gameState === 'playing') {
        drawGame();
      } else if (gameState === 'gameover') {
        drawGameOver();
      }
    };

    const drawMenu = () => {
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      const titleY = 150 + Math.sin(Date.now() / 500) * 10;
      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#00ffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TEMPLO DOS ECOS', 640, titleY);
      ctx.shadowBlur = 0;

      // Subtítulo
      ctx.fillStyle = '#ffd700';
      ctx.font = '28px Arial';
      ctx.fillText('🧠 Treinamento de Memória Visuoespacial 🧠', 640, 250);

      // Instruções
      const instructions = [
        '1. MEMORIZE a sequência de plataformas',
        '2. AGUARDE o tempo de retenção',
        '3. NAVEGUE pela sequência correta',
        '',
        'Use as SETAS ← ↑ → ↓ para mover',
        '',
        'Pressione ESPAÇO para começar'
      ];

      let y = 350;
      instructions.forEach(inst => {
        ctx.fillStyle = inst === '' ? '#00ffff' : 'white';
        ctx.font = inst.includes('ESPAÇO') ? 'bold 24px Arial' : '20px Arial';
        ctx.fillText(inst, 640, y);
        y += 40;
      });
      
      // Botão de configurações
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(20, 650, 200, 50);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 650, 200, 50);
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('⚙️ Config (C)', 40, 682);
    };

    const drawGame = () => {
      drawGrid();
      drawPlatforms();
      drawParticles();
      drawPlayer();
      drawHUD();
    };

    const drawGameOver = () => {
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 640, 200);

      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 0;

      ctx.fillStyle = 'white';
      ctx.font = '28px Arial';
      ctx.fillText(`Pontuação: ${score}`, 640, 300);
      ctx.fillText(`Nível Alcançado: ${level}`, 640, 350);
      ctx.fillText(`Precisão: ${precisao}%`, 640, 400);

      ctx.fillStyle = '#00ffff';
      ctx.fillText('Pressione ESPAÇO para voltar ao menu', 640, 500);
    };

    // GAME LOOP
    const gameLoop = () => {
      update();
      draw();
      game.animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('click', initAudio);
      if (game.animationId) {
        cancelAnimationFrame(game.animationId);
      }
    };
  }, [gameState, score, level, phase, stats]);
  
  // Handler para salvar configurações
  const handleSaveSettings = (newSettings) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    applySensorySettings(newSettings, canvas, audio);
  };

  return (
    <div className="echo-temple">
      <canvas ref={canvasRef} />
      
      {/* Modal de Configurações */}
      {showSettings && (
        <SensorySettings
          userId="default"
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default EchoTemple;
