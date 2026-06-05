import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

const MAX_CITY_LENGTH = 100;

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

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

    const city = req.nextUrl.searchParams.get("city");
    if (!city?.trim()) {
      return NextResponse.json({ error: "city is required" }, { status: 400 });
    }
    if (city.length > MAX_CITY_LENGTH) {
      return NextResponse.json({ error: "City name too long" }, { status: 400 });
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: { "User-Agent": "WeatherAI-App/1.0" },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Geocoding service error: ${res.status}` },
        { status: 502 }
      );
    }

    const results: NominatimResult[] = await res.json();
    if (!results.length) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const { lat, lon, display_name } = results[0];
    if (!lat || !lon) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }
    return NextResponse.json({ lat, lon, name: display_name });
  } catch (err) {
    return apiError(err, "Geocoding failed");
  }
}
