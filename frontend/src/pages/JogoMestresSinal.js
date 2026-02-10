import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JogoMestresSinal.css';

function JogoMestresSinal({ user }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('ready'); // ready, playing, waiting
  const [pontos, setPontos] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [sinalAtual, setSinalAtual] = useState('go'); // go ou no-go
  const [tempoInicio, setTempoInicio] = useState(null);
  const [stimulusTimestamp, setStimulusTimestamp] = useState(null); // ← TIMESTAMP DO ESTÍMULO
  const [reactionTimes, setReactionTimes] = useState([]); // ← ARRAY DE TEMPOS DE REAÇÃO

  const iniciarJogo = () => {
    setPontos(0);
    setAcertos(0);
    setErros(0);
    setGameState('playing');
    setTempoInicio(Date.now());
  };

  const iniciarRodada = useCallback(() => {
    const isNoGo = Math.random() > 0.5;
    setSinalAtual(isNoGo ? 'no-go' : 'go');
    setGameState('waiting');
    setStimulusTimestamp(performance.now());

    setTimeout(() => {
      if (gameState !== 'ready') {
        iniciarRodada();
      }
    }, 2000 + Math.random() * 2000);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      iniciarRodada();
    }
  }, [gameState, iniciarRodada]);

  const handleClick = () => {
    if (gameState !== 'waiting' || !stimulusTimestamp) return;

    const reactionTime = performance.now() - stimulusTimestamp;
    const isCorrect = sinalAtual === 'go';

    setReactionTimes(prev => [...prev, {
      timestamp: Date.now(),
      reactionTime: Math.round(reactionTime),
      correct: isCorrect,
      stimulusType: sinalAtual
    }]);

    if (sinalAtual === 'go') {
      setAcertos(prev => prev + 1);
      setPontos(prev => prev + 10);
    } else {
      setErros(prev => prev + 1);
      setPontos(prev => Math.max(0, prev - 5));
    }

    if (acertos + erros >= 9) {
      finalizarJogo();
    }
  };

  const finalizarJogo = async () => {
    setGameState('ready');
    const tempoTotal = Math.floor((Date.now() - tempoInicio) / 1000);
    
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((sum, rt) => sum + rt.reactionTime, 0) / reactionTimes.length
      : 0;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/progresso', {
        aluno_id: user.id,
        atividade_id: 1,
        pontos: pontos,
        tempo_gasto: tempoTotal,
        acertos: acertos + 1,
        erros: erros,
        reaction_times: reactionTimes,
        avg_reaction_time: Math.round(avgReactionTime)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Jogo finalizado!\nPontos: ${pontos}\nAcertos: ${acertos + 1}\nErros: ${erros}`);
      navigate('/aluno');
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  return (
    <div className="jogo-container">
      <header className="jogo-header">
        <button onClick={() => navigate('/aluno')} className="btn-voltar">← Voltar</button>
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
            <div className={`sinal ${sinalAtual}`}>
              {sinalAtual === 'no-go' ? (
                <div className="no-go-icon">🚫</div>
              ) : (
                <div className="go-icon">✓</div>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default JogoMestresSinal;
