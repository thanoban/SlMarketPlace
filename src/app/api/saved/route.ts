import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SavedEvent from "@/models/SavedEvent";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const saved = await SavedEvent.find({ userId: session.user.id })
      .populate({
        path: "eventId",
        populate: [
          { path: "clubId", select: "name logoUrl isVerified" },
          { path: "interests", select: "name" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ saved });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
