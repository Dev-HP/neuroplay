/**
 * AchievementCard - Card de Conquista
 * 
 * Componente individual para exibir uma conquista.
 * Mostra estado (desbloqueada/bloqueada) e progresso.
 * 
 * @module components/AchievementCard
 * @version 1.0.0
 */

import React from 'react';
import './AchievementCard.css';

const AchievementCard = ({ achievement, onClick }) => {
  const { 
    id, 
    name, 
    description, 
    icon, 
    rarity, 
    points, 
    unlocked, 
    unlockedAt,
    progress = 0,
    category
  } = achievement;

  const rarityColors = {
    common: '#667eea',
    rare: '#4facfe',
    epic: '#fa709a',
    legendary: '#ffd89b'
  };

  const rarityLabels = {
    common: 'Comum',
    rare: 'Rara',
    epic: 'Épica',
    legendary: 'Lendária'
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      className={`achievement-card ${unlocked ? 'unlocked' : 'locked'} rarity-${rarity}`}
      onClick={onClick}
      style={{ '--rarity-color': rarityColors[rarity] }}
    >
      <div className="achievement-card-header">
        <div className={`achievement-icon ${unlocked ? '' : 'locked-icon'}`}>
          {unlocked ? icon : '🔒'}
        </div>
        <div className="achievement-rarity" style={{ color: rarityColors[rarity] }}>
          {rarityLabels[rarity]}
        </div>
      </div>

      <div className="achievement-card-body">
        <h3 className="achievement-name">
          {unlocked ? name : '???'}
        </h3>
        <p className="achievement-description">
          {unlocked ? description : 'Conquista bloqueada'}
        </p>

        {!unlocked && progress > 0 && (
          <div className="achievement-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: rarityColors[rarity]
                }}
              />
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      <div className="achievement-card-footer">
        <div className="achievement-points">
          ⭐ {points} pontos
        </div>
        {unlocked && unlockedAt && (
          <div className="achievement-date">
            {formatDate(unlockedAt)}
          </div>
        )}
      </div>

      {unlocked && (
        <div className="achievement-unlocked-badge">
          ✓
        </div>
      )}
    </div>
  );
};

export default AchievementCard;
