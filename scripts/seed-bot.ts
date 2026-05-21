import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: String,
    onboardingComplete: Boolean,
  },
  { timestamps: true }
);

const ClubSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    name: String,
    description: String,
    contact: String,
    district: String,
    clubType: String,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

async function seedBot() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Club = mongoose.models.Club || mongoose.model("Club", ClubSchema);

  const BOT_EMAIL = "bot@uniplaza.lk";

  let botUser = await User.findOne({ email: BOT_EMAIL });
  if (!botUser) {
    const passwordHash = await bcrypt.hash(
      `bot-${Math.random().toString(36)}`,
      12
    );
    botUser = await User.create({
      name: "UniPlaza Bot",
      email: BOT_EMAIL,
      passwordHash,
      role: "club",
      onboardingComplete: true,
    });
    console.log("Bot user created:", BOT_EMAIL);
  } else {
    console.log("Bot user already exists");
  }

  let botClub = await Club.findOne({ userId: botUser._id });
  if (!botClub) {
    botClub = await Club.create({
      userId: botUser._id,
      name: "UniPlaza Bot",
      description: "Automated event discovery for Sri Lankan students — competitions, hackathons, and local events curated daily.",
      contact: BOT_EMAIL,
      district: "Colombo",
      clubType: "community",
      isVerified: true,
    });
    console.log("Bot club created, isVerified: true");
  } else {
    console.log("Bot club already exists");
  }

  console.log("\n✅ Bot club ID (copy this to BOT_CLUB_ID in .env.local):");
  console.log(botClub._id.toString());

  await mongoose.disconnect();
}

seedBot().catch(console.error);
