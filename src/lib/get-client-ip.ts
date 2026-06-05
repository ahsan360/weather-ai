import type { NextRequest } from "next/server";

/**
 * Returns the real client IP from X-Forwarded-For.
 * Returns null in production when no IP header is present —
 * callers must reject such requests to prevent shared rate-limit buckets.
 */
export function getClientIp(req: NextRequest): string | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  if (!ip) return process.env.NODE_ENV === "production" ? null : "dev-local";
  return ip;
}
