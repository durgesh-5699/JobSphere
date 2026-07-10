import axios from "axios";
import type { ParsedJobData } from "../types/types.ts";

export const parseJobInput=async(input:string):Promise<ParsedJobData>=>{
    const res = await axios.post("/api/ai/parse-job",{input});
    return res.data.data;
}