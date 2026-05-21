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

const DEFAULT_INTERESTS = [
  "Technology/IT",
  "Software Development",
  "DevOps",
  "Cybersecurity",
  "Data Science & AI",
  "Design/UX",
  "Engineering",
  "Medicine & Health",
  "Science & Research",
  "Business & Entrepreneurship",
  "Marketing",
  "Finance",
  "Law",
  "Education/Academic",
  "Arts & Culture",
  "Environment",
];

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: String,
  homeDistrict: String,
  interests: [mongoose.Schema.Types.ObjectId],
  onboardingComplete: Boolean,
}, { timestamps: true });

const InterestSchema = new mongoose.Schema({
  name: { type: String, unique: true },
});

async function seed() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Interest = mongoose.models.Interest || mongoose.model("Interest", InterestSchema);

  // Seed interests
  let seeded = 0;
  for (const name of DEFAULT_INTERESTS) {
    try {
      await Interest.findOneAndUpdate({ name }, { name }, { upsert: true });
      seeded++;
    } catch {
      // Skip duplicate
    }
  }
  console.log(`Seeded ${seeded} interest categories`);

  // Seed admin user
  const adminEmail = "admin@slevents.lk";
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const passwordHash = await bcrypt.hash("admin123!", 12);
    await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "admin",
      onboardingComplete: true,
    });
    console.log(`Admin created: ${adminEmail} / admin123!`);
  } else {
    console.log("Admin already exists");
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch(console.error);
