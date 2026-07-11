import mongoose, { Schema, Document } from "mongoose";

export interface IJobMatch extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  matchPercent: number;
  matchedPoints: string[];
  missingPoints: string[];
  computedAt: Date;
}

const jobMatchSchema = new Schema<IJobMatch>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  matchPercent: { type: Number, required: true },
  matchedPoints: { type: [String], default: [] },
  missingPoints: { type: [String], default: [] },
  computedAt: { type: Date, default: Date.now },
});

jobMatchSchema.index({ user: 1, job: 1 }, { unique: true });

const JobMatch = mongoose.model<IJobMatch>("JobMatch", jobMatchSchema);
export default JobMatch;