import React, { useEffect, useRef, useState } from 'react';
import './CyberRunnerCanvas.css';
import { AdaptiveDifficulty } from './adaptiveDifficulty';
import { SensorySettings, loadSensorySettings, applySensorySettings } from '../../shared/components/SensorySettings';
import { getAudioFeedback } from '../../shared/utils/audioFeedback';

const CyberRunnerEnhanced = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [powerUp, setPowerUp] = useState(null);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ acertos: 0, erros: 0 });
  const [adaptiveMessage, setAdaptiveMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const gameRef = useRef(null);
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

    // Inicializa sistema adaptativo
    if (!adaptiveSystemRef.current) {
      adaptiveSystemRef.current = new AdaptiveDifficulty();
    }
    const adaptiveSystem = adaptiveSystemRef.current;

    // Estado do jogo
    const game = {
      player: {
        x: 100,
        y: 570,
        width: 50,
        height: 70,
        jumping: false,
        sliding: false,
        velocityY: 0,
        frame: 0,
        animationCounter: 0
      },
      obstacles: [],
      collectibles: [],
      particles: [],
      speed: 5,
      lastObstacle: 0,
      lastCollectible: 0,
      challengeActive: false,
      currentChallenge: null,
      challengeButtons: [],
      keys: {},
      animationId: null,
      backgroundOffset: 0,
      comboTimer: 0,
      lastAttemptTime: 0
    };

    gameRef.current = game;

    // DESAFIOS COGNITIVOS VARIADOS
    const challengeTypes = {
      math: {
        name: 'Matemática',
        icon: '🔢',
        generate: () => {
          const ops = ['+', '-', '×'];
          const op = ops[Math.floor(Math.random() * ops.length)];
          const a = Math.floor(Math.random() * 15) + 1;
          const b = Math.floor(Math.random() * 15) + 1;
          let answer;
          if (op === '+') answer = a + b;
          else if (op === '-') answer = a - b;
          else answer = a * b;
          const wrong1 = answer + Math.floor(Math.random() * 5) + 1;
          const wrong2 = answer - Math.floor(Math.random() * 5) - 1;
          const options = [answer, wrong1, wrong2].sort(() => Math.random() - 0.5);
          return {
            question: `${a} ${op} ${b} = ?`,
            answer: answer,
            options: options,
            type: 'math'
          };
        }
      },
      color: {
        name: 'Cores',
        icon: '🎨',
        generate: () => {
          const colors = [
            { name: 'VERMELHO', color: '#ff0000', text: 'VERMELHO' },
            { name: 'AZUL', color: '#0000ff', text: 'AZUL' },
            { name: 'VERDE', color: '#00ff00', text: 'VERDE' },
            { name: 'AMARELO', color: '#ffff00', text: 'AMARELO' }
          ];
          const target = colors[Math.floor(Math.random() * colors.length)];
          const wrongColor = colors[Math.floor(Math.random() * colors.length)];
          return {
            question: 'Qual a COR da palavra?',
            display: { text: target.text, color: wrongColor.color },
            answer: wrongColor.name,
            options: colors.map(c => c.name).sort(() => Math.random() - 0.5).slice(0, 3),
            type: 'color'
          };
        }
      },
      sequence: {
        name: 'Sequência',
        icon: '🔄',
        generate: () => {
          const patterns = [
            { seq: [1, 2, 3, 4], next: 5 },
            { seq: [2, 4, 6, 8], next: 10 },
            { seq: [1, 3, 5, 7], next: 9 },
            { seq: [5, 10, 15, 20], next: 25 }
          ];
          const pattern = patterns[Math.floor(Math.random() * patterns.length)];
          return {
            question: `${pattern.seq.join(', ')}, ?`,
            answer: pattern.next,
            options: [pattern.next, pattern.next + 1, pattern.next - 1].sort(() => Math.random() - 0.5),
            type: 'sequence'
          };
        }
      },
      memory: {
        name: 'Memória',
        icon: '🧠',
        generate: () => {
          const symbols = ['🌟', '🎯', '🚀', '⚡', '🎨', '🎵'];
          const sequence = [];
          const length = 3 + Math.floor(level / 3);
          for (let i = 0; i < length; i++) {
            sequence.push(symbols[Math.floor(Math.random() * symbols.length)]);
          }
          return {
            question: 'Memorize a sequência!',
            sequence: sequence,
            answer: sequence[sequence.length - 1],
            options: symbols.sort(() => Math.random() - 0.5).slice(0, 3),
            type: 'memory',
            showTime: 3000
          };
        }
      }
    };

    // DESENHAR PERSONAGEM ANIMADO
    const drawPlayer = () => {
      const p = game.player;
      const height = p.sliding ? p.height / 2 : p.height;
      
      // Corpo do robô
      const bodyColor = powerUp === 'shield' ? '#00ffff' : '#4a9eff';
      const glowColor = p.jumping || p.sliding ? '#ffff00' : '#00ffff';
      
      // Efeito glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = glowColor;
      
      // Corpo principal
      ctx.fillStyle = bodyColor;
      ctx.fillRect(p.x, p.y, p.width, height);
      
      // Cabeça
      ctx.fillStyle = '#6ab7ff';
      ctx.fillRect(p.x + 5, p.y - 20, p.width - 10, 20);
      
      // Olhos (piscando)
      const eyeOpen = Math.floor(game.player.animationCounter / 30) % 10 !== 0;
      if (eyeOpen) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(p.x + 12, p.y - 12, 8, 8);
        ctx.fillRect(p.x + 30, p.y - 12, 8, 8);
      }
      
      // Braços (animados)
      const armOffset = Math.sin(game.player.animationCounter / 5) * 5;
      ctx.fillStyle = '#4a9eff';
      ctx.fillRect(p.x - 10, p.y + 15 + armOffset, 10, 25);
      ctx.fillRect(p.x + p.width, p.y + 15 - armOffset, 10, 25);
      
      // Pernas (animadas ao correr)
      if (!p.jumping && !p.sliding) {
        const legOffset = Math.sin(game.player.animationCounter / 3) * 10;
        ctx.fillRect(p.x + 10, p.y + height, 12, 15 + legOffset);
        ctx.fillRect(p.x + 28, p.y + height, 12, 15 - legOffset);
      }
      
      // Power-up visual
      if (powerUp) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x - 5, p.y - 25, p.width + 10, height + 30);
      }
      
      ctx.shadowBlur = 0;
      game.player.animationCounter++;
    };

    // CRIAR OBSTÁCULOS
    const createObstacle = () => {
      const type = Math.random() < 0.7 ? 'go' : 'nogo';
      const obstacle = {
        x: 1280,
        y: type === 'go' ? 490 : 590,
        width: 60,
        height: type === 'go' ? 80 : 40,
        type: type,
        color: type === 'go' ? '#00ff00' : '#ff0000'
      };
      game.obstacles.push(obstacle);
    };

    // CRIAR COLECIONÁVEIS
    const createCollectible = () => {
      const types = ['coin', 'star', 'powerup'];
      const weights = [0.7, 0.2, 0.1];
      let random = Math.random();
      let type = 'coin';
      
      for (let i = 0; i < weights.length; i++) {
        if (random < weights[i]) {
          type = types[i];
          break;
        }
        random -= weights[i];
      }
      
      const collectible = {
        x: 1280,
        y: 400 + Math.random() * 150,
        width: 30,
        height: 30,
        type: type,
        collected: false,
        rotation: 0
      };
      game.collectibles.push(collectible);
    };

    // CRIAR PARTÍCULAS
    const createParticles = (x, y, color, count = 10) => {
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 30,
          color: color,
          size: Math.random() * 5 + 2
        });
      }
    };

    // GERAR DESAFIO COGNITIVO
    const generateChallenge = () => {
      const types = Object.keys(challengeTypes);
      const type = types[Math.floor(Math.random() * types.length)];
      return challengeTypes[type].generate();
    };

    // CONTROLES
    const handleKeyDown = (e) => {
      game.keys[e.key] = true;
      
      if (gameState === 'menu' && e.key === ' ') {
        setGameState('playing');
        resetGame();
      } else if (gameState === 'playing') {
        if (e.key === ' ' && !game.player.jumping) {
          game.player.jumping = true;
          game.player.velocityY = -12; // Reduzido de -16 para -12 (pulo mais suave)
        } else if (e.key === 'ArrowDown') {
          game.player.sliding = true;
        }
      } else if (gameState === 'gameover' && e.key === ' ') {
        setGameState('menu');
      }
    };

    const handleKeyUp = (e) => {
      game.keys[e.key] = false;
      if (e.key === 'ArrowDown') {
        game.player.sliding = false;
      }
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Verifica clique no botão de configurações (menu)
      if (gameState === 'menu' && x >= 20 && x <= 220 && y >= 650 && y <= 700) {
        setShowSettings(true);
        return;
      }
      
      if (!game.challengeActive) return;

      game.challengeButtons.forEach(btn => {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          const correct = btn.value === game.currentChallenge.answer ||
                         btn.value === game.currentChallenge.answer.toString();
          
          // Calcula tempo de reação
          const reactionTime = Date.now() - game.lastAttemptTime;
          
          // Registra tentativa no sistema adaptativo
          const result = adaptiveSystem.recordAttempt({
            correct: correct,
            reactionTime: reactionTime,
            type: 'challenge'
          });
          
          // Aplica novos parâmetros se houve ajuste
          if (result) {
            const params = result.params;
            game.speed = params.speed;
            game.challengeFrequency = params.challengeFrequency;
            
            // Mostra mensagem de ajuste
            setAdaptiveMessage(result.message);
            setTimeout(() => setAdaptiveMessage(null), 3000);
          }
          
          if (correct) {
            setScore(s => s + 50 + (combo * 10));
            setCombo(c => c + 1);
            setStats(st => ({ ...st, acertos: st.acertos + 1 }));
            createParticles(640, 360, '#00ff00', 20);
            game.comboTimer = 180; // 3 segundos
          } else {
            setStats(st => ({ ...st, erros: st.erros + 1 }));
            setCombo(0);
            createParticles(640, 360, '#ff0000', 15);
          }
          
          game.challengeActive = false;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleClick);

    // Importar funções de desenho
    const { drawBackground, drawCollectible, drawParticles, drawHUD, drawChallenge } = 
      require('./gameDrawFunctions');

    const resetGame = () => {
      game.player.y = 570;
      game.player.jumping = false;
      game.player.sliding = false;
      game.player.velocityY = 0;
      game.obstacles = [];
      game.collectibles = [];
      game.particles = [];
      game.challengeActive = false;
      game.lastObstacle = 0;
      game.lastCollectible = 0;
      game.backgroundOffset = 0;
      game.lastAttemptTime = 0;
      setScore(0);
      setLives(3);
      setCoins(0);
      setLevel(1);
      setPowerUp(null);
      setCombo(0);
      setStats({ acertos: 0, erros: 0 });
      setAdaptiveMessage(null);
      
      // Reseta sistema adaptativo
      adaptiveSystem.reset();
    };

    const update = () => {
      if (gameState !== 'playing') return;

      // Atualiza offset do fundo
      const currentSpeed = game.challengeActive ? game.speed * 0.3 : game.speed; // Câmera lenta durante desafio
      game.backgroundOffset += currentSpeed;

      // Física do pulo
      if (game.player.jumping) {
        game.player.y += game.player.velocityY;
        game.player.velocityY += 0.8; // Reduzido de 1 para 0.8 (gravidade mais suave)

        if (game.player.y >= 570) {
          game.player.y = 570;
          game.player.jumping = false;
          game.player.velocityY = 0;
        }
      }

      // Gera obstáculos
      if (game.obstacles.length < 3 && Date.now() - game.lastObstacle > 2000) {
        createObstacle();
        game.lastObstacle = Date.now();
      }

      // Gera colecionáveis
      if (game.collectibles.length < 2 && Date.now() - game.lastCollectible > 3000) {
        createCollectible();
        game.lastCollectible = Date.now();
      }

      // Move obstáculos (continua mesmo durante desafio, mas mais devagar)
      game.obstacles.forEach((obs, index) => {
        obs.x -= currentSpeed;

        // Colisão
        if (game.player.x < obs.x + obs.width &&
            game.player.x + game.player.width > obs.x &&
            game.player.y < obs.y + obs.height &&
            game.player.y + game.player.height > obs.y) {

          if (powerUp === 'shield') {
            setPowerUp(null);
            game.obstacles.splice(index, 1);
            createParticles(obs.x, obs.y, '#00ffff', 15);
            return;
          }

          const correct = (obs.type === 'go' && game.player.jumping) ||
                        (obs.type === 'nogo' && game.player.sliding);

          // Calcula tempo de reação (tempo desde que obstáculo ficou visível)
          const reactionTime = Math.max(100, 1500 - (obs.x - game.player.x) / game.speed * 16);
          
          // Registra tentativa no sistema adaptativo
          const result = adaptiveSystem.recordAttempt({
            correct: correct,
            reactionTime: reactionTime,
            type: 'obstacle'
          });
          
          // Aplica novos parâmetros se houve ajuste
          if (result) {
            const params = result.params;
            game.speed = params.speed;
            
            // Mostra mensagem de ajuste
            setAdaptiveMessage(result.message);
            setTimeout(() => setAdaptiveMessage(null), 3000);
          }

          if (correct) {
            setScore(s => s + 10 + (combo * 2));
            setCombo(c => c + 1);
            setStats(st => ({ ...st, acertos: st.acertos + 1 }));
            createParticles(obs.x, obs.y, '#00ff00', 10);
            game.comboTimer = 180;
          } else {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              }
              return newLives;
            });
            setCombo(0);
            setStats(st => ({ ...st, erros: st.erros + 1 }));
            createParticles(obs.x, obs.y, '#ff0000', 15);
          }

          game.obstacles.splice(index, 1);
        }

        if (obs.x < -obs.width) {
          game.obstacles.splice(index, 1);
        }
      });

      // Move e coleta colecionáveis
      game.collectibles.forEach((col, index) => {
        col.x -= currentSpeed; // Usa velocidade ajustada
        col.rotation += 0.1;

        // Colisão com jogador
        if (!col.collected &&
            game.player.x < col.x + col.width &&
            game.player.x + game.player.width > col.x &&
            game.player.y < col.y + col.height &&
            game.player.y + game.player.height > col.y) {
          
          col.collected = true;
          
          if (col.type === 'coin') {
            setCoins(c => c + 1);
            setScore(s => s + 5);
            createParticles(col.x, col.y, '#ffd700', 8);
          } else if (col.type === 'star') {
            setScore(s => s + 25);
            createParticles(col.x, col.y, '#ffff00', 12);
          } else if (col.type === 'powerup') {
            setPowerUp('shield');
            setTimeout(() => setPowerUp(null), 10000);
            createParticles(col.x, col.y, '#ff00ff', 15);
          }
          
          game.collectibles.splice(index, 1);
        }

        if (col.x < -col.width) {
          game.collectibles.splice(index, 1);
        }
      });

      // Atualiza partículas
      game.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          game.particles.splice(index, 1);
        }
      });

      // Timer do combo
      if (game.comboTimer > 0) {
        game.comboTimer--;
        if (game.comboTimer === 0) {
          setCombo(0);
        }
      }

      // Ativa desafio cognitivo (usa frequência adaptativa)
      const params = adaptiveSystem.getParams();
      if (!game.challengeActive && Math.random() < params.challengeFrequency) {
        game.challengeActive = true;
        game.currentChallenge = generateChallenge();
        game.lastAttemptTime = Date.now();
      }

      // Aumenta nível baseado na pontuação
      const newLevel = Math.floor(score / 500) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        game.speed = Math.min(5 + newLevel * 0.5, 12);
      }
    };

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
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título animado
      const titleY = 150 + Math.sin(Date.now() / 500) * 10;
      ctx.fillStyle = '#00ffff';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#00ffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CYBER-RUNNER', 640, titleY);
      ctx.shadowBlur = 0;

      // Subtítulo
      ctx.fillStyle = 'white';
      ctx.font = '28px Arial';
      ctx.fillText('🧠 Treinamento Cognitivo Avançado 🧠', 640, 250);

      // Instruções com ícones
      const instructions = [
        { text: 'VERDE ↑ = PULAR (ESPAÇO)', color: '#00ff00' },
        { text: 'VERMELHO ↓ = DESLIZAR (↓)', color: '#ff0000' },
        { text: '💰 Colete moedas e power-ups!', color: '#ffd700' },
        { text: '🧠 Resolva desafios cognitivos!', color: '#00ffff' }
      ];

      let y = 350;
      instructions.forEach(inst => {
        ctx.fillStyle = inst.color;
        ctx.font = 'bold 22px Arial';
        ctx.fillText(inst.text, 640, y);
        y += 50;
      });

      // Botão start pulsante
      const pulseSize = 1 + Math.sin(Date.now() / 300) * 0.1;
      ctx.save();
      ctx.translate(640, 580);
      ctx.scale(pulseSize, pulseSize);
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('Pressione ESPAÇO para começar', 0, 0);
      ctx.restore();
      
      // Botão de configurações
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(20, 650, 200, 50);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 650, 200, 50);
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('⚙️ Configurações', 35, 682);
    };

    const drawGame = () => {
      // Fundo animado
      drawBackground(ctx, game.backgroundOffset, canvas.width, canvas.height);

      // Efeito de câmera lenta durante desafio
      if (game.challengeActive) {
        ctx.fillStyle = 'rgba(0, 100, 200, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Texto "SLOW MOTION"
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⏱️ SLOW MOTION', 640, 150);
      }

      // Desenha colecionáveis
      game.collectibles.forEach(col => drawCollectible(ctx, col));

      // Desenha obstáculos
      game.obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // Ícone
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obs.type === 'go' ? '↑' : '↓', obs.x + 30, obs.y + obs.height / 2 + 12);
      });

      // Desenha partículas
      drawParticles(ctx, game.particles);

      // Desenha jogador
      drawPlayer();

      // HUD
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 100;
      drawHUD(ctx, score, lives, coins, level, combo, precisao, powerUp);
      
      // Mensagem de ajuste adaptativo
      if (adaptiveMessage) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(340, 80, 600, 60);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(adaptiveMessage, 640, 115);
      }

      // Desafio cognitivo
      if (game.challengeActive && game.currentChallenge) {
        // Prepara botões
        game.challengeButtons = [];
        game.currentChallenge.options.forEach((opt, i) => {
          const x = 340 + i * 200;
          const y = 420;
          game.challengeButtons.push({
            x, y,
            width: 180,
            height: 90,
            value: opt
          });
        });
        
        drawChallenge(ctx, game.currentChallenge, game.challengeButtons);
      }
    };

    const drawGameOver = () => {
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ff0000';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 640, 150);
      ctx.shadowBlur = 0;

      // Estatísticas
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 0;

      const statsData = [
        { label: '🏆 Pontuação Final', value: score, color: '#ffff00' },
        { label: '💰 Moedas Coletadas', value: coins, color: '#ffd700' },
        { label: '📊 Nível Alcançado', value: level, color: '#00ffff' },
        { label: '✅ Acertos', value: stats.acertos, color: '#00ff00' },
        { label: '❌ Erros', value: stats.erros, color: '#ff0000' },
        { label: '🎯 Precisão', value: `${precisao}%`, color: '#00ffff' }
      ];

      let y = 280;
      statsData.forEach(stat => {
        ctx.fillStyle = stat.color;
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`${stat.label}: ${stat.value}`, 640, y);
        y += 50;
      });

      // Mensagem motivacional
      let message = '';
      if (precisao >= 90) message = '🌟 EXCELENTE! Você é um mestre!';
      else if (precisao >= 75) message = '👏 MUITO BOM! Continue assim!';
      else if (precisao >= 60) message = '👍 BOM TRABALHO! Você está melhorando!';
      else message = '💪 CONTINUE TENTANDO! Você consegue!';

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(message, 640, y + 30);

      // Botão restart
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 28px Arial';
      ctx.fillText('Pressione ESPAÇO para jogar novamente', 640, y + 90);
    };

    const gameLoop = () => {
      update();
      draw();
      game.animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleClick);
      if (game.animationId) {
        cancelAnimationFrame(game.animationId);
      }
    };
  }, [gameState, score, lives, coins, level, powerUp, combo, stats]);
  
  // Handler para salvar configurações
  const handleSaveSettings = (newSettings) => {
    const canvas = canvasRef.current;
    const audio = getAudioFeedback();
    applySensorySettings(newSettings, canvas, audio);
  };

  return (
    <div className="cyber-runner-canvas">
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

export default CyberRunnerEnhanced;
