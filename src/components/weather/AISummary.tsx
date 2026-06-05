import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  summary: string | null | undefined;
}

export default function AISummary({ summary }: Props) {
  return (
    <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          AI Summary
        </span>
      </div>
      {summary ? (
        <p className="text-sm leading-relaxed text-slate-300">{summary}</p>
      ) : (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          AI summary not available for this location
        </p>
      )}
    </div>
  );
}
