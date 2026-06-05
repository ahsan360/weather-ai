"use client";

import { useState, type FormEvent } from "react";
import { Search, Loader2 } from "lucide-react";
import type { GeoResult } from "@/types";

interface Props {
  onResult: (geo: GeoResult) => void;
}

export default function SearchBar({ onResult }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const city = query.trim();
    if (!city) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "City not found");
        return;
      }

      onResult(data as GeoResult);
      setQuery("");
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          maxLength={100}
          disabled={loading}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}
