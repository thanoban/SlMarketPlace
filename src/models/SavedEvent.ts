import mongoose, { Schema, Document, models } from "mongoose";

export interface SavedEventDocument extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedEventSchema = new Schema<SavedEventDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  },
  { timestamps: true }
);

SavedEventSchema.index({ userId: 1 });
SavedEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const SavedEvent =
  models.SavedEvent ||
  mongoose.model<SavedEventDocument>("SavedEvent", SavedEventSchema);
export default SavedEvent;
