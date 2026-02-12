import React, { useEffect, useRef, useState } from 'react';
import './GravityLab.css';
import { getAudioFeedback } from '../../shared/utils/audioFeedback';
import { AdaptiveDifficulty } from '../CyberRunnerCanvas/adaptiveDifficulty';
import { SensorySettings, loadSensorySettings, applySensorySettings } from '../../shared/components/SensorySettings';
import { useAchievementSystem } from '../../features/achievements';

const GravityLab = () => {
  const canvasRef = useRef(null);
  const { trackEvent } = useAchievementSystem();
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentRule, setCurrentRule] = useState('color'); // color ou shape
  const [ruleChanges, setRuleChanges] = useState(0);
  const [stats, setStats] = useState({ acertos: 0, erros: 0 });
  const [experimentsCompleted, setExperimentsCompleted] = useState(0);
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

    // TIPOS DE OBJETOS
    const objectTypes = [
      { shape: 'square', color: '#ff6b6b', name: 'Quadrado Vermelho' },
      { shape: 'square', color: '#4ecdc4', name: 'Quadrado Azul' },
      { shape: 'circle', color: '#ff6b6b', name: 'Círculo Vermelho' },
      { shape: 'circle', color: '#4ecdc4', name: 'Círculo Azul' },
      { shape: 'triangle', color: '#ffe66d', name: 'Triângulo Amarelo' },
      { shape: 'triangle', color: '#95e1d3', name: 'Triângulo Verde' }
    ];

    // Estado do jogo
    const game = {
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
      
      // Cria zonas alvo baseadas na regra atual
      if (currentRule === 'color') {
        const colors = [...new Set(game.objects.map(o => o.color))];
        colors.forEach((color, i) => {
          game.targetZones.push({
            x: 800 + i * 200,
            y: 500,
            width: 150,
            height: 150,
            color: color,
            type: 'color',
            label: color === '#ff6b6b' ? 'VERMELHO' : 
                   color === '#4ecdc4' ? 'AZUL' : 
                   color === '#ffe66d' ? 'AMARELO' : 'VERDE'
          });
        });
      } else {
        const shapes = [...new Set(game.objects.map(o => o.shape))];
        shapes.forEach((shape, i) => {
          game.targetZones.push({
            x: 800 + i * 200,
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
      // Gradiente de laboratório
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#2c3e50');
      gradient.addColorStop(1, '#34495e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid de laboratório
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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

      // Título do laboratório
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GRAVITY LAB', 640, 100);
    };

    // DESENHAR OBJETO
    const drawObject = (obj) => {
      ctx.save();
      ctx.translate(obj.x, obj.y);
      ctx.rotate(obj.rotation);

      // Sombra
      ctx.shadowBlur = 15;
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
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.label, zone.x + zone.width / 2, zone.y + zone.height + 25);
    };

    // DESENHAR ROBÔ NPC
    const drawRobot = () => {
      const r = game.robot;
      
      // Corpo
      ctx.fillStyle = '#95a5a6';
      ctx.fillRect(r.x - 30, r.y - 60, 60, 80);
      
      // Cabeça
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(r.x - 25, r.y - 90, 50, 30);
      
      // Antena
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y - 90);
      ctx.lineTo(r.x, r.y - 110);
      ctx.stroke();
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(r.x, r.y - 110, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Olhos baseados no humor
      ctx.fillStyle = '#2c3e50';
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
      ctx.fillStyle = '#95a5a6';
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
      // Pontos
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`PONTOS: ${score}`, 20, 30);
      
      // Nível
      ctx.fillText(`NÍVEL: ${level}`, 20, 60);
      
      // Mudanças de regra
      ctx.fillText(`MUDANÇAS: ${ruleChanges}`, 20, 90);
      
      // Regra atual (DESTAQUE)
      const ruleText = currentRule === 'color' ? '🎨 ORGANIZE POR COR' : '🔷 ORGANIZE POR FORMA';
      const ruleColor = currentRule === 'color' ? '#ff6b6b' : '#4ecdc4';
      
      ctx.fillStyle = ruleColor;
      ctx.shadowBlur = 20;
      ctx.shadowColor = ruleColor;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(ruleText, 640, 50);
      ctx.shadowBlur = 0;
      
      // Precisão
      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 100;
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`PRECISÃO: ${precisao}%`, 1260, 30);
      
      // Instrução
      ctx.fillStyle = 'white';
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Arraste os objetos para as zonas corretas!', 640, 690);
      
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

    // ALERTA DE MUDANÇA DE REGRA
    const drawRuleChange = () => {
      if (!game.showingRule) return;

      // Overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Caixa de alerta
      ctx.fillStyle = '#e74c3c';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#e74c3c';
      ctx.fillRect(340, 200, 600, 300);
      ctx.shadowBlur = 0;

      // Ícone de alerta
      ctx.font = 'bold 80px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️', 640, 280);

      // Texto
      ctx.font = 'bold 48px Arial';
      ctx.fillText('MUDANÇA DE REGRA!', 640, 360);

      const newRule = currentRule === 'color' ? '🎨 ORGANIZE POR COR' : '🔷 ORGANIZE POR FORMA';
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = '#ffff00';
      ctx.fillText(newRule, 640, 430);
    };

    // MOUSE EVENTS
    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
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
      const rect = canvas.getBoundingClientRect();
      game.mouseX = e.clientX - rect.left;
      game.mouseY = e.clientY - rect.top;
      
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
              createParticles(zone.x + zone.width / 2, zone.y + zone.height / 2, '#00ff00', 20);
              
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
                setExperimentsCompleted(e => {
                  const newCount = e + 1;
                  trackEvent('experiment_completed', {
                    game: 'gravity-lab',
                    totalCompleted: newCount
                  });
                  return newCount;
                });
                
                setTimeout(() => {
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
              createParticles(zone.x + zone.width / 2, zone.y + zone.height / 2, '#ff0000', 15);
              
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

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // KEYBOARD
    const handleKeyDown = (e) => {
      if (gameState === 'menu') {
        if (e.key === ' ') {
          setGameState('playing');
          resetGame();
        } else if (e.key === 'c' || e.key === 'C') {
          setShowSettings(true);
        }
      } else if (gameState === 'gameover' && e.key === ' ') {
        setGameState('menu');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const resetGame = () => {
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

      ctx.fillStyle = '#3498db';
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#3498db';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GRAVITY LAB', 640, 200);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffd700';
      ctx.font = '28px Arial';
      ctx.fillText('🧪 Laboratório de Gravidade 🧪', 640, 270);

      const instructions = [
        '1. ARRASTE objetos para as zonas corretas',
        '2. Siga a REGRA atual (COR ou FORMA)',
        '3. ATENÇÃO: A regra pode MUDAR!',
        '',
        'Pressione ESPAÇO para começar'
      ];

      let y = 360;
      instructions.forEach(inst => {
        ctx.fillStyle = inst === '' ? '#00ffff' : 'white';
        ctx.font = inst.includes('ESPAÇO') ? 'bold 24px Arial' : '20px Arial';
        ctx.fillText(inst, 640, y);
        y += 40;
      });
      
      // Botão de configurações
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(20, 650, 200, 50);
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 650, 200, 50);
      ctx.fillStyle = '#3498db';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('⚙️ Config (C)', 40, 682);
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

      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', 640, 200);

      const total = stats.acertos + stats.erros;
      const precisao = total > 0 ? (stats.acertos / total * 100).toFixed(1) : 0;

      ctx.fillStyle = 'white';
      ctx.font = '28px Arial';
      ctx.fillText(`Pontuação: ${score}`, 640, 300);
      ctx.fillText(`Nível Alcançado: ${level}`, 640, 350);
      ctx.fillText(`Mudanças de Regra: ${ruleChanges}`, 640, 400);
      ctx.fillText(`Precisão: ${precisao}%`, 640, 450);

      ctx.fillStyle = '#00ffff';
      ctx.fillText('Pressione ESPAÇO para voltar ao menu', 640, 550);
    };

    // GAME LOOP
    const gameLoop = () => {
      update();
      draw();
      game.animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', initAudio);
      if (game.animationId) {
        cancelAnimationFrame(game.animationId);
      }
    };
  }, [gameState, score, level, currentRule, ruleChanges, stats]);
  
  // Handler para salvar configurações
  const handleSaveSettings = (newSettings) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    applySensorySettings(newSettings, canvas, audio);
  };

  return (
    <div className="gravity-lab">
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

export default GravityLab;
