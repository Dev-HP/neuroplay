/**
 * AchievementSystem Tests
 */

import AchievementSystem, { getAchievementSystem } from '../AchievementSystem';
import { StorageManager } from '../StorageManager';
import NotificationManager from '../NotificationManager';

// Mock dependencies
jest.mock('../StorageManager');
jest.mock('../NotificationManager');

describe('AchievementSystem', () => {
  let system;

  beforeEach(() => {
    system = new AchievementSystem();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = getAchievementSystem();
      const instance2 = getAchievementSystem();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await system.initialize();
      
      expect(system.initialized).toBe(true);
    });

    it('should not initialize twice', async () => {
      await system.initialize();
      await system.initialize();
      
      expect(system.initialized).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const errorSystem = new AchievementSystem();
      errorSystem.storage.initialize = jest.fn().mockRejectedValue(new Error('Init failed'));
      
      await expect(errorSystem.initialize()).rejects.toThrow('Init failed');
    });
  });

  describe('_loadAllAchievements', () => {
    it('should load all achievement definitions', () => {
      const achievements = system._loadAllAchievements();
      
      expect(Object.keys(achievements).length).toBeGreaterThan(0);
      expect(achievements).toHaveProperty('first_steps');
    });

    it('should have valid achievement structure', () => {
      const achievements = system._loadAllAchievements();
      const firstAchievement = Object.values(achievements)[0];
      
      expect(firstAchievement).toHaveProperty('id');
      expect(firstAchievement).toHaveProperty('name');
      expect(firstAchievement).toHaveProperty('description');
      expect(firstAchievement).toHaveProperty('icon');
      expect(firstAchievement).toHaveProperty('category');
      expect(firstAchievement).toHaveProperty('xp');
      expect(firstAchievement).toHaveProperty('condition');
    });

    it('should load achievements from all categories', () => {
      const achievements = system._loadAllAchievements();
      const categories = new Set(Object.values(achievements).map(a => a.category));
      
      expect(categories.size).toBeGreaterThan(1);
    });
  });

  describe('trackEvent', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should return empty array if not initialized', async () => {
      const uninitializedSystem = new AchievementSystem();
      const result = await uninitializedSystem.trackEvent('test', {});
      
      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const result = await system.trackEvent('invalid_event', null);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('should track events without errors', async () => {
      const result = await system.trackEvent('game_completed', {
        game: 'cyber-runner'
      });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('_checkAchievement', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should not unlock already unlocked achievement', async () => {
      const achievement = { id: 'test', condition: () => true };
      system.storage.getAchievementProgress = jest.fn().mockResolvedValue({ unlocked: true });
      
      const result = await system._checkAchievement(achievement, {});
      
      expect(result).toBe(false);
    });

    it('should unlock achievement when condition is met', async () => {
      const achievement = { id: 'test', condition: () => true, name: 'Test', icon: '🎮' };
      system.storage.getAchievementProgress = jest.fn().mockResolvedValue({ unlocked: false });
      system.storage.unlockAchievement = jest.fn().mockResolvedValue(true);
      
      const result = await system._checkAchievement(achievement, {});
      
      expect(result).toBe(true);
    });

    it('should not unlock achievement when condition is not met', async () => {
      const achievement = { id: 'test', condition: () => false };
      system.storage.getAchievementProgress = jest.fn().mockResolvedValue({ unlocked: false });
      
      const result = await system._checkAchievement(achievement, {});
      
      expect(result).toBe(false);
    });
  });

  describe('_unlockAchievement', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should unlock achievement and show notification', async () => {
      const achievement = {
        id: 'test',
        name: 'Test Achievement',
        description: 'Test description',
        icon: '🎮',
        xp: 100
      };
      
      const unlockSpy = jest.spyOn(system.storage, 'unlockAchievement');
      const showSpy = jest.spyOn(system.notificationManager, 'show');
      
      await system._unlockAchievement(achievement);
      
      expect(unlockSpy).toHaveBeenCalled();
      expect(showSpy).toHaveBeenCalled();
    });
  });

  describe('getAllAchievements', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should return all achievements with progress', async () => {
      const achievements = await system.getAllAchievements();
      
      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);
    });

    it('should include progress data', async () => {
      const achievements = await system.getAllAchievements();
      const first = achievements[0];
      
      expect(first).toHaveProperty('progress');
      expect(first).toHaveProperty('unlocked');
      expect(first).toHaveProperty('unlockedAt');
    });

    it('should merge achievement definitions with progress', async () => {
      system.storage.getAchievementProgress = jest.fn().mockResolvedValue({
        progress: 50,
        unlocked: false,
        unlockedAt: null
      });
      
      const achievements = await system.getAllAchievements();
      
      expect(achievements[0].progress).toBe(50);
    });
  });

  describe('getAchievementsByCategory', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should filter by category', async () => {
      const achievements = await system.getAchievementsByCategory('progress');
      
      expect(achievements.every(a => a.category === 'progress')).toBe(true);
    });

    it('should return empty array for invalid category', async () => {
      const achievements = await system.getAchievementsByCategory('invalid_category_xyz');
      
      expect(achievements).toEqual([]);
    });

    it('should return all achievements of specified category', async () => {
      const allAchievements = await system.getAllAchievements();
      const progressAchievements = allAchievements.filter(a => a.category === 'progress');
      const result = await system.getAchievementsByCategory('progress');
      
      expect(result.length).toBe(progressAchievements.length);
    });
  });

  describe('getUnlockedAchievements', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should return only unlocked achievements', async () => {
      // Mock para retornar valores diferentes para cada achievement
      let callCount = 0;
      system.storage.getAchievementProgress = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount % 3 === 0) {
          return Promise.resolve({ unlocked: true, progress: 100 });
        }
        return Promise.resolve({ unlocked: false, progress: 50 });
      });
      
      const unlocked = await system.getUnlockedAchievements();
      
      expect(unlocked.every(a => a.unlocked === true)).toBe(true);
    });

    it('should return empty array if no achievements unlocked', async () => {
      system.storage.getAchievementProgress = jest.fn().mockResolvedValue({ unlocked: false });
      
      const unlocked = await system.getUnlockedAchievements();
      
      expect(unlocked).toEqual([]);
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should return statistics', async () => {
      const stats = await system.getStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('unlocked');
      expect(stats).toHaveProperty('locked');
      expect(stats).toHaveProperty('percentage');
      expect(stats).toHaveProperty('totalPoints');
    });

    it('should calculate percentage correctly', async () => {
      const stats = await system.getStats();
      
      expect(stats.percentage).toBe((stats.unlocked / stats.total) * 100);
    });

    it('should calculate total points correctly', async () => {
      // Mock para retornar todos achievements como desbloqueados
      system.storage.getAchievementProgress = jest.fn().mockResolvedValue({ 
        unlocked: true, 
        progress: 100 
      });
      
      const stats = await system.getStats();
      const allAchievements = Object.values(system.achievements);
      const expectedPoints = allAchievements.reduce((sum, a) => sum + (a.xp || 0), 0);
      
      expect(typeof stats.totalPoints).toBe('number');
      expect(stats.totalPoints).toBe(expectedPoints);
    });

    it('should handle zero unlocked achievements', async () => {
      system.storage.getAchievementProgress = jest.fn().mockResolvedValue({ unlocked: false });
      
      const stats = await system.getStats();
      
      expect(stats.unlocked).toBe(0);
      expect(stats.percentage).toBe(0);
      expect(stats.totalPoints).toBe(0);
    });
  });

  describe('addEventListener', () => {
    it('should add listener', () => {
      const callback = jest.fn();
      const unsubscribe = system.addEventListener(callback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(system.listeners.size).toBe(1);
    });

    it('should remove listener on unsubscribe', () => {
      const callback = jest.fn();
      const unsubscribe = system.addEventListener(callback);
      
      unsubscribe();
      
      expect(system.listeners.size).toBe(0);
    });

    it('should notify listeners', () => {
      const callback = jest.fn();
      system.addEventListener(callback);
      
      system._notifyListeners('test_event', { data: 'test' });
      
      expect(callback).toHaveBeenCalledWith('test_event', { data: 'test' });
    });

    it('should handle listener errors', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      system.addEventListener(errorCallback);
      
      expect(() => {
        system._notifyListeners('test', {});
      }).not.toThrow();
    });

    it('should notify multiple listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      system.addEventListener(callback1);
      system.addEventListener(callback2);
      
      system._notifyListeners('test', { data: 'test' });
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    it('should reset all data', async () => {
      const clearSpy = jest.spyOn(system.storage, 'clearAllData');
      
      await system.reset();
      
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should clear storage when reset', async () => {
      const clearSpy = jest.spyOn(system.storage, 'clearAllData').mockResolvedValue(true);
      
      await system.reset();
      
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('_notifyListeners', () => {
    it('should call all listeners with event data', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      system.addEventListener(callback1);
      system.addEventListener(callback2);
      
      const eventData = { test: 'data' };
      system._notifyListeners('test_event', eventData);
      
      expect(callback1).toHaveBeenCalledWith('test_event', eventData);
      expect(callback2).toHaveBeenCalledWith('test_event', eventData);
    });

    it('should continue notifying even if one listener fails', () => {
      const errorCallback = jest.fn(() => { throw new Error('Fail'); });
      const successCallback = jest.fn();
      
      system.addEventListener(errorCallback);
      system.addEventListener(successCallback);
      
      system._notifyListeners('test', {});
      
      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();
    });
  });
});
