import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  ExternalLink,
  IndianRupee,
  MapPin,
  Trash2,
  X,
  Sparkles,
  Clock,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useApplications from "../context/useApplication";
import { useEffect, useState } from "react";
import type { Job } from "../types/job.types";
import { fetchJobById, deleteJob } from "../services/jobService";
import useAuth from "../context/useAuth";
import type { MatchResult } from "../types/types";
import { fetchJobMatch } from "../services/matchService";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isApplied, applyToJob } = useApplications();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const [match, setMatch] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  useEffect(() => {
    if (job?._id) loadMatch(job._id);
  }, [job?._id]);

  const loadMatch = async (jobId: string) => {
    try {
      setMatchLoading(true);
      const result = await fetchJobMatch(jobId);
      setMatch(result);
    } catch (err: any) {
      console.error("Failed to fetch match score", err);
    } finally {
      setMatchLoading(false);
    }
  };

  const isOwner = job && user && job.postedBy === user.id;

  useEffect(() => {
    if (id) loadJob(id);
  }, [id]);

  const loadJob = async (jobId: string) => {
    try {
      const data = await fetchJobById(jobId);
      setJob(data);
    } catch (err: any) {
      console.log("failed to load Job", err.message);
    } finally {
      setLoading(false);
    }
  };

  const applied = job ? isApplied(job._id) : false;

  const handleApply = async () => {
    if (!job) return;
    if (!applied) {
      await applyToJob(job._id);
    }

    window.open(job.applyLink, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async () => {
    if (!job) return;
    const confirmed = window.confirm("Delete this job posting? This can't be undone.");
    if (!confirmed) return;
    try {
      await deleteJob(job._id);
      navigate("/my-jobs");
    } catch (err: any) {
      console.error("Failed to delete job", err);
      alert("Failed to delete job. Try again.");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#F6F5F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#12151C]/50">
          <span className="w-4 h-4 rounded-full border-2 border-[#12151C]/20 border-t-[#2F5D50] animate-spin" />
          <span className="font-mono text-xs tracking-[0.15em] uppercase">Loading</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-[#12151C]/50 mb-4">This job posting doesn't exist.</p>
        <Link to="/" className="text-[#2F5D50] font-semibold hover:text-[#12151C] transition-colors">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.button
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-medium text-[#12151C]/50 hover:text-[#12151C] transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to jobs
          </motion.button>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-5"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#EAF1EE] flex items-center justify-center flex-shrink-0">
                  <Building2 size={24} className="text-[#2F5D50]" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-semibold text-[#12151C] tracking-tight">
                    {job.title}
                  </h1>
                  <p className="text-[#12151C]/60 font-medium">{job.company}</p>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#B3413A] border border-[#F0CFC9] bg-[#FBEAE8] hover:bg-[#F5DBD6] px-4 py-2 rounded-xl transition-colors flex-shrink-0"
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-[#12151C]/55">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                {job.location}
              </div>
              {job.salary && (
                <div className="flex items-center gap-1.5 font-mono text-[#8A6316]">
                  <IndianRupee size={14} />
                  {job.salary.replace("₹", "")}
                </div>
              )}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <Calendar size={14} className="text-[#12151C]/55" />
                Posted {formatDate(job.createdAt)}
              </div>
              {job.deadline && (
                <div className={`flex items-center gap-1.5 font-semibold ${
                  new Date(job.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 ? "text-red-600" : "text-slate-500"
                }`}>
                  <Clock size={14} />
                  Apply by {new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="font-mono text-[11px] font-medium text-[#2F5D50] bg-[#EAF1EE] px-2.5 py-1.5 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-colors bg-[#12151C] hover:bg-[#2F5D50] text-white"
              >
                Apply now
                <ExternalLink size={16} />
              </motion.button>

              {applied && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F5D50] bg-[#EAF1EE] px-2.5 py-1.5 rounded-full">
                  <Check size={12} />
                  Applied
                </span>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8"
          >
            <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4">
              Job description
            </p>
            <p className="text-[#12151C]/70 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-7 sticky top-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#EAF1EE] flex items-center justify-center flex-shrink-0">
                <Sparkles size={15} className="text-[#2F5D50]" />
              </div>
              <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">
                Your match
              </p>
            </div>

            {matchLoading ? (
              <div className="flex items-center gap-3 text-[#12151C]/50 py-6 justify-center">
                <span className="w-4 h-4 rounded-full border-2 border-[#12151C]/20 border-t-[#2F5D50] animate-spin" />
                <span className="font-mono text-xs tracking-[0.1em] uppercase">Analyzing</span>
              </div>
            ) : match ? (
              <>
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#EDEBE5" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={
                        match.matchPercent >= 70
                          ? "#2F5D50"
                          : match.matchPercent >= 40
                          ? "#8A6316"
                          : "#B3413A"
                      }
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={
                        2 * Math.PI * 42 - (match.matchPercent / 100) * 2 * Math.PI * 42
                      }
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-3xl font-semibold text-[#12151C]">
                      {match.matchPercent}%
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#12151C]/40">
                      fit score
                    </span>
                  </div>
                </div>

                {match.matchedPoints.length > 0 && (
                  <div className="mb-5">
                    <p className="font-mono text-[10px] font-semibold text-[#2F5D50] uppercase tracking-[0.15em] mb-2.5">
                      Matches
                    </p>
                    <ul className="space-y-2">
                      {match.matchedPoints.map((point, i) => (
                        <li
                          key={i}
                          className="text-[13px] text-[#12151C]/70 leading-snug flex gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#EAF1EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={10} className="text-[#2F5D50]" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {match.missingPoints.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] font-semibold text-[#B3413A] uppercase tracking-[0.15em] mb-2.5">
                      Gaps
                    </p>
                    <ul className="space-y-2">
                      {match.missingPoints.map((point, i) => (
                        <li
                          key={i}
                          className="text-[13px] text-[#12151C]/70 leading-snug flex gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#FBEAE8] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X size={10} className="text-[#B3413A]" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[#12151C]/40 text-center py-6">
                Couldn't calculate match right now.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}