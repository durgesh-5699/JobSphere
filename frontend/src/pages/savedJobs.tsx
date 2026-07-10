import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import JobCard from "../components/jobCard.tsx";
import { fetchMyBookmarks } from "../services/bookmarkService";
import type { Job } from "../types/types.ts";

export default function  SavedJobs(){
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
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Saved Jobs</h1>
        <p className="text-slate-500 mb-8">
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"} saved for later
        </p>

        {loading ? (
          <p className="text-slate-500 text-center py-20">Loading...</p>
        ) : jobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Bookmark size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">You haven't saved any jobs yet.</p>
            <Link to="/" className="text-indigo-600 font-semibold hover:underline text-sm">
              Browse open roles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
