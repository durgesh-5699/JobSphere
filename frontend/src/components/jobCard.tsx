import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Building2,
  IndianRupee,
  Trash2,
  Clock,
  BookmarkCheck,
  Bookmark,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Job } from "../types/types.ts";
import useApplications from "../context/useApplication";
import { useBookmarks } from "../context/useBookmark.ts";
import { Users2 } from "lucide-react";

interface JobCardProps {
  job: Job;
  onDelete?: (jobId: string) => void;
}

export default function JobCard({ job, onDelete }: JobCardProps) {
  const navigate = useNavigate();
  const { isApplied } = useApplications();
  const applied = isApplied(job._id);

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(job._id);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(job._id);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(job._id);
  };

  const daysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = daysUntilDeadline(job.deadline);

  return (
    <motion.div
      onClick={() => navigate(`/jobs/${job._id}`)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-full cursor-pointer bg-white border border-[#E4E2DC] rounded-2xl p-5 hover:border-[#2F5D50]/30 hover:shadow-[0_16px_32px_-16px_rgba(18,21,28,0.18)] transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-11 h-11 rounded-xl bg-[#EAF1EE] flex items-center justify-center">
          <Building2 size={19} className="text-[#2F5D50]" />
        </div>

        <div className="flex items-start gap-2">
          <div className="flex flex-col items-end gap-1">
            {applied && (
              <span className="text-[10px] font-mono font-semibold tracking-wide text-[#2F5D50] bg-[#EAF1EE] px-2 py-0.5 rounded-full">
                APPLIED
              </span>
            )}
            <span className="font-mono text-[11px] text-[#12151C]/35">
              {timeAgo(job.createdAt)}
            </span>
          </div>

          <button
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked
                ? "text-amber-500"
                : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
            }`}
            aria-label="Bookmark"
          >
            {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>

          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded-lg text-[#12151C]/30 hover:text-[#B3413A] hover:bg-[#FBEAE8] transition-colors"
              aria-label="Delete job"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      <h3 className="font-display font-semibold text-[#12151C] text-lg mb-1 group-hover:text-[#2F5D50] transition-colors pr-6">
        {job.title}
      </h3>
      <p className="text-sm font-medium text-[#12151C]/60 mb-3">
        {job.company}
      </p>

      <p className="text-sm text-[#12151C]/50 line-clamp-2 mb-4">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="font-mono text-[11px] font-medium text-[#2F5D50] bg-[#EAF1EE] px-2 py-1 rounded-md"
          >
            {skill}
          </span>
        ))}
      </div>

      {daysLeft !== null && daysLeft >= 0 && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold mb-3 ${
            daysLeft <= 3 ? "text-red-600" : "text-slate-500"
          }`}
        >
          <Clock size={12} />
          {daysLeft === 0
            ? "Closes today!"
            : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left to apply`}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-[#EDEBE5]">
        <div className="flex items-center gap-1.5 text-xs text-[#12151C]/50">
          <MapPin size={13} />
          {job.location}
        </div>
        {job.salary && (
          <div className="flex items-center gap-1 font-mono text-xs font-semibold text-[#8A6316] bg-[#FBF3E3] px-2 py-0.5 rounded-md">
            <IndianRupee size={12} />
            {job.salary.replace("₹", "")}
          </div>
        )}
        {job.postedInRooms && job.postedInRooms.length > 1 && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <Users2 size={12} />
            Posted in {job.postedInRooms.length} rooms
          </div>
        )}
      </div>
    </motion.div>
  );
}
