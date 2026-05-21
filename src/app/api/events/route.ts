import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Club from "@/models/Club";
import Event from "@/models/Event";
import Interest from "@/models/Interest";
import { eventSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "club") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const club = await Club.findOne({ userId: session.user.id }).lean();
    if (!club) {
      return NextResponse.json({ error: "Club not found. Register your organization first." }, { status: 404 });
    }

    const interestDocs = await Interest.find({ name: { $in: parsed.data.interests } }).lean();
    const interestIds = interestDocs.map((i) => i._id);

    // State machine: verified clubs skip pending queue
    const status = club.isVerified ? "scheduled" : "pending";

    const event = await Event.create({
      clubId: club._id,
      title: parsed.data.title,
      description: parsed.data.description,
      bannerUrl: body.bannerUrl || undefined,
      mode: parsed.data.mode,
      district: parsed.data.mode === "physical" ? parsed.data.district : undefined,
      venue: parsed.data.venue || undefined,
      onlineLink: parsed.data.onlineLink || undefined,
      startDatetime: new Date(parsed.data.startDatetime),
      endDatetime: new Date(parsed.data.endDatetime),
      goLiveAt: new Date(parsed.data.goLiveAt),
      status,
      interests: interestIds,
    });

    return NextResponse.json({ id: event._id.toString(), status }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
