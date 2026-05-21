"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SL_DISTRICTS } from "@/lib/constants";

export default function FeedFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const mode = params.get("mode") || "all";
  const district = params.get("district") || "";
  const date = params.get("date") || "all";

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value === "all" || value === "") {
      p.delete(key);
    } else {
      p.set(key, value);
    }
    router.push(`/?${p.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 py-3">
      {/* Mode */}
      <select
        value={mode}
        onChange={(e) => update("mode", e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All modes</option>
        <option value="online">Online</option>
        <option value="physical">Physical</option>
      </select>

      {/* District */}
      <select
        value={district}
        onChange={(e) => update("district", e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        disabled={mode === "online"}
      >
        <option value="">All districts</option>
        {SL_DISTRICTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      {/* Date */}
      <select
        value={date}
        onChange={(e) => update("date", e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">Any date</option>
        <option value="today">Today</option>
        <option value="week">This week</option>
        <option value="month">This month</option>
      </select>
    </div>
  );
}
