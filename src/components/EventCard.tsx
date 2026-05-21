"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Calendar, Clock } from "lucide-react";
import Badge from "./ui/Badge";
import VerifiedBadge from "./VerifiedBadge";
import { formatDate, cloudinaryUrl } from "@/lib/utils";

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    bannerUrl?: string;
    mode: "online" | "physical";
    district?: string;
    startDatetime: string | Date;
    endDatetime: string | Date;
    isPromoted?: boolean;
    clubId: {
      name: string;
      logoUrl?: string;
      isVerified?: boolean;
    };
    interests: { name: string }[];
  };
  saved?: boolean;
  onSaveToggle?: (eventId: string, saved: boolean) => void;
}

export default function EventCard({ event, saved = false, onSaveToggle }: EventCardProps) {
  return (
    <Link href={`/events/${event._id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Banner */}
        <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-blue-50">
          {event.bannerUrl ? (
            <Image
              src={cloudinaryUrl(event.bannerUrl, { width: 600, height: 280 })}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 600px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-blue-200" />
            </div>
          )}
          {event.isPromoted && (
            <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {onSaveToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onSaveToggle(event._id, !saved);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow transition-colors"
              aria-label={saved ? "Unsave event" : "Save event"}
            >
              <svg
                className={`h-4 w-4 ${saved ? "text-blue-600 fill-blue-600" : "text-gray-500"}`}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm leading-snug mb-1">
            {event.title}
          </h3>

          {/* Organizer */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-gray-500 truncate">{event.clubId.name}</span>
            {event.clubId.isVerified && <VerifiedBadge className="h-3 w-3" />}
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{formatDate(event.startDatetime)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {event.mode === "online" ? (
                <>
                  <Globe className="h-3 w-3 flex-shrink-0 text-green-500" />
                  <span className="text-green-600">Online</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{event.district}</span>
                </>
              )}
            </div>
          </div>

          {/* Interest tags */}
          <div className="flex flex-wrap gap-1">
            {event.interests.slice(0, 3).map((interest) => (
              <Badge key={interest.name} variant="blue" className="text-xs">
                {interest.name}
              </Badge>
            ))}
            {event.interests.length > 3 && (
              <Badge variant="gray" className="text-xs">+{event.interests.length - 3}</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
