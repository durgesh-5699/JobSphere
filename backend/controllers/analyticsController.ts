import type { Request, Response } from "express";
import mongoose from "mongoose";
import Room from "../models/roomModel.ts";
import Job from "../models/jobModel.ts";
import RoomMembership from "../models/roomMembershipModel.ts";
import Application from "../models/applicationModel.ts";

export const getRoomAnalytics = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if(!room){
      return res.status(404).json({ message: "Room not found" });
    }
    if(room.owner.toString() !== req.user?._id?.toString()){
      return res.status(403).json({ message: "Not authorized" });
    }

    const roomId = new mongoose.Types.ObjectId(req.params.id);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const totalMembers = await RoomMembership.countDocuments({ room: roomId, status: "approved" });
    const roomJobs = await Job.find({ room: roomId }).select("_id title company createdAt postedBy");
    const totalJobs = roomJobs.length;
    const jobIds = roomJobs.map((j) => j._id);

    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

    const jobsOverTimeRaw = await Job.aggregate([
      { $match: { room: roomId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const jobsOverTime = jobsOverTimeRaw.map((d) => ({ date: d._id, jobs: d.count }));

    const memberGrowthRaw = await RoomMembership.aggregate([
      { $match: { room: roomId, status: "approved", createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const memberGrowth = memberGrowthRaw.map((d) => ({ date: d._id, members: d.count }));

    const topPostersRaw = await Job.aggregate([
      { $match: { room: roomId } },
      { $group: { _id: "$postedBy", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" },
      },
      { $unwind: "$user" },
      { $project: { name: "$user.name", count: 1 } },
    ]);

    const topJobsRaw = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: "$job", applications: { $sum: 1 } } },
      { $sort: { applications: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: "jobs", localField: "_id", foreignField: "_id", as: "job" },
      },
      { $unwind: "$job" },
      { $project: { title: "$job.title", company: "$job.company", applications: 1 } },
    ]);

    res.status(200).json({
      totalMembers,
      totalJobs,
      totalApplications,
      jobsOverTime,
      memberGrowth,
      topPosters: topPostersRaw,
      topJobs: topJobsRaw,
    });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};