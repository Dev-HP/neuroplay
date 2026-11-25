import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import EmergencyStop from '../../shared/components/EmergencyStop';
import errorCascadeDetector from '../../shared/utils/errorCascadeDetector';
import { apiUrl } from '../../shared/config/api';
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
  const [, setReactionTimes] = useState([]); // tempos de reação (também em placarRef)
  const [cascadeMessage, setCascadeMessage] = useState(null); // Mensagem de cascata
  const [showCascadeModal, setShowCascadeModal] = useState(false); // Modal de pausa

  // Paradigma Go/No-Go clássico: bloco embaralhado com 75% de sinais "Go" e 25%
  // de "No-Go". A maioria de "Go" cria a resposta automática que a criança
  // precisa inibir; com 50/50 a tarefa vira apenas uma escolha.
  const TOTAL_SINAIS = 20;
  const PROPORCAO_GO = 0.75;
  const timerRef = useRef(null);
  const ativoRef = useRef(false); // rodadas só avançam enquanto a partida está ativa
  const sequenciaRef = useRef([]);
  const indiceRef = useRef(-1);
  const respondeuRef = useRef(false);
  const placarRef = useRef(null);
  const [sinalNumero, setSinalNumero] = useState(0);

  const placarVazio = () => ({ hits: 0, rejeicoes: 0, omissoes: 0, comissoes: 0, pontos: 0, tempos: [], eventos: [] });

  const gerarSequencia = () => {
    const totalGo = Math.round(TOTAL_SINAIS * PROPORCAO_GO);
    const seq = [...Array(totalGo).fill('go'), ...Array(TOTAL_SINAIS - totalGo).fill('no-go')];
    for (let i = seq.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [seq[i], seq[j]] = [seq[j], seq[i]];
    }
    // Evita começar com "No-Go": a criança ainda não formou o padrão.
    if (seq[0] === 'no-go') {
      const k = seq.indexOf('go');
      [seq[0], seq[k]] = [seq[k], seq[0]];
    }
    return seq;
  };

  const atualizarPlacarNaTela = () => {
    const p = placarRef.current;
    setAcertos(p.hits + p.rejeicoes);
    setErros(p.omissoes + p.comissoes);
    setPontos(p.pontos);
  };

  const pararRodadas = useCallback(() => {
    ativoRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => pararRodadas, [pararRodadas]);

  const iniciarJogo = () => {
    placarRef.current = placarVazio();
    sequenciaRef.current = gerarSequencia();
    indiceRef.current = -1;
    respondeuRef.current = false;
    setPontos(0);
    setAcertos(0);
    setErros(0);
    setSinalNumero(0);
    setReactionTimes([]);
    setTempoInicio(Date.now());
    errorCascadeDetector.reset(); // Resetar detector ao iniciar
    setCascadeMessage(null);
    setShowCascadeModal(false);
    ativoRef.current = true;
    setGameState('playing');
  };

  // Fecha o sinal atual: sem resposta, "Go" vira omissão e "No-Go" vira acerto (inibiu).
  const avaliarSinalSemResposta = () => {
    const idx = indiceRef.current;
    if (idx < 0 || respondeuRef.current || !placarRef.current) return;
    const tipo = sequenciaRef.current[idx];
    const p = placarRef.current;
    if (tipo === 'go') {
      p.omissoes += 1;
      p.eventos.push({ tipo: 'omissao', sinal: idx + 1 });
      errorCascadeDetector.addAttempt(false);
    } else {
      p.rejeicoes += 1;
      p.pontos += 5;
      p.eventos.push({ tipo: 'inibiu', sinal: idx + 1 });
      errorCascadeDetector.addAttempt(true);
    }
    respondeuRef.current = true;
  };

  const finalizarJogo = async () => {
    pararRodadas();
    setGameState('ready');
    const p = placarRef.current || placarVazio();
    const tempoTotal = Math.floor((Date.now() - tempoInicio) / 1000);
    const acertosFinais = p.hits + p.rejeicoes;
    const errosFinais = p.omissoes + p.comissoes;
    const tempoMedio = p.tempos.length ? Math.round(p.tempos.reduce((a, b) => a + b, 0) / p.tempos.length) : null;

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
        pontos: p.pontos,
        score: p.pontos,
        tempo_gasto: tempoTotal,
        duration_seconds: tempoTotal,
        acertos: acertosFinais,
        erros: errosFinais,
        events: p.eventos.map((evento) => ({ type: 'reaction', data: evento })),
        metadata: {
          paradigma: 'go-no-go',
          total_sinais: TOTAL_SINAIS,
          proporcao_go: PROPORCAO_GO,
          acertos_go: p.hits,
          inibicoes_corretas: p.rejeicoes,
          omissoes: p.omissoes,
          comissoes: p.comissoes,
          tempo_reacao_medio_ms: tempoMedio
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Atividade finalizada!\nPontos: ${p.pontos}\nAcertos: ${acertosFinais}\nErros: ${errosFinais}`);
      navigate(`/aluno?student_id=${studentId}`);
    } catch (error) {
      setCascadeMessage(error.response?.data?.error || 'Não foi possível salvar a sessão. Verifique o consentimento e tente novamente.');
    }
  };

  const finalizarJogoRef = useRef(finalizarJogo);
  finalizarJogoRef.current = finalizarJogo;

  const iniciarRodada = useCallback(() => {
    if (!ativoRef.current) return;
    avaliarSinalSemResposta();
    if (placarRef.current) atualizarPlacarNaTela();
    indiceRef.current += 1;
    if (indiceRef.current >= sequenciaRef.current.length) {
      finalizarJogoRef.current();
      return;
    }
    respondeuRef.current = false;
    setSinalAtual(sequenciaRef.current[indiceRef.current]);
    setSinalNumero(indiceRef.current + 1);
    setGameState('waiting');
    setStimulusTimestamp(performance.now());

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(iniciarRodada, 1800 + Math.random() * 900);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      iniciarRodada();
    }
  }, [gameState, iniciarRodada]);

  const handleClick = () => {
    if (gameState !== 'waiting' || !stimulusTimestamp || !ativoRef.current || respondeuRef.current) return;
    respondeuRef.current = true; // uma resposta por sinal

    const reactionTime = Math.round(performance.now() - stimulusTimestamp);
    const isCorrect = sinalAtual === 'go';
    const p = placarRef.current;
    const cascadeResult = errorCascadeDetector.addAttempt(isCorrect);

    if (isCorrect) {
      p.hits += 1;
      p.pontos += 10;
      p.tempos.push(reactionTime);
      p.eventos.push({ tipo: 'acerto', sinal: indiceRef.current + 1, tempo_ms: reactionTime });
    } else {
      p.comissoes += 1;
      p.pontos = Math.max(0, p.pontos - 5);
      p.eventos.push({ tipo: 'comissao', sinal: indiceRef.current + 1, tempo_ms: reactionTime });
    }
    setReactionTimes(p.tempos.slice());
    atualizarPlacarNaTela();

    // Verificar cascata de erros
    if (cascadeResult.cascade && !cascadeResult.cooldown) {
      setCascadeMessage(cascadeResult.suggestion);
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

            <p className="progresso-sinais" aria-live="polite">Sinal {sinalNumero} de {TOTAL_SINAIS}</p>
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
