import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  ExternalLink,
  IndianRupee,
  MapPin,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { mockJobs } from "../data/mockJobs";
import useApplications from "../context/useApplication";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const job = mockJobs.find((j) => j._id === id);

  const { isApplied, applyToJob } = useApplications();
  const applied = job ? isApplied(job._id) : false;

  const handleApply = () => {
    if (!job) return;
    applyToJob(job._id);
    window.open(job.applyLink, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
                  {job?.title}
                </h1>
                <p className="text-slate-600 font-medium">{job?.company}</p>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} />
              {job?.location}
            </div>
            {job?.salary && (
              <div className="flex items-center gap-1.5">
                <IndianRupee size={14} />
                {job?.salary.replace("₹", "")}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              Posted {formatDate(job!.createdAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} />
              Shared by {job?.postedBy}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {job?.skills.map((skill) => (
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
            {job?.description}
          </p>
        </div>
      </div>
    </div>
  );
}
