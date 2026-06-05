import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(...inputs);

export const formatTemp = (temp?: number | null): string => {
  if (temp == null || isNaN(temp)) return "—";
  return `${Math.round(temp)}°`;
};

export const formatDay = (dateStr: string, index: number): string => {
  if (index === 0) return "Today";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en", {
    weekday: "short",
  });
};

export const formatHour = (timeStr: string): string => {
  const normalized = timeStr.includes("T") ? timeStr : timeStr.replace(" ", "T");
  return new Date(normalized).toLocaleTimeString("en", {
    hour: "numeric",
    hour12: true,
  });
};

export const formatPct = (value: number, total: number): string =>
  total === 0 ? "0%" : `${Math.round((value / total) * 100)}%`;

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
export const degToCompass = (deg?: number): string => {
  if (deg == null) return "";
  return COMPASS[Math.round(deg / 45) % 8];
};

// WMO Weather Interpretation Codes
const WMO: Record<string, string> = {
  "0": "Clear sky", "1": "Mainly clear", "2": "Partly cloudy", "3": "Overcast",
  "45": "Foggy", "48": "Icy fog",
  "51": "Light drizzle", "53": "Drizzle", "55": "Dense drizzle",
  "56": "Freezing drizzle", "57": "Heavy freezing drizzle",
  "61": "Light rain", "63": "Rain", "65": "Heavy rain",
  "66": "Freezing rain", "67": "Heavy freezing rain",
  "71": "Light snow", "73": "Snow", "75": "Heavy snow", "77": "Snow grains",
  "80": "Light showers", "81": "Showers", "82": "Violent showers",
  "85": "Light snow showers", "86": "Heavy snow showers",
  "95": "Thunderstorm", "96": "Thunderstorm w/ hail", "99": "Heavy thunderstorm",
};

export const wmoText = (code?: string | null): string =>
  code ? (WMO[code] ?? `Code ${code}`) : "—";
