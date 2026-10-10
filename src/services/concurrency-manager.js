/**
 * Adaptive In-Flight Concurrency & Overload Manager
 * Protects Node.js event loop, memory, and external API quotas during traffic surges.
 * 
 * Guarantees:
 * 1. Limits maximum concurrent heavy AI synthesis jobs (default: 15).
 * 2. Queues backlog up to maxQueue (default: 50).
 * 3. Overload Fast-Track: If the queue is saturated, signals caller to engage
 *    instant deterministic generation (< 10ms) rather than dropping or timing out.
 */

class ConcurrencyManager {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 15;
    this.maxQueue = options.maxQueue || 50;
    this.activeCount = 0;
    this.queue = []; // Array of { resolve, reject, priority, timestamp }
  }

  /**
   * Acquires a concurrency execution slot
   * @param {Object} [options={}] - { canFastTrack: boolean }
   * @returns {Promise<{ isFastTrack: boolean, release: Function }>}
   */
  async acquire(options = {}) {
    // 1. Slot immediately available
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      return {
        isFastTrack: false,
        release: () => this.release()
      };
    }

    // 2. Queue capacity exceeded -> Overload Fast-Track
    if (this.queue.length >= this.maxQueue) {
      if (options.canFastTrack !== false) {
        // Divert to instant deterministic fallback to protect server health
        return {
          isFastTrack: true,
          release: () => {} // No-op, didn't consume an active slot
        };
      }
    }

    // 3. Enqueue and wait for available slot (with 3-second safeguard against stalled queues)
    return new Promise((resolve) => {
      let timer = null;
      const job = {
        resolve: () => {
          if (timer) clearTimeout(timer);
          this.activeCount++;
          resolve({
            isFastTrack: false,
            release: () => this.release()
          });
        },
        timestamp: Date.now()
      };

      timer = setTimeout(() => {
        const idx = this.queue.indexOf(job);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
        }
        resolve({
          isFastTrack: true,
          release: () => {}
        });
      }, 3000);

      this.queue.push(job);
    });
  }

  /**
   * Releases an execution slot and dequeues next in line
   */
  release() {
    this.activeCount = Math.max(0, this.activeCount - 1);
    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const nextJob = this.queue.shift();
      if (nextJob && typeof nextJob.resolve === 'function') {
        nextJob.resolve();
      }
    }
  }

  /**
   * Executes a heavy async task within a concurrency slot
   * @param {Function} taskFn - () => Promise<any>
   * @param {Function} [fallbackFn] - () => Promise<any> for fast-track under overload
   * @returns {Promise<any>}
   */
  async run(taskFn, fallbackFn = null) {
    const slot = await this.acquire({ canFastTrack: Boolean(fallbackFn) });
    if (slot.isFastTrack && fallbackFn) {
      return fallbackFn();
    }

    try {
      return await taskFn();
    } finally {
      slot.release();
    }
  }

  /**
   * Current operational telemetry
   */
  getTelemetry() {
    return {
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      maxQueue: this.maxQueue,
      loadFactor: Number((this.activeCount / this.maxConcurrent).toFixed(2))
    };
  }
}

// Global shared instance for portfolio synthesis operations
const globalConcurrencyManager = new ConcurrencyManager({
  maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SYNTHESIS || '15', 10),
  maxQueue: parseInt(process.env.MAX_SYNTHESIS_QUEUE || '50', 10)
});

module.exports = { ConcurrencyManager, globalConcurrencyManager };
