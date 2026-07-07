import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Globe, Lock, Users, Check, X, Clock } from "lucide-react";
import {
  fetchRoomById,
  joinRoom,
  fetchPendingRequests,
  respondToRequest,
} from "../services/roomService";
import useAuth from "../context/useAuth";
import type { Room, RoomMember, RoomMembership } from "../types/room.types";
import { Link } from "react-router-dom";
import { fetchRoomMembers } from "../services/roomService";

export default function RoomDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [myStatus, setMyStatus] = useState<
    "pending" | "approved" | "rejected" | null
  >(null);
  const [requests, setRequests] = useState<RoomMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const [members, setMembers] = useState<RoomMember[]>([]);

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id]);

  const loadRoom = async (roomId: string) => {
    try {
      setLoading(true);
      const data = await fetchRoomById(roomId);
      setRoom(data.room);
      setMyStatus(data.myStatus);

      const memberList = await fetchRoomMembers(roomId);
      setMembers(memberList);

      if (data.room.owner === user?.id) {
        const pending = await fetchPendingRequests(roomId);
        setRequests(pending);
      }
    } catch (err) {
      console.error("Failed to load room", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!id) return;
    setJoining(true);
    try {
      await joinRoom(id);
      loadRoom(id);
    } catch (err) {
      console.error("Failed to join room", err);
    } finally {
      setJoining(false);
    }
  };

  const handleRespond = async (
    membershipId: string,
    action: "approve" | "reject",
  ) => {
    if (!id) return;
    try {
      await respondToRequest(id, membershipId, action);
      setRequests((prev) => prev.filter((r) => r._id !== membershipId));
    } catch (err) {
      console.error("Failed to respond to request", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Room not found.</p>
      </div>
    );
  }

  const isOwner = room.owner === user?.id;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {room.name}
            </h1>
            {room.isPublic ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <Globe size={12} /> Public
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <Lock size={12} /> Private
              </span>
            )}
          </div>

          {room.description && (
            <p className="text-slate-600 mb-5">{room.description}</p>
          )}

          {/* Join status / button */}
          {myStatus === "approved" && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
              <Check size={14} /> You're a member
            </span>
          )}
          {myStatus === "pending" && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
              <Clock size={14} /> Request pending approval
            </span>
          )}
          {myStatus === null && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Users size={16} />
              {joining
                ? "Joining..."
                : room.isPublic
                  ? "Join Room"
                  : "Request to Join"}
            </button>
          )}
        </div>

        {isOwner && requests.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h2 className="font-display font-bold text-slate-900 mb-4">
              Pending Requests ({requests.length})
            </h2>
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {req.user.name}
                    </p>
                    <p className="text-xs text-slate-500">{req.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/users/${req.user._id}`}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleRespond(req._id, "approve")}
                      className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                      aria-label="Approve"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleRespond(req._id, "reject")}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      aria-label="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mt-6">
          <h2 className="font-display font-bold text-slate-900 mb-4">
            Members ({members.length})
          </h2>
          {members.length > 0 ? (
            <div className="space-y-2">
              {members.map((m) => (
                <Link
                  key={m._id}
                  to={`/users/${m.user._id}`}
                  className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {m.user.name}
                    </p>
                    <p className="text-xs text-slate-500">{m.user.email}</p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">
                    View →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic text-sm">No members yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
