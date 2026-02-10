import React from 'react';
import './EmergencyStop.css';

function EmergencyStop({ onStop }) {
  const handleEmergencyStop = () => {
    const audioContext = window.audioContext;
    if (audioContext) {
      audioContext.suspend();
    }

    document.querySelectorAll('audio, video').forEach(el => {
      el.pause();
      el.muted = true;
    });

    document.querySelectorAll('*').forEach(el => {
      el.style.animation = 'none';
      el.style.transition = 'none';
    });

    if (onStop) onStop();
  };

  return (
    <button
      className="emergency-stop-button"
      onClick={handleEmergencyStop}
      aria-label="Parar tudo - Botão de emergência"
      title="Clique se precisar parar tudo imediatamente"
    >
      <span className="emergency-icon">⏸️</span>
      <span className="emergency-text">PARAR</span>
    </button>
  );
}

export default EmergencyStop;
