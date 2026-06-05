import { NextRequest, NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";
import { apiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";
import type { WeatherResponse, HourForecast } from "@/types";

interface GeoLocation {
  city: string | null;
  country: string | null;
}

async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      { headers: { "User-Agent": "WeatherAI-App/1.0" }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return { city: null, country: null };
    const d = await res.json();
    return {
      city:
        d.address?.city ??
        d.address?.town ??
        d.address?.village ??
        d.display_name?.split(",")[0] ??
        null,
      country: d.address?.country_code?.toUpperCase() ?? null,
    };
  } catch {
    return { city: null, country: null };
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
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
  const rate = await checkRateLimit(ip);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rate.reset - Date.now()) / 1000)) } }
    );
  }

  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (lat && lon) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      if (
        isNaN(parsedLat) || isNaN(parsedLon) ||
        parsedLat < -90 || parsedLat > 90 ||
        parsedLon < -180 || parsedLon > 180
      ) {
        return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
      }

      const knownCity = searchParams.get("city");

      const [weatherResult, geocodeResult] = await Promise.allSettled([
        weatherApi.getWeather(parsedLat, parsedLon),
        knownCity ? Promise.resolve(null) : reverseGeocode(parsedLat, parsedLon),
      ]);

      if (weatherResult.status === "rejected") throw weatherResult.reason;
      const data = weatherResult.value;
      const geo: GeoLocation =
        !knownCity && geocodeResult.status === "fulfilled" && geocodeResult.value
          ? geocodeResult.value
          : { city: null, country: null };

      enrichCurrentFromHourly(data);
      data.location.city = knownCity ?? geo.city ?? undefined;
      data.location.country = geo.country ?? data.location.country;
      return NextResponse.json(data);
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim() ?? "auto";
    const { data, geoHeaders } = await weatherApi.getWeatherByIp(ip);
    enrichCurrentFromHourly(data);

    const geo = await reverseGeocode(data.location.lat, data.location.lon);
    data.location.city = geoHeaders.city ?? geo.city ?? undefined;
    data.location.country = geo.country ?? geoHeaders.country ?? undefined;

    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "Failed to fetch weather");
  }
}
