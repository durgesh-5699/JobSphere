import { Link } from "react-router-dom";
import { Briefcase, Plus } from "lucide-react";
import { motion } from "framer-motion";
import JobCard from "../components/jobCard";
import { useEffect, useState } from "react";
import type { Job } from "../types/job.types";
import { deleteJob, fetchMyJobs } from "../services/jobService";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

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

  const handleDelete = async(jobId:string)=>{
    const confirmed = window.confirm("Delete this job posting? This can't be undone.");
    if(!confirmed) return ;
    try{
      await deleteJob(jobId);
      setMyJobs((prev)=>prev.filter((job)=>job._id!=jobId));
    }catch(err:any){
      console.error("Failed to delete job", err);
      alert("Failed to delete job. Try again.");
    }
  }

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="flex items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-semibold text-[#12151C] tracking-tight mb-2">
              Jobs you've posted
            </h1>
            <p className="text-[#12151C]/55">
              <span className="font-mono">{myJobs.length}</span>{" "}
              {myJobs.length === 1 ? "role" : "roles"} shared so far
            </p>
          </div>
          <Link
            to="/post-job"
            className="flex items-center gap-2 bg-[#12151C] hover:bg-[#2F5D50] text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors shrink-0"
          >
            <Plus size={16} />
            Post a job
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-white border border-[#E4E2DC] overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-[#F6F5F2] to-transparent" />
              </div>
            ))}
            <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
          </div>
        ) : myJobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myJobs.map((job, i) => (
              <motion.div key={job._id} variants={fadeUp} initial="hidden" animate="show" custom={i}>
                <JobCard job={job} onDelete={handleDelete}/>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-center py-20 bg-white border border-[#E4E2DC] rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF1EE] flex items-center justify-center mx-auto mb-4">
              <Briefcase size={18} className="text-[#2F5D50]" />
            </div>
            <p className="text-[#12151C]/55 mb-4">You haven't posted any jobs yet.</p>
            <Link
              to="/post-job"
              className="text-[#2F5D50] font-semibold hover:text-[#12151C] transition-colors text-sm"
            >
              Post your first job
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};