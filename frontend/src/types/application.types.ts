export interface Application {
    id: string;
    job: {
    _id: string;
    title: string;
    company: string;
    description: string;
    applyLink: string;
    location: string;
    skills: string[];
    requirements:string[];
    salary?: string;
    postedBy: string;
    createdAt: string;
    deadline?:string;
  };
  appliedAt: string;
}

export interface ApplicationContextType {
    appliedJobIds : string[];
    applications : Application[];
    applyToJob: (jobId:string)=>void;
    isApplied : (jobId:string)=>boolean;
    loading:boolean;
}