import { Building2, IndianRupee, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Job } from "../types/job.types";

export default function JobCard({ job }: { job: Job }) {
  const navigate = useNavigate();
  const timeAgo = (datestr: string) => {
    const diff = Date.now() - new Date(datestr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days == 0) return "Today";
    if (days == 1) return "1 day ago";
    return `${days} days ago`;
  };

  return (
    <div
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Building2 size={20} className="text-indigo-600" />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {timeAgo(job.createdAt)}
        </span>
      </div>

      <h3 className="font-display font-bold text-slate-900 text-lg mb-1 group-hover:text-indigo-600 transition-colors">
        {job.title}
      </h3>
      <p className="text-sm font-medium text-slate-600 mb-3">{job.company}</p>

      <p className="text-sm text-slate-500 line-clamp-2 mb-4">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={13} />
          {job.location}
        </div>
        {job.salary && (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
            <IndianRupee size={12} />
            {job.salary.replace("₹", "")}
          </div>
        )}
      </div>
    </div>
  );
}
