import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../shared/theme/gameStage.css';
import GameControls from '../../shared/components/GameControls';
import { getAudioFeedback } from '../../shared/utils/audioFeedback';
import { AdaptiveDifficulty } from '../../shared/adaptation/adaptiveDifficulty';
import { SensorySettings, loadSensorySettings, applySensorySettings } from '../../shared/components/SensorySettings';
import { useAchievementSystem } from '../../features/achievements';
import { getCurrentStudentId, persistGameplay } from '../../shared/api/gameplay';
import { TEMA, fonte, pintarFundo, desenharTelaTitulo, desenharPlacar, desenharFaixa } from '../../shared/theme/gameTheme';

const EXPERIMENTOS_POR_SESSAO = 3;

const GravityLab = () => {
  const [searchParams] = useSearchParams();
  const studentId = getCurrentStudentId(searchParams);
  const canvasRef = useRef(null);
  const sessionStartedAtRef = useRef(null);
  const sessionPersistedRef = useRef(false);
  const { trackEvent } = useAchievementSystem();
  const experimentsRef = useRef(0);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentRule, setCurrentRule] = useState('color'); // color ou shape
  const [ruleChanges, setRuleChanges] = useState(0);
  const [stats, setStats] = useState({ acertos: 0, erros: 0 });
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

    // TIPOS DE OBJETOS
    const objectTypes = [
      { shape: 'square', color: '#e06b68', name: 'Quadrado Vermelho' },
      { shape: 'square', color: '#8cc9d6', name: 'Quadrado Azul' },
      { shape: 'circle', color: '#e06b68', name: 'Círculo Vermelho' },
      { shape: 'circle', color: '#8cc9d6', name: 'Círculo Azul' },
      { shape: 'triangle', color: '#e6c768', name: 'Triângulo Amarelo' },
      { shape: 'triangle', color: '#95e1d3', name: 'Triângulo Verde' }
    ];

    // Estado do jogo
    // O estado do jogo vive em gameRef e é criado uma única vez: este efeito roda
    // de novo sempre que pontuação/fase mudam, e recriar o objeto apagava a
    // partida em andamento (sequência, posição do jogador, obstáculos).
    const game = gameRef.current || {
      objects: [],
      targetZones: [],
      selectedObject: null,
      mouseX: 0,
      mouseY: 0,
      dragging: false,
      robot: {
        x: 100,
        y: 600,
        mood: 'neutral', // neutral, happy, sad
        moodTimer: 0
      },
      ruleChangeTimer: 0,
      showingRule: false,
      particles: [],
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
    };
    
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });

    // GERAR NÍVEL
    const generateLevel = () => {
      game.objects = [];
      game.targetZones = [];
      game.attemptStartTime = Date.now();
      
      // Usa parâmetros adaptativos para número de objetos
      const params = adaptiveSystem.getParams();
      const baseObjects = 4;
      const adaptiveObjects = Math.floor(params.speed / 3); // speed varia de 3-15
      const numObjects = Math.min(baseObjects + adaptiveObjects, 8); // Máximo 8
      
      for (let i = 0; i < numObjects; i++) {
        const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
        game.objects.push({
          ...type,
          x: 200 + Math.random() * 400,
          y: 150 + i * 70,
          size: 50,
          velocityY: 0,
          rotation: Math.random() * Math.PI * 2,
          placed: false
        });
      }
      
      // Cria zonas alvo baseadas na regra atual, alinhadas à direita para que
      // três ou quatro caixas caibam inteiras no canvas (1280 px).
      const posicaoZona = (i, total) => 1280 - 40 - total * 170 + 20 + i * 170;
      if (currentRule === 'color') {
        const colors = [...new Set(game.objects.map(o => o.color))];
        colors.forEach((color, i) => {
          game.targetZones.push({
            x: posicaoZona(i, colors.length),
            y: 500,
            width: 150,
            height: 150,
            color: color,
            type: 'color',
            label: color === '#e06b68' ? 'VERMELHO' : 
                   color === '#8cc9d6' ? 'AZUL' : 
                   color === '#e6c768' ? 'AMARELO' : 'VERDE'
          });
        });
      } else {
        const shapes = [...new Set(game.objects.map(o => o.shape))];
        shapes.forEach((shape, i) => {
          game.targetZones.push({
            x: posicaoZona(i, shapes.length),
            y: 500,
            width: 150,
            height: 150,
            shape: shape,
            type: 'shape',
            label: shape === 'square' ? 'QUADRADO' : 
                   shape === 'circle' ? 'CÍRCULO' : 'TRIÂNGULO'
          });
        });
      }
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

    // DESENHAR FUNDO
    const drawBackground = () => {
      pintarFundo(ctx, canvas.width, canvas.height);
    };

    // DESENHAR OBJETO
    const drawObject = (obj) => {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rotation);

      // Sombra
      ctx.shadowBlur = 0;
      ctx.shadowColor = obj.color;

      ctx.fillStyle = obj.color;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;

      if (obj.shape === 'square') {
        ctx.fillRect(-obj.size / 2, -obj.size / 2, obj.size, obj.size);
        ctx.strokeRect(-obj.size / 2, -obj.size / 2, obj.size, obj.size);
      } else if (obj.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, obj.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (obj.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -obj.size / 2);
        ctx.lineTo(-obj.size / 2, obj.size / 2);
        ctx.lineTo(obj.size / 2, obj.size / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    };

    // DESENHAR ZONA ALVO
    const drawTargetZone = (zone) => {
      // Borda pulsante
      const pulse = 1 + Math.sin(Date.now() / 500) * 0.1;
      ctx.save();
      ctx.translate(zone.x + zone.width / 2, zone.y + zone.height / 2);
      ctx.scale(pulse, pulse);

      // Fundo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(-zone.width / 2, -zone.height / 2, zone.width, zone.height);

      // Borda
      ctx.strokeStyle = zone.color || 'white';
      ctx.lineWidth = 4;
      ctx.strokeRect(-zone.width / 2, -zone.height / 2, zone.width, zone.height);

      // Ícone/Preview
      ctx.fillStyle = zone.color || 'white';
      if (zone.type === 'color') {
        ctx.fillRect(-30, -30, 60, 60);
      } else if (zone.shape === 'square') {
        ctx.fillRect(-30, -30, 60, 60);
      } else if (zone.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
      } else if (zone.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-30, 30);
        ctx.lineTo(30, 30);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Inter, "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.label, zone.x + zone.width / 2, zone.y + zone.height + 25);
    };

    // DESENHAR ROBÔ NPC
    const drawRobot = () => {
      const r = game.robot;
      
      // Corpo
      ctx.fillStyle = '#8eadd8';
      ctx.fillRect(r.x - 30, r.y - 60, 60, 80);
      
      // Cabeça
      ctx.fillStyle = '#b9cde8';
      ctx.fillRect(r.x - 25, r.y - 90, 50, 30);
      
      // Antena
      ctx.strokeStyle = '#628cc6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y - 90);
      ctx.lineTo(r.x, r.y - 110);
      ctx.stroke();
      ctx.fillStyle = '#e06b68';
      ctx.beginPath();
      ctx.arc(r.x, r.y - 110, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Olhos baseados no humor
      ctx.fillStyle = '#223c63';
      if (r.mood === 'happy') {
        // Olhos felizes (^_^)
        ctx.beginPath();
        ctx.arc(r.x - 10, r.y - 75, 3, 0, Math.PI, true);
        ctx.arc(r.x + 10, r.y - 75, 3, 0, Math.PI, true);
        ctx.stroke();
        
        // Boca sorrindo
        ctx.beginPath();
        ctx.arc(r.x, r.y - 65, 10, 0, Math.PI);
        ctx.stroke();
      } else if (r.mood === 'sad') {
        // Olhos tristes (T_T)
        ctx.fillRect(r.x - 12, r.y - 78, 2, 6);
        ctx.fillRect(r.x + 10, r.y - 78, 2, 6);
        
        // Boca triste
        ctx.beginPath();
        ctx.arc(r.x, r.y - 60, 10, Math.PI, 0);
        ctx.stroke();
      } else {
        // Olhos neutros
        ctx.fillRect(r.x - 12, r.y - 76, 4, 4);
        ctx.fillRect(r.x + 8, r.y - 76, 4, 4);
        
        // Boca neutra
        ctx.fillRect(r.x - 8, r.y - 65, 16, 2);
      }
      
      // Braços
      ctx.fillStyle = '#8eadd8';
      ctx.fillRect(r.x - 45, r.y - 50, 15, 40);
      ctx.fillRect(r.x + 30, r.y - 50, 15, 40);
      
      // Pernas
      ctx.fillRect(r.x - 20, r.y + 20, 15, 30);
      ctx.fillRect(r.x + 5, r.y + 20, 15, 30);
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
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? Math.round((stats.acertos / total) * 100) : 100;
      desenharPlacar(ctx, [`Pontos ${score}`, `Nível ${level}`, `Trocas de regra ${ruleChanges}`, `Precisão ${precisao}%`]);

      // Regra atual em destaque, sempre no mesmo lugar
      const ruleText = currentRule === 'color' ? '🎨 Organize pela COR' : '🔷 Organize pela FORMA';
      desenharFaixa(ctx, ruleText, { cor: currentRule === 'color' ? TEMA.amarelo : TEMA.destaque });
      if (adaptiveMessageRef.current) {
        desenharFaixa(ctx, adaptiveMessageRef.current, { y: 150, cor: TEMA.textoSuave });
      }
    };

    // ALERTA DE MUDANÇA DE REGRA
    const drawRuleChange = () => {
      if (!game.showingRule) return;

      // Aviso calmo e previsível: cartão central com a nova regra (sem alarme vermelho).
      ctx.fillStyle = 'rgba(22, 41, 74, 0.85)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = TEMA.painel;
      ctx.fillRect(340, 220, 600, 260);
      ctx.strokeStyle = TEMA.amarelo;
      ctx.lineWidth = 3;
      ctx.strokeRect(340, 220, 600, 260);

      ctx.textAlign = 'center';
      ctx.fillStyle = TEMA.texto;
      ctx.font = fonte(40, 800);
      ctx.fillText('A regra mudou!', 640, 310);

      const newRule = currentRule === 'color' ? '🎨 Agora organize pela COR' : '🔷 Agora organize pela FORMA';
      ctx.fillStyle = TEMA.amarelo;
      ctx.font = fonte(32, 700);
      ctx.fillText(newRule, 640, 390);
    };

    // MOUSE EVENTS
    // Converte a posição do ponteiro para as coordenadas internas do canvas
    // (o canvas tem 1280x720, mas é exibido redimensionado pelo CSS).
    const toCanvasPoint = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const handleMouseDown = (e) => {
      const { x, y } = toCanvasPoint(e);
      if (canvas.setPointerCapture && e.pointerId !== undefined) {
        try { canvas.setPointerCapture(e.pointerId); } catch (_error) { /* ignorado */ }
      }
      
      game.mouseX = x;
      game.mouseY = y;
      
      // Verifica se clicou em algum objeto
      game.objects.forEach(obj => {
        if (!obj.placed) {
          const dx = x - obj.x;
          const dy = y - obj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < obj.size / 2) {
            game.selectedObject = obj;
            game.dragging = true;
          }
        }
      });
    };

    const handleMouseMove = (e) => {
      const point = toCanvasPoint(e);
      game.mouseX = point.x;
      game.mouseY = point.y;
      
      if (game.dragging && game.selectedObject) {
        game.selectedObject.x = game.mouseX;
        game.selectedObject.y = game.mouseY;
      }
    };

    const handleMouseUp = () => {
      if (game.dragging && game.selectedObject) {
        // Verifica se soltou em uma zona alvo
        let placed = false;
        const reactionTime = Date.now() - game.attemptStartTime;
        
        game.targetZones.forEach(zone => {
          if (game.selectedObject.x >= zone.x &&
              game.selectedObject.x <= zone.x + zone.width &&
              game.selectedObject.y >= zone.y &&
              game.selectedObject.y <= zone.y + zone.height) {
            
            // Verifica se está correto
            const correct = (currentRule === 'color' && game.selectedObject.color === zone.color) ||
                          (currentRule === 'shape' && game.selectedObject.shape === zone.shape);
            
            if (correct) {
              // Acertou!
              // Registra tentativa no sistema adaptativo
              const result = adaptiveSystem.recordAttempt({
                correct: true,
                reactionTime: reactionTime,
                type: 'sorting'
              });
              
              // Aplica ajustes se houver
              if (result) {
                setAdaptiveMessage(result.message);
                setTimeout(() => setAdaptiveMessage(null), 3000);
              }
              
              game.selectedObject.placed = true;
              game.selectedObject.x = zone.x + zone.width / 2;
              game.selectedObject.y = zone.y + zone.height / 2;
              setScore(s => s + 50 + (level * 10));
              setStats(st => ({ ...st, acertos: st.acertos + 1 }));
              createParticles(zone.x + zone.width / 2, zone.y + zone.height / 2, '#5cc98a', 20);
              
              // Feedback auditivo
              audioRef.current?.onCorrectAnswer();
              
              // Robô feliz
              game.robot.mood = 'happy';
              game.robot.moodTimer = 120;
              
              // Verifica se completou o nível
              if (game.objects.every(o => o.placed)) {
                // Som de nível completo
                audioRef.current?.onLevelComplete();
                
                // Track experiment completion
                experimentsRef.current += 1;
                trackEventRef.current('experiment_completed', {
                  game: 'gravity-lab',
                  totalCompleted: experimentsRef.current
                });
                if (experimentsRef.current >= EXPERIMENTOS_POR_SESSAO) {
                  // Sessão completa: encerra e dispara o salvamento.
                  setTimeout(() => setGameState('gameover'), 1000);
                } else setTimeout(() => {
                  setLevel(l => l + 1);
                  
                  // Muda regra baseado em parâmetros adaptativos
                  const params = adaptiveSystem.getParams();
                  const shouldChangeRule = params.speed > 7; // Muda se está indo bem
                  
                  if (shouldChangeRule && Math.random() < 0.5) {
                    setCurrentRule(r => r === 'color' ? 'shape' : 'color');
                    setRuleChanges(rc => rc + 1);
                    game.showingRule = true;
                    game.ruleChangeTimer = 180; // 3 segundos
                  } else {
                    generateLevel();
                  }
                }, 1000);
              }
              
              placed = true;
              game.attemptStartTime = Date.now();
            } else {
              // Errou!
              // Registra tentativa no sistema adaptativo
              const result = adaptiveSystem.recordAttempt({
                correct: false,
                reactionTime: reactionTime,
                type: 'sorting'
              });
              
              // Aplica ajustes se houver
              if (result) {
                setAdaptiveMessage(result.message);
                setTimeout(() => setAdaptiveMessage(null), 3000);
              }
              
              setStats(st => ({ ...st, erros: st.erros + 1 }));
              createParticles(zone.x + zone.width / 2, zone.y + zone.height / 2, '#e06b68', 15);
              
              // Feedback auditivo
              audioRef.current?.onIncorrectAnswer();
              
              // Robô triste
              game.robot.mood = 'sad';
              game.robot.moodTimer = 120;
              
              game.attemptStartTime = Date.now();
            }
          }
        });
        
        // Se não colocou em nenhuma zona, volta para posição original
        if (!placed && !game.selectedObject.placed) {
          // Objeto volta para área de objetos
        }
      }
      
      game.dragging = false;
      game.selectedObject = null;
    };

    canvas.addEventListener('pointerdown', handleMouseDown);
    canvas.addEventListener('pointermove', handleMouseMove);
    canvas.addEventListener('pointerup', handleMouseUp);

    // KEYBOARD
    const handleKeyDown = (e) => {
      if (gameState === 'menu') {
        if (e.key === ' ') {
          setGameState('playing');
          resetGame();
        } else if (e.key === 'c' || e.key === 'C') {
          setShowSettings(true);
        }
      } else if (gameState === 'playing' && e.key === 'Escape') {
        setGameState('gameover');
      } else if (gameState === 'gameover' && e.key === ' ') {
        setGameState('menu');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const resetGame = () => {
      experimentsRef.current = 0;
      sessionStartedAtRef.current = Date.now();
      sessionPersistedRef.current = false;
      setScore(0);
      setLevel(1);
      setRuleChanges(0);
      setCurrentRule('color');
      setStats({ acertos: 0, erros: 0 });
      setAdaptiveMessage(null);
      game.particles = [];
      game.robot.mood = 'neutral';
      
      // Reseta sistema adaptativo
      adaptiveSystem.reset();
      
      generateLevel();
    };

    // UPDATE
    const update = () => {
      if (gameState !== 'playing') return;

      // Timer de mudança de regra
      if (game.showingRule) {
        game.ruleChangeTimer--;
        if (game.ruleChangeTimer <= 0) {
          game.showingRule = false;
          generateLevel();
        }
      }

      // Timer do humor do robô
      if (game.robot.moodTimer > 0) {
        game.robot.moodTimer--;
        if (game.robot.moodTimer === 0) {
          game.robot.mood = 'neutral';
        }
      }

      // Física dos objetos não colocados
      game.objects.forEach(obj => {
        if (!obj.placed && !game.dragging) {
          obj.rotation += 0.02;
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
        titulo: 'Gravity Lab',
        subtitulo: 'Organize os objetos pela regra',
        linhas: [
          '1. Arraste cada objeto para a caixa certa',
          '2. Siga a regra do topo: pela COR ou pela FORMA',
          '3. Quando a regra mudar, um aviso vai aparecer',
        ],
        chamada: 'Toque em Começar ou aperte ESPAÇO',
      });
    };

    const drawGame = () => {
      drawBackground();
      drawTargetZones();
      drawObjects();
      drawParticles();
      drawRobot();
      drawHUD();
      drawRuleChange();
    };

    const drawTargetZones = () => {
      game.targetZones.forEach(zone => drawTargetZone(zone));
    };

    const drawObjects = () => {
      game.objects.forEach(obj => drawObject(obj));
    };

    const drawGameOver = () => {
      drawBackground();
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? Math.round((stats.acertos / total) * 100) : 0;
      desenharTelaTitulo(ctx, canvas.width, {
        titulo: 'Experimentos concluídos',
        subtitulo: 'Bom trabalho!',
        linhas: [`Pontos: ${score}   ·   Trocas de regra: ${ruleChanges}   ·   Precisão: ${precisao}%`],
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
      canvas.removeEventListener('pointerdown', handleMouseDown);
      canvas.removeEventListener('pointermove', handleMouseMove);
      canvas.removeEventListener('pointerup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', initAudio);
      if (game.animationId) {
        cancelAnimationFrame(game.animationId);
      }
    };
  }, [gameState, score, level, currentRule, ruleChanges, stats]);
  
  useEffect(() => {
    if (gameState !== 'gameover' || sessionPersistedRef.current || !studentId || !sessionStartedAtRef.current) return;
    if (!score && !stats.acertos && !stats.erros) return; // partida sem nenhuma jogada não gera registro
    sessionPersistedRef.current = true;
    persistGameplay({
      studentId,
      gameType: 'gravity-lab',
      score,
      durationSeconds: (Date.now() - sessionStartedAtRef.current) / 1000,
      acertos: stats.acertos,
      erros: stats.erros,
      metadata: { paradigma: 'troca-de-regra', nivel: level, regra_final: currentRule === 'color' ? 'cor' : 'forma', trocas_de_regra: ruleChanges, experimentos: experimentsRef.current }
    }).catch(() => {
      sessionPersistedRef.current = false;
    });
  }, [gameState, studentId, score, stats, level, currentRule, ruleChanges]);

  // Handler para salvar configurações
  const handleSaveSettings = (newSettings) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    applySensorySettings(newSettings, canvas, audio);
  };

  return (
    <div className="game-stage gravity-lab">
      <canvas ref={canvasRef} />
      <GameControls onSettings={() => setShowSettings(true)} studentId={studentId} isPlaying={gameState === 'playing'} controls={[{ key: 'Escape', icon: '⏹', label: 'Encerrar' }]} />
      
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

export default GravityLab;
