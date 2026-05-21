"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import FeedFilters from "@/components/FeedFilters";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { Calendar } from "lucide-react";

interface FeedEvent {
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
}

function FeedContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeed = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    const res = await fetch(`/api/events/feed?${params.toString()}`);
    const data = await res.json();
    setEvents(p === 1 ? data.events : (prev: FeedEvent[]) => [...prev, ...data.events]);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
    fetchFeed(1);
  }, [fetchFeed]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/saved")
      .then((r) => r.json())
      .then((d) => {
        const ids = new Set<string>(
          (d.saved || []).map((s: { eventId: { _id: string } | string }) =>
            typeof s.eventId === "string" ? s.eventId : s.eventId._id
          )
        );
        setSavedIds(ids);
      });
  }, [session]);

  async function handleSaveToggle(eventId: string, save: boolean) {
    if (!session) return;
    const method = save ? "POST" : "DELETE";
    await fetch(`/api/saved/${eventId}`, { method });
    setSavedIds((prev) => {
      const next = new Set(prev);
      save ? next.add(eventId) : next.delete(eventId);
      return next;
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-900">
          {session ? "Your personalized feed" : "Events in Sri Lanka"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {session?.user?.role === "attendee"
            ? "Events matching your interests"
            : "Discover upcoming events and workshops"}
        </p>
      </div>

      <Suspense>
        <FeedFilters />
      </Suspense>

      {loading && page === 1 ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No events found</p>
          <p className="text-gray-400 text-sm mt-1">
            {session
              ? "Try changing your filters or check back later"
              : "Sign up to personalize your feed"}
          </p>
          {!session && (
            <Link href="/signup" className="mt-4 inline-block">
              <Button size="sm">Sign up free</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                saved={savedIds.has(event._id)}
                onSaveToggle={session ? handleSaveToggle : undefined}
              />
            ))}
          </div>

          {page < totalPages && (
            <div className="flex justify-center mt-8">
              <Button
                variant="secondary"
                loading={loading}
                onClick={() => {
                  const next = page + 1;
                  setPage(next);
                  fetchFeed(next);
                }}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
      <FeedContent />
    </Suspense>
  );
}
