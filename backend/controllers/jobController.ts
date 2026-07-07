import type { Request, Response } from "express";
import Job from "../models/jobModel";
import RoomMembership from "../models/roomMembershipModel";
import Room from "../models/roomModel"

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
        const {title,company,description,applyLink,location,skills,salary,room} = req.body;
        if(!title || !company || !description || !applyLink || !location || !skills || !salary || !room){
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

        const job = await Job.create({title,company,description,applyLink,location,skills : skills || [],salary,postedBy:req.user?._id,room})

        res.status(201).json({job});
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const getJobs = async(req:Request,res:Response)=>{
    try {
        const {search,location} = req.query;
        
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
        
        const jobs = await Job.find(filter).sort({createdAt:-1});
        res.status(200).json({jobs});
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

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