"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Calendar, Globe, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDatetime } from "@/lib/utils";

interface PendingEvent {
  _id: string;
  title: string;
  description: string;
  mode: "online" | "physical";
  district?: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
  clubId: { name: string; isVerified: boolean; district: string };
  interests: { name: string }[];
}

export default function AdminQueuePage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetch("/api/admin/queue")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      });
  }, []);

  async function approve(id: string) {
    setActionLoading(id);
    await fetch(`/api/admin/events/${id}/approve`, { method: "PATCH" });
    setEvents((prev) => prev.filter((e) => e._id !== id));
    setActionLoading(null);
  }

  async function reject(id: string) {
    if (!rejectReason.trim()) return;
    setActionLoading(id);
    await fetch(`/api/admin/events/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    });
    setEvents((prev) => prev.filter((e) => e._id !== id));
    setRejectModal(null);
    setRejectReason("");
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">
        Moderation Queue ({events.length})
      </h1>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">All clear! No pending events.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    by <strong>{event.clubId.name}</strong> · {event.clubId.district}
                  </p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDatetime(event.startDatetime)}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {event.mode === "online" ? (
                        <><Globe className="h-3 w-3 text-green-500" /><span className="text-green-600">Online</span></>
                      ) : (
                        <><MapPin className="h-3 w-3 text-gray-400" /><span className="text-gray-500">{event.district}</span></>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {event.interests.map((i) => (
                      <Badge key={i.name} variant="blue">{i.name}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">{event.description}</p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => approve(event._id)}
                    loading={actionLoading === event._id}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => { setRejectModal({ id: event._id }); setRejectReason(""); }}
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-3">Reject event</h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Reason for rejection (shown to the club)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2 mt-3">
              <Button
                variant="danger"
                loading={actionLoading === rejectModal.id}
                onClick={() => reject(rejectModal.id)}
                className="flex-1"
              >
                Confirm reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => setRejectModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
