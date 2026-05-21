import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Interest from "@/models/Interest";
import { onboardingSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { interests: interestNames, homeDistrict } = parsed.data;

    await connectDB();
    const interestDocs = await Interest.find({ name: { $in: interestNames } }).lean();
    const interestIds = interestDocs.map((i) => i._id);

    await User.findByIdAndUpdate(session.user.id, {
      interests: interestIds,
      homeDistrict,
      onboardingComplete: true,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
