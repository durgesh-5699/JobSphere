import { GraduationCap } from "lucide-react";
import JobCard from "../components/jobCard";
import { useEffect, useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import type { Job } from "../types/job.types";
import { fetchJobs } from "../services/jobService";

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
    [],
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
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
          <GraduationCap size={14} className="text-amber-500" />
          <span className="text-xs font-semibold text-indigo-700 tracking-wide">
            {jobs.length} OPEN ROLES
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">
          Openings shared by your Friends
        </h1>
        <p className="text-slate-500 mb-8">
          Spotted by students, verified before it hits the board.
        </p>

        {/* Filters */}
        <FilterBar
          search={search!}
          setSearch={setSearch}
          location={location!}
          setLocation={setLocation}
          locations={locations}
        />

        {/* Job grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-500">Loading jobs...</p>
          </div>
        ): filteredJobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500">No roles match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
