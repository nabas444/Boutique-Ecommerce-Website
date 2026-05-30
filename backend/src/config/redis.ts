import IORedis from 'ioredis';

export const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

// Cart helpers
export const CART_TTL = 60 * 60 * 24 * 7; // 7 days

export async function getCart(userId: string) {
  const data = await redis.get(`cart:${userId}`);
  return data ? JSON.parse(data) : { items: [] };
}

export async function setCart(userId: string, cart: object) {
  await redis.setex(`cart:${userId}`, CART_TTL, JSON.stringify(cart));
}

export async function deleteCart(userId: string) {
  await redis.del(`cart:${userId}`);
}
