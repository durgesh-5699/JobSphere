import type {Request,Response} from "express"
import Notification from "../models/notificationModel";

export const getMyNotifications = async(req:Request, res:Response)=>{
    try{
       const notifications = await Notification.find({user:req.user?._id}).sort({createdAt:-1}).limit(30);
       res.status(200).json({notifications});
    }catch(err:any){
        res.status(500).json({message:`Error : ${err.message}`})
    }
};

export const getUnreadCount = async(req:Request,res:Response)=>{
    try{
       const count = await Notification.countDocuments({user:req.user?._id, isRead:false});
       res.status(200).json({count}); 
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const markAsRead = async(req:Request, res:Response)=>{
    try{
        const notification = await Notification.findOneAndUpdate(
            {_id: req.params.id, user: req.user?._id },
            {isRead: true },
            {new: true }
        );

        if(!notification){
            return res.status(404).json({ message: "Notification not found" });
        }
        res.status(200).json({ notification });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

export const markAllAsRead = async(req:Request, res:Response)=>{
    try{
        await Notification.updateMany({ user: req.user?._id, isRead: false },{ isRead: true });
        res.status(200).json({ message: "All marked as read" });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}
