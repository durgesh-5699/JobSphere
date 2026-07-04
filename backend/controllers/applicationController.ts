import type { Request, Response } from "express";
import Application from "../models/applicationModel";

export const applyToJob = async(req:Request,res:Response)=>{
    try {
        const {jobId} = req.body;
        if(!jobId){
            return res.status(400).json({ message: "Job ID is required" });
        }

        const existing = await Application.findOne({user:req.user?._id,job:jobId});
        if(existing){
            return res.status(200).json({ application: existing });
        }

        const application = await Application.create({user:req.user?._id,job:jobId});

        res.status(201).json({application});

    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}

export const getMyApplication = async(req:Request,res:Response)=>{
    try {
        const applications = await Application.find({user:req.user?._id}).populate("job");
        res.status(200).json({ applications });
    }catch(err:any){
        res.status(500).json({ message: `Error: ${err.message}` });
    }
}