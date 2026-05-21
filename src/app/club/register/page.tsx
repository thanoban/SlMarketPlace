"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, Users, Briefcase } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Textarea from "@/components/ui/Textarea";
import ImageUpload from "@/components/ImageUpload";
import { SL_DISTRICTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ClubType = "university" | "private" | "community";

const CLUB_TYPES: { value: ClubType; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "university",
    label: "University Club",
    description: "Affiliated with a university or higher education institution",
    icon: GraduationCap,
  },
  {
    value: "community",
    label: "Community",
    description: "Independent community or interest group open to the public",
    icon: Users,
  },
  {
    value: "private",
    label: "Private Organization",
    description: "Private company, startup, or professional organization",
    icon: Briefcase,
  },
];

export default function ClubRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    contact: "",
    district: "",
    clubType: "" as ClubType | "",
    universityName: "",
    logoUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.clubType) return setError("Please select your organization type");
    if (form.clubType === "university" && !form.universityName.trim()) {
      return setError("Please enter your university name");
    }

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
          New clubs require admin approval. Once verified, your events publish on schedule — no waiting.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo */}
          <div>
            <Label>Logo (optional)</Label>
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => setForm({ ...form, logoUrl: url })}
              folder="slevents/logos"
              label="Upload logo"
              aspectRatio="square"
            />
          </div>

          {/* Organization type */}
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-2 block">
              Organization type *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CLUB_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, clubType: t.value, universityName: "" })}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-colors",
                    form.clubType === t.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <t.icon
                    className={cn(
                      "h-5 w-5 mb-1.5",
                      form.clubType === t.value ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  <p className={cn("text-sm font-medium", form.clubType === t.value ? "text-blue-700" : "text-gray-800")}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* University name (only for university type) */}
          {form.clubType === "university" && (
            <div>
              <Label htmlFor="universityName">University / Institution name *</Label>
              <Input
                id="universityName"
                placeholder="e.g. University of Colombo"
                value={form.universityName}
                onChange={(e) => setForm({ ...form, universityName: e.target.value })}
              />
            </div>
          )}

          <div>
            <Label htmlFor="name">Organization name *</Label>
            <Input
              id="name"
              placeholder={
                form.clubType === "university"
                  ? "e.g. IEEE Student Branch — University of Colombo"
                  : "e.g. Colombo Tech Meetup"
              }
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
              placeholder="What does your club / community do? Who is it for?"
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
              title="District"
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
            Submit for review
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Our admin team will review your application. You&apos;ll be able to post events right away — they&apos;ll go live once approved.
          </p>
        </form>
      </div>
    </div>
  );
}
