import * as cheerio from "cheerio";
import { fetchHtml, parseDate, sleep } from "./utils";
import type { ScrapedEvent } from "./types";

const LISTING_URL =
  "https://devpost.com/hackathons?open_to[]=public&challenge_type[]=hackathon&sort_by=Deadline";

function buildDescription(title: string, endDate: Date, tagsText: string): string {
  const dateStr = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tagsLine = tagsText ? ` Focus areas: ${tagsText}.` : "";
  return `International hackathon open to all students: ${title}.${tagsLine} Submissions close ${dateStr}. Visit the hackathon page for full details, prizes, and team registration.`;
}

async function fetchEventDates(
  url: string
): Promise<{ start: Date; end: Date } | null> {
  try {
    await sleep(500);
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // Devpost event pages have dates in <time> elements or in .span-dates
    const timeEls = $("time");
    const dates: Date[] = [];
    timeEls.each((_, el) => {
      const dt = $(el).attr("datetime");
      if (dt) {
        try {
          dates.push(parseDate(dt));
        } catch {
          // skip
        }
      }
    });

    if (dates.length >= 2) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      return { start: dates[0], end: dates[dates.length - 1] };
    }
  } catch {
    // fall through
  }
  return null;
}

export async function scrapeDevpost(): Promise<ScrapedEvent[]> {
  const html = await fetchHtml(LISTING_URL);
  const $ = cheerio.load(html);
  const results: ScrapedEvent[] = [];
  const now = new Date();

  // Devpost listing uses <article class="challenge-listing"> or <li class="challenge-listing">
  const cards = $("article.challenge-listing, li.challenge-listing");

  for (let i = 0; i < cards.length; i++) {
    const card = cards.eq(i);
    try {
      const sourceUrl =
        card.attr("data-url") ||
        card.find("a.challenge-listing-link").attr("href") ||
        card.find("a[href*='devpost.com']").attr("href") ||
        "";

      if (!sourceUrl || !sourceUrl.includes("devpost.com")) continue;

      const title =
        card.find(".challenge-title").text().trim() ||
        card.find("h2, h3").first().text().trim();

      if (!title || title.length < 3) continue;

      const bannerEl = card.find("img").first();
      const bannerImageUrl =
        bannerEl.attr("src") || bannerEl.attr("data-src") || undefined;

      const rawTags: string[] = [];
      card.find(".challenge-tags .challenge-tag, .tag").each((_, el) => {
        const t = $(el).text().trim();
        if (t) rawTags.push(t);
      });

      // Try to parse dates from card text
      const datesText = card.find(".challenge-dates, .submission-period, .date").text();
      let startDatetime: Date | null = null;
      let endDatetime: Date | null = null;

      // Look for ISO date strings in data attributes
      card.find("[data-submission-start], [data-submission-end]").each((_, el) => {
        const start = $(el).attr("data-submission-start");
        const end = $(el).attr("data-submission-end");
        if (start && !startDatetime) {
          try { startDatetime = parseDate(start); } catch { /* skip */ }
        }
        if (end && !endDatetime) {
          try { endDatetime = parseDate(end); } catch { /* skip */ }
        }
      });

      // If dates not in card, fetch individual page (rate-limited)
      if (!endDatetime && sourceUrl) {
        const fetched = await fetchEventDates(sourceUrl);
        if (fetched) {
          startDatetime = fetched.start;
          endDatetime = fetched.end;
        }
      }

      if (!endDatetime) continue;
      if (endDatetime < now) continue; // already ended

      if (!startDatetime) startDatetime = now;

      const tagsText = rawTags.join(", ");
      const description = buildDescription(title, endDatetime, tagsText);

      results.push({
        title,
        description,
        sourceUrl,
        bannerImageUrl,
        mode: "online",
        onlineLink: sourceUrl,
        registrationUrl: sourceUrl,
        startDatetime,
        endDatetime,
        goLiveAt: now,
        rawTags,
        sourceName: "devpost",
      });
    } catch {
      // skip bad cards
    }
  }

  return results;
}
