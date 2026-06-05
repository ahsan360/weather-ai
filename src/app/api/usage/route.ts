import { NextResponse } from "next/server";
import { weatherApi } from "@/lib/weather-api";
import { apiError } from "@/lib/api-error";

export async function GET() {
  try {
    const data = await weatherApi.getUsage();
    return NextResponse.json(data);
  } catch (err) {
    return apiError(err, "Failed to fetch usage");
  }
}
