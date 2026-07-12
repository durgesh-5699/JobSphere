//match result types
export interface MatchResult {
  matchPercent: number;
  matchedPoints: string[];
  missingPoints: string[];
}

export interface Recommendation {
  jobId: string;
  matchPercent: number;
  reason: string;
  job: Job;
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

export interface FetchJobsResponse {
  jobs: Job[];
  total: number;
  hasMore: boolean;
  page: number;
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

//analytics types
export interface RoomAnalytics {
  totalMembers: number;
  totalJobs: number;
  totalApplications: number;
  jobsOverTime: { date: string; jobs: number }[];
  memberGrowth: { date: string; members: number }[];
  topPosters: { name: string; count: number }[];
  topJobs: { title: string; company: string; applications: number }[];
}

//application types
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

//profile types
export interface Project {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface Education {
    degree : string;
    institution : string;
    year:string;
}

export interface Experience {
    role:string;
    company :string;
    duration:string;
    description:string;
}

export interface ParsedResumeData {
  bio: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: string[];
  education: { degree: string; institution: string; year: string }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  projects: { title: string; description: string; techStack: string[]; link: string }[];
}

export interface Profile {
  _id: string;
  user: string;
  phone?: string;
  bio?: string;
  location?: string;
  education: Education[];
  experience: Experience[];
  projects : Project[];
  skills: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
}

//room types
export interface Room {
  _id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  owner: string;
  createdAt: string;
}

export interface RoomMembership {
  _id: string;
  room: string;
  user: { _id: string; name: string; email: string };
  status: "pending" | "approved" | "rejected";
}

export interface RoomMember {
  _id: string;
  user: { _id: string; name: string; email: string };
}

//user types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  checkAuth: () => Promise<void>;
}