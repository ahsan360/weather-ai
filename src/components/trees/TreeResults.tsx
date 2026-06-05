import { CheckCircle, AlertTriangle, XCircle, Lightbulb, Eye } from "lucide-react";
import type { TreeAnalysisResult } from "@/types";

interface Props {
  result: TreeAnalysisResult;
}

function HealthBar({
  label,
  value,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ElementType;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      <div className="flex-1">
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          <span className="font-medium text-white">
            {value} ({pct}%)
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all ${color.replace("text-", "bg-")}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function TreeResults({ result }: Props) {
  const totalTrees = result.total_tree_count;
  const confidence = Math.round(result.confidence_score * 100);

  const statsGrid = [
    { label: "Total Trees", value: String(totalTrees) },
    { label: "Canopy Coverage", value: `${result.canopy_coverage_pct}%` },
    { label: "Confidence", value: `${confidence}%` },
    { label: "Density / Acre", value: result.tree_density_per_acre.toFixed(1) },
    ...(result.tree_species_guess
      ? [{ label: "Species Guess", value: result.tree_species_guess }]
      : []),
    ...(result.land_acres
      ? [{ label: "Land Area", value: `${result.land_acres} acres` }]
      : []),
  ];

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statsGrid.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 text-lg font-semibold text-white truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Health breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Tree Health
        </p>
        <div className="space-y-3">
          <HealthBar
            label="Healthy"
            value={result.tree_health.healthy}
            total={totalTrees}
            color="text-green-400"
            icon={CheckCircle}
          />
          <HealthBar
            label="Needs Care"
            value={result.tree_health.needs_care}
            total={totalTrees}
            color="text-yellow-400"
            icon={AlertTriangle}
          />
          <HealthBar
            label="Needs Replacement"
            value={result.tree_health.needs_replacement}
            total={totalTrees}
            color="text-red-400"
            icon={XCircle}
          />
        </div>
      </div>

      {/* Image comparison */}
      {result.original_image_url && result.overlay_image_url && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Original", src: result.original_image_url },
            { label: "AI Overlay", src: result.overlay_image_url },
          ].map(({ label, src }) => (
            <div key={label} className="rounded-xl overflow-hidden border border-white/10">
              <p className="bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400">
                {label}
              </p>
              <img src={src} alt={label} className="w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Observations */}
      {result.observations?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Eye className="h-3.5 w-3.5" />
            Observations
          </p>
          <ul className="space-y-2">
            {result.observations.map((obs, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
            <Lightbulb className="h-3.5 w-3.5" />
            Recommendations
          </p>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
