import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface ClubFollowDocument extends Document {
  userId: mongoose.Types.ObjectId;
  clubId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ClubFollowSchema = new Schema<ClubFollowDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true },
  },
  { timestamps: true }
);

ClubFollowSchema.index({ userId: 1, clubId: 1 }, { unique: true });
ClubFollowSchema.index({ clubId: 1 });

const ClubFollow: Model<ClubFollowDocument> =
  (models.ClubFollow as Model<ClubFollowDocument>) ||
  mongoose.model<ClubFollowDocument>("ClubFollow", ClubFollowSchema);
export default ClubFollow;
