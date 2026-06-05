import type { WeatherResponse, UsageStats, TreeAnalysisResult, TreeQuota } from "@/types";

const BASE_URL = "https://api.weather-ai.co";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.WEATHER_API_KEY;
  if (!key) throw new Error("WEATHER_API_KEY is not configured");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

interface GeoResponse {
  data: WeatherResponse;
  geoHeaders: { city: string | null; region: string | null; country: string | null };
}

async function fetchWeatherGeo(ip: string): Promise<GeoResponse> {
  const key = process.env.WEATHER_API_KEY;
  if (!key) throw new Error("WEATHER_API_KEY is not configured");

  const res = await fetch(
    `${BASE_URL}/v1/weather-geo?ip=${ip}&days=7&ai=true&units=metric`,
    { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${body || res.statusText}`);
  }

  const data = (await res.json()) as WeatherResponse;
  return {
    data,
    geoHeaders: {
      city: res.headers.get("x-city"),
      region: res.headers.get("x-region"),
      country: res.headers.get("x-country"),
    },
  };
}

export const weatherApi = {
  getWeatherByIp: fetchWeatherGeo,

  getWeather: (lat: number, lon: number) =>
    apiFetch<WeatherResponse>(
      `/v1/weather?lat=${lat}&lon=${lon}&days=7&ai=true&units=metric`,
      { next: { revalidate: 600 } } as RequestInit
    ),

  getUsage: () =>
    apiFetch<UsageStats>(`/v1/usage`, { next: { revalidate: 0 } } as RequestInit),

  analyzeTrees: (formData: FormData) =>
    apiFetch<TreeAnalysisResult>(`/v1/trees/analyze`, { method: "POST", body: formData }),

  getTreeQuota: () =>
    apiFetch<TreeQuota>(`/v1/trees/quota`, { next: { revalidate: 0 } } as RequestInit),
};
