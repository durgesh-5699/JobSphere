import type { Request, Response } from "express";
import Job from "../models/jobModel";
import RoomMembership from "../models/roomMembershipModel";
import Room from "../models/roomModel"
import Notification from "../models/notificationModel";

const normalizeUrl=(url:string):string=>{
    try{
       const parsed = new URL(url.trim());
       return `${parsed.origin}${parsed.pathname}`.toLowerCase().replace(/\/$/,""); 
    }catch(err:any){
        return url.trim().toLowerCase();
    }
};

export const createJob=async(req:Request,res:Response)=>{
    try {
        const {title,company,description,applyLink,location,skills,salary,room,requirements,deadline} = req.body;

        console.log(title,company,description,applyLink,location,skills,salary,room,requirements,deadline);

        if(!title || !company || !description || !applyLink || !location || !skills || !room){
            return res.status(400).json({message:"please fill all required fields, including room"});
        }

        const roomDoc = await Room.findById(room);
        if(!roomDoc){
            return res.status(404).json({ message: "Room not found" });
        }

        const membership = await RoomMembership.findOne({
            room,
            user:req.user?.id,
        });

        if(!membership &&  roomDoc.isPublic){
            membership = await RoomMembership.create({
                room,
                user : req.user?._id,
                status:"approved",
            });
        }

        if(!membership || membership.status !== "approved"){
            return res.status(403).json({ message: "You must be an approved member of this room to post here" });
        }

        const normalizedLink = normalizeUrl(applyLink);

        const existingJobs = await Job.find({company,title});
        const duplicate = existingJobs.find((job)=>normalizeUrl(job.applyLink)===normalizedLink);

        if(duplicate){
            return res.status(409).json({
                message:"This job has already been posted on jobSphere.",
                existingJobId : duplicate._id,
            })
        }

        const job = await Job.create({
            title,company,description,applyLink,location,
            skills : skills || [],
            salary : salary || undefined,
            postedBy:req.user?._id,
            room,
            requirements:requirements || [],
            deadline : deadline || undefined ,
        })

        const roomMembers = await RoomMembership.find({
            room:job.room,
            status:"approved",
            user:{$ne: req.user?._id},
        });

        const notifications = roomMembers.map((member) => ({
            user: member.user,
            type: "new_job" as const,
            title: "New job posted",
            message: `${job.title} at ${job.company} was just posted`,
            link: `/jobs/${job._id}`,
        }));

        if(notifications.length>0){
            await Notification.insertMany(notifications);
        }

        res.status(201).json({job});
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const getJobs = async(req:Request,res:Response)=>{
    try {
        const {search, location, page = "1", limit = "9"} = req.query;
 
        const pageNum = Math.max(parseInt(page as string) || 1, 1);
        const limitNum = Math.max(parseInt(limit as string) || 9, 1);
        const skip = (pageNum - 1) * limitNum;
 
        const publicRooms = await RoomMembership.find({isPublic:true}).select("_id");
        const myApprovedMemberships = await RoomMembership.find({
            user : req.user?._id,
            status : "approved",
        }).select("room");
 
        const accessibleRoomIds = [
            ...publicRooms.map((r)=>r._id),
            ...myApprovedMemberships.map((m)=>m.room)
        ];
 
        const filter:any={room : { $in: accessibleRoomIds}};
 
        if(location) filter.location = location;
 
        if (search){
            const regex = new RegExp(search as string, "i");
            filter.$or = [
                { title: regex },
                { company: regex },
                { skills: regex },
            ];
        }
 
        const [jobs, total] = await Promise.all([
            Job.find(filter).sort({createdAt:-1}).skip(skip).limit(limitNum),
            Job.countDocuments(filter),
        ]);
 
        const hasMore = skip + jobs.length < total;
 
        res.status(200).json({ jobs, hasMore, total, page: pageNum });
 
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

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