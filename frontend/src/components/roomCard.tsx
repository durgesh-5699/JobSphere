import { Link } from "react-router-dom";
import type { Room } from "../types/room.types";
import { Globe, Lock, Users } from "lucide-react";

export default function RoomCard({ room, isMember }: { room: Room; isMember: boolean }){
  return (
    <Link
      to={`/rooms/${room._id}`}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display font-bold text-slate-900">{room.name}</h3>
        {room.isPublic ? (
          <Globe size={15} className="text-slate-400 flex-shrink-0" />
        ) : (
          <Lock size={15} className="text-slate-400 flex-shrink-0" />
        )}
      </div>
      {room.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{room.description}</p>
      )}
      {isMember ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
          <Users size={12} /> Joined
        </span>
      ) : (
        <span className="text-xs font-semibold text-indigo-600">View room →</span>
      )}
    </Link>
  );
};