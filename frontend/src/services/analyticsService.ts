import axios from "axios";
import type { RoomAnalytics } from "../types/types";

export const fetchRoomAnalytics = async (roomId: string): Promise<RoomAnalytics> => {
  const res = await axios.get(`/api/rooms/${roomId}/analytics`);
  return res.data;
};