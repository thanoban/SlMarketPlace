import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Globe, ArrowLeft, ExternalLink } from "lucide-react";
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

  // Derive source attribution from sourceUrl domain
  const sourceLabel = (() => {
    const url = event.sourceUrl as string | undefined;
    if (!url) return null;
    if (url.includes("devpost.com")) return "Devpost";
    if (url.includes("eventbrite.com")) return "Eventbrite";
    if (url.includes("hackerearth.com")) return "HackerEarth";
    if (url.includes("mlh.io")) return "MLH";
    if (url.includes("ctftime.org")) return "CTFtime";
    return "External";
  })();

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
              event.bannerUrl.includes("cloudinary.com") ? (
                <Image
                  src={cloudinaryUrl(event.bannerUrl, { width: 800, height: 400 })}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="800px"
                />
              ) : (
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="800px"
                  unoptimized
                />
              )
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

              {event.registrationUrl && (
                <a
                  href={event.registrationUrl as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors w-fit"
                >
                  Register / Get Tickets <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Interest tags + source attribution */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {interests.map((i) => (
                <Badge key={i.name} variant="blue">{i.name}</Badge>
              ))}
              {sourceLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200">
                  via {sourceLabel}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap mb-6">
              {event.description}
            </div>

            {/* WhatsApp / Telegram group links (visible to logged-in users) */}
            {session && (event.whatsappGroupUrl || event.telegramGroupUrl) && (
              <div className="mt-2 mb-4 flex flex-col gap-2">
                {event.whatsappGroupUrl && (
                  <a
                    href={event.whatsappGroupUrl as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors w-fit"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Join WhatsApp Group
                  </a>
                )}
                {event.telegramGroupUrl && (
                  <a
                    href={event.telegramGroupUrl as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg transition-colors w-fit"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Join Telegram Group
                  </a>
                )}
              </div>
            )}

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
