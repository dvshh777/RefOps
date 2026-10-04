// Redis Cache Layer & Real-time PubSub Simulation for Refinery Operational Telemetry

interface CacheStore {
  [key: string]: {
    value: any;
    expiresAt?: number;
  };
}

export class RedisCacheService {
  private cache: CacheStore = {};
  private pubsubListeners: Array<(channel: string, message: any) => void> = [];

  public async get<T>(key: string): Promise<T | null> {
    const item = this.cache[key];
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      delete this.cache[key];
      return null;
    }
    return item.value as T;
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cache[key] = { value, expiresAt };
  }

  public async del(key: string): Promise<void> {
    delete this.cache[key];
  }

  public publish(channel: string, message: any) {
    this.pubsubListeners.forEach(listener => listener(channel, message));
  }

  public subscribe(listener: (channel: string, message: any) => void) {
    this.pubsubListeners.push(listener);
    return () => {
      this.pubsubListeners = this.pubsubListeners.filter(l => l !== listener);
    };
  }

  public getStats() {
    const keys = Object.keys(this.cache);
    return {
      connected: true,
      cachedKeysCount: keys.length,
      keys: keys,
      memoryUsedKB: Math.round(JSON.stringify(this.cache).length / 1024),
    };
  }
}

export const redisCache = new RedisCacheService();
