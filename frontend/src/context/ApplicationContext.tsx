import { createContext, useState } from "react";

interface ApplicationContextType {
    appliedJobIds : string[];
    applyToJob: (jobId:string)=>void;
    isApplied : (jobId:string)=>boolean;
}

export const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider=({children}:{children:React.ReactNode})=>{

    const [appliedJobIds,setAppliedJobIds] = useState<string[]>([]);

    const applyToJob=(jobId:string)=>{  
        if(!appliedJobIds.includes(jobId)){
            setAppliedJobIds([...appliedJobIds,jobId]);
        }
    }
    const isApplied =(jobId:string)=> appliedJobIds.includes(jobId);

    return <ApplicationContext.Provider value={{appliedJobIds,applyToJob,isApplied}}>
        {children}
    </ApplicationContext.Provider>
}