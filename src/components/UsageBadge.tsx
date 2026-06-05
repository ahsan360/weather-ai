"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import type { UsageStats } from "@/types";

function isUsageStats(d: unknown): d is UsageStats {
  if (typeof d !== "object" || d === null) return false;
  const o = d as Record<string, unknown>;
  const period = o.period as Record<string, unknown> | undefined;
  const limits = o.limits as Record<string, unknown> | undefined;
  return (
    typeof o.plan === "string" &&
    typeof period === "object" && period !== null &&
    typeof period.requestCount === "number" &&
    typeof limits === "object" && limits !== null &&
    typeof limits.requests === "number"
  );
}

export default function UsageBadge({ refreshKey }: { refreshKey?: number }) {
  const [usage, setUsage] = useState<UsageStats | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
      .then((d) => { if (isUsageStats(d)) setUsage(d); })
      .catch(() => null);
  }, [refreshKey]);

  if (!usage) return null;

  const used = usage.period.requestCount;
  const limit = usage.limits.requests;
  const pct = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
      <Activity className="h-3.5 w-3.5 text-blue-400" />
      <span className="capitalize">{usage.plan}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-blue-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>
        {used.toLocaleString()} / {limit.toLocaleString()}
      </span>
    </div>
  );
}
