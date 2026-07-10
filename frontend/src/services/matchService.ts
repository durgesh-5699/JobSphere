import axios from "axios"
import type { MatchResult } from "../types/types"

export const fetchJobMatch=async(jobId:string):Promise<MatchResult>=>{
    const res = await axios.get(`/api/jobs/${jobId}/match`);
    return res.data ;
}