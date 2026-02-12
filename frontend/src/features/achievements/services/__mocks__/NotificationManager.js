/**
 * Mock NotificationManager for tests
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
  }

  show(notification) {
    this.notifications.push(notification);
  }

  clear() {
    this.notifications = [];
  }

  getAll() {
    return this.notifications;
  }
}

export default NotificationManager;
