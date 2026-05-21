import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Club from "@/models/Club";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const clubs = await Club.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ clubs });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
