const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function scoreOf(notification) {
  const weight = TYPE_WEIGHTS[notification.type] ?? 0;
  const ts = Date.parse(notification.timestamp);
  const epochMs = Number.isFinite(ts) ? ts : 0;
  return weight * 1e13 + epochMs;
}

class MaxHeap {
  constructor() {
    this.data = []; // each entry: { score, payload }
  }
  size() {
    return this.data.length;
  }
  peek() {
    return this.data[0]?.payload;
  }
  push(entry) {
    this.data.push(entry);
    this._siftUp(this.data.length - 1);
  }
  pop() {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return top.payload;
  }
  _siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].score < this.data[i].score) {
        [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
        i = parent;
      } else break;
    }
  }
  _siftDown(i) {
    const n = this.data.length;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let best = i;
      if (l < n && this.data[l].score > this.data[best].score) best = l;
      if (r < n && this.data[r].score > this.data[best].score) best = r;
      if (best === i) break;
      [this.data[best], this.data[i]] = [this.data[i], this.data[best]];
      i = best;
    }
  }
}

class MinHeap {
  // Used internally to evict the lowest-priority item when capped.
  constructor() {
    this.data = [];
  }
  size() {
    return this.data.length;
  }
  peek() {
    return this.data[0];
  }
  push(entry) {
    this.data.push(entry);
    this._siftUp(this.data.length - 1);
  }
  pop() {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return top;
  }
  _siftUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].score > this.data[i].score) {
        [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
        i = parent;
      } else break;
    }
  }
  _siftDown(i) {
    const n = this.data.length;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let best = i;
      if (l < n && this.data[l].score < this.data[best].score) best = l;
      if (r < n && this.data[r].score < this.data[best].score) best = r;
      if (best === i) break;
      [this.data[best], this.data[i]] = [this.data[i], this.data[best]];
      i = best;
    }
  }
}

class PriorityInbox {
  /**
   * @param {number|null} maxSize - optional cap; lowest-priority items evicted
   *                                when exceeded.
   */
  constructor(maxSize = null) {
    this.maxSize = maxSize;
    this.heap = new MaxHeap();
    this.cap = new MinHeap(); // mirror, only used when capped
  }

  push(notification) {
    const score = scoreOf(notification);
    const entry = { score, payload: notification };
    this.heap.push(entry);
    if (this.maxSize) {
      this.cap.push(entry);
      while (this.cap.size() > this.maxSize) {
        const evicted = this.cap.pop();
        // Lazy delete in the max-heap by marking; we'll filter on read.
        evicted.evicted = true;
      }
    }
  }

  /**
   * Return the top-N highest-priority unread notifications.
   * Non-destructive — internal heap is unchanged after the call.
   */
  topN(n) {
    const limit = Math.max(0, Number(n) || 0);
    if (limit === 0) return [];

    // Drain into a temporary list, skipping lazy-evicted entries.
    const drained = [];
    const buffer = [];
    while (drained.length < limit && this.heap.size() > 0) {
      const entry = this.heap.data[0];
      this.heap.pop();
      if (entry.evicted) continue;
      drained.push(entry);
      buffer.push(entry);
    }
    // Restore — push back everything we removed.
    for (const e of buffer) this.heap.push(e);

    return drained.map((e) => e.payload);
  }

  size() {
    return this.maxSize ? Math.min(this.heap.size(), this.maxSize) : this.heap.size();
  }
}

module.exports = { PriorityInbox, scoreOf, TYPE_WEIGHTS };