import { NextResponse } from "next/server";

export function apiError(err: unknown, fallback = "Request failed") {
  const message = err instanceof Error ? err.message : fallback;
  return NextResponse.json({ error: message }, { status: 500 });
}
