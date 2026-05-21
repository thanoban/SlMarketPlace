import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Club from "@/models/Club";

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
    const { isVerified } = await req.json();
    await connectDB();
    const club = await Club.findByIdAndUpdate(id, { isVerified }, { new: true });
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });
    return NextResponse.json({ isVerified: club.isVerified });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
