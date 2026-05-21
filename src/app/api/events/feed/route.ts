import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "all";
    const district = searchParams.get("district") || "";
    const dateFilter = searchParams.get("date") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    const now = new Date();

    // Auto-publish scheduled events whose goLiveAt has passed (check-on-read)
    await Event.updateMany(
      { status: "scheduled", goLiveAt: { $lte: now } },
      { $set: { status: "published" } }
    );

    // Build base query
    const query: Record<string, unknown> = {
      status: "published",
      endDatetime: { $gte: now },
    };

    // Interest filter: if logged in attendee, filter by their interests
    if (session?.user?.role === "attendee") {
      const user = await User.findById(session.user.id).lean();
      if (user?.interests?.length) {
        query.interests = { $in: user.interests };
      }
    }

    // Mode filter
    if (mode === "online") {
      query.mode = "online";
    } else if (mode === "physical") {
      query.mode = "physical";
      if (district) query.district = district;
    } else if (district) {
      // "all" mode but district selected — only physical events in that district + all online
      query.$or = [
        { mode: "physical", district },
        { mode: "online" },
      ];
    }

    // Date filter
    if (dateFilter === "today") {
      query.startDatetime = { $gte: startOfDay(now), $lte: endOfDay(now) };
    } else if (dateFilter === "week") {
      query.startDatetime = { $gte: startOfWeek(now), $lte: endOfWeek(now) };
    } else if (dateFilter === "month") {
      query.startDatetime = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
    }

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("clubId", "name logoUrl isVerified district")
        .populate("interests", "name")
        .sort({ isPromoted: -1, startDatetime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query),
    ]);

    return NextResponse.json({ events, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
