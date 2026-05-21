"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ImageUpload";
import InterestPicker from "@/components/InterestPicker";
import { SL_DISTRICTS } from "@/lib/constants";

interface Interest {
  _id: string;
  name: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    mode: "physical" as "online" | "physical",
    district: "",
    venue: "",
    onlineLink: "",
    startDatetime: "",
    endDatetime: "",
    goLiveAt: "",
    bannerUrl: "",
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/interests")
      .then((r) => r.json())
      .then((d) => setInterests(d.interests || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedInterests.length) return setError("Select at least one interest tag");
    if (form.mode === "physical" && !form.district) return setError("Select a district for physical events");

    setLoading(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, interests: selectedInterests }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to create event");
      return;
    }

    router.push("/club/dashboard");
  }

  return (
    <div className="pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-blue-600" />
          Create new event
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Banner */}
          <div>
            <Label>Event banner image</Label>
            <ImageUpload
              value={form.bannerUrl}
              onChange={(url) => setForm({ ...form, bannerUrl: url })}
              folder="slevents/events"
              label="Upload event banner"
              aspectRatio="banner"
            />
          </div>

          <div>
            <Label htmlFor="title">Event title *</Label>
            <Input
              id="title"
              placeholder="e.g. Introduction to DevOps Workshop"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Describe the event — what attendees will learn, who should join, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          {/* Interest tags */}
          <div>
            <Label className="mb-2 block">Interest tags *</Label>
            <InterestPicker
              interests={interests}
              selected={selectedInterests}
              onChange={setSelectedInterests}
            />
          </div>

          {/* Mode */}
          <div>
            <Label>Event mode *</Label>
            <div className="grid grid-cols-2 gap-2 mt-1 p-1 bg-gray-100 rounded-xl">
              {(["physical", "online"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, mode: m })}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.mode === m
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {m === "physical" ? "Physical" : "Online"}
                </button>
              ))}
            </div>
          </div>

          {/* District / venue / link */}
          {form.mode === "physical" ? (
            <>
              <div>
                <Label htmlFor="district">District *</Label>
                <select
                  id="district"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select district</option>
                  {SL_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="venue">Venue (optional)</Label>
                <Input
                  id="venue"
                  placeholder="e.g. University of Colombo, Main Hall"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor="onlineLink">Online event link (optional)</Label>
              <Input
                id="onlineLink"
                type="url"
                placeholder="https://zoom.us/j/..."
                value={form.onlineLink}
                onChange={(e) => setForm({ ...form, onlineLink: e.target.value })}
              />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDatetime">Start date & time *</Label>
              <Input
                id="startDatetime"
                type="datetime-local"
                value={form.startDatetime}
                onChange={(e) => setForm({ ...form, startDatetime: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDatetime">End date & time *</Label>
              <Input
                id="endDatetime"
                type="datetime-local"
                value={form.endDatetime}
                onChange={(e) => setForm({ ...form, endDatetime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="goLiveAt">Go-live date & time *</Label>
            <Input
              id="goLiveAt"
              type="datetime-local"
              value={form.goLiveAt}
              onChange={(e) => setForm({ ...form, goLiveAt: e.target.value })}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              The event will appear publicly on the feed at this time (after admin approval if required)
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Submit event
          </Button>
        </form>
      </div>
    </div>
  );
}
