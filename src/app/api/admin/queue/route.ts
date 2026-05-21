import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const events = await Event.find({ status: "pending" })
      .populate("clubId", "name isVerified district")
      .populate("interests", "name")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
