import { formatHour, formatTemp } from "@/lib/utils";
import type { HourForecast } from "@/types";

interface Props {
  hours: HourForecast[];
}

export default function HourlyChart({ hours }: Props) {
  const displayed = hours
    .filter((h) => typeof h.temperature === "number")
    .slice(0, 24);

  if (displayed.length === 0) return null;

  const temps = displayed.map((h) => h.temperature as number);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  const barHeight = (temp: number) => Math.round(((temp - min) / range) * 60 + 20);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Hourly — Today
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-end gap-3">
          {displayed.map((hour) => (
            <div key={hour.time} className="flex w-12 flex-col items-center gap-1">
              <span className="text-xs font-medium text-white">
                {formatTemp(hour.temperature)}
              </span>
              {hour.icon ? (
                <img src={hour.icon} alt="" className="w-8 h-8" />
              ) : (
                <div className="w-full flex items-end justify-center">
                  <div
                    className="w-7 rounded-t-md bg-blue-400/60 hover:bg-blue-400 transition-colors"
                    style={{ height: `${barHeight(hour.temperature as number)}px` }}
                  />
                </div>
              )}
              {(hour.precipitation_probability ?? 0) > 0 && (
                <span className="text-xs text-blue-300">
                  {hour.precipitation_probability}%
                </span>
              )}
              <span className="text-xs text-slate-500">{formatHour(hour.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
