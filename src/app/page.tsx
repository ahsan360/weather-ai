"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "@/components/weather/SearchBar";
import CurrentWeather from "@/components/weather/CurrentWeather";
import AISummary from "@/components/weather/AISummary";
import HourlyChart from "@/components/weather/HourlyChart";
import DailyForecast from "@/components/weather/DailyForecast";
import UsageBadge from "@/components/UsageBadge";
import type { WeatherResponse, HourlyResponse, GeoResult } from "@/types";

function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ""}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-52" />
      <Skeleton className="h-24" />
      <Skeleton className="h-40" />
      <Skeleton className="h-64" />
    </div>
  );
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [hourly, setHourly] = useState<HourlyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (lat?: number, lon?: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setLoading(true);
    setError("");
    setWeather(null);
    setHourly(null);

    try {
      const url =
        lat != null && lon != null
          ? `/api/weather?lat=${lat}&lon=${lon}`
          : "/api/weather";

      const weatherData = await fetchJson<WeatherResponse>(url, signal);
      const { lat: wlat, lon: wlon } = weatherData.location;

      const hourlyData = await fetchJson<HourlyResponse>(
        `/api/hourly?lat=${wlat}&lon=${wlon}`,
        signal
      ).catch(() => null);

      setWeather(weatherData);
      setHourly(hourlyData);
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  function handleGeoResult(geo: GeoResult) {
    load(parseFloat(geo.lat), parseFloat(geo.lon));
  }

  const todayHours = hourly?.forecast?.days?.[0]?.hour ?? null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-64">
          <SearchBar onResult={handleGeoResult} />
        </div>
        <UsageBadge />
      </div>

      {loading && <LoadingSkeleton />}

      {error && !loading && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {weather && !loading && (
        <div className="animate-fade-in space-y-4">
          <CurrentWeather current={weather.current} location={weather.location} />

          {weather.ai_summary && <AISummary summary={weather.ai_summary} />}

          {todayHours && todayHours.length > 0 && (
            <HourlyChart hours={todayHours} />
          )}

          {weather.forecast?.days && weather.forecast.days.length > 0 && (
            <DailyForecast days={weather.forecast.days} />
          )}
        </div>
      )}
    </main>
  );
}
