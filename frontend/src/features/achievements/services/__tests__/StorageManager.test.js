/**
 * StorageManager Tests
 */

import { StorageManager } from '../StorageManager';

describe('StorageManager', () => {
  let storage;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new StorageManager('test-user');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should create instance', () => {
      expect(storage).toBeDefined();
      expect(storage.userId).toBe('test-user');
    });

    it('should initialize successfully', async () => {
      await expect(storage.initialize()).resolves.not.toThrow();
      expect(storage.initialized).toBe(true);
    });
  });

  describe('save', () => {
    it('should save valid data', () => {
      const data = { achievements: {}, stats: {}, unlockedAchievements: [] };
      const result = storage.save(data);
      expect(result).toBe(true);
    });

    it('should validate data before saving', () => {
      const invalidData = null;
      const result = storage.save(invalidData);
      expect(result).toBe(false);
    });
  });

  describe('load', () => {
    it('should load data', () => {
      const testData = { achievements: {}, stats: {} };
      storage.save(testData);
      
      const data = storage.load();
      expect(data).toBeDefined();
      expect(data.achievements).toBeDefined();
    });

    it('should return null if no data', () => {
      localStorage.clear();
      const data = storage.load();
      expect(data).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear data', () => {
      storage.save({ achievements: {}, stats: {} });
      const result = storage.clear();
      expect(result).toBe(true);
      expect(storage.load()).toBeNull();
    });
  });

  describe('export', () => {
    it('should export data in LGPD format', () => {
      storage.save({ achievements: {}, stats: {} });
      const exported = storage.export();
      
      expect(exported).toBeDefined();
      expect(exported.format).toBe('JSON');
      expect(exported.standard).toBe('LGPD');
    });
  });

  describe('validate', () => {
    it('should validate correct data', () => {
      const validData = {
        achievements: {},
        stats: {}
      };
      expect(storage.validate(validData)).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(storage.validate(null)).toBe(false);
      expect(storage.validate('string')).toBe(false);
    });
  });

  describe('getAchievementProgress', () => {
    it('should get achievement progress', async () => {
      const progress = await storage.getAchievementProgress('test-id');
      expect(progress).toBeDefined();
      expect(progress).toHaveProperty('progress');
      expect(progress).toHaveProperty('unlocked');
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock achievement', async () => {
      const result = await storage.unlockAchievement('test-id', Date.now());
      expect(result).toBe(true);
    });
  });
});
