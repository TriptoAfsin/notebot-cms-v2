import Redis from "ioredis";

const getRedisClient = () => {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  return new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });
};

export const redis = getRedisClient();

const KEY_PREFIX = "notebot:";

export async function invalidateCache(key: string) {
  try {
    await redis.del(KEY_PREFIX + key);
  } catch {
    // Silently fail
  }
}

export async function invalidateCachePattern(pattern: string) {
  try {
    const keys = await redis.keys(KEY_PREFIX + pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Silently fail
  }
}
