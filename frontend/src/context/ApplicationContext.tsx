import { createContext, useEffect, useState } from "react";
import type { Application, ApplicationContextType } from "../types/application.types";
import { applyToJobAPI, fetchMyApplicaions } from "../services/applicationService";
import useAuth from "./useAuth";

export const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider=({children}:{children:React.ReactNode})=>{

    const [appliedJobIds,setAppliedJobIds] = useState<string[]>([]);
    const [loading,setLoading] = useState(true);
    const [applications,setApplications] = useState<Application[]>([]);

    const {user} = useAuth();

    useEffect(()=>{
        if(user){
            loadApplications();
        }else{
            setAppliedJobIds([]);
            setLoading(false);
        }
    },[user]);

    const loadApplications =async()=>{
        try{
            const applications = await fetchMyApplicaions();
            setAppliedJobIds(applications.map((app)=>app.job._id));
            setApplications(applications);
        }catch(err:any){
            console.log("failed to fecth applications", err);
        }finally{
            setLoading(false);
        }
    };

    const applyToJob=async(jobId:string)=>{  
        if(appliedJobIds.includes(jobId)) return ;
        try {
            const appl = await applyToJobAPI(jobId);
            setApplications((prev)=>[...prev,appl]);
            setAppliedJobIds((prev)=>[...prev,jobId]);
        }catch(err){
         console.log("Failed to apply", err);   
        }
    };

    const isApplied =(jobId:string)=> appliedJobIds.includes(jobId);

    return (
    <ApplicationContext.Provider value={{appliedJobIds,applications,applyToJob,isApplied,loading}}>
        {children}
    </ApplicationContext.Provider>
    )
};