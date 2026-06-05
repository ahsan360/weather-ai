import { formatHour, formatTemp } from "@/lib/utils";
import type { HourForecast } from "@/types";

interface Props {
  hours: HourForecast[];
}

export default function HourlyChart({ hours }: Props) {
  const displayed = hours.slice(0, 24).filter((h) => typeof h.temp_c === "number");

  if (displayed.length === 0) return null;

  const temps = displayed.map((h) => h.temp_c);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  const barHeight = (temp: number) =>
    Math.round(((temp - min) / range) * 60 + 20);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Hourly — Today
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-end gap-2">
          {displayed.map((hour, i) => (
            <div key={i} className="flex w-10 flex-col items-center gap-1">
              <span className="text-xs font-medium text-white">
                {formatTemp(hour.temp_c)}
              </span>
              <div className="flex w-full items-end justify-center">
                <div
                  className="w-7 rounded-t-md bg-blue-400/60 transition-all hover:bg-blue-400"
                  style={{ height: `${barHeight(hour.temp_c)}px` }}
                />
              </div>
              {(hour.chance_of_rain ?? 0) > 0 && (
                <span className="text-xs text-blue-300">{hour.chance_of_rain}%</span>
              )}
              <span className="text-xs text-slate-500">{formatHour(hour.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
