import { createClient } from 'redis';

export const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', (error) => console.error('Redis error:', error.message));

export const TASKS_CACHE_KEY = 'tasks:all';
export const TASKS_CACHE_TTL_SECONDS = 30;
