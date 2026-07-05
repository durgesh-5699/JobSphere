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