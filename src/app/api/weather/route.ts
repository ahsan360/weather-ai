import { NextRequest, NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";
import { apiError } from "@/lib/api-error";
import type { WeatherResponse, HourForecast } from "@/types";

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "User-Agent": "WeatherAI-App/1.0" }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return (
      d.address?.city ??
      d.address?.town ??
      d.address?.village ??
      d.display_name?.split(",")[0] ??
      null
    );
  } catch {
    return null;
  }
}

function enrichCurrentFromHourly(data: WeatherResponse): void {
  if (!data.current?.time || !data.hourly?.length) return;
  const currentHour = new Date(data.current.time).getHours();
  const match: HourForecast | undefined = data.hourly.find(
    (h) => new Date(h.time).getHours() === currentHour
  );
  if (match) {
    data.current.humidity = match.humidity;
    data.current.feels_like = match.feels_like;
    data.current.uv_index = match.uv_index;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (lat && lon) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      const [data, city] = await Promise.all([
        weatherApi.getWeather(parsedLat, parsedLon),
        reverseGeocode(parsedLat, parsedLon),
      ]);
      enrichCurrentFromHourly(data);
      data.location.city = city ?? undefined;
      return NextResponse.json(data);
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim() ?? "auto";
    const { data, geoHeaders } = await weatherApi.getWeatherByIp(ip);
    enrichCurrentFromHourly(data);

    const city =
      geoHeaders.city ??
      (await reverseGeocode(data.location.lat, data.location.lon));
    data.location.city = city ?? undefined;
    data.location.country = geoHeaders.country ?? data.location.country;

    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "Failed to fetch weather");
  }
}
