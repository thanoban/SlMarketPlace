import mongoose, { Schema, Document, models } from "mongoose";

export interface InterestDocument extends Document {
  name: string;
}

const InterestSchema = new Schema<InterestDocument>({
  name: { type: String, required: true, unique: true, trim: true },
});

const Interest =
  models.Interest || mongoose.model<InterestDocument>("Interest", InterestSchema);
export default Interest;
