import mongoose from "mongoose"

export interface INotification extends Document{
  user: mongoose.Types.ObjectId;
  type: "join_request" | "request_approved" | "request_rejected" | "new_job";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["join_request", "request_approved", "request_rejected", "new_job"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 }); 
const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;