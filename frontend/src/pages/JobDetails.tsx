import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  ExternalLink,
  IndianRupee,
  MapPin,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useApplications from "../context/useApplication";
import { useEffect, useState } from "react";
import type { Job } from "../types/job.types";
import { fetchJobById, deleteJob } from "../services/jobService";
import useAuth from "../context/useAuth";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const},
  }),
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isApplied, applyToJob } = useApplications();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = job && user && job.postedBy === user._id;

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

    // Sirf pehli baar applyToJob call karo (application record banane ke liye).
    // Agar already applied hai, seedha link khol do — dobara track nahi karna.
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
      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.button
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#12151C]/50 hover:text-[#12151C] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to jobs
        </motion.button>

        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={1}
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
          variants={fadeUp} initial="hidden" animate="show" custom={2}
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
    </div>
  );
}