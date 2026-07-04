import axios from "axios";
import type { Job } from "../types/job.types";

export const fetchJobs = async(search?:string , location?:string):Promise<Job[]>=>{
    const params :Record<string,string>={};
    if(search) params.search = search;
    if(location) params.location = location;

    const res = await axios.get("/api/jobs",{params});
    return res.data.jobs;
}

export const fetchJobById =async(id:string):Promise<Job>=>{
    const res = await axios.get(`/api/jobs/${id}`);
    return res.data.job;
}

export const fetchMyJobs = async():Promise<Job[]>=>{
    const res = await axios.get("/api/jobs/my-jobs");
    return res.data.jobs;
}

export const createJob = async(jobData:Omit<Job,"_id" | "postedBy" | "createdAt">):Promise<Job>=>{
    const res = await axios.post("/api/jobs",jobData);
    return res.data.job ;
}

export const deleteJob = async(id:string):Promise<void>=>{
    await axios.delete(`/api/jobs/${id}`);
}