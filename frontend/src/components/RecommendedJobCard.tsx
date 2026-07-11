import { useNavigate } from "react-router-dom";
import { Building2, MapPin } from "lucide-react";
import type { Recommendation } from "../types/types.ts";

export default function RecommendedJobCard({ rec }: { rec: Recommendation }){
  const navigate = useNavigate();
  const { job, matchPercent, reason } = rec;

  const ringColor = matchPercent >= 70 ? "#16a34a" : matchPercent >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div
      onClick={() => navigate(`/jobs/${job._id}`)}
      className="shrink-0 w-72 cursor-pointer bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-slate-900 text-sm truncate">{job.title}</h3>
          <p className="text-xs text-slate-500 truncate">{job.company}</p>
        </div>
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle
              cx="20" cy="20" r="16" fill="none" stroke={ringColor} strokeWidth="4"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 - (matchPercent / 100) * 2 * Math.PI * 16}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
            {matchPercent}%
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{reason}</p>

      <div className="flex items-center gap-1 text-xs text-slate-400">
        <MapPin size={11} />
        {job.location}
      </div>
    </div>
  );
};