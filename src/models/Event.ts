import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface EventDocument extends Document {
  clubId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  bannerUrl?: string;
  mode: "online" | "physical";
  district?: string;
  venue?: string;
  onlineLink?: string;
  startDatetime: Date;
  endDatetime: Date;
  goLiveAt: Date;
  status: "pending" | "approved" | "scheduled" | "published" | "rejected";
  rejectReason?: string;
  isPromoted: boolean;
  interests: mongoose.Types.ObjectId[];
  sourceUrl?: string;
  registrationUrl?: string;
  whatsappGroupUrl?: string;
  telegramGroupUrl?: string;
  capacity?: number;
  viewCount: number;
  createdAt: Date;
}

const EventSchema = new Schema<EventDocument>(
  {
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    bannerUrl: { type: String },
    mode: { type: String, enum: ["online", "physical"], required: true },
    district: { type: String },
    venue: { type: String },
    onlineLink: { type: String },
    startDatetime: { type: Date, required: true },
    endDatetime: { type: Date, required: true },
    goLiveAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "scheduled", "published", "rejected"],
      default: "pending",
    },
    rejectReason: { type: String },
    isPromoted: { type: Boolean, default: false },
    interests: [{ type: Schema.Types.ObjectId, ref: "Interest" }],
    sourceUrl: { type: String },
    registrationUrl: { type: String },
    whatsappGroupUrl: { type: String },
    telegramGroupUrl: { type: String },
    capacity: { type: Number },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

EventSchema.index({ status: 1, goLiveAt: 1, endDatetime: 1 });
EventSchema.index({ clubId: 1, status: 1 });
EventSchema.index({ interests: 1 });
EventSchema.index({ sourceUrl: 1 }, { unique: true, sparse: true });

const Event: Model<EventDocument> = (models.Event as Model<EventDocument>) || mongoose.model<EventDocument>("Event", EventSchema);
export default Event;
