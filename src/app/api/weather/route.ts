import { NextRequest, NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";
import { apiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (lat && lon) {
      const data = await weatherApi.getWeather(parseFloat(lat), parseFloat(lon));
      return NextResponse.json(data);
    }

    // Forward real user IP so the API geo-locates them, not the server
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim() ?? "auto";
    const data = await weatherApi.getWeatherByIp(ip);
    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "Failed to fetch weather");
  }
}
