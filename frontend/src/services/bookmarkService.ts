import axios from "axios";
import type { Job } from "../types/types.ts";

export const toggleBookmark = async (jobId: string): Promise<boolean> => {
  const res = await axios.post(`/api/bookmarks/${jobId}`);
  return res.data.bookmarked;
};

export const fetchMyBookmarkIds = async (): Promise<string[]> => {
  const res = await axios.get("/api/bookmarks/mine-ids");
  return res.data.jobIds;
};

export const fetchMyBookmarks = async (): Promise<{ _id: string; job: Job }[]> => {
  const res = await axios.get("/api/bookmarks/me");
  return res.data.bookmarks;
};