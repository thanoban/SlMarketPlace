"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import InterestPicker from "@/components/InterestPicker";
import { SL_DISTRICTS } from "@/lib/constants";

interface Interest {
  _id: string;
  name: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/interests")
      .then((r) => r.json())
      .then((d) => setInterests(d.interests || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected.length) return setError("Please select at least one interest");
    if (!district) return setError("Please select your district");

    setError("");
    setLoading(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests: selected, homeDistrict: district }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save preferences");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-2xl mb-2">
            <Calendar className="h-7 w-7" />
            SL Events
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Personalize your feed</h1>
          <p className="text-gray-500 text-sm">
            Choose your interests and district to see relevant events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Interests */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-3 block">
              What are your interests?
            </Label>
            <InterestPicker
              interests={interests}
              selected={selected}
              onChange={setSelected}
            />
            {selected.length > 0 && (
              <p className="text-xs text-blue-600 mt-2">{selected.length} selected</p>
            )}
          </div>

          {/* District */}
          <div>
            <Label htmlFor="district" className="text-base font-semibold text-gray-900 mb-2 block">
              Your home district
            </Label>
            <select
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select your district</option>
              {SL_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Start discovering events
          </Button>
        </form>
      </div>
    </div>
  );
}
