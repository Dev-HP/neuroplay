export class OfflineQueue {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
  }

  add(request) {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      id: crypto.randomUUID()
    });
    this.save();
  }

  async sync() {
    if (!navigator.onLine) return;

    const pending = [...this.queue];
    this.queue = [];
    this.save();

    for (const request of pending) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(request.data)
        });
      } catch (error) {
        this.queue.push(request);
      }
    }
    this.save();
  }

  save() {
    localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
  }

  getQueue() {
    return this.queue;
  }

  clear() {
    this.queue = [];
    this.save();
  }
}

const offlineQueue = new OfflineQueue();
export default offlineQueue;
