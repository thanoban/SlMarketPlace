import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Club from "@/models/Club";
import { Calendar, Building2, CheckCircle } from "lucide-react";
import Link from "next/link";
import RunScraperButton from "./RunScraperButton";

export default async function AdminOverview() {
  await connectDB();

  const [pendingCount, totalEvents, totalClubs, verifiedClubs] = await Promise.all([
    Event.countDocuments({ status: "pending" }),
    Event.countDocuments(),
    Club.countDocuments(),
    Club.countDocuments({ isVerified: true }),
  ]);

  const stats = [
    { label: "Pending events", value: pendingCount, icon: Calendar, href: "/admin/queue", color: "text-amber-600 bg-amber-50" },
    { label: "Total events", value: totalEvents, icon: Calendar, href: "/admin/queue", color: "text-blue-600 bg-blue-50" },
    { label: "Total clubs", value: totalClubs, icon: Building2, href: "/admin/clubs", color: "text-purple-600 bg-purple-50" },
    { label: "Verified clubs", value: verifiedClubs, icon: CheckCircle, href: "/admin/clubs", color: "text-green-600 bg-green-50" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
                <s.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800">
            {pendingCount} event{pendingCount !== 1 ? "s" : ""} waiting for review
          </p>
          <Link href="/admin/queue" className="text-sm text-amber-700 underline mt-1 inline-block">
            Go to moderation queue
          </Link>
        </div>
      )}

      <RunScraperButton />
    </div>
  );
}
