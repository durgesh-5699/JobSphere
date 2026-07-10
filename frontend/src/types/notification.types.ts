
export interface Notification {
  _id: string;
  type: "join_request" | "request_approved" | "request_rejected" | "new_job";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}