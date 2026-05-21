import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Club from "@/models/Club";
import { clubSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "club") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = clubSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    await connectDB();
    const existing = await Club.findOne({ userId: session.user.id }).lean();
    if (existing) {
      return NextResponse.json({ error: "Club already registered for this account" }, { status: 409 });
    }

    const club = await Club.create({
      userId: session.user.id,
      ...parsed.data,
      logoUrl: body.logoUrl || undefined,
    });

    return NextResponse.json({ id: club._id.toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
