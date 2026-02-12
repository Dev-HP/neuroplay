/**
 * AchievementSystem - Sistema Central de Conquistas
 * 
 * Gerencia todas as conquistas, progresso do usuário e lógica de desbloqueio.
 * Baseado em evidências científicas (Restack.io 2024, MDPI 2024).
 * 
 * @module AchievementSystem
 * @version 1.0.0
 */

import { StorageManager } from './StorageManager';
import NotificationManager from './NotificationManager';
import * as achievements from '../data/achievements';

class AchievementSystem {
  constructor() {
    this.storage = new StorageManager();
    this.notificationManager = new NotificationManager();
    this.achievements = this._loadAllAchievements();
    this.listeners = new Set();
    this.initialized = false;
  }

  /**
   * Initialize the achievement system
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.storage.initialize();
      this.initialized = true;
      console.log('[AchievementSystem] Initialized successfully');
    } catch (error) {
      console.error('[AchievementSystem] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load all achievement definitions
   */
  _loadAllAchievements() {
    const allAchievements = {};
    
    Object.values(achievements).forEach(achievementModule => {
      if (Array.isArray(achievementModule)) {
        achievementModule.forEach(achievement => {
          allAchievements[achievement.id] = achievement;
        });
      }
    });
    
    return allAchievements;
  }

  /**
   * Track an event that might trigger achievements
   */
  async trackEvent(eventType, data = {}) {
    if (!this.initialized) {
      console.warn('[AchievementSystem] Not initialized, skipping event:', eventType);
      return;
    }

    try {
      const unlockedAchievements = [];
      
      // Check all achievements for this event
      for (const achievement of Object.values(this.achievements)) {
        if (achievement.trigger === eventType) {
          const unlocked = await this._checkAchievement(achievement, data);
          if (unlocked) {
            unlockedAchievements.push(achievement);
          }
        }
      }
      
      // Notify listeners
      if (unlockedAchievements.length > 0) {
        this._notifyListeners('achievements_unlocked', unlockedAchievements);
      }
      
      return unlockedAchievements;
    } catch (error) {
      console.error('[AchievementSystem] Error tracking event:', error);
      return [];
    }
  }

  /**
   * Check if an achievement should be unlocked
   */
  async _checkAchievement(achievement, data) {
    // Check if already unlocked
    const progress = await this.storage.getAchievementProgress(achievement.id);
    if (progress.unlocked) return false;

    // Check condition
    const shouldUnlock = achievement.condition(data, progress);
    
    if (shouldUnlock) {
      await this._unlockAchievement(achievement);
      return true;
    }
    
    // Update progress if not unlocked
    if (achievement.updateProgress) {
      const newProgress = achievement.updateProgress(data, progress);
      await this.storage.updateAchievementProgress(achievement.id, newProgress);
    }
    
    return false;
  }

  /**
   * Unlock an achievement
   */
  async _unlockAchievement(achievement) {
    const timestamp = Date.now();
    
    // Update storage
    await this.storage.unlockAchievement(achievement.id, timestamp);
    
    // Show notification
    this.notificationManager.show({
      id: achievement.id,
      title: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      points: achievement.points
    });
    
    console.log('[AchievementSystem] Achievement unlocked:', achievement.name);
  }

  /**
   * Get all achievements with progress
   */
  async getAllAchievements() {
    const achievementsWithProgress = [];
    
    for (const achievement of Object.values(this.achievements)) {
      const progress = await this.storage.getAchievementProgress(achievement.id);
      achievementsWithProgress.push({
        ...achievement,
        progress: progress.progress || 0,
        unlocked: progress.unlocked || false,
        unlockedAt: progress.unlockedAt || null
      });
    }
    
    return achievementsWithProgress;
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(category) {
    const all = await this.getAllAchievements();
    return all.filter(a => a.category === category);
  }

  /**
   * Get unlocked achievements
   */
  async getUnlockedAchievements() {
    const all = await this.getAllAchievements();
    return all.filter(a => a.unlocked);
  }

  /**
   * Get achievement statistics
   */
  async getStats() {
    const all = await this.getAllAchievements();
    const unlocked = all.filter(a => a.unlocked);
    
    return {
      total: all.length,
      unlocked: unlocked.length,
      locked: all.length - unlocked.length,
      percentage: (unlocked.length / all.length) * 100,
      totalPoints: unlocked.reduce((sum, a) => sum + a.points, 0),
      byRarity: {
        common: unlocked.filter(a => a.rarity === 'common').length,
        rare: unlocked.filter(a => a.rarity === 'rare').length,
        epic: unlocked.filter(a => a.rarity === 'epic').length,
        legendary: unlocked.filter(a => a.rarity === 'legendary').length
      }
    };
  }

  /**
   * Add event listener
   */
  addEventListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  _notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('[AchievementSystem] Listener error:', error);
      }
    });
  }

  /**
   * Reset all achievements (for testing)
   */
  async reset() {
    await this.storage.clearAllData();
    console.log('[AchievementSystem] All achievements reset');
  }
}

// Singleton instance
let instance = null;

export const getAchievementSystem = () => {
  if (!instance) {
    instance = new AchievementSystem();
  }
  return instance;
};

export default AchievementSystem;
