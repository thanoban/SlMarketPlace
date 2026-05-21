import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Globe, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import SavedEvent from "@/models/SavedEvent";
import Badge from "@/components/ui/Badge";
import VerifiedBadge from "@/components/VerifiedBadge";
import SaveButton from "./SaveButton";
import { formatDatetime, formatDate, cloudinaryUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  await connectDB();

  const event = await Event.findById(id)
    .populate("clubId", "name logoUrl isVerified district")
    .populate("interests", "name")
    .lean();

  if (!event) notFound();

  // Status check: only show published (or scheduled/approved for preview)
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const club = event.clubId as unknown as { _id: string; name: string; logoUrl?: string; isVerified?: boolean; district?: string };
  const isOwnClub = session?.user?.role === "club";

  if (!isAdmin && !isOwnClub && event.status !== "published") {
    notFound();
  }

  let isSaved = false;
  if (session?.user?.id) {
    const saved = await SavedEvent.findOne({ userId: session.user.id, eventId: id }).lean();
    isSaved = !!saved;
  }

  const interests = event.interests as unknown as { name: string }[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Banner */}
          <div className="relative w-full h-52 bg-gradient-to-br from-blue-100 to-blue-50">
            {event.bannerUrl ? (
              <Image
                src={cloudinaryUrl(event.bannerUrl, { width: 800, height: 400 })}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="800px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-blue-200" />
              </div>
            )}
          </div>

          <div className="p-5">
            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h1>

            {/* Organizer */}
            <div className="flex items-center gap-2 mb-4">
              {club.logoUrl && (
                <Image
                  src={club.logoUrl}
                  alt={club.name}
                  width={28}
                  height={28}
                  className="rounded-full object-cover border border-gray-200"
                />
              )}
              <span className="text-sm font-medium text-gray-700">{club.name}</span>
              {club.isVerified && <VerifiedBadge />}
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                <div>
                  <p>Starts: {formatDatetime(event.startDatetime)}</p>
                  <p className="text-gray-500">Ends: {formatDatetime(event.endDatetime)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {event.mode === "online" ? (
                  <>
                    <Globe className="h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-green-600 font-medium">Online event</span>
                    {event.onlineLink && (
                      <a
                        href={event.onlineLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 ml-1"
                      >
                        Join link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{event.venue ? `${event.venue}, ` : ""}{event.district}</span>
                  </>
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {interests.map((i) => (
                <Badge key={i.name} variant="blue">{i.name}</Badge>
              ))}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap mb-6">
              {event.description}
            </div>

            {/* Save button */}
            {session && session.user.role === "attendee" && (
              <SaveButton eventId={id} initialSaved={isSaved} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
