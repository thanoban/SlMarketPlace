import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { reason } = await req.json();
    if (!reason) return NextResponse.json({ error: "Reject reason required" }, { status: 400 });

    await connectDB();
    const event = await Event.findByIdAndUpdate(
      id,
      { status: "rejected", rejectReason: reason },
      { new: true }
    );
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json({ status: event.status });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
