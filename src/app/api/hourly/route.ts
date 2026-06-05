import { NextRequest, NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
    }

    const data = await weatherApi.getHourly(parseFloat(lat), parseFloat(lon));
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch hourly data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
