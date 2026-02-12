/**
 * NotificationManager - Gerenciador de Notificações
 * 
 * Exibe notificações animadas quando conquistas são desbloqueadas.
 * Integra com audioFeedback existente e respeita configurações sensoriais.
 * 
 * @module NotificationManager
 * @version 1.0.0
 */

import { getAudioFeedback } from '../../../shared/utils/audioFeedback';

class NotificationManager {
  constructor() {
    this.queue = [];
    this.isShowing = false;
    this.container = null;
    this.currentNotification = null;
  }

  /**
   * Initialize notification container
   */
  initialize() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.id = 'achievement-notifications';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Show achievement notification
   */
  show(achievement) {
    this.queue.push(achievement);
    if (!this.isShowing) {
      this._showNext();
    }
  }

  /**
   * Show next notification in queue
   */
  async _showNext() {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const achievement = this.queue.shift();
    
    // Ensure container exists
    this.initialize();
    
    // Create notification element
    const notification = this._createNotificationElement(achievement);
    this.container.appendChild(notification);
    this.currentNotification = notification;
    
    // Play sound
    this._playAchievementSound(achievement.rarity);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });
    
    // Wait and animate out
    await this._wait(4000);
    
    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';
    
    await this._wait(300);
    
    // Remove from DOM
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    
    this.currentNotification = null;
    
    // Show next
    this._showNext();
  }

  /**
   * Create notification DOM element
   */
  _createNotificationElement(achievement) {
    const div = document.createElement('div');
    div.className = `achievement-notification rarity-${achievement.rarity}`;
    div.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      max-width: 400px;
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: auto;
      cursor: pointer;
      margin-bottom: 12px;
    `;
    
    // Rarity-specific colors
    const rarityColors = {
      common: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      rare: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      epic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      legendary: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)'
    };
    
    div.style.background = rarityColors[achievement.rarity] || rarityColors.common;
    
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 32px;">${achievement.icon}</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
            🏆 Conquista Desbloqueada!
          </div>
          <div style="font-size: 14px; margin-bottom: 2px;">
            ${achievement.title}
          </div>
          <div style="font-size: 12px; opacity: 0.9;">
            ${achievement.description}
          </div>
          <div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">
            +${achievement.points} pontos
          </div>
        </div>
      </div>
    `;
    
    // Click to dismiss
    div.addEventListener('click', () => {
      div.style.transform = 'translateX(400px)';
      div.style.opacity = '0';
      setTimeout(() => {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
      }, 300);
    });
    
    return div;
  }

  /**
   * Play achievement sound based on rarity
   */
  _playAchievementSound(rarity) {
    try {
      const soundMap = {
        common: 'success',
        rare: 'levelUp',
        epic: 'powerUp',
        legendary: 'victory'
      };
      
      const soundType = soundMap[rarity] || 'success';
      const audioFeedback = getAudioFeedback();
      audioFeedback.play(soundType);
    } catch (error) {
      console.warn('[NotificationManager] Could not play sound:', error);
    }
  }

  /**
   * Wait helper
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.queue = [];
    if (this.currentNotification && this.currentNotification.parentNode) {
      this.currentNotification.parentNode.removeChild(this.currentNotification);
    }
    this.currentNotification = null;
    this.isShowing = false;
  }
}

// Singleton instance
let instance = null;

export const getNotificationManager = () => {
  if (!instance) {
    instance = new NotificationManager();
  }
  return instance;
};

export default NotificationManager;
