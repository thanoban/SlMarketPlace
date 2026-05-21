import mongoose, { Schema, Document, Model, models } from "mongoose";

export type ClubType = "university" | "private" | "community";

export interface ClubDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  logoUrl?: string;
  description: string;
  contact: string;
  district: string;
  clubType: ClubType;
  universityName?: string;
  isVerified: boolean;
  createdAt: Date;
}

const ClubSchema = new Schema<ClubDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    description: { type: String, required: true },
    contact: { type: String, required: true },
    district: { type: String, required: true },
    clubType: { type: String, enum: ["university", "private", "community"], required: true },
    universityName: { type: String },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Club: Model<ClubDocument> = (models.Club as Model<ClubDocument>) || mongoose.model<ClubDocument>("Club", ClubSchema);
export default Club;
