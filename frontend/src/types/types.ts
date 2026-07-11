//match result types
export interface MatchResult {
  matchPercent: number;
  matchedPoints: string[];
  missingPoints: string[];
}


//notification types
export interface Notification {
  _id: string;
  type: "join_request" | "request_approved" | "request_rejected" | "new_job" | "deadline_reminder";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}


//jods types
export interface Job {
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
  postedInRooms?: string[];
}

export interface JobFilters {
  location?: string;
  skill?: string;
  company?: string;
}

export interface CreateJobResult{
  created : Job[];
  duplicates : {roomId:string; existingJobId:string}[];
  unauthorized:string[];
}

//ai types
export interface ParsedJobData {
  title: string;
  company: string;
  description: string;
  location: string;
  skills: string[];
  requirements :[];
  salary: string;
  applyLink: string;
  deadline:string;
}