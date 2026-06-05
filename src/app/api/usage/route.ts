import { NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";

export async function GET() {
  try {
    const data = await weatherApi.getUsage();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch usage";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
