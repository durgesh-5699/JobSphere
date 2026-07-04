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
import useApplications from "../context/useApplication";
import { useEffect, useState } from "react";
import type { Job } from "../types/job.types";
import { fetchJobById, deleteJob } from "../services/jobService";
import useAuth from "../context/useAuth";

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
    await applyToJob(job._id);
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
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500 mb-4">This job posting doesn't exist.</p>
        <Link to="/" className="text-indigo-600 font-semibold hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to jobs
        </button>

        {/* Header card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Building2 size={26} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  {job.title}
                </h1>
                <p className="text-slate-600 font-medium">{job.company}</p>
              </div>
            </div>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors flex-shrink-0"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              {job.location}
            </div>
            {job.salary && (
              <div className="flex items-center gap-1.5">
                <IndianRupee size={14} />
                {job.salary.replace("₹", "")}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              Posted {formatDate(job.createdAt)}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Apply button */}
          <button
            onClick={handleApply}
            disabled={applied}
            className={`inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl transition-colors ${
              applied
                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {applied ? (
              <>
                <Check size={16} />
                Applied
              </>
            ) : (
              <>
                Apply now
                <ExternalLink size={16} />
              </>
            )}
          </button>
        </div>

        {/* Description card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
            Job Description
          </h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>
      </div>
    </div>
  );
}