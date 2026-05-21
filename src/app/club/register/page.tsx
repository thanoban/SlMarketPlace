"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ImageUpload";
import { SL_DISTRICTS } from "@/lib/constants";

export default function ClubRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    contact: "",
    district: "",
    logoUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/club/dashboard");
  }

  return (
    <div className="pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Register your organization
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          New clubs are reviewed. After admin verification, your events publish instantly.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo */}
          <div>
            <Label>Club / Organization logo (optional)</Label>
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => setForm({ ...form, logoUrl: url })}
              folder="slevents/logos"
              label="Upload logo"
              aspectRatio="square"
            />
          </div>

          <div>
            <Label htmlFor="name">Organization name *</Label>
            <Input
              id="name"
              placeholder="e.g. IEEE Student Branch Colombo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">About your organization *</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="What does your club do? Who is it for?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact">Contact (email or phone) *</Label>
            <Input
              id="contact"
              placeholder="contact@yourorg.lk"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="district">District *</Label>
            <select
              id="district"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select your district</option>
              {SL_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            Register organization
          </Button>
        </form>
      </div>
    </div>
  );
}
