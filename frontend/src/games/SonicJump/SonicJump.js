import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../shared/theme/gameStage.css';
import GameControls from '../../shared/components/GameControls';
import { getAudioFeedback } from '../../shared/utils/audioFeedback';
import { getPhonemeSynthesizer } from '../../shared/utils/phonemeSynthesizer';
import { AdaptiveDifficulty } from '../../shared/adaptation/adaptiveDifficulty';
import { SensorySettings, loadSensorySettings, applySensorySettings } from '../../shared/components/SensorySettings';
import { useAchievementSystem } from '../../features/achievements';
import { getCurrentStudentId, persistGameplay } from '../../shared/api/gameplay';
import { TEMA, fonte, pintarFundo, desenharTelaTitulo, desenharPlacar, desenharFaixa } from '../../shared/theme/gameTheme';

const SonicJump = () => {
  const [searchParams] = useSearchParams();
  const studentId = getCurrentStudentId(searchParams);
  const canvasRef = useRef(null);
  const sessionStartedAtRef = useRef(null);
  const sessionPersistedRef = useRef(false);
  const { trackEvent } = useAchievementSystem();
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [stats, setStats] = useState({ acertos: 0, erros: 0 });
  const platformsReachedRef = useRef(0);
  const [adaptiveMessage, setAdaptiveMessage] = useState(null);
  // O laço do canvas é criado uma vez; refs mantêm os valores atuais visíveis nele.
  const adaptiveMessageRef = useRef(null);
  useEffect(() => {
    adaptiveMessageRef.current = adaptiveMessage;
  }, [adaptiveMessage]);
  const trackEventRef = useRef(trackEvent);
  useEffect(() => {
    trackEventRef.current = trackEvent;
  }, [trackEvent]);
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
      { sound: '/B/', letter: 'B', color: '#e06b68', description: 'Bola' },
      { sound: '/P/', letter: 'P', color: '#8cc9d6', description: 'Pato' },
      { sound: '/D/', letter: 'D', color: '#e6c768', description: 'Dado' },
      { sound: '/T/', letter: 'T', color: '#a8e6cf', description: 'Tatu' },
      { sound: '/V/', letter: 'V', color: '#ff8b94', description: 'Vaca' },
      { sound: '/F/', letter: 'F', color: '#c7ceea', description: 'Foca' },
      { sound: '/S/', letter: 'S', color: '#ffd3b6', description: 'Sapo' },
      { sound: '/Z/', letter: 'Z', color: '#ffaaa5', description: 'Zebra' }
    ];

    // Estado do jogo
    // O estado do jogo vive em gameRef e é criado uma única vez: este efeito roda
    // de novo sempre que pontuação/fase mudam, e recriar o objeto apagava a
    // partida em andamento (sequência, posição do jogador, obstáculos).
    const game = gameRef.current || {
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
      pintarFundo(ctx, canvas.width, canvas.height, { grade: false });

      // Ondas sonoras lentas e discretas (sem notas piscando).
      game.waveAnimation += 0.02;
      ctx.strokeStyle = 'rgba(140, 201, 214, 0.08)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
          const y = 360 + Math.sin((x + game.waveAnimation * 50 + i * 50) / 60) * (30 + i * 12);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
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
        ctx.shadowBlur = 0;
        ctx.shadowColor = color;
        ctx.fillRect(-width / 2, -height / 2, width, height);
        
        // Borda
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeRect(-width / 2, -height / 2, width, height);
        
        ctx.shadowBlur = 0;

        // Letra 3D
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Inter, "Segoe UI", system-ui, sans-serif';
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
      ctx.fillStyle = '#e6c768';
      ctx.shadowBlur = 0;
      ctx.shadowColor = '#e6c768';
      
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

      // Fundo escurecido fixo (sem pulsar) e cartão central com uma informação por linha.
      ctx.fillStyle = 'rgba(22, 41, 74, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const boxWidth = 560;
      const boxHeight = 330;
      const boxX = (canvas.width - boxWidth) / 2;
      const boxY = 150;
      ctx.fillStyle = TEMA.painel;
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = game.currentPhoneme.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      const centro = canvas.width / 2;
      ctx.textAlign = 'center';
      ctx.fillStyle = TEMA.textoSuave;
      ctx.font = fonte(24, 600);
      ctx.fillText('🔊 Ouça o som', centro, boxY + 50);

      ctx.fillStyle = TEMA.texto;
      ctx.font = fonte(80, 800);
      ctx.fillText(game.currentPhoneme.sound, centro, boxY + 150);

      ctx.fillStyle = game.currentPhoneme.color;
      ctx.font = fonte(28, 600);
      ctx.fillText(`(${game.currentPhoneme.description})`, centro, boxY + 200);

      const seconds = Math.ceil(game.soundTimer / 60);
      ctx.fillStyle = TEMA.amarelo;
      ctx.font = fonte(30, 700);
      ctx.fillText(`${seconds}`, centro, boxY + 255);

      ctx.fillStyle = TEMA.textoSuave;
      ctx.font = fonte(18, 500);
      ctx.fillText('Aperte R ou "Repetir som" para ouvir de novo', centro, boxY + 300);
    };

    // DESENHAR HUD
    const drawHUD = () => {
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? Math.round((stats.acertos / total) * 100) : 100;
      desenharPlacar(ctx, [`Pontos ${score}`, `Nível ${level}`, `Precisão ${precisao}%`]);

      ctx.font = fonte(26, 700);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${'❤️'.repeat(lives)}`, 1260, 37);
      ctx.textBaseline = 'alphabetic';

      const instrucao = !game.showingSound && game.player.onPlatform ? 'Pule para a letra certa (ESPAÇO)' : '';
      desenharFaixa(ctx, adaptiveMessageRef.current || instrucao, { y: 690 });
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
      } else if (gameState === 'playing' && e.key === 'Escape') {
        setGameState('gameover'); // encerra e dispara o salvamento da sessão
      } else if (gameState === 'playing') {
        if (e.key === ' ' && game.player.onPlatform && !game.showingSound) {
          game.player.jumping = true;
          // Força do pulo calculada para alcançar as plataformas com folga, usando
          // a mesma gravidade (adaptativa) da física. Antes era fixa em -18, o
          // que subia ~200 px — as plataformas ficam ~300 px acima e o jogo era
          // impossível de vencer.
          const gravidade = Math.max(0.6, Math.min(1.0, adaptiveSystem.getParams().gravity));
          const alturaPlataforma = game.platforms.length ? game.platforms[0].y : 325;
          const subida = (game.player.y + game.player.height / 2) - alturaPlataforma + 70;
          game.player.velocityY = -Math.sqrt(2 * gravidade * subida);
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
        // (o deslocamento lateral é aplicado continuamente em update())
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
            platformsReachedRef.current += 1;
            trackEventRef.current('platform_reached', {
              game: 'sonic-jump',
              totalReached: platformsReachedRef.current
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
            createParticles(platform.x + platform.width / 2, platform.y, '#e06b68', 25);
            
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
      sessionStartedAtRef.current = Date.now();
      sessionPersistedRef.current = false;
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
        // Direção contínua enquanto a seta estiver pressionada (teclado ou
        // botão na tela); antes era 15 px por toque, o que tornava as
        // plataformas laterais inalcançáveis pelo toque.
        if (game.keys.ArrowLeft) game.player.x -= 13;
        if (game.keys.ArrowRight) game.player.x += 13;
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
      desenharTelaTitulo(ctx, canvas.width, {
        titulo: 'Sonic Jump',
        subtitulo: 'Ouça o som e pule na letra certa',
        linhas: [
          '1. Escute o som da letra (R repete o som)',
          '2. Pule com ESPAÇO para a plataforma da letra',
          '3. No ar, use ← → para ajustar',
        ],
        chamada: 'Toque em Começar ou aperte ESPAÇO',
      });
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
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? Math.round((stats.acertos / total) * 100) : 0;
      desenharTelaTitulo(ctx, canvas.width, {
        titulo: 'Atividade concluída',
        subtitulo: 'Bom trabalho!',
        linhas: [`Pontos: ${score}   ·   Nível: ${level}   ·   Precisão: ${precisao}%`],
        chamada: 'Aperte ESPAÇO para voltar ao início',
      });
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
  
  useEffect(() => {
    if (gameState !== 'gameover' || sessionPersistedRef.current || !studentId || !sessionStartedAtRef.current) return;
    if (!score && !stats.acertos && !stats.erros) return; // partida sem nenhuma jogada não gera registro
    sessionPersistedRef.current = true;
    persistGameplay({
      studentId,
      gameType: 'sonic-jump',
      score,
      durationSeconds: (Date.now() - sessionStartedAtRef.current) / 1000,
      acertos: stats.acertos,
      erros: stats.erros,
      metadata: { paradigma: 'discriminacao-fonemica', nivel: level, vidas_restantes: lives }
    }).catch(() => {
      sessionPersistedRef.current = false;
    });
  }, [gameState, studentId, score, stats, lives, level]);

  // Handler para salvar configurações
  const handleSaveSettings = (newSettings) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    applySensorySettings(newSettings, canvas, audio);
  };

  return (
    <div className="game-stage sonic-jump">
      <canvas ref={canvasRef} />
      <GameControls onSettings={() => setShowSettings(true)} studentId={studentId} isPlaying={gameState === 'playing'} controls={[{ key: 'ArrowLeft', icon: '←', label: 'Esquerda' }, { key: ' ', icon: '⬆', label: 'Pular' }, { key: 'ArrowRight', icon: '→', label: 'Direita' }, { key: 'r', icon: '🔊', label: 'Repetir som' }, { key: 'Escape', icon: '⏹', label: 'Encerrar' }]} />
      
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
