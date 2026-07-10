import mongoose, { Schema, Document } from "mongoose";

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, job: 1 }, { unique: true });

const Bookmark = mongoose.model<IBookmark>("Bookmark", bookmarkSchema);
export default Bookmark;