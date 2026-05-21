"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Card from "@/components/ui/Card";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee" as "attendee" | "club",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Signup failed");
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (form.role === "attendee") {
      router.push("/onboarding");
    } else {
      router.push("/club/register");
    }
    router.refresh();
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 text-blue-600 font-bold text-xl mb-1">
          <Calendar className="h-6 w-6" />
          SL Events
        </div>
        <p className="text-gray-500 text-sm">Create your account</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-gray-100 rounded-xl">
        {(["attendee", "club"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setForm({ ...form, role: r })}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              form.role === r
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {r === "attendee" ? "I'm an Attendee" : "I'm an Organizer"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
