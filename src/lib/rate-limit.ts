import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const LIMIT = 10;
const WINDOW = "60 s";

const FAIL_OPEN: RateLimitResult = { success: true, limit: LIMIT, remaining: LIMIT, reset: 0 };

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
  if (!limiter) return FAIL_OPEN;
  try {
    const result = await limiter.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch {
    // Redis unavailable — fail open so users are not blocked
    return FAIL_OPEN;
  }
}
