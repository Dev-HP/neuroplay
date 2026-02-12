import React, { useEffect, useRef, useState } from 'react';
import './SonicJump.css';
import { getAudioFeedback } from '../../shared/utils/audioFeedback';
import { getPhonemeSynthesizer } from '../../shared/utils/phonemeSynthesizer';
import { AdaptiveDifficulty } from '../CyberRunnerCanvas/adaptiveDifficulty';
import { SensorySettings, loadSensorySettings, applySensorySettings } from '../../shared/components/SensorySettings';
import { useAchievementSystem } from '../../features/achievements';

const SonicJump = () => {
  const canvasRef = useRef(null);
  const { trackEvent } = useAchievementSystem();
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [currentSound, setCurrentSound] = useState(null);
  const [stats, setStats] = useState({ acertos: 0, erros: 0 });
  const [platformsReached, setPlatformsReached] = useState(0);
  const [adaptiveMessage, setAdaptiveMessage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const gameRef = useRef(null);
  const audioRef = useRef(null);
  const phonemeRef = useRef(null);
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

    // FONEMAS E LETRAS
    const phonemes = [
      { sound: '/B/', letter: 'B', color: '#ff6b6b', description: 'Bola' },
      { sound: '/P/', letter: 'P', color: '#4ecdc4', description: 'Pato' },
      { sound: '/D/', letter: 'D', color: '#ffe66d', description: 'Dado' },
      { sound: '/T/', letter: 'T', color: '#a8e6cf', description: 'Tatu' },
      { sound: '/V/', letter: 'V', color: '#ff8b94', description: 'Vaca' },
      { sound: '/F/', letter: 'F', color: '#c7ceea', description: 'Foca' },
      { sound: '/S/', letter: 'S', color: '#ffd3b6', description: 'Sapo' },
      { sound: '/Z/', letter: 'Z', color: '#ffaaa5', description: 'Zebra' }
    ];

    // Estado do jogo
    const game = {
      player: {
        x: 640,
        y: 600,
        width: 50,
        height: 60,
        velocityY: 0,
        jumping: false,
        onPlatform: true
      },
      platforms: [],
      currentPhoneme: null,
      showingSound: false,
      soundTimer: 0,
      particles: [],
      waveAnimation: 0,
      keys: {},
      animationId: null
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
      if (!phonemeRef.current) {
        phonemeRef.current = getPhonemeSynthesizer();
        await phonemeRef.current.init();
        console.log('[SonicJump] Phoneme synthesizer initialized');
      }
    };
    
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    // GERAR DESAFIO
    const generateChallenge = () => {
      const phoneme = phonemes[Math.floor(Math.random() * phonemes.length)];
      
      // Cria 3 plataformas com letras
      const correctIndex = Math.floor(Math.random() * 3);
      const wrongPhonemes = phonemes.filter(p => p.letter !== phoneme.letter);
      
      // Usa parâmetros adaptativos para posicionamento
      const params = adaptiveSystem.getParams();
      const platformY = Math.max(250, 350 - params.speed * 5); // Mais alto = mais difícil
      
      game.platforms = [];
      for (let i = 0; i < 3; i++) {
        const isCorrect = i === correctIndex;
        const phonemeData = isCorrect ? phoneme : wrongPhonemes[Math.floor(Math.random() * wrongPhonemes.length)];
        
        game.platforms.push({
          x: 200 + i * 400,
          y: platformY,
          width: 200,
          height: 40,
          letter: phonemeData.letter,
          color: phonemeData.color,
          correct: isCorrect,
          rotation: 0,
          destroyed: false
        });
      }
      
      game.currentPhoneme = phoneme;
      game.showingSound = true;
      
      // Tempo de exibição adaptativo
      const soundTime = Math.max(120, 240 - params.speed * 10); // 2-4 segundos
      game.soundTimer = soundTime;
      
      setCurrentSound(phoneme);
      
      // 🎵 PLAY REAL PHONEME AUDIO
      if (phonemeRef.current) {
        phonemeRef.current.playPhoneme(phoneme.sound, 0.8);
        console.log(`[SonicJump] Playing phoneme: ${phoneme.sound}`);
      }
    };

    // CRIAR PARTÍCULAS
    const createParticles = (x, y, color, count = 20) => {
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 50,
          color,
          size: Math.random() * 8 + 3
        });
      }
    };

    // DESENHAR FUNDO MUSICAL
    const drawBackground = () => {
      // Gradiente
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ondas sonoras animadas
      game.waveAnimation += 0.05;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
          const y = 360 + Math.sin((x + game.waveAnimation * 50 + i * 50) / 50) * (30 + i * 10);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Notas musicais flutuantes
      ctx.font = '30px Arial';
      const notes = ['♪', '♫', '♬'];
      for (let i = 0; i < 10; i++) {
        const x = (i * 150 + game.waveAnimation * 20) % canvas.width;
        const y = 100 + Math.sin((i + game.waveAnimation) * 0.5) * 50;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(game.waveAnimation + i) * 0.1})`;
        ctx.fillText(notes[i % 3], x, y);
      }
    };

    // DESENHAR PLATAFORMAS
    const drawPlatforms = () => {
      game.platforms.forEach(platform => {
        if (platform.destroyed) return;

        const { x, y, width, height, letter, color, rotation } = platform;
        
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(rotation);

        // Plataforma
        ctx.fillStyle = color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // Borda
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        ctx.shadowBlur = 0;

        // Letra 3D
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra da letra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(letter, 3, 3);
        
        // Letra principal
        ctx.fillStyle = 'white';
        ctx.fillText(letter, 0, 0);

        ctx.restore();

        // Animação de rotação
        platform.rotation += 0.01;
      });
    };

    // DESENHAR JOGADOR
    const drawPlayer = () => {
      const p = game.player;
      
      // Sombra
      if (game.player.onPlatform) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + p.height / 2 + 5, p.width / 2, p.width / 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Corpo (nota musical)
      ctx.fillStyle = '#ffd700';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffd700';
      
      // Cabeça (círculo)
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Haste
      ctx.fillRect(p.x + 15, p.y - 10, 5, 40);
      
      // Bandeira
      ctx.beginPath();
      ctx.moveTo(p.x + 20, p.y - 10);
      ctx.lineTo(p.x + 45, p.y);
      ctx.lineTo(p.x + 20, p.y + 10);
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Olhos
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(p.x - 5, p.y - 15, 3, 0, Math.PI * 2);
      ctx.arc(p.x + 5, p.y - 15, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    // DESENHAR PARTÍCULAS
    const drawParticles = () => {
      game.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 50;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    // DESENHAR PAINEL DE SOM
    const drawSoundPanel = () => {
      if (!game.showingSound || !game.currentPhoneme) return;

      // Overlay pulsante
      const pulse = 0.7 + Math.sin(game.soundTimer / 10) * 0.3;
      ctx.fillStyle = `rgba(0, 0, 0, ${pulse * 0.7})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Caixa de som
      const boxWidth = 600;
      const boxHeight = 300;
      const boxX = (canvas.width - boxWidth) / 2;
      const boxY = 100;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = game.currentPhoneme.color;
      ctx.lineWidth = 5;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // 🎵 AUDIO WAVEFORM (visual indicator that real audio is playing)
      ctx.strokeStyle = game.currentPhoneme.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const waveY = boxY + 80;
      const waveWidth = 100;
      const waveAmplitude = 15;
      for (let x = -waveWidth; x <= waveWidth; x += 5) {
        const y = waveY + Math.sin((x + game.soundTimer * 2) / 10) * waveAmplitude * pulse;
        if (x === -waveWidth) ctx.moveTo(canvas.width / 2 + x, y);
        else ctx.lineTo(canvas.width / 2 + x, y);
      }
      ctx.stroke();

      // Speaker icon with animation
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = game.currentPhoneme.color;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = game.currentPhoneme.color;
      ctx.fillText('🔊', canvas.width / 2, boxY + 80);
      ctx.shadowBlur = 0;

      // Fonema
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(game.currentPhoneme.sound, canvas.width / 2, boxY + 160);

      // Descrição
      ctx.font = '28px Arial';
      ctx.fillStyle = game.currentPhoneme.color;
      ctx.fillText(`(${game.currentPhoneme.description})`, canvas.width / 2, boxY + 210);

      // Ondas sonoras animadas (concentric circles)
      for (let i = 0; i < 3; i++) {
        const radius = 50 + i * 30 + (game.soundTimer % 30);
        const alpha = 1 - (game.soundTimer % 30) / 30;
        ctx.strokeStyle = `${game.currentPhoneme.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, boxY + 80, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Timer
      const seconds = Math.ceil(game.soundTimer / 60);
      ctx.font = 'bold 40px Arial';
      ctx.fillStyle = '#ffff00';
      ctx.fillText(seconds, canvas.width / 2, boxY + 270);
      
      // "Listening..." indicator
      ctx.font = '20px Arial';
      ctx.fillStyle = '#00ff00';
      ctx.fillText('🎧 Ouça o som!', canvas.width / 2, boxY + 240);
      
      // Replay instruction
      ctx.font = '18px Arial';
      ctx.fillStyle = '#aaaaaa';
      ctx.fillText('Pressione R para ouvir novamente', canvas.width / 2, boxY + 265);
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
      
      // Vidas
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`${'❤️'.repeat(lives)}`, 1260, 30);
      
      // Precisão
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 100;
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.fillText(`PRECISÃO: ${precisao}%`, 640, 30);

      // Instrução
      if (!game.showingSound && game.player.onPlatform) {
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Pule para a letra correta! (ESPAÇO)', 640, 680);
      }
      
      // Mensagem de ajuste adaptativo
      if (adaptiveMessage) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(340, 620, 600, 50);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(adaptiveMessage, 640, 650);
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
      } else if (gameState === 'playing') {
        if (e.key === ' ' && game.player.onPlatform && !game.showingSound) {
          game.player.jumping = true;
          game.player.velocityY = -18;
          game.player.onPlatform = false;
        }
        
        // 🔁 REPLAY PHONEME (press R during sound display)
        if ((e.key === 'r' || e.key === 'R') && game.showingSound && game.currentPhoneme) {
          if (phonemeRef.current) {
            phonemeRef.current.playPhoneme(game.currentPhoneme.sound, 0.8);
            console.log(`[SonicJump] Replaying phoneme: ${game.currentPhoneme.sound}`);
            // Reset timer to give more time
            game.soundTimer = Math.max(game.soundTimer, 120);
          }
        }
        
        // Movimento horizontal no ar
        if (game.player.jumping) {
          if (e.key === 'ArrowLeft') {
            game.player.x -= 15;
          } else if (e.key === 'ArrowRight') {
            game.player.x += 15;
          }
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

    // VERIFICAR COLISÃO COM PLATAFORMA
    const checkPlatformCollision = () => {
      game.platforms.forEach(platform => {
        if (platform.destroyed) return;

        const playerBottom = game.player.y + game.player.height / 2;
        const playerLeft = game.player.x - game.player.width / 2;
        const playerRight = game.player.x + game.player.width / 2;

        if (playerBottom >= platform.y &&
            playerBottom <= platform.y + platform.height &&
            playerRight >= platform.x &&
            playerLeft <= platform.x + platform.width &&
            game.player.velocityY > 0) {
          
          // Pousou na plataforma!
          game.player.y = platform.y - game.player.height / 2;
          game.player.velocityY = 0;
          game.player.jumping = false;
          game.player.onPlatform = true;

          const reactionTime = Date.now() - game.attemptStartTime;

          if (platform.correct) {
            // Acertou!
            // Registra tentativa no sistema adaptativo
            const result = adaptiveSystem.recordAttempt({
              correct: true,
              reactionTime: reactionTime,
              type: 'phoneme'
            });
            
            // Aplica ajustes se houver
            if (result) {
              setAdaptiveMessage(result.message);
              setTimeout(() => setAdaptiveMessage(null), 3000);
            }
            
            setScore(s => s + 100 + (level * 20));
            setStats(st => ({ ...st, acertos: st.acertos + 1 }));
            
            // Track platform achievement
            setPlatformsReached(p => {
              const newCount = p + 1;
              trackEvent('platform_reached', {
                game: 'sonic-jump',
                totalReached: newCount
              });
              return newCount;
            });
            
            createParticles(platform.x + platform.width / 2, platform.y, platform.color, 30);
            
            // Feedback auditivo
            audioRef.current?.onCorrectAnswer();
            
            setTimeout(() => {
              // Som de nível completo
              audioRef.current?.onLevelComplete();
              setLevel(l => l + 1);
              startNewRound();
            }, 1000);
          } else {
            // Errou! Plataforma desmorona
            // Registra tentativa no sistema adaptativo
            const result = adaptiveSystem.recordAttempt({
              correct: false,
              reactionTime: reactionTime,
              type: 'phoneme'
            });
            
            // Aplica ajustes se houver
            if (result) {
              setAdaptiveMessage(result.message);
              setTimeout(() => setAdaptiveMessage(null), 3000);
            }
            
            platform.destroyed = true;
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              }
              return newLives;
            });
            setStats(st => ({ ...st, erros: st.erros + 1 }));
            createParticles(platform.x + platform.width / 2, platform.y, '#ff0000', 25);
            
            // Feedback auditivo
            audioRef.current?.onIncorrectAnswer();
            
            // Jogador cai
            game.player.onPlatform = false;
            game.player.jumping = true;
            
            setTimeout(() => {
              if (gameState === 'playing') {
                startNewRound();
              }
            }, 1500);
          }
        }
      });
    };

    // INICIAR NOVA RODADA
    const startNewRound = () => {
      game.player.x = 640;
      game.player.y = 600;
      game.player.velocityY = 0;
      game.player.jumping = false;
      game.player.onPlatform = true;
      game.attemptStartTime = Date.now();
      generateChallenge();
    };

    const resetGame = () => {
      setScore(0);
      setLevel(1);
      setLives(3);
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

      // Timer do som
      if (game.showingSound) {
        game.soundTimer--;
        if (game.soundTimer <= 0) {
          game.showingSound = false;
          game.attemptStartTime = Date.now();
        }
      }

      // Física do pulo
      if (game.player.jumping) {
        game.player.y += game.player.velocityY;
        
        // Gravidade adaptativa
        const params = adaptiveSystem.getParams();
        const gravity = Math.max(0.6, Math.min(1.0, params.gravity));
        game.player.velocityY += gravity;

        // Limites laterais
        game.player.x = Math.max(50, Math.min(1230, game.player.x));

        // Verifica colisão
        checkPlatformCollision();

        // Caiu fora da tela
        if (game.player.y > 750) {
          setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameState('gameover');
            }
            return newLives;
          });
          startNewRound();
        }
      }

      // Atualiza partículas
      game.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravidade nas partículas
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
      drawBackground();

      // Título
      const titleY = 150 + Math.sin(Date.now() / 500) * 10;
      ctx.fillStyle = '#ff6b6b';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ff6b6b';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SONIC JUMP', 640, titleY);
      ctx.shadowBlur = 0;

      // Subtítulo
      ctx.fillStyle = '#ffd700';
      ctx.font = '28px Arial';
      ctx.fillText('🎵 Orquestra das Plataformas 🎵', 640, 250);

      // Instruções
      const instructions = [
        '1. OUÇA o som do fonema',
        '2. PULE para a letra correta',
        '3. Use ESPAÇO para pular',
        '4. Use ← → no ar para ajustar',
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
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 650, 200, 50);
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('⚙️ Config (C)', 40, 682);
    };

    const drawGame = () => {
      drawBackground();
      drawPlatforms();
      drawParticles();
      drawPlayer();
      drawSoundPanel();
      drawHUD();
    };

    const drawGameOver = () => {
      drawBackground();

      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ff0000';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 640, 200);
      ctx.shadowBlur = 0;

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
  }, [gameState, score, level, lives, stats]);
  
  // Handler para salvar configurações
  const handleSaveSettings = (newSettings) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    applySensorySettings(newSettings, canvas, audio);
  };

  return (
    <div className="sonic-jump">
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

export default SonicJump;
