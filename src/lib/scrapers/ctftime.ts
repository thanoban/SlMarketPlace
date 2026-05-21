// CTFtime.org JSON API — cybersecurity competitions (CTFs)
import type { ScrapedEvent } from "./types";

const API_URL = "https://ctftime.org/api/v1/events/?limit=20&start=";

interface CTFEvent {
  id: number;
  title: string;
  description?: string;
  url: string;
  start: string;
  finish: string;
  logo?: string;
  format?: string;
  onsite: boolean;
  location?: string;
}

export async function scrapeCTFTime(): Promise<ScrapedEvent[]> {
  const now = new Date();
  const startTs = Math.floor(now.getTime() / 1000);
  const results: ScrapedEvent[] = [];

  const res = await fetch(`${API_URL}${startTs}`, {
    headers: {
      Accept: "application/json",
      // CTFtime requires a browser-like User-Agent
      "User-Agent": "Mozilla/5.0 (compatible; UniPlaza/1.0)",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`CTFtime API error ${res.status}`);

  const events = (await res.json()) as CTFEvent[];

  for (const ev of events) {
    try {
      const endDatetime = new Date(ev.finish);
      if (endDatetime < now) continue;

      const startDatetime = new Date(ev.start);
      const title = ev.title?.trim();
      if (!title || title.length < 3) continue;

      const sourceUrl = ev.url?.startsWith("http")
        ? ev.url
        : `https://ctftime.org/event/${ev.id}`;

      const dateStr = endDatetime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const description =
        ev.description?.trim() ||
        `${title} — a Capture The Flag (CTF) cybersecurity competition open to students worldwide. Ends ${dateStr}. Visit the event page for more details and registration.`;

      results.push({
        title,
        description,
        sourceUrl,
        bannerImageUrl: ev.logo || undefined,
        mode: "online",
        onlineLink: sourceUrl,
        registrationUrl: sourceUrl,
        startDatetime,
        endDatetime,
        goLiveAt: now,
        rawTags: ["security", "cybersecurity", "ctf", "hacking"],
        sourceName: "ctftime",
      });
    } catch {
      // skip bad events
    }
  }

  return results;
}
