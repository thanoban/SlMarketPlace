import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, GraduationCap, Users, Briefcase, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Club from "@/models/Club";
import Event from "@/models/Event";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/StatusBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import Badge from "@/components/ui/Badge";
import { formatDatetime } from "@/lib/utils";
import type { EventStatus } from "@/lib/constants";
import type { ClubType } from "@/models/Club";

const clubTypeConfig: Record<ClubType, { label: string; icon: React.ElementType; color: string }> = {
  university: { label: "University Club", icon: GraduationCap, color: "text-blue-600" },
  community: { label: "Community", icon: Users, color: "text-green-600" },
  private: { label: "Private Organization", icon: Briefcase, color: "text-purple-600" },
};

const statusSteps = [
  { key: "pending", label: "Submitted", icon: Clock, description: "Waiting for admin review" },
  { key: "scheduled", label: "Approved", icon: CheckCircle, description: "Will go live at scheduled time" },
  { key: "published", label: "Live", icon: Eye, description: "Visible to the public" },
  { key: "rejected", label: "Not approved", icon: XCircle, description: "See reason below" },
] as const;

export default async function ClubDashboard() {
  const session = await auth();
  if (!session || session.user.role !== "club") redirect("/login");

  await connectDB();

  const club = await Club.findOne({ userId: session.user.id }).lean();
  if (!club) redirect("/club/register");

  const events = await Event.find({ clubId: club._id })
    .sort({ createdAt: -1 })
    .populate("interests", "name")
    .lean();

  const typeConf = club.clubType ? clubTypeConfig[club.clubType as ClubType] : clubTypeConfig.community;
  const TypeIcon = typeConf.icon;

  const counts = {
    pending: events.filter((e) => e.status === "pending").length,
    scheduled: events.filter((e) => e.status === "scheduled").length,
    published: events.filter((e) => e.status === "published").length,
    rejected: events.filter((e) => e.status === "rejected").length,
  };

  return (
    <div className="pt-6 space-y-6">
      {/* Club profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900">{club.name}</h1>
              {club.isVerified && <VerifiedBadge />}
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <TypeIcon className={`h-4 w-4 ${typeConf.color}`} />
              <span className="text-sm text-gray-500">{typeConf.label}</span>
              {club.universityName && (
                <span className="text-sm text-gray-400">· {club.universityName}</span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{club.district}</p>

            {/* Verification status banner */}
            {!club.isVerified ? (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <p className="text-xs font-medium text-amber-800">Pending verification</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your events need admin approval for now. Once verified, they publish automatically at your scheduled go-live time.
                </p>
              </div>
            ) : (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                <p className="text-xs font-medium text-green-800">Verified organization</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Your events go straight to scheduled and publish automatically — no waiting for approval.
                </p>
              </div>
            )}
          </div>

          <Link href="/club/events/new" className="flex-shrink-0">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New event
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", count: counts.pending, color: "text-amber-600 bg-amber-50", border: "border-amber-200" },
          { label: "Scheduled", count: counts.scheduled, color: "text-purple-600 bg-purple-50", border: "border-purple-200" },
          { label: "Live", count: counts.published, color: "text-green-600 bg-green-50", border: "border-green-200" },
          { label: "Rejected", count: counts.rejected, color: "text-red-600 bg-red-50", border: "border-red-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border ${s.border} ${s.color.split(" ")[1]} p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">All events ({events.length})</h2>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No events yet</p>
            <Link href="/club/events/new" className="mt-3 inline-block">
              <Button size="sm">Create your first event</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event._id.toString()} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/events/${event._id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 text-sm line-clamp-1 block"
                    >
                      {event.title}
                    </Link>

                    <div className="flex flex-wrap gap-3 mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDatetime(event.startDatetime)} · {event.mode === "online" ? "Online" : event.district}
                      </p>
                    </div>

                    {/* Progress steps */}
                    <div className="flex items-center gap-1 mt-2">
                      {event.status !== "rejected" ? (
                        ["pending", "scheduled", "published"].map((step, i) => {
                          const stepOrder = ["pending", "scheduled", "published"];
                          const currentOrder = stepOrder.indexOf(event.status);
                          const thisOrder = stepOrder.indexOf(step);
                          const isDone = thisOrder <= currentOrder;
                          return (
                            <div key={step} className="flex items-center">
                              <div
                                className={`h-2 w-2 rounded-full ${isDone ? "bg-blue-500" : "bg-gray-200"}`}
                              />
                              {i < 2 && (
                                <div className={`h-0.5 w-6 ${thisOrder < currentOrder ? "bg-blue-500" : "bg-gray-200"}`} />
                              )}
                            </div>
                          );
                        })
                      ) : null}
                    </div>

                    {/* Reject reason */}
                    {event.status === "rejected" && event.rejectReason && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium text-red-700">Not approved</p>
                        <p className="text-xs text-red-600 mt-0.5">{event.rejectReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <StatusBadge status={event.status as EventStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
