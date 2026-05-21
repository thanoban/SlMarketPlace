import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface NotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: "new_event" | "waitlist_promoted";
  eventId?: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["new_event", "waitlist_promoted"],
      required: true,
    },
    eventId: { type: Schema.Types.ObjectId, ref: "Event" },
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
// Auto-delete notifications after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const Notification: Model<NotificationDocument> =
  (models.Notification as Model<NotificationDocument>) ||
  mongoose.model<NotificationDocument>("Notification", NotificationSchema);
export default Notification;
