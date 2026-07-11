import type { Request, Response } from "express";
import Job from "../models/jobModel";
import RoomMembership from "../models/roomMembershipModel";
import Room from "../models/roomModel"
import Notification from "../models/notificationModel";
import { getDedupedAccessibleJobs } from "../utils/jobHelper";

const normalizeUrl=(url:string):string=>{
    try{
       const parsed = new URL(url.trim());
       return `${parsed.origin}${parsed.pathname}`.toLowerCase().replace(/\/$/,""); 
    }catch(err:any){
        return url.trim().toLowerCase();
    }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const { title, company, description, applyLink, location, skills, salary, rooms, requirements, deadline } = req.body;

    if (!title || !company || !description || !applyLink || !location || !skills || !rooms || rooms.length === 0) {
      return res.status(400).json({ message: "Please fill all required fields, including room" });
    }

    const normalizedLink = normalizeUrl(applyLink);

    const created: any[] = [];
    const duplicates: { roomId: string; existingJobId: string }[] = [];
    const unauthorized: string[] = [];

    for (const roomId of rooms) {
      const roomDoc = await Room.findById(roomId);
      if (!roomDoc) continue;

      let membership = await RoomMembership.findOne({
        room: roomId,
        user: req.user?._id,
      });

      if (!membership && roomDoc.isPublic) {
        membership = await RoomMembership.create({
          room: roomId,
          user: req.user?._id,
          status: "approved",
        });
      }

      if (!membership || membership.status !== "approved") {
        unauthorized.push(roomId);
        continue;
      }

      const existingJobs = await Job.find({ title, company, room: roomId });
      const duplicate = existingJobs.find((job) => normalizeUrl(job.applyLink) === normalizedLink);

      if (duplicate) {
        duplicates.push({ roomId, existingJobId: duplicate._id.toString() });
        continue;
      }

      const job = await Job.create({
        title, company, description, applyLink, location,
        skills: skills || [],
        salary,
        postedBy: req.user?._id,
        room: roomId,
        requirements: requirements || [],
        deadline: deadline || undefined,
      });

      created.push(job);

      const roomMembers = await RoomMembership.find({
        room: roomId,
        status: "approved",
        user: { $ne: req.user?._id },
      });

      const notifications = roomMembers.map((member) => ({
        user: member.user,
        type: "new_job" as const,
        title: "New job posted",
        message: `${job.title} at ${job.company} was just posted`,
        link: `/jobs/${job._id}`,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({ created, duplicates, unauthorized });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const { search, location } = req.query;

     const extraFilter: any = {};
    if (location) extraFilter.location = location;
    if (search) {
      const regex = new RegExp(search as string, "i");
      extraFilter.$or = [{ title: regex }, { company: regex }, { skills: regex }];
    }

    const dedupedJobs = await getDedupedAccessibleJobs(req.user?._id as string, extraFilter);

    res.status(200).json({ jobs: dedupedJobs });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const getJobLocations = async (req: Request, res: Response) => {
    try {
        const publicRooms = await RoomMembership.find({isPublic:true}).select("_id");
        const myApprovedMemberships = await RoomMembership.find({
            user : req.user?._id,
            status : "approved",
        }).select("room");
 
        const accessibleRoomIds = [
            ...publicRooms.map((r)=>r._id),
            ...myApprovedMemberships.map((m)=>m.room)
        ];
 
        const locations = await Job.distinct("location", { room: { $in: accessibleRoomIds } });
 
        res.status(200).json({ locations });
 
    } catch (err: any) {
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const getJobById=async(req:Request,res:Response)=>{
    try {
        const {id} = req.params;
        const job = await Job.findById(id);
        if(!job){
            return res.status(404).json({ message: "Job not found" });
        }
        res.status(200).json({job});
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const getMyJobs = async(req:Request,res:Response)=>{
    try{
        const {_id} = req.user;
        const jobs = await Job.find({postedBy:_id}).sort({createdAt:-1});
        res.status(200).json({jobs});
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const deleteJob = async(req:Request,res:Response)=>{
    try {
        const {id} = req.params;
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if(job.postedBy.toString() !== req.user?._id?.toString()){
            return res.status(403).json({ message: "Not authorized to delete this job" });
        }

        await job.deleteOne();
        res.status(200).json({ message: "Job deleted" });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}