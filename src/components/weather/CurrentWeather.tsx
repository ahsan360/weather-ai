import { Droplets, Wind, Eye, Thermometer, Sun } from "lucide-react";
import { formatTemp, wmoText, degToCompass } from "@/lib/utils";
import type { CurrentWeather as CurrentWeatherType, WeatherLocation } from "@/types";

interface Props {
  current: CurrentWeatherType;
  location: WeatherLocation;
}

function buildStats(c: CurrentWeatherType) {
  const items: { icon: React.ElementType; label: string; value: string }[] = [];
  if (c.humidity != null)
    items.push({ icon: Droplets, label: "Humidity", value: `${c.humidity}%` });
  if (c.wind_speed != null)
    items.push({
      icon: Wind,
      label: "Wind",
      value: `${Math.round(c.wind_speed)} km/h ${degToCompass(c.wind_direction)}`.trim(),
    });
  if (c.feels_like != null)
    items.push({ icon: Thermometer, label: "Feels like", value: formatTemp(c.feels_like) });
  if (c.uv_index != null)
    items.push({ icon: Sun, label: "UV Index", value: String(c.uv_index) });
  return items;
}

export default function CurrentWeather({ current, location }: Props) {
  const locationName = location.city ?? "Your Location";
  const country = location.country && location.country !== "CN"
    ? `, ${location.country}`
    : location.timezone
      ? ` (${location.timezone.split("/")[1]?.replace("_", " ") ?? location.timezone})`
      : "";
  const stats = buildStats(current);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <p className="text-sm text-slate-400">{locationName}{country}</p>

      <div className="mt-2 flex items-center gap-4">
        <span className="text-8xl font-thin text-white leading-none">
          {formatTemp(current.temperature)}
        </span>
        <div className="flex flex-col gap-1">
          {current.icon && (
            <img
              src={current.icon}
              alt={wmoText(current.condition_code)}
              className="w-14 h-14"
            />
          )}
          <p className="text-base text-white">{wmoText(current.condition_code)}</p>
          <p className="text-xs text-slate-400">°C</p>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2"
            >
              <Icon className="h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
