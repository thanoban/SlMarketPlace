import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Interest from "@/models/Interest";
import Club from "@/models/Club";
import { mapInterests } from "./utils";
import { scrapeDevpost } from "./devpost";
import { scrapeEventbrite } from "./eventbrite";
import { scrapeHackerEarth } from "./hackerearth";
import { scrapeMLH } from "./mlh";
import { scrapeCTFTime } from "./ctftime";
import type { ScrapedEvent } from "./types";

interface RunResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

async function upsertScrapedEvent(
  ev: ScrapedEvent,
  botClubId: mongoose.Types.ObjectId,
  interestDocs: { _id: unknown; name: string }[]
): Promise<"inserted" | "skipped"> {
  const interestIds = mapInterests(ev.rawTags, interestDocs);

  const res = await Event.updateOne(
    { sourceUrl: ev.sourceUrl },
    {
      $setOnInsert: {
        clubId: botClubId,
        title: ev.title,
        description: ev.description,
        bannerUrl: ev.bannerImageUrl || undefined,
        mode: ev.mode,
        district: ev.district,
        venue: ev.venue,
        onlineLink: ev.onlineLink,
        registrationUrl: ev.registrationUrl,
        startDatetime: ev.startDatetime,
        endDatetime: ev.endDatetime,
        goLiveAt: ev.goLiveAt,
        status: "scheduled",
        interests: interestIds,
        sourceUrl: ev.sourceUrl,
        isPromoted: false,
      },
    },
    { upsert: true }
  );

  return res.upsertedCount > 0 ? "inserted" : "skipped";
}

export async function runAllScrapers(): Promise<RunResult> {
  await connectDB();

  const interestDocs = await Interest.find({}).lean<{ _id: unknown; name: string }[]>();

  const botClubIdStr = process.env.BOT_CLUB_ID;
  if (!botClubIdStr) throw new Error("BOT_CLUB_ID env var is not set — run npm run seed:bot first");

  const botClub = await Club.findById(botClubIdStr).lean();
  if (!botClub) throw new Error(`Bot club not found for id: ${botClubIdStr}`);

  const botClubId = botClub._id as mongoose.Types.ObjectId;

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Run scrapers — each is independent; one failure does not abort the other
  const scraperResults: ScrapedEvent[] = [];

  try {
    const devpostEvents = await scrapeDevpost();
    scraperResults.push(...devpostEvents);
    console.log(`[scraper] devpost: ${devpostEvents.length} events found`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`devpost: ${msg}`);
    console.error("[scraper] devpost failed:", msg);
  }

  try {
    const eventbriteEvents = await scrapeEventbrite();
    scraperResults.push(...eventbriteEvents);
    console.log(`[scraper] eventbrite: ${eventbriteEvents.length} events found`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`eventbrite: ${msg}`);
    console.error("[scraper] eventbrite failed:", msg);
  }

  try {
    const hackerEarthEvents = await scrapeHackerEarth();
    scraperResults.push(...hackerEarthEvents);
    console.log(`[scraper] hackerearth: ${hackerEarthEvents.length} events found`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`hackerearth: ${msg}`);
    console.error("[scraper] hackerearth failed:", msg);
  }

  try {
    const mlhEvents = await scrapeMLH();
    scraperResults.push(...mlhEvents);
    console.log(`[scraper] mlh: ${mlhEvents.length} events found`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`mlh: ${msg}`);
    console.error("[scraper] mlh failed:", msg);
  }

  try {
    const ctfEvents = await scrapeCTFTime();
    scraperResults.push(...ctfEvents);
    console.log(`[scraper] ctftime: ${ctfEvents.length} events found`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`ctftime: ${msg}`);
    console.error("[scraper] ctftime failed:", msg);
  }

  // Upsert all events
  for (const ev of scraperResults) {
    try {
      const outcome = await upsertScrapedEvent(ev, botClubId, interestDocs);
      if (outcome === "inserted") inserted++;
      else skipped++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Ignore duplicate key errors (race condition safety net)
      if (!msg.includes("duplicate key") && !msg.includes("E11000")) {
        errors.push(`upsert ${ev.sourceUrl}: ${msg}`);
      } else {
        skipped++;
      }
    }
  }

  console.log(`[scraper] done — inserted: ${inserted}, skipped: ${skipped}, errors: ${errors.length}`);
  return { inserted, skipped, errors };
}
