import { Link } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";
import JobCard from "../components/jobCard";
import { useEffect, useState } from "react";
import type { Job } from "../types/job.types";
import { fetchMyJobs } from "../services/jobService";

export default function MyJobs(){
  const [myJobs,setMyJobs] = useState<Job[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    loadMyJobs();
  },[])

  const loadMyJobs=async()=>{
    try{
      const data = await fetchMyJobs();
      setMyJobs(data);
    }catch(err:any){
      console.log("failed to load your jobs",err.message);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
              Jobs you've posted
            </h1>
            <p className="text-slate-500">
              {myJobs.length} {myJobs.length === 1 ? "role" : "roles"} shared so far
            </p>
          </div>
          <Link
            to="/post-job"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Post a job
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500 text-center py-20">Loading...</p>
        ) : myJobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">You haven't posted any jobs yet.</p>
            <Link
              to="/post-job"
              className="text-indigo-600 font-semibold hover:underline text-sm"
            >
              Post your first job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
