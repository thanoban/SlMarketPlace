import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import SavedEvent from "@/models/SavedEvent";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;

  try {
    await connectDB();
    await SavedEvent.findOneAndUpdate(
      { userId: session.user.id, eventId },
      { userId: session.user.id, eventId },
      { upsert: true }
    );
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;

  try {
    await connectDB();
    await SavedEvent.findOneAndDelete({ userId: session.user.id, eventId });
    return NextResponse.json({ saved: false });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
