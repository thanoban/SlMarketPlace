import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface RSVPDocument extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: "going" | "interested" | "waitlist";
  checkInToken?: string;
  checkedIn: boolean;
  createdAt: Date;
}

const RSVPSchema = new Schema<RSVPDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    status: {
      type: String,
      enum: ["going", "interested", "waitlist"],
      default: "going",
    },
    checkInToken: { type: String },
    checkedIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RSVPSchema.index({ userId: 1, eventId: 1 }, { unique: true });
RSVPSchema.index({ eventId: 1, status: 1 });
RSVPSchema.index({ checkInToken: 1 }, { unique: true, sparse: true });

const RSVP: Model<RSVPDocument> =
  (models.RSVP as Model<RSVPDocument>) ||
  mongoose.model<RSVPDocument>("RSVP", RSVPSchema);
export default RSVP;
