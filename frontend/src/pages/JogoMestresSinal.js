import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import EmergencyStop from '../shared/components/EmergencyStop';
import errorCascadeDetector from '../shared/utils/errorCascadeDetector';
import { apiUrl } from '../shared/config/api';
import './JogoMestresSinal.css';

function JogoMestresSinal({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student_id') || user?.student_id || (user?.tipo === 'aluno' ? user.id : null);
  const [gameState, setGameState] = useState('ready'); // ready, playing, waiting
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [sinalAtual, setSinalAtual] = useState('go'); // go ou no-go
  const [tempoInicio, setTempoInicio] = useState(null);
  const [stimulusTimestamp, setStimulusTimestamp] = useState(null); // ← TIMESTAMP DO ESTÍMULO
  const [reactionTimes, setReactionTimes] = useState([]); // ← ARRAY DE TEMPOS DE REAÇÃO
  const [cascadeMessage, setCascadeMessage] = useState(null); // Mensagem de cascata
  const [showCascadeModal, setShowCascadeModal] = useState(false); // Modal de pausa

  const TOTAL_RESPOSTAS = 10;
  const timerRef = useRef(null);
  const ativoRef = useRef(false); // rodadas só avançam enquanto a partida está ativa

  const pararRodadas = useCallback(() => {
    ativoRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => pararRodadas, [pararRodadas]);

  const iniciarJogo = () => {
    setPontos(0);
    setAcertos(0);
    setErros(0);
    setReactionTimes([]);
    setTempoInicio(Date.now());
    errorCascadeDetector.reset(); // Resetar detector ao iniciar
    setCascadeMessage(null);
    setShowCascadeModal(false);
    ativoRef.current = true;
    setGameState('playing');
  };

  const iniciarRodada = useCallback(() => {
    if (!ativoRef.current) return;
    const isNoGo = Math.random() > 0.5;
    setSinalAtual(isNoGo ? 'no-go' : 'go');
    setGameState('waiting');
    setStimulusTimestamp(performance.now());

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(iniciarRodada, 2000 + Math.random() * 2000);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      iniciarRodada();
    }
  }, [gameState, iniciarRodada]);

  const finalizarJogo = async ({ pontosFinais, acertosFinais, errosFinais, eventos }) => {
    pararRodadas();
    setGameState('ready');
    const tempoTotal = Math.floor((Date.now() - tempoInicio) / 1000);

    if (!studentId) {
      setCascadeMessage('Selecione um perfil de estudante autorizado antes de iniciar uma atividade.');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      await axios.post(apiUrl('/api/v1/gameplay/sync'), {
        session_id: `mestres-sinal-${studentId}-${Date.now()}`,
        student_id: Number(studentId),
        game_type: 'mestres-sinal',
        pontos: pontosFinais,
        score: pontosFinais,
        tempo_gasto: tempoTotal,
        duration_seconds: tempoTotal,
        acertos: acertosFinais,
        erros: errosFinais,
        events: eventos.map((event) => ({ type: 'reaction', data: event }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Atividade finalizada!\nPontos: ${pontosFinais}\nAcertos: ${acertosFinais}\nErros: ${errosFinais}`);
      navigate(`/aluno?student_id=${studentId}`);
    } catch (error) {
      setCascadeMessage(error.response?.data?.error || 'Não foi possível salvar a sessão. Verifique o consentimento e tente novamente.');
    }
  };

  const handleClick = () => {
    if (gameState !== 'waiting' || !stimulusTimestamp || !ativoRef.current) return;

    const reactionTime = performance.now() - stimulusTimestamp;
    const isCorrect = sinalAtual === 'go';
    setStimulusTimestamp(null); // uma resposta por sinal

    // Registrar tentativa no detector de cascata
    const cascadeResult = errorCascadeDetector.addAttempt(isCorrect);

    // Valores atualizados calculados aqui para que o resultado final inclua esta resposta
    const novosAcertos = acertos + (isCorrect ? 1 : 0);
    const novosErros = erros + (isCorrect ? 0 : 1);
    const novosPontos = isCorrect ? pontos + 10 : Math.max(0, pontos - 5);
    const novosEventos = [...reactionTimes, {
      timestamp: Date.now(),
      reactionTime: Math.round(reactionTime),
      correct: isCorrect,
      stimulusType: sinalAtual
    }];

    setAcertos(novosAcertos);
    setErros(novosErros);
    setPontos(novosPontos);
    setReactionTimes(novosEventos);

    if (novosAcertos + novosErros >= TOTAL_RESPOSTAS) {
      finalizarJogo({ pontosFinais: novosPontos, acertosFinais: novosAcertos, errosFinais: novosErros, eventos: novosEventos });
      return;
    }

    // Verificar cascata de erros
    if (cascadeResult.cascade && !cascadeResult.cooldown) {
      console.warn('⚠️ Cascata de erros detectada!', cascadeResult);

      // Mostrar mensagem encorajadora
      setCascadeMessage(cascadeResult.suggestion);

      // Se crítico, pausar o jogo e sugerir descanso
      if (cascadeResult.severity === 'critical') {
        pararRodadas();
        setGameState('paused');
        setShowCascadeModal(true);
      }
    }
  };

  const handleContinueAfterPause = () => {
    setShowCascadeModal(false);
    setCascadeMessage(null);
    ativoRef.current = true;
    setGameState('playing');
  };

  const voltarAoPainel = () => navigate(studentId ? `/aluno?student_id=${encodeURIComponent(studentId)}` : '/aluno');

  const handleTakePause = () => {
    pararRodadas();
    setShowCascadeModal(false);
    voltarAoPainel();
  };

  return (
    <div className="jogo-container">
      <EmergencyStop onStop={() => { pararRodadas(); setGameState('ready'); }} />
      {!studentId && <div className="status-banner" role="status">Selecione um perfil autorizado no painel do educador.</div>}
      <header className="jogo-header">
        <button onClick={() => { pararRodadas(); voltarAoPainel(); }} className="btn-voltar">← Voltar</button>
        <div className="pontos-display">Pontos: {pontos}</div>
      </header>

      <div className="jogo-area">
        {gameState === 'ready' ? (
          <div className="start-screen">
            <h1>Mestres do Sinal</h1>
            <p>Clique apenas quando aparecer o sinal verde!</p>
            <p>Não clique no sinal vermelho!</p>
            <button onClick={iniciarJogo} className="btn btn-primary btn-large">
              Começar
            </button>
          </div>
        ) : (
          <div className="game-screen">
            <div
              className={`sinal ${sinalAtual}`}
              role="img"
              aria-label={sinalAtual === 'no-go' ? 'Sinal vermelho: não clique' : 'Sinal verde: clique'}
            >
              {sinalAtual === 'no-go' ? (
                <>
                  <div className="no-go-icon" aria-hidden="true">🚫</div>
                  <span className="sinal-label">Vermelho — não clique</span>
                </>
              ) : (
                <>
                  <div className="go-icon" aria-hidden="true">✓</div>
                  <span className="sinal-label">Verde — clique</span>
                </>
              )}
            </div>

            <button
              onClick={handleClick}
              className="btn-acao"
              disabled={gameState !== 'waiting'}
            >
              {gameState === 'waiting' ? 'Clique!' : 'Aguarde...'}
            </button>

            <div className="stats">
              <div className="stat-item">
                <span className="stat-label">Acertos:</span>
                <span className="stat-value">{acertos}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Erros:</span>
                <span className="stat-value">{erros}</span>
              </div>
            </div>

            {/* Mensagem de encorajamento durante cascata */}
            {cascadeMessage && !showCascadeModal && (
              <div className="cascade-warning">
                <div className="cascade-icon">💪</div>
                <p>{cascadeMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de pausa sugerida */}
      {showCascadeModal && (
        <div className="cascade-modal-overlay">
          <div className="cascade-modal">
            <div className="cascade-modal-icon">😊</div>
            <h2>Vamos fazer uma pausa?</h2>
            <p>Você está indo muito bem! Que tal descansar um pouquinho?</p>
            <p className="cascade-modal-subtitle">Descansar ajuda a concentração e melhora o desempenho!</p>
            <div className="cascade-modal-actions">
              <button onClick={handleTakePause} className="btn btn-primary">
                Fazer Pausa
              </button>
              <button onClick={handleContinueAfterPause} className="btn btn-secondary">
                Continuar Jogando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JogoMestresSinal;
