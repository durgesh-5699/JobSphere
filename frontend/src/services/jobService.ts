import axios from "axios";
import type { Job } from "../types/types.ts";

export const fetchJobs = async (params: {search?: string;location?: string;page?: number;limit?: number;})=>{
  const res = await axios.get("/api/jobs", { params });
  return res.data;
};

export const fetchJobLocations = async () => {
  const res = await axios.get("/api/jobs/locations");
  return res.data;
};

export const fetchJobById =async(id:string):Promise<Job>=>{
    const res = await axios.get(`/api/jobs/${id}`);
    return res.data.job;
}

export const fetchMyJobs = async():Promise<Job[]>=>{
    const res = await axios.get("/api/jobs/my-jobs");
    return res.data.jobs;
}

export const createJob = async(jobData: Omit<Job, "_id" | "postedBy" | "createdAt"> & { room: string ; requirements?:string[]}):Promise<Job>=>{
    const res = await axios.post("/api/jobs",jobData);
    return res.data.job ;
}

export const deleteJob = async(id:string):Promise<void>=>{
    await axios.delete(`/api/jobs/${id}`);
}