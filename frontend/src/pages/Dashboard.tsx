import { GraduationCap, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import JobCard from "../components/jobCard";
import { useEffect, useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import type { Job } from "../types/job.types";
import { fetchJobs } from "../services/jobService";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Dashboard() {
  const [jobs,setJobs] = useState<Job[]>([])
  const [loading,setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  useEffect(()=>{
    loadJobs();
  },[])

  const loadJobs = async()=>{
    try {
    setLoading(true);
      const data = await fetchJobs();
      setJobs(data);
    }catch(err:any){
      console.log("faild to fecth jobs",err.message); 
    }finally{
      setLoading(false);
    }
  };

  const locations = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.location))),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        search === "" ||
        job.title.toLowerCase().includes((search ?? "").toLowerCase()) ||
        job.skills.some((s) =>
          s.toLowerCase().includes((search ?? "").toLowerCase()),
        );
        const matchesLocation = location === "" || job.location === location;
        return matchesSearch && matchesLocation;
    });
  }, [search, location,jobs]);

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <div className="inline-flex items-center gap-2 bg-[#FBF3E3] border border-[#EADFC4] rounded-full px-4 py-1.5 mb-4">
            <GraduationCap size={13} className="text-[#C08B2C]" />
            <span className="font-mono text-[11px] font-semibold text-[#8A6316] tracking-[0.1em]">
              {jobs.length} OPEN ROLES
            </span>
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#12151C] tracking-tight mb-2">
            Openings shared by your friends
          </h1>
          <p className="text-[#12151C]/55 mb-8">
            Spotted by students, verified before it hits the board.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
          <FilterBar
            search={search!}
            setSearch={setSearch}
            location={location!}
            setLocation={setLocation}
            locations={locations}
          />
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-white border border-[#E4E2DC] overflow-hidden relative"
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-[#F6F5F2] to-transparent" />
              </div>
            ))}
            <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
          </div>
        ): filteredJobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job._id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={i}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center py-24"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF1EE] flex items-center justify-center mb-4">
              <SearchX size={20} className="text-[#2F5D50]" />
            </div>
            <p className="font-display font-semibold text-[#12151C] mb-1">No roles match your search</p>
            <p className="text-sm text-[#12151C]/45">Try clearing a filter or searching a different skill.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}