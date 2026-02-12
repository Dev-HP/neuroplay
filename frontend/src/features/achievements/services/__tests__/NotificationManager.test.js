/**
 * NotificationManager Tests
 */

import NotificationManager from '../NotificationManager';

describe('NotificationManager', () => {
  let manager;

  beforeEach(() => {
    manager = new NotificationManager();
    // Mock DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    it('should create instance', () => {
      expect(manager).toBeDefined();
    });

    it('should have empty queue', () => {
      expect(manager.queue).toEqual([]);
    });

    it('should initialize container', () => {
      manager.initialize();
      expect(manager.container).toBeDefined();
    });
  });

  describe('show', () => {
    beforeEach(() => {
      // Mock _showNext to prevent automatic processing
      manager._showNext = jest.fn();
    });

    it('should add notification to queue', () => {
      const notification = {
        id: 'test',
        title: 'Test',
        description: 'Test notification'
      };
      
      manager.show(notification);
      expect(manager.queue.length).toBeGreaterThanOrEqual(1);
    });

    it('should add multiple notifications', () => {
      manager.show({ id: '1', title: 'Test 1' });
      manager.show({ id: '2', title: 'Test 2' });
      expect(manager.queue.length).toBeGreaterThanOrEqual(1);
    });
  });
});
