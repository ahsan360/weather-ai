import { NextResponse } from "next/server";

// Hourly data is now included in /api/weather response (weather.hourly[])
// This route is kept as a stub to avoid 404s from any cached requests
export async function GET() {
  return NextResponse.json({ error: "Use /api/weather — hourly data is included in the response" }, { status: 410 });
}
