import type { ScrapedEvent } from "./types";

// HackerEarth public API — no key required for listing challenges
const API_URL = "https://www.hackerearth.com/api/events/upcoming/?limit=20&offset=0";

interface HackerEarthEvent {
  id: number;
  title: string;
  description?: string;
  url: string;
  start_utc: string;
  end_utc: string;
  type: string;
  thumbnail?: string;
}

interface HackerEarthResponse {
  response: HackerEarthEvent[];
}

export async function scrapeHackerEarth(): Promise<ScrapedEvent[]> {
  const now = new Date();
  const results: ScrapedEvent[] = [];

  const res = await fetch(API_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`HackerEarth API error ${res.status}`);

  const data = (await res.json()) as HackerEarthResponse;
  const events = data.response || [];

  for (const ev of events) {
    try {
      const endDatetime = new Date(ev.end_utc);
      if (endDatetime < now) continue;

      const startDatetime = new Date(ev.start_utc);
      const title = ev.title?.trim();
      if (!title || title.length < 3) continue;

      const sourceUrl = ev.url.startsWith("http")
        ? ev.url
        : `https://www.hackerearth.com${ev.url}`;

      const dateStr = endDatetime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const description =
        ev.description?.trim() ||
        `${title} — an online competition on HackerEarth open to students worldwide. Submissions close ${dateStr}. Visit the challenge page for full details, prizes, and registration.`;

      const rawTags: string[] = [];
      if (ev.type) rawTags.push(ev.type.toLowerCase());
      rawTags.push("software", "competitive programming");

      results.push({
        title,
        description,
        sourceUrl,
        bannerImageUrl: ev.thumbnail || undefined,
        mode: "online",
        onlineLink: sourceUrl,
        registrationUrl: sourceUrl,
        startDatetime,
        endDatetime,
        goLiveAt: now,
        rawTags,
        sourceName: "hackerearth",
      });
    } catch {
      // skip bad events
    }
  }

  return results;
}
