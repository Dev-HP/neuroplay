import React from 'react';
import './GameUI.css';

/**
 * Interface do Usuário do Jogo
 * Mostra score, vidas, estatísticas e controles
 */
export default function GameUI({
  gameState,
  score,
  lives,
  stats,
  onStart,
  onPause,
  onRestart
}) {
  const accuracy = stats.responseCount > 0
    ? ((stats.correctResponses / stats.responseCount) * 100).toFixed(1)
    : 0;

  const avgReactionTime = stats.responseCount > 0
    ? Math.round(stats.totalReactionTime / stats.responseCount)
    : 0;

  return (
    <div className="game-ui">
      {/* HUD Superior */}
      <div className="hud-top">
        <div className="hud-item">
          <span className="hud-label">PONTOS</span>
          <span className="hud-value score">{score}</span>
        </div>

        <div className="hud-item">
          <span className="hud-label">VIDAS</span>
          <div className="lives-container">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`life-heart ${i < lives ? 'active' : 'inactive'}`}
              >
                ❤️
              </div>
            ))}
          </div>
        </div>

        <div className="hud-item">
          <span className="hud-label">PRECISÃO</span>
          <span className="hud-value">{accuracy}%</span>
        </div>
      </div>

      {/* Controles */}
      <div className="controls-hint">
        <div className="control-item">
          <kbd>ESPAÇO</kbd> ou <kbd>↑</kbd> = Pular
        </div>
        <div className="control-item">
          <kbd>↓</kbd> = Deslizar
        </div>
      </div>

      {/* Tela de Início */}
      {gameState === 'ready' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h1 className="game-title">CYBER-RUNNER</h1>
            <p className="game-subtitle">Treinamento de Controle Inibitório</p>
            
            <div className="instructions">
              <h3>Como Jogar:</h3>
              <ul>
                <li><span className="obstacle-go">Verde</span> = PULE (Espaço/↑)</li>
                <li><span className="obstacle-nogo">Vermelho</span> = DESLIZE (↓)</li>
                <li>Resolva equações matemáticas quando aparecerem!</li>
              </ul>
            </div>

            <button className="btn-primary" onClick={onStart}>
              INICIAR JOGO
            </button>
          </div>
        </div>
      )}

      {/* Tela de Pausa */}
      {gameState === 'paused' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2>PAUSADO</h2>
            <div className="stats-panel">
              <div className="stat-item">
                <span className="stat-label">Acertos:</span>
                <span className="stat-value">{stats.correctResponses}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Erros:</span>
                <span className="stat-value">{stats.incorrectResponses}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tempo Médio:</span>
                <span className="stat-value">{avgReactionTime}ms</span>
              </div>
            </div>
            <button className="btn-primary" onClick={onPause}>
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {/* Tela de Game Over */}
      {gameState === 'gameOver' && (
        <div className="game-overlay">
          <div className="overlay-content">
            <h2 className="game-over-title">GAME OVER</h2>
            
            <div className="final-score">
              <span className="final-score-label">Pontuação Final</span>
              <span className="final-score-value">{score}</span>
            </div>

            <div className="stats-panel">
              <div className="stat-item">
                <span className="stat-label">Precisão:</span>
                <span className="stat-value">{accuracy}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Acertos:</span>
                <span className="stat-value">{stats.correctResponses}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Erros:</span>
                <span className="stat-value">{stats.incorrectResponses}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tempo Médio de Reação:</span>
                <span className="stat-value">{avgReactionTime}ms</span>
              </div>
            </div>

            <button className="btn-primary" onClick={onRestart}>
              JOGAR NOVAMENTE
            </button>
          </div>
        </div>
      )}

      {/* Botão de Pausa (durante jogo) */}
      {gameState === 'playing' && (
        <button className="btn-pause" onClick={onPause} aria-label="Pausar jogo">
          ⏸️
        </button>
      )}
    </div>
  );
}
