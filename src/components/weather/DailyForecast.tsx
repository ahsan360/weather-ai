import { Droplets } from "lucide-react";
import { formatTemp, formatDay, wmoText } from "@/lib/utils";
import type { DayForecast } from "@/types";

interface Props {
  days: DayForecast[];
}

export default function DailyForecast({ days }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        7-Day Forecast
      </p>
      <div className="divide-y divide-white/5">
        {days.map((day, i) => (
          <div
            key={day.date}
            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <span className="w-10 text-sm font-medium text-white">
              {formatDay(day.date, i)}
            </span>
            {day.icon && (
              <img src={day.icon} alt={wmoText(day.condition_code)} className="w-7 h-7" />
            )}
            <span className="flex-1 text-sm text-slate-400 truncate">
              {wmoText(day.condition_code)}
            </span>
            {(day.precipitation_probability ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-blue-300">
                <Droplets className="h-3 w-3" />
                {day.precipitation_probability}%
              </span>
            )}
            <span className="w-8 text-right text-sm text-slate-500">
              {formatTemp(day.temp_min)}
            </span>
            <span className="w-8 text-right text-sm font-semibold text-white">
              {formatTemp(day.temp_max)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
