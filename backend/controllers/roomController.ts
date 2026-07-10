import type {Request,Response} from "express";
import Room from "../models/roomModel";
import RoomMembership from "../models/roomMembershipModel";
import Job from "../models/jobModel"
import Notification from "../models/notificationModel";
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createRoom = async(req:Request,res:Response)=>{
    try{
       const {name,description,isPublic} = req.body;
       if(!name || !name.trim() || !description){
        return res.status(400).json({message:"Fill each information"});
       }

       const existing = await Room.findOne({
        name : {$regex : `^${escapeRegex(name.trim())}$`, $options:"i"},
       });

       if (existing) {
            return res.status(409).json({ message: "A room with this name already exists" });
        }

       const room = await Room.create({name,description,isPublic:!!isPublic,owner:req.user?._id});

       await RoomMembership.create({room:room._id, user:req.user?._id, status:"approved"});
       
       res.status(201).json({room});
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const listPublicRooms = async(req:Request,res:Response)=>{
    try{
       const rooms = await Room.find({isPublic:true}).sort({createdAt:-1}); 
       res.status(200).json({rooms});
    }catch(err:any){
        res.status(500).json({message:`Error: ${err.message}`});
    }
};

export const listMyRoooms=async(req:Request,res:Response)=>{
    try{
       const memberships = await RoomMembership.find({
        user: req.user?._id,
        status : "approved",
       }) .populate("room");

       const rooms = memberships.map((m)=>m.room);
       res.status(200).json({rooms});
    }catch(err:any){
        res.status(500).json({message:`Error: ${err.message}`})
    }
};

export const getRoomById = async(req:Request,res:Response)=>{
    try{
       const room = await Room.findById(req.params.id);
       if(!room){
        return res.status(404).json({message:"Room no found"});
       }

       const membership = await RoomMembership.findOne({
        room : room._id,
        user:req.user?._id,
       });

       res.status(200).json({
        room,
        myStatus:membership?.status || null,
       })
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const joinRoom = async(req:Request,res:Response)=>{
    try{
       const room = await Room.findById(req.params.id);
       if(!room){
        return res.status(404).json({message:"Room not found"});
       }
        const existing = await RoomMembership.findOne({
            room : room._id,
            user : req.user?._id,
        });
        
        if(existing){
            return res.status(200).json({membership:existing});
        }

        const membership = await RoomMembership.create({
            room : room._id,
            user :req.user?._id,
            status:room.isPublic ? "approved":"pending",
        });

        if(!room.isPublic){
            await Notification.create({
                user:room.owner,
                type:"join_request",
                title:"New join request",
                message: `${req.user?.name} requested to join "${room.name}"`,
                link: `/rooms/${room._id}`,
            })
        }
        res.status(201).json({membership});
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const getPendingRequest = async(req:Request,res:Response)=>{
    try{
       const room = await Room.findById(req.params.id);
       if(!room){
        return res.status(404).json({message:"Room not found"});
       }

       if(room.owner.toString() !== req.user?._id?.toString()){
        return res.status(403).json({message:"Not authorized"});
       }

       const requests = await RoomMembership.find({
        room : room._id,
        status : "pending",
       }).populate("user","name email");
       res.status(200).json({requests});
    }catch(err:any){
         res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const respondToRequest = async(req:Request,res:Response)=>{
    try{
        const {action} = req.body ;
        const room = await Room.findById(req.params.id);

        if(!room){
            return res.status(404).json({message:"Room not found"});
        }

        if(room.owner.toString() !== req.user?.id?.toString()){
            return res.status(403).json({ message: "Not authorized" });
        }

        const membership = await RoomMembership.findById(req.params.membershipId);
        if(!membership){
            return res.status(404).json({ message: "Request not found" });
        }

        membership.status = action === "approve" ? "approved" : "rejected";
        await membership.save();

        await Notification.create({
            user: membership.user,
            type: action === "approve" ? "request_approved" : "request_rejected",
            title: action === "approve" ? "Request approved!" : "Request rejected",
            message:
                action === "approve"
                ? `Your request to join "${room.name}" was approved`
                : `Your request to join "${room.name}" was rejected`,
                link: `/rooms/${room._id}`,
        });

        res.status(200).json({ membership });

    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const searchRooms = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || (q as string).trim().length < 1) {
      return res.status(200).json({ rooms: [] });
    }

    const regex = new RegExp((q as string).trim(), "i");
    const rooms = await Room.find({ name: regex }).limit(15).sort({ createdAt: -1 });

    res.status(200).json({ rooms });
  } catch (err: any) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const getRoomMembers=async(req:Request, res:Response)=>{
  try{
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const members = await RoomMembership.find({
      room: room._id,
      status: "approved",
    }).populate("user", "name email");

    res.status(200).json({ members });
  }catch(err:any){
    res.status(500).json({ message: `Error: ${err.message}` });
  }
};

export const updateRoom = async(req:Request,res:Response)=>{
    try {
        const room = await Room.findById(req.params.id);
        if(!room){
            return res.status(404).json({ message: "Room not found" });
        }
        if(room.owner.toString() !== req.user?._id?.toString()){
            return res.status(403).json({ message: "Not authorized" });
        }

        const {name,description,isPublic} = req.body;

        if(name && name.trim() !== room.name){
            const duplicate = await Room.findOne({
            _id: { $ne: room._id },    
            name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
        });
        if(duplicate){
            return res.status(409).json({ message: "A room with this name already exists" });
        }
        room.name = name.trim();
        }

        if(description !== undefined) room.description = description;
        if(isPublic !== undefined) room.isPublic = !!isPublic;

        await room.save();
        res.status(200).json({ room });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const removeMember = async(req:Request,res:Response)=>{
    try{
        const room = await Room.findById(req.params.id);
        if (!room){
            return res.status(404).json({ message: "Room not found" });
        }
        if(room.owner.toString() !== req.user?._id?.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const membership = await RoomMembership.findById(req.params.membershipId);
        if(!membership){
            return res.status(404).json({ message: "Member not found" });
        }

        if(membership.user.toString() === room.owner.toString()){
            return res.status(400).json({ message: "Owner cannot be removed from their own room" });
        }

        await membership.deleteOne();
        res.status(200).json({ message: "Member removed" });
    }catch(err:any){
         res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const getRoomJobs = async(req:Request,res:Response)=>{
    try{
       const room = await Room.findById(req.params.id);
       if(!room){
            return res.status(404).json({ message: "Room not found" });
       }

       if(!room.isPublic){
         const membership = await RoomMembership.findOne({
         room: room._id,
         user: req.user?._id,
         status: "approved",
        });

        if(!membership){
            return res.status(403).json({ message: "Not authorized to view this room's jobs" });
        }
        }

        const jobs = await Job.find({ room: room._id }).sort({ createdAt: -1 });
        res.status(200).json({ jobs });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}