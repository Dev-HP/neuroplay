/**
 * Mock StorageManager for tests
 */

export class StorageManager {
  constructor(userId = 'test-user') {
    this.userId = userId;
    this.storageKey = `neuroplay_achievements_${userId}`;
    this.version = '1.0';
    this.initialized = false;
    this.data = {
      achievements: {},
      stats: {},
      unlockedAchievements: []
    };
  }

  async initialize() {
    this.initialized = true;
    return Promise.resolve();
  }

  async getAchievementProgress(achievementId) {
    return this.data.achievements[achievementId] || {
      progress: 0,
      unlocked: false,
      unlockedAt: null
    };
  }

  async updateAchievementProgress(achievementId, progress) {
    this.data.achievements[achievementId] = {
      ...this.data.achievements[achievementId],
      ...progress
    };
    return true;
  }

  async unlockAchievement(achievementId, timestamp) {
    this.data.achievements[achievementId] = {
      ...this.data.achievements[achievementId],
      unlocked: true,
      unlockedAt: timestamp
    };
    
    if (!this.data.unlockedAchievements.includes(achievementId)) {
      this.data.unlockedAchievements.push(achievementId);
    }
    
    return true;
  }

  async clearAllData() {
    this.data = {
      achievements: {},
      stats: {},
      unlockedAchievements: []
    };
    return true;
  }

  save(data) {
    this.data = data;
    return true;
  }

  load() {
    return this.data;
  }

  export() {
    return {
      format: 'JSON',
      standard: 'LGPD',
      version: this.version,
      exportedAt: new Date().toISOString(),
      userId: this.userId,
      data: this.data
    };
  }

  clear() {
    this.data = {
      achievements: {},
      stats: {},
      unlockedAchievements: []
    };
    return true;
  }

  validate(data) {
    return data && typeof data === 'object';
  }

  hasData() {
    return Object.keys(this.data.achievements).length > 0;
  }

  getDataSize() {
    return JSON.stringify(this.data).length;
  }

  getLastSync() {
    return Date.now();
  }
}
