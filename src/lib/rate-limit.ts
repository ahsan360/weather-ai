import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const LIMIT = 20;
const WINDOW = "60 s";

function createLimiter(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
    analytics: true,
    prefix: "weather-ai:rl",
  });
}

const limiter = createLimiter();

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  if (!limiter) {
    // Fail open: no Redis configured — allow all requests (dev / local)
    return { success: true, limit: LIMIT, remaining: LIMIT, reset: 0 };
  }
  const result = await limiter.limit(ip);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
