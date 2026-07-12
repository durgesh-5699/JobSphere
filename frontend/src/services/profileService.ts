import axios from "axios";
import type { ParsedResumeData, Profile } from "../types/types.ts";

export const fetchMyProfile=async():Promise<Profile>=>{
    const res = await axios.get("/api/profile/me");
    return res.data.profile ;
};

export const updateMyProfile=async(data:Partial<Profile>):Promise<Profile>=>{
    const res = await axios.put("/api/profile/me",data);
    return res.data.profile;
}

export const uploadResume=async(file:File):Promise<{profile:Profile; parsedData:ParsedResumeData|null}>=>{
    const formData = new FormData();
    formData.append("resume",file);

    const res = await axios.post("/api/profile/resume",formData,{
        headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(res.data);
    return {profile : res.data.profile, parsedData:res.data.parsedData};
}

export const fetchProfileByUserId = async (userId: string): Promise<Profile & { user: { name: string; email: string } }> => {
  const res = await axios.get(`/api/profile/user/${userId}`);
  return res.data.profile;
};