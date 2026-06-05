import { Droplets, Wind, Eye, Gauge, Thermometer, Sun } from "lucide-react";
import { formatTemp } from "@/lib/utils";
import type { CurrentWeather as CurrentWeatherType, WeatherLocation } from "@/types";

interface Props {
  current: CurrentWeatherType;
  location: WeatherLocation;
}

const stats = (c: CurrentWeatherType) => [
  { icon: Droplets, label: "Humidity", value: `${c.humidity}%` },
  { icon: Wind, label: "Wind", value: `${Math.round(c.wind_kph)} km/h ${c.wind_dir ?? ""}` },
  { icon: Thermometer, label: "Feels like", value: formatTemp(c.feelslike_c) },
  { icon: Sun, label: "UV Index", value: String(c.uv) },
  ...(c.pressure_mb ? [{ icon: Gauge, label: "Pressure", value: `${c.pressure_mb} mb` }] : []),
  ...(c.vis_km ? [{ icon: Eye, label: "Visibility", value: `${c.vis_km} km` }] : []),
];

export default function CurrentWeather({ current, location }: Props) {
  const locationName = location.city ?? location.name ?? "Your Location";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <p className="text-sm text-slate-400">
        {locationName}
        {location.country ? `, ${location.country}` : ""}
      </p>

      <div className="mt-2 flex items-end gap-4">
        <span className="text-8xl font-thin text-white">
          {formatTemp(current.temp_c)}
        </span>
        <div className="mb-2">
          <p className="text-xl capitalize text-white">{current.condition.text}</p>
          <p className="text-sm text-slate-400">C</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats(current).map(({ icon: Icon, label, value }) => (
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
    </div>
  );
}
