import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "attendee" | "club" | "admin";
  homeDistrict?: string;
  interests: mongoose.Types.ObjectId[];
  onboardingComplete: boolean;
  avatarUrl?: string;
  createdAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["attendee", "club", "admin"], default: "attendee" },
    homeDistrict: { type: String },
    interests: [{ type: Schema.Types.ObjectId, ref: "Interest" }],
    onboardingComplete: { type: Boolean, default: false },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

const User: Model<UserDocument> = (models.User as Model<UserDocument>) || mongoose.model<UserDocument>("User", UserSchema);
export default User;
