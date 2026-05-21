import * as cheerio from "cheerio";
import { fetchHtml } from "./utils";
import type { ScrapedEvent } from "./types";

// MLH (Major League Hacking) public events list
const MLH_URL = "https://mlh.io/events";

export async function scrapeMLH(): Promise<ScrapedEvent[]> {
  const html = await fetchHtml(MLH_URL);
  const $ = cheerio.load(html);
  const results: ScrapedEvent[] = [];
  const now = new Date();

  // MLH events are listed as <div class="event"> or <div class="event-item">
  const cards = $(".event, .event-wrapper");

  cards.each((_, el) => {
    try {
      const card = $(el);

      const title =
        card.find(".event-name, h3, h4").first().text().trim();
      if (!title || title.length < 3) return;

      const sourceUrl =
        card.find("a").first().attr("href") || "";
      if (!sourceUrl) return;

      const fullUrl = sourceUrl.startsWith("http")
        ? sourceUrl
        : `https://mlh.io${sourceUrl}`;

      // MLH shows dates in spans — format varies but typically "Month D - D, YYYY"
      const dateText = card.find(".event-date, .date, time").first().text().trim();
      const bannerImageUrl =
        card.find("img").first().attr("src") || undefined;

      // Try to parse date from text — MLH format: "May 30 - Jun 1, 2026"
      const now = new Date();
      let startDatetime = now;
      let endDatetime: Date | null = null;

      const dateMatch = dateText.match(
        /([A-Za-z]+ \d+)\s*[-–]\s*([A-Za-z]+ \d+(?:, \d{4})?)/
      );
      if (dateMatch) {
        const year = new Date().getFullYear();
        try {
          endDatetime = new Date(`${dateMatch[2].includes(",") ? dateMatch[2] : dateMatch[2] + ", " + year}`);
          startDatetime = new Date(`${dateMatch[1]}, ${year}`);
        } catch {
          // skip date parsing
        }
      }

      if (!endDatetime) endDatetime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // default 30 days out
      if (endDatetime < now) return;

      const dateStr = endDatetime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const description = `${title} — an MLH (Major League Hacking) hackathon open to students worldwide. Event ends ${dateStr}. Visit the event page for full details and registration.`;

      results.push({
        title,
        description,
        sourceUrl: fullUrl,
        bannerImageUrl,
        mode: "online",
        onlineLink: fullUrl,
        registrationUrl: fullUrl,
        startDatetime,
        endDatetime,
        goLiveAt: now,
        rawTags: ["hackathon", "web development", "software", "design"],
        sourceName: "mlh",
      });
    } catch {
      // skip
    }
  });

  return results;
}
