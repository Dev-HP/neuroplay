/**
 * IndexedDB Manager - Local-First Database
 * All game data is saved here FIRST, then synced to server
 */

const DB_NAME = 'NeuroPlayDB';
const DB_VERSION = 1;

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Game sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { 
            keyPath: 'id',
            autoIncrement: false 
          });
          sessionsStore.createIndex('student_id', 'student_id', { unique: false });
          sessionsStore.createIndex('game_type', 'game_type', { unique: false });
          sessionsStore.createIndex('synced', 'synced', { unique: false });
          sessionsStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Achievements store
        if (!db.objectStoreNames.contains('achievements')) {
          const achievementsStore = db.createObjectStore('achievements', { 
            keyPath: 'id' 
          });
          achievementsStore.createIndex('student_id', 'student_id', { unique: false });
          achievementsStore.createIndex('unlocked', 'unlocked', { unique: false });
        }

        // Sync queue store (for offline events)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
          queueStore.createIndex('priority', 'priority', { unique: false });
        }

        // Student profile cache
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'student_id' });
        }
      };
    });
  }

  /**
   * Save game session (FAST - no network)
   */
  async saveSession(session) {
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    
    const sessionData = {
      ...session,
      synced: false,
      created_at: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const request = store.put(sessionData);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get unsynced sessions (for background sync)
   */
  async getUnsyncedSessions() {
    const transaction = this.db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark session as synced
   */
  async markSessionSynced(sessionId) {
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(sessionId);
      
      getRequest.onsuccess = () => {
        const session = getRequest.result;
        if (session) {
          session.synced = true;
          session.synced_at = new Date().toISOString();
          
          const putRequest = store.put(session);
          putRequest.onsuccess = () => resolve(true);
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(false);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Get all sessions for a student
   */
  async getSessionsByStudent(studentId) {
    const transaction = this.db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    const index = store.index('student_id');

    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save achievement
   */
  async saveAchievement(achievement) {
    const transaction = this.db.transaction(['achievements'], 'readwrite');
    const store = transaction.objectStore('achievements');

    return new Promise((resolve, reject) => {
      const request = store.put(achievement);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get achievements for student
   */
  async getAchievementsByStudent(studentId) {
    const transaction = this.db.transaction(['achievements'], 'readonly');
    const store = transaction.objectStore('achievements');
    const index = store.index('student_id');

    return new Promise((resolve, reject) => {
      const request = index.getAll(studentId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add to sync queue
   */
  async addToSyncQueue(action, data, priority = 1) {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');

    const queueItem = {
      action,
      data,
      priority,
      timestamp: new Date().toISOString(),
      retries: 0
    };

    return new Promise((resolve, reject) => {
      const request = store.add(queueItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get sync queue items
   */
  async getSyncQueue() {
    const transaction = this.db.transaction(['sync_queue'], 'readonly');
    const store = transaction.objectStore('sync_queue');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove from sync queue
   */
  async removeFromSyncQueue(id) {
    const transaction = this.db.transaction(['sync_queue'], 'readwrite');
    const store = transaction.objectStore('sync_queue');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data (for logout)
   */
  async clearAll() {
    const stores = ['sessions', 'achievements', 'sync_queue', 'profiles'];
    const transaction = this.db.transaction(stores, 'readwrite');

    const promises = stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const request = transaction.objectStore(storeName).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    return Promise.all(promises);
  }
}

// Singleton instance
let dbInstance = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = new IndexedDBManager();
    await dbInstance.init();
  }
  return dbInstance;
};

export default IndexedDBManager;
