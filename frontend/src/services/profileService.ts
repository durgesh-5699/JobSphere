import axios from "axios";
import type { Profile } from "../types/profile.type";

export const fetchMyProfile=async():Promise<Profile>=>{
    const res = await axios.get("/api/profile/me");
    return res.data.profile ;
};

export const updateMyProfile=async(data:Partial<Profile>):Promise<Profile>=>{
    const res = await axios.put("/api/profile/me",data);
    return res.data.profile;
}

export const uploadResume=async(file:File):Promise<Profile>=>{
    const formData = new FormData();
    formData.append("resume",file);

    const res = await axios.post("/api/profile/resume",formData,{
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.profile;
}