"use client";

import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Upload, ImageIcon, Loader2, X } from "lucide-react";
import type { TreeAnalysisResult } from "@/types";

interface Props {
  onResult: (result: TreeAnalysisResult) => void;
}

export default function TreeAnalyzerForm({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(f: File) {
    if (f.size > 20 * 1024 * 1024) {
      setError("Image must be under 20 MB");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData();
    formData.append("image", file);

    const optional = ["farmerId", "county", "landAcres", "location", "notes"];
    optional.forEach((key) => {
      const el = form.elements.namedItem(key);
      if (el instanceof HTMLInputElement && el.value.trim()) {
        formData.append(key, el.value.trim());
      }
    });

    try {
      const res = await fetch("/api/trees/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed");
        return;
      }
      onResult(data as TreeAnalysisResult);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !file && inputRef.current?.click()}
        className="relative flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 transition hover:border-blue-400/50 hover:bg-white/10"
      >
        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="max-h-56 w-full rounded-xl object-contain px-4"
            />
            <button
              type="button"
              aria-label="Clear image"
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="absolute right-3 top-3 rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="rounded-2xl bg-white/10 p-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Drop an image here or{" "}
                <span className="text-blue-400">browse</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                JPEG, PNG, WEBP — max 20 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Optional metadata */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { name: "farmerId", placeholder: "Farmer / Plot ID" },
          { name: "county", placeholder: "County / Region" },
          { name: "landAcres", placeholder: "Land size (acres)" },
          { name: "location", placeholder: "Farm description" },
          { name: "notes", placeholder: "Extra notes (optional)" },
        ].map(({ name, placeholder }) => (
          <input
            key={name}
            name={name}
            placeholder={placeholder}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30"
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={!file || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Analyze Trees
          </>
        )}
      </button>
    </form>
  );
}
