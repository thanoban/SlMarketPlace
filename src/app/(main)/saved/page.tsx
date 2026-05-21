"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/ui/Spinner";

interface SavedEntry {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    bannerUrl?: string;
    mode: "online" | "physical";
    district?: string;
    startDatetime: string;
    endDatetime: string;
    isPromoted: boolean;
    clubId: { name: string; logoUrl?: string; isVerified?: boolean };
    interests: { name: string }[];
  };
}

export default function SavedPage() {
  const { data: session, status } = useSession();
  const [saved, setSaved] = useState<SavedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  if (status === "unauthenticated") redirect("/login");

  useEffect(() => {
    fetch("/api/saved")
      .then((r) => r.json())
      .then((d) => {
        setSaved(d.saved || []);
        setSavedIds(new Set((d.saved || []).map((s: SavedEntry) => s.eventId._id)));
        setLoading(false);
      });
  }, []);

  async function handleSaveToggle(eventId: string, save: boolean) {
    const method = save ? "POST" : "DELETE";
    await fetch(`/api/saved/${eventId}`, { method });
    if (!save) {
      setSaved((prev) => prev.filter((s) => s.eventId._id !== eventId));
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="pt-4 pb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-blue-600" />
          Saved Events
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{saved.length} event{saved.length !== 1 ? "s" : ""} saved</p>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No saved events</p>
          <p className="text-gray-400 text-sm mt-1">Browse the feed and save events you&apos;re interested in</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((entry) => (
            <EventCard
              key={entry._id}
              event={entry.eventId}
              saved={savedIds.has(entry.eventId._id)}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
