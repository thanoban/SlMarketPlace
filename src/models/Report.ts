import mongoose, { Schema, Document, models } from "mongoose";

export interface ReportDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reason: string;
  createdAt: Date;
}

const ReportSchema = new Schema<ReportDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

const Report =
  models.Report || mongoose.model<ReportDocument>("Report", ReportSchema);
export default Report;
