import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(...inputs);

export const formatTemp = (temp: number) => `${Math.round(temp)}°`;

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
