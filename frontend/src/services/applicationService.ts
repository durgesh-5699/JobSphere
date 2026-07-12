import axios from "axios";
import type { Application } from "../types/types.ts";

export const applyToJobAPI =async(jobId:string):Promise<Application>=>{
    const res = await axios.post("/api/applications",{jobId});
    return res.data.application ;
}

export const fetchMyApplicaions = async():Promise<Application[]>=>{
    const res = await axios.get("/api/applications/me");
    return res.data.applications ;
}