import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import JobCard from "../components/jobCard.tsx";
import { fetchMyBookmarks } from "../services/bookmarkService";
import type { Job } from "../types/types.ts";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function SavedJobs(){
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    try {
      setLoading(true);
      const bookmarks = await fetchMyBookmarks();
      setJobs(bookmarks.map((b) => b.job));
    } catch (err) {
      console.error("Failed to fetch saved jobs", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-semibold text-[#12151C] tracking-tight mb-2">
            Saved Jobs
          </h1>
          <p className="text-[#12151C]/55">
            <span className="font-mono">{jobs.length}</span>{" "}
            {jobs.length === 1 ? "job" : "jobs"} saved for later
          </p>
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
        ) : jobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job, i) => (
              <motion.div key={job._id} variants={fadeUp} initial="hidden" animate="show" custom={i}>
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="text-center py-20 bg-white border border-[#E4E2DC] rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-[#EAF1EE] flex items-center justify-center mx-auto mb-4">
              <Bookmark size={18} className="text-[#2F5D50]" />
            </div>
            <p className="text-[#12151C]/55 mb-4">You haven't saved any jobs yet.</p>
            <Link
              to="/"
              className="text-[#2F5D50] font-semibold hover:text-[#12151C] transition-colors text-sm"
            >
              Browse open roles
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};