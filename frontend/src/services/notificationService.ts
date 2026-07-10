import axios from "axios";
import type { Notification } from "../types/notification.types";

export const fetchNotifications = async():Promise<Notification[]>=>{
    const res = await axios.get("/api/notifications");
    return res.data.notifications;
}

export const fetchUnreadCount=async():Promise<number>=>{
    const res = await axios.get("/api/notifications/unread-count");
    return res.data.count;
}

export const markAsRead = async(id:string):Promise<void>=>{
    await axios.patch(`/api/notifications/${id}/read`);
}

export const markAllAsRead = async():Promise<void>=>{
    await axios.patch("/api/notifications/read-all");
}