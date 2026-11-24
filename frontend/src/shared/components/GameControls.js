import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameControls.css';

/**
 * Controles na tela para os jogos em canvas.
 * Os jogos leem o teclado (window keydown/keyup); cada botão dispara a mesma
 * tecla, permitindo jogar por toque, mouse ou tecnologia assistiva.
 */
export function pressKey(key, type = 'keydown') {
  window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true }));
}

function GameControls({ studentId, isPlaying, startLabel = 'Começar', controls = [], onSettings }) {
  const navigate = useNavigate();
  const voltar = () => navigate(studentId ? `/aluno?student_id=${encodeURIComponent(studentId)}` : '/aluno');

  const holdHandlers = (key) => ({
    onPointerDown: (event) => {
      event.preventDefault();
      pressKey(key, 'keydown');
    },
    onPointerUp: () => pressKey(key, 'keyup'),
    onPointerLeave: () => pressKey(key, 'keyup'),
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        pressKey(key, 'keydown');
        setTimeout(() => pressKey(key, 'keyup'), 120);
      }
    }
  });

  return (
    <div className="game-controls">
      <button type="button" className="game-controls__back" onClick={voltar}>
        ← Voltar
      </button>
      {onSettings && !isPlaying && (
        <button type="button" className="game-controls__settings" onClick={onSettings}>
          ⚙ Ajustes
        </button>
      )}
      {!isPlaying && (
        <p className="game-controls__rotate" role="note">
          Dica: gire o aparelho para jogar com a tela maior.
        </p>
      )}
      <div className="game-controls__bar" role="toolbar" aria-label="Controles do jogo">
        {!isPlaying ? (
          <button type="button" className="game-controls__start" {...holdHandlers(' ')}>
            ▶ {startLabel}
          </button>
        ) : (
          controls.map((control) => (
            <button
              type="button"
              key={control.key + control.label}
              className="game-controls__key"
              aria-label={control.ariaLabel || control.label}
              {...holdHandlers(control.key)}
            >
              <span aria-hidden="true">{control.icon}</span>
              <span className="game-controls__label">{control.label}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default GameControls;
