import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function proxy(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const { success, limit, remaining, reset } = await checkRateLimit(ip);

  const rlHeaders: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  };

  if (!success) {
    const retryAfter = reset > 0 ? Math.ceil((reset - Date.now()) / 1000) : 60;
    return NextResponse.json(
      { error: "Too many requests", retryAfter },
      {
        status: 429,
        headers: { ...rlHeaders, "Retry-After": String(retryAfter) },
      }
    );
  }

  const res = NextResponse.next();
  Object.entries(rlHeaders).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: "/api/weather",
};
