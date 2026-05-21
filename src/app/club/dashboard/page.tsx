import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Club from "@/models/Club";
import Event from "@/models/Event";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/StatusBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import { formatDate, formatDatetime } from "@/lib/utils";
import type { EventStatus } from "@/lib/constants";

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

  return (
    <div className="pt-6">
      {/* Club header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900">{club.name}</h1>
              {club.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{club.district}</p>
            {!club.isVerified && (
              <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                Your events require admin approval until your club is verified
              </p>
            )}
            {club.isVerified && (
              <p className="text-xs text-green-600 mt-1 bg-green-50 px-2 py-1 rounded">
                Verified — your events publish instantly when the go-live time arrives
              </p>
            )}
          </div>
          <Link href="/club/events/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New event
            </Button>
          </Link>
        </div>
      </div>

      {/* Events */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Your events ({events.length})</h2>
      </div>

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
                  <Link href={`/events/${event._id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm line-clamp-1">
                    {event.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatDatetime(event.startDatetime)} · {event.mode === "online" ? "Online" : event.district}
                  </p>
                  {event.status === "rejected" && event.rejectReason && (
                    <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                      Rejected: {event.rejectReason}
                    </p>
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
  );
}
