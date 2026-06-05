import type {
  WeatherResponse,
  HourlyResponse,
  DailyResponse,
  UsageStats,
  TreeAnalysisResult,
  TreeQuota,
} from "@/types";

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

export const weatherApi = {
  getWeatherByIp: (ip: string) =>
    apiFetch<WeatherResponse>(
      `/v1/weather-geo?ip=${ip}&days=7&ai=true&units=metric`,
      { next: { revalidate: 0 } } as RequestInit
    ),

  getWeather: (lat: number, lon: number) =>
    apiFetch<WeatherResponse>(
      `/v1/weather?lat=${lat}&lon=${lon}&days=7&ai=true&units=metric`,
      { next: { revalidate: 600 } } as RequestInit
    ),

  getHourly: (lat: number, lon: number) =>
    apiFetch<HourlyResponse>(
      `/v1/hourly?lat=${lat}&lon=${lon}&units=metric`,
      { next: { revalidate: 600 } } as RequestInit
    ),

  getDaily: (lat: number, lon: number) =>
    apiFetch<DailyResponse>(
      `/v1/daily?lat=${lat}&lon=${lon}&days=7&units=metric`,
      { next: { revalidate: 600 } } as RequestInit
    ),

  getUsage: () =>
    apiFetch<UsageStats>(`/v1/usage`, {
      next: { revalidate: 0 },
    } as RequestInit),

  analyzeTrees: (formData: FormData) =>
    apiFetch<TreeAnalysisResult>(`/v1/trees/analyze`, {
      method: "POST",
      body: formData,
    }),

  getTreeQuota: () =>
    apiFetch<TreeQuota>(`/v1/trees/quota`, {
      next: { revalidate: 0 },
    } as RequestInit),
};
