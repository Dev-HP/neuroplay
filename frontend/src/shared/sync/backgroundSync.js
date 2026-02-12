/**
 * Background Sync Service
 * Syncs local IndexedDB data to server when online
 */

import { getDB } from '../db/indexedDB';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class BackgroundSyncService {
  constructor() {
    this.syncing = false;
    this.syncInterval = null;
  }

  /**
   * Start background sync (every 30 seconds)
   */
  start() {
    // Sync immediately
    this.sync();

    // Then sync periodically
    this.syncInterval = setInterval(() => {
      this.sync();
    }, 30000); // 30 seconds

    // Listen for online event
    window.addEventListener('online', () => {
      console.log('[BackgroundSync] Network restored, syncing...');
      this.sync();
    });
  }

  /**
   * Stop background sync
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Main sync function
   */
  async sync() {
    // Don't sync if offline
    if (!navigator.onLine) {
      console.log('[BackgroundSync] Offline, skipping sync');
      return;
    }

    // Don't sync if already syncing
    if (this.syncing) {
      console.log('[BackgroundSync] Already syncing, skipping');
      return;
    }

    try {
      this.syncing = true;
      console.log('[BackgroundSync] Starting sync...');

      const db = await getDB();

      // Get unsynced sessions
      const unsyncedSessions = await db.getUnsyncedSessions();
      console.log(`[BackgroundSync] Found ${unsyncedSessions.length} unsynced sessions`);

      // Sync each session
      for (const session of unsyncedSessions) {
        try {
          await this.syncSession(session);
          await db.markSessionSynced(session.id);
          console.log(`[BackgroundSync] Synced session ${session.id}`);
        } catch (error) {
          console.error(`[BackgroundSync] Failed to sync session ${session.id}:`, error);
          // Continue with next session
        }
      }

      // Process sync queue
      await this.processSyncQueue();

      console.log('[BackgroundSync] Sync completed');

    } catch (error) {
      console.error('[BackgroundSync] Sync error:', error);
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Sync a single session to server
   */
  async syncSession(session) {
    const response = await fetch(`${API_URL}/api/v1/gameplay/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        session_id: session.id,
        student_id: session.student_id,
        game_type: session.game_type,
        events: session.events || [],
        score: session.score || 0,
        duration_seconds: session.duration_seconds || 0
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process sync queue
   */
  async processSyncQueue() {
    const db = await getDB();
    const queue = await db.getSyncQueue();

    console.log(`[BackgroundSync] Processing ${queue.length} queued items`);

    for (const item of queue) {
      try {
        // Execute the queued action
        await this.executeQueuedAction(item);
        
        // Remove from queue
        await db.removeFromSyncQueue(item.id);
        
        console.log(`[BackgroundSync] Processed queue item ${item.id}`);
      } catch (error) {
        console.error(`[BackgroundSync] Failed to process queue item ${item.id}:`, error);
        
        // Increment retry count
        item.retries = (item.retries || 0) + 1;
        
        // Remove if too many retries
        if (item.retries >= 5) {
          console.warn(`[BackgroundSync] Removing queue item ${item.id} after 5 retries`);
          await db.removeFromSyncQueue(item.id);
        }
      }
    }
  }

  /**
   * Execute a queued action
   */
  async executeQueuedAction(item) {
    const { action, data } = item;

    switch (action) {
      case 'update_profile':
        return this.syncProfileUpdate(data);
      
      case 'unlock_achievement':
        return this.syncAchievementUnlock(data);
      
      default:
        console.warn(`[BackgroundSync] Unknown action: ${action}`);
    }
  }

  /**
   * Sync profile update
   */
  async syncProfileUpdate(data) {
    const response = await fetch(`${API_URL}/api/v1/students/${data.student_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data.updates)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Sync achievement unlock
   */
  async syncAchievementUnlock(data) {
    const response = await fetch(`${API_URL}/api/v1/achievements/unlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Force sync now
   */
  async syncNow() {
    return this.sync();
  }
}

// Singleton instance
let syncServiceInstance = null;

export const getSyncService = () => {
  if (!syncServiceInstance) {
    syncServiceInstance = new BackgroundSyncService();
  }
  return syncServiceInstance;
};

export default BackgroundSyncService;
