"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function RunScraperButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");

  async function handleRun() {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/admin/run-scraper", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scraper failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — could not reach scraper");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">Event scraper</p>
          <p className="text-xs text-gray-500">Runs automatically at 2 AM UTC daily. Trigger manually here.</p>
        </div>
        <Button variant="secondary" size="sm" loading={loading} onClick={handleRun}>
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Run now
        </Button>
      </div>

      {result && (
        <div className="text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800">
          Done — {result.inserted} new event{result.inserted !== 1 ? "s" : ""} inserted, {result.skipped} skipped
          {result.errors.length > 0 && (
            <span className="text-amber-700 ml-2">· {result.errors.length} error{result.errors.length !== 1 ? "s" : ""}: {result.errors.join("; ")}</span>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
