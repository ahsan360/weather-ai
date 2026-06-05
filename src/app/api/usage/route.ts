import { NextRequest, NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";
import { apiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
    const rate = await checkRateLimit(clientIp);
    if (!rate.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rate.reset - Date.now()) / 1000)) } }
      );
    }

    const data = await weatherApi.getUsage();
    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "Failed to fetch usage");
  }
}
