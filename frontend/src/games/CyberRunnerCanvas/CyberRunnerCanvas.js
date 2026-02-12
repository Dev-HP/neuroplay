import React, { useEffect, useRef, useState } from 'react';
import { useAchievementSystem } from '../../features/achievements';
import './CyberRunnerCanvas.css';

const CyberRunnerCanvas = () => {
  const canvasRef = useRef(null);
  const { trackEvent } = useAchievementSystem();
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [powerUp, setPowerUp] = useState(null);
  const [stats, setStats] = useState({ acertos: 0, erros: 0 });
  const [distance, setDistance] = useState(0);
  const [obstaclesDodged, setObstaclesDodged] = useState(0);
  const [portalsSolved, setPortalsSolved] = useState(0);
  const gameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    // Estado do jogo
    const game = {
      player: {
        x: 100,
        y: 570,
        width: 40,
        height: 60,
        jumping: false,
        sliding: false,
        velocityY: 0
      },
      obstacles: [],
      speed: 5,
      lastObstacle: 0,
      mathActive: false,
      mathQuestion: null,
      mathButtons: [],
      keys: {},
      animationId: null
    };

    gameRef.current = game;

    // Controles
    const handleKeyDown = (e) => {
      game.keys[e.key] = true;
      
      if (gameState === 'menu' && e.key === ' ') {
        setGameState('playing');
        resetGame();
      } else if (gameState === 'playing') {
        if (e.key === ' ' && !game.player.jumping && !game.mathActive) {
          game.player.jumping = true;
          game.player.velocityY = -15;
        } else if (e.key === 'ArrowDown' && !game.mathActive) {
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
      if (!game.mathActive) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      game.mathButtons.forEach(btn => {
        if (x >= btn.x && x <= btn.x + btn.width &&
            y >= btn.y && y <= btn.y + btn.height) {
          const correct = btn.value === game.mathQuestion.answer;
          
          if (correct) {
            setScore(s => s + 50);
            setStats(st => ({ ...st, acertos: st.acertos + 1 }));
            setPortalsSolved(p => {
              const newCount = p + 1;
              // Track portal achievements
              trackEvent('portal_solved', { 
                game: 'cyber-runner',
                totalSolved: newCount 
              });
              return newCount;
            });
          } else {
            setStats(st => ({ ...st, erros: st.erros + 1 }));
          }
          
          game.mathActive = false;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleClick);

    // Funções do jogo
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

    const generateMath = () => {
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      
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
        options: options
      };
    };

    const resetGame = () => {
      game.player.y = 570;
      game.player.jumping = false;
      game.player.sliding = false;
      game.player.velocityY = 0;
      game.obstacles = [];
      game.mathActive = false;
      game.lastObstacle = 0;
      setScore(0);
      setLives(3);
      setStats({ acertos: 0, erros: 0 });
      setDistance(0);
      setObstaclesDodged(0);
      setPortalsSolved(0);
      
      // Track first game
      trackEvent('game_started', { game: 'cyber-runner' });
    };

    const drawMenu = () => {
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CYBER-RUNNER', 640, 150);

      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText('Treinamento de Controle Inibitório', 640, 250);

      ctx.font = '20px Arial';
      ctx.fillText('VERDE = PULAR (ESPAÇO)', 640, 350);
      ctx.fillText('VERMELHO = DESLIZAR (↓)', 640, 400);
      ctx.fillText('', 640, 450);
      ctx.fillStyle = '#00ffff';
      ctx.fillText('Pressione ESPAÇO para começar', 640, 500);
    };

    const drawGame = () => {
      // Fundo
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = '#003264';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Pista
      ctx.fillStyle = '#1a1f3a';
      ctx.fillRect(0, 620, canvas.width, 100);

      // Jogador
      const playerHeight = game.player.sliding ? game.player.height / 2 : game.player.height;
      ctx.fillStyle = game.player.jumping || game.player.sliding ? '#ffff00' : '#00ffff';
      ctx.fillRect(game.player.x, game.player.y, game.player.width, playerHeight);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(game.player.x, game.player.y, game.player.width, playerHeight);

      // Obstáculos
      game.obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(obs.type === 'go' ? '↑' : '↓', obs.x + 30, obs.y + obs.height / 2 + 12);
      });

      // HUD
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`PONTOS: ${score}`, 20, 30);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`VIDAS: ${'❤️'.repeat(lives)}`, 1260, 30);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ffff';
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 0;
      ctx.fillText(`PRECISÃO: ${precisao}%`, 640, 30);

      // Matemática
      if (game.mathActive) {
        drawMath();
      }
    };

    const drawMath = () => {
      // Overlay
      ctx.fillStyle = 'rgba(10, 14, 39, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Caixa
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(340, 160, 600, 400);
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(340, 160, 600, 400);

      // Pergunta
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(game.mathQuestion.question, 640, 250);

      // Botões
      game.mathButtons = [];
      game.mathQuestion.options.forEach((opt, i) => {
        const x = 390 + i * 180;
        const y = 380;
        const width = 150;
        const height = 80;

        ctx.fillStyle = '#00aaff';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(opt.toString(), x + width / 2, y + 50);

        game.mathButtons.push({ x, y, width, height, value: opt });
      });
    };

    const drawGameOver = () => {
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 640, 150);

      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 0;

      ctx.fillStyle = '#ffff00';
      ctx.fillText(`Pontuação Final: ${score}`, 640, 300);
      ctx.fillStyle = 'white';
      ctx.fillText(`Acertos: ${stats.acertos}`, 640, 350);
      ctx.fillText(`Erros: ${stats.erros}`, 640, 400);
      ctx.fillText(`Precisão: ${precisao}%`, 640, 450);
      ctx.fillStyle = '#00ffff';
      ctx.fillText('Pressione ESPAÇO para jogar novamente', 640, 550);
    };

    const update = () => {
      if (gameState === 'playing') {
        // Física do pulo
        if (game.player.jumping) {
          game.player.y += game.player.velocityY;
          game.player.velocityY += 1;

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

        // Move obstáculos
        game.obstacles.forEach((obs, index) => {
          obs.x -= game.speed;

          // Colisão
          if (game.player.x < obs.x + obs.width &&
              game.player.x + game.player.width > obs.x &&
              game.player.y < obs.y + obs.height &&
              game.player.y + game.player.height > obs.y) {

            const correct = (obs.type === 'go' && game.player.jumping) ||
                          (obs.type === 'nogo' && game.player.sliding);

            if (correct) {
              setScore(s => s + 10);
              setStats(st => ({ ...st, acertos: st.acertos + 1 }));
              setObstaclesDodged(o => {
                const newCount = o + 1;
                // Track obstacle achievements
                trackEvent('obstacle_dodged', { 
                  game: 'cyber-runner',
                  totalDodged: newCount 
                });
                return newCount;
              });
            } else {
              setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                  setGameState('gameover');
                  // Track game completion
                  trackEvent('game_completed', { 
                    game: 'cyber-runner',
                    score: score,
                    distance: distance,
                    obstaclesDodged: obstaclesDodged,
                    portalsSolved: portalsSolved
                  });
                }
                return newLives;
              });
              setStats(st => ({ ...st, erros: st.erros + 1 }));
            }

            game.obstacles.splice(index, 1);
          }

          // Remove se saiu da tela
          if (obs.x < -obs.width) {
            game.obstacles.splice(index, 1);
          }
        });

        // Update distance
        setDistance(d => {
          const newDistance = d + game.speed;
          // Track distance milestones
          if (Math.floor(newDistance / 100) > Math.floor(d / 100)) {
            trackEvent('distance_reached', { 
              game: 'cyber-runner',
              distance: Math.floor(newDistance)
            });
          }
          return newDistance;
        });

        // Ativa matemática
        if (!game.mathActive && Math.random() < 0.002) {
          game.mathActive = true;
          game.mathQuestion = generateMath();
        }
      }
    };

    const gameLoop = () => {
      update();

      if (gameState === 'menu') {
        drawMenu();
      } else if (gameState === 'playing') {
        drawGame();
      } else if (gameState === 'gameover') {
        drawGameOver();
      }

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
  }, [gameState, score, lives, stats]);

  return (
    <div className="cyber-runner-canvas">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default CyberRunnerCanvas;
