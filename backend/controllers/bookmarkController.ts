import type { Request, Response } from "express";
import Bookmark from "../models/bookmarkModel.ts";

export const toggleBookmark = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    const existing = await Bookmark.findOne({ user: req.user?._id, job: jobId });
    if(existing){
      await existing.deleteOne();
      return res.status(200).json({ bookmarked: false });
    }

    await Bookmark.create({ user: req.user?._id, job: jobId });
    res.status(201).json({ bookmarked: true });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const getMyBookmarks = async (req: Request, res: Response) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user?._id })
      .populate("job")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookmarks });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const getMyBookmarkIds = async (req: Request, res: Response) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user?._id }).select("job");
    res.status(200).json({ jobIds: bookmarks.map((b) => b.job) });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};