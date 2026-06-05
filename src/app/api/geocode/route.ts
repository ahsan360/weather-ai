import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city");
    if (!city?.trim()) {
      return NextResponse.json({ error: "city is required" }, { status: 400 });
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
    return NextResponse.json({ lat, lon, name: display_name });
  } catch (err) {
    return apiError(err, "Geocoding failed");
  }
}
