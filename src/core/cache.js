const PREFIX = 'rsf:cache:';

class SessionCache {
  constructor(prefix = PREFIX) {
    this.prefix = prefix;
    this.memory = new Map();
  }

  makeKey(key) {
    return `${this.prefix}${key}`;
  }

  has(key) {
    const storageKey = this.makeKey(key);

    if (this.memory.has(storageKey)) {
      return true;
    }

    return sessionStorage.getItem(storageKey) !== null;
  }

  get(key, fallback = null) {
    const storageKey = this.makeKey(key);

    if (this.memory.has(storageKey)) {
      return this.memory.get(storageKey);
    }

    const raw = sessionStorage.getItem(storageKey);
    if (raw === null) {
      return fallback;
    }

    try {
      const value = JSON.parse(raw);
      this.memory.set(storageKey, value);
      return value;
    } catch {
      this.memory.delete(storageKey);
      sessionStorage.removeItem(storageKey);
      return fallback;
    }
  }

  set(key, value) {
    const storageKey = this.makeKey(key);
    this.memory.set(storageKey, value);
    sessionStorage.setItem(storageKey, JSON.stringify(value));
    return value;
  }

  remove(key) {
    const storageKey = this.makeKey(key);
    this.memory.delete(storageKey);
    sessionStorage.removeItem(storageKey);
  }

  clear() {
    this.memory.clear();

    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      sessionStorage.removeItem(key);
    }
  }

  keys() {
    const found = new Set();

    for (const key of this.memory.keys()) {
      if (key.startsWith(this.prefix)) {
        found.add(key.slice(this.prefix.length));
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        found.add(key.slice(this.prefix.length));
      }
    }

    return [...found];
  }
}

export const rsfCache = new SessionCache();
export { SessionCache };