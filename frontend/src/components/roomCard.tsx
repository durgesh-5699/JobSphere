import { Link } from "react-router-dom";
import type { Room } from "../types/types.ts";
import { Globe, Lock, Users, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function RoomCard({ room, isMember }: { room: Room; isMember: boolean }){
  const initials = room.name.slice(0, 2).toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={`/rooms/${room._id}`}
        className="group relative flex h-full flex-col bg-white border border-[#E4E2DC] rounded-2xl p-5 overflow-hidden hover:border-[#2F5D50]/30 hover:shadow-[0_16px_32px_-16px_rgba(18,21,28,0.18)] transition-shadow"
      >
        {/* Corner accent, reveals on hover */}
        <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-[#EAF1EE] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#12151C] text-white flex items-center justify-center text-sm font-display font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-display font-semibold text-[#12151C] truncate group-hover:text-[#2F5D50] transition-colors">
              {room.name}
            </h3>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-[#12151C]/40 uppercase tracking-wide mt-0.5">
              {room.isPublic ? <Globe size={11} /> : <Lock size={11} />}
              {room.isPublic ? "Public" : "Private"}
            </span>
          </div>
          <ArrowUpRight
            size={16}
            className="text-[#12151C]/20 group-hover:text-[#2F5D50] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0"
          />
        </div>

        {room.description ? (
          <p className="relative text-sm text-[#12151C]/50 line-clamp-2 mb-4 flex-1">{room.description}</p>
        ) : (
          <p className="relative text-sm text-[#12151C]/25 italic mb-4 flex-1">No description yet.</p>
        )}

        <div className="relative flex items-center justify-between pt-3 border-t border-[#EDEBE5]">
          {isMember ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide text-[#2F5D50] bg-[#EAF1EE] px-2.5 py-1 rounded-full">
              <Users size={11} /> JOINED
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#2F5D50] group-hover:text-[#12151C] transition-colors">
              View room
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};