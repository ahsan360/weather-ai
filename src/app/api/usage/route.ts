import { NextRequest, NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";
import { apiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

export async function GET(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    if (!clientIp) {
      return NextResponse.json(
        { error: "Unable to identify your IP address. Please check your network or proxy configuration." },
        { status: 400 }
      );
    }
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
