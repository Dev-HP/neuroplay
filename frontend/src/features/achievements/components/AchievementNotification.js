/**
 * AchievementNotification - Notificação de Conquista
 * 
 * Componente de notificação animada exibida quando conquista é desbloqueada.
 * 
 * @module components/AchievementNotification
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import './AchievementNotification.css';

const AchievementNotification = ({ achievement, onClose, duration = 4000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const rarityColors = {
    common: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    rare: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    epic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    legendary: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
  };

  return (
    <div 
      className={`achievement-notification ${isVisible ? 'visible' : ''} rarity-${achievement.rarity}`}
      onClick={handleClose}
      style={{ background: rarityColors[achievement.rarity] }}
    >
      <div className="notification-content">
        <div className="notification-icon">{achievement.icon}</div>
        <div className="notification-text">
          <div className="notification-title">
            🏆 Conquista Desbloqueada!
          </div>
          <div className="notification-name">
            {achievement.title || achievement.name}
          </div>
          <div className="notification-description">
            {achievement.description}
          </div>
          <div className="notification-points">
            +{achievement.points} pontos
          </div>
        </div>
      </div>
      <div className="notification-close">✕</div>
    </div>
  );
};

export default AchievementNotification;
