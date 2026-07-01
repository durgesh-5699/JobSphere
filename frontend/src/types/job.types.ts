export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  applyLink: string;
  location: string;
  skills: string[];
  salary?: string;
  postedBy: string;
  createdAt: string;
}

export interface JobFilters {
  location?: string;
  skill?: string;
  company?: string;
}