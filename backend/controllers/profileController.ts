import type {Request,Response} from "express"
import Profile from "../models/profileModel";
import cloudinary from "../config/cloudinary";

export const getMyProfile = async(req:Request,res:Response)=>{
    try{
       let profile = await Profile.findOne({user:req.user?._id});
       
       if(!profile){
        profile = await Profile.create({user:req.user?._id});
       }
       res.status(200).json({profile});

    }catch(err:any){
        res.status(500).json({message:`Error : ${err.message}`});
    }
}

export const updateMyProfile=async(req:Request,res:Response)=>{
    try {
        const {phone,bio,location,education,experience,skills,linkedin,github,portfolio,} = req.body;

        const profile = await Profile.findOneAndUpdate(
            {user:req.user?._id},
            {phone,bio,location,education,experience,skills,linkedin,github,portfolio},
            {new:true, upsert:true}
        );
    res.status(200).json({profile});

    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const uploadResume = async(req:Request,res:Response)=>{
    try{
        if(!req.file){
            return res.status(400).json({ message: "Please upload a PDF file" });
        } 

        const uploadResult = await new Promise<any>((resolve,reject)=>{
            const stream = cloudinary.uploader.upload_stream({
                resource_type: "raw",
                folder : "jobSphere-resumes",
                pulic_id : `resume-${req.user?._id}-${Date.now()}`,
            },
            (error,result)=>{
                if(error) reject(error);
                else resolve(result);
            });
            stream.end(req.file!.buffer);
        });

        const profile = await Profile.findOneAndUpdate(
            {user : req.user?._id},
            { resumeUrl: uploadResult.secure_url},
            {new:true,upsert:true}
        );
        res.status(200).json({ profile });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};