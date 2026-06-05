"use client";

import { useState } from "react";
import { TreePine, RotateCcw } from "lucide-react";
import TreeAnalyzerForm from "@/components/trees/TreeAnalyzerForm";
import TreeResults from "@/components/trees/TreeResults";
import type { TreeAnalysisResult } from "@/types";

export default function TreeAnalyzerPage() {
  const [result, setResult] = useState<TreeAnalysisResult | null>(null);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TreePine className="h-5 w-5 text-green-400" />
          <h1 className="text-xl font-semibold text-white">AI Tree Analyzer</h1>
        </div>
        <p className="text-sm text-slate-400">
          Upload a drone or satellite image to count trees, assess canopy health,
          and get AI-powered agronomic recommendations.
        </p>
      </div>

      {result ? (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Analysis ID: <span className="font-mono text-slate-400">{result.analysis_id}</span>
            </p>
            <button
              onClick={() => setResult(null)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Analysis
            </button>
          </div>
          <TreeResults result={result} />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <TreeAnalyzerForm onResult={setResult} />
        </div>
      )}
    </main>
  );
}
