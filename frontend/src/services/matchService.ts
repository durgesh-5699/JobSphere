import axios from "axios"
import type { MatchResult, Recommendation } from "../types/types"

export const fetchJobMatch=async(jobId:string):Promise<MatchResult>=>{
    const res = await axios.get(`/api/jobs/${jobId}/match`);
    return res.data ;
}

export const fetchRecommendedJobs = async (): Promise<{recommendations: Recommendation[];profileIncomplete?: boolean;}> => {
  const res = await axios.get("/api/jobs/recommended");
  return res.data;
};