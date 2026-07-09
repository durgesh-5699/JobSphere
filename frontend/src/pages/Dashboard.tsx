import { GraduationCap, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import JobCard from "../components/jobCard";
import { useCallback, useEffect, useRef, useState } from "react";
import FilterBar from "../components/FilterBar";
import type { Job } from "../types/job.types";
import { fetchJobs, fetchJobLocations } from "../services/jobService";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const LIMIT = 9;

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);        // initial / filter-change load
  const [loadingMore, setLoadingMore] = useState(false); // subsequent page loads
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState<string[]>([]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchJobLocations()
      .then((data) => setLocations(data.locations))
      .catch((err) => console.log("failed to fetch locations", err.message));
  }, []);

  useEffect(() => {
    loadJobs(1, true);
  }, [debouncedSearch, location]);

  const loadJobs = async (pageToLoad: number, isNewFilter: boolean = false) => {
    try {
      isNewFilter ? setLoading(true) : setLoadingMore(true);

      const data = await fetchJobs({
        search: debouncedSearch,
        location,
        page: pageToLoad,
        limit: LIMIT,
      });

      setJobs((prev) => (isNewFilter ? data.jobs : [...prev, ...data.jobs]));
      setHasMore(data.hasMore);
      setTotal(data.total);
      setPage(pageToLoad);

    } catch (err: any) {
      console.log("failed to fetch jobs", err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const lastJobRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadJobs(page + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore, page, debouncedSearch, location]
  );

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <div className="inline-flex items-center gap-2 bg-[#FBF3E3] border border-[#EADFC4] rounded-full px-4 py-1.5 mb-4">
            <GraduationCap size={13} className="text-[#C08B2C]" />
            <span className="font-mono text-[11px] font-semibold text-[#8A6316] tracking-[0.1em]">
              {total} OPEN ROLES
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
            search={search}
            setSearch={setSearch}
            location={location}
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
        ) : jobs.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {jobs.map((job, i) => {
                const isLast = i === jobs.length - 1;
                return (
                  <motion.div
                    key={job._id}
                    ref={isLast ? lastJobRef : undefined}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={Math.min(i, 8)}
                  >
                    <JobCard job={job} />
                  </motion.div>
                );
              })}
            </div>

            {loadingMore && (
              <div className="flex justify-center py-8">
                <span className="w-5 h-5 rounded-full border-2 border-[#12151C]/20 border-t-[#2F5D50] animate-spin" />
              </div>
            )}

            {!hasMore && !loadingMore && (
              <p className="text-center text-xs font-mono text-[#12151C]/35 uppercase tracking-[0.1em] py-8">
                You've reached the end
              </p>
            )}
          </>
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