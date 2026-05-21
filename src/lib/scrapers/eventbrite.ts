import { mapEventbriteDistrict } from "./utils";
import type { ScrapedEvent } from "./types";

const API_BASE = "https://www.eventbriteapi.com/v3";

interface EventbriteVenue {
  name?: string;
  address?: {
    city?: string;
    region?: string;
    country?: string;
    localized_address_display?: string;
  };
}

interface EventbriteCategory {
  name?: string;
}

interface EventbriteEvent {
  id: string;
  name: { text: string };
  summary?: string;
  description?: { text?: string };
  url: string;
  start: { utc: string };
  end: { utc: string };
  online_event: boolean;
  logo?: { original?: { url: string } };
  venue?: EventbriteVenue;
  category?: EventbriteCategory;
  subcategory?: EventbriteCategory;
  status: string;
}

interface EventbriteResponse {
  events: EventbriteEvent[];
  pagination: {
    page_count: number;
    page_number: number;
    has_more_items: boolean;
  };
}

async function fetchPage(token: string, page: number): Promise<EventbriteResponse> {
  const params = new URLSearchParams({
    "location.address": "Sri Lanka",
    "location.within": "500km",
    sort_by: "date",
    expand: "venue,category,subcategory",
    token,
    page: String(page),
  });

  const res = await fetch(`${API_BASE}/events/search/?${params}`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Eventbrite API error ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<EventbriteResponse>;
}

export async function scrapeEventbrite(): Promise<ScrapedEvent[]> {
  const token = process.env.EVENTBRITE_API_KEY;
  if (!token) throw new Error("EVENTBRITE_API_KEY is not set");

  const results: ScrapedEvent[] = [];
  const now = new Date();
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchPage(token, page);
    totalPages = data.pagination.page_count;

    for (const ev of data.events) {
      try {
        if (ev.status !== "live" && ev.status !== "started") continue;

        const endDatetime = new Date(ev.end.utc);
        if (endDatetime < now) continue;

        const startDatetime = new Date(ev.start.utc);
        const title = ev.name.text?.trim();
        if (!title || title.length < 3) continue;

        const description =
          ev.description?.text?.trim() ||
          ev.summary?.trim() ||
          `${title} — an event in Sri Lanka. Visit the Eventbrite page for full details and registration.`;

        const bannerImageUrl = ev.logo?.original?.url;

        const rawTags: string[] = [];
        if (ev.category?.name) rawTags.push(ev.category.name);
        if (ev.subcategory?.name) rawTags.push(ev.subcategory.name);

        const mode: "online" | "physical" = ev.online_event ? "online" : "physical";
        const district = mode === "physical"
          ? mapEventbriteDistrict(
              ev.venue?.address?.region,
              ev.venue?.address?.city
            )
          : undefined;

        const venue = ev.venue?.name || ev.venue?.address?.localized_address_display;

        // Skip physical events outside Sri Lanka (no district mapped)
        if (mode === "physical" && !district) continue;

        results.push({
          title,
          description,
          sourceUrl: ev.url,
          bannerImageUrl,
          mode,
          district,
          venue: venue || undefined,
          onlineLink: mode === "online" ? ev.url : undefined,
          registrationUrl: ev.url,
          startDatetime,
          endDatetime,
          goLiveAt: now,
          rawTags,
          sourceName: "eventbrite",
        });
      } catch {
        // skip bad events
      }
    }

    if (!data.pagination.has_more_items) break;
    page++;
  }

  return results;
}
