import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Globe, Lock, Users, Check, X, Clock, Settings, Briefcase,
  Save, Trash2, Crown,
} from "lucide-react";
import {
  fetchRoomById, joinRoom, fetchPendingRequests, respondToRequest,
  fetchRoomMembers, updateRoom, removeMember, fetchRoomJobs,
} from "../services/roomService";
import useAuth from "../context/useAuth";
import JobCard from "../components/jobCard";
import type { Room, RoomMembership } from "../types/room.types";
import type { Job } from "../types/job.types";

export default function RoomDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [myStatus, setMyStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<RoomMembership[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Settings form
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id]);

  const loadRoom = async (roomId: string) => {
    try {
      setLoading(true);
      const data = await fetchRoomById(roomId);
      setRoom(data.room);
      setMyStatus(data.myStatus);
      setEditName(data.room.name);
      setEditDescription(data.room.description || "");
      setEditIsPublic(data.room.isPublic);

      const memberList = await fetchRoomMembers(roomId);
      setMembers(memberList);

      // Jobs sirf fetch karo agar access hai (approved member ya public room)
      if (data.room.isPublic || data.myStatus === "approved") {
        const jobList = await fetchRoomJobs(roomId);
        setJobs(jobList);
      }

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

  const handleRespond = async (membershipId: string, action: "approve" | "reject") => {
    if (!id) return;
    try {
      await respondToRequest(id, membershipId, action);
      setRequests((prev) => prev.filter((r) => r._id !== membershipId));
      loadRoom(id); 
    } catch (err) {
      console.error("Failed to respond to request", err);
    }
  };

  const handleSaveSettings = async () => {
    if (!id) return;
    setSettingsError("");
    setSettingsSuccess("");
    setSaving(true);
    try {
      const updated = await updateRoom(id, {
        name: editName,
        description: editDescription,
        isPublic: editIsPublic,
      });
      setRoom(updated);
      setSettingsSuccess("Room updated!");
      setTimeout(() => setSettingsSuccess(""), 3000);
    } catch (err: any) {
      setSettingsError(err.response?.data?.message || "Failed to update room.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (membershipId: string, memberName: string) => {
    if (!id) return;
    const confirmed = window.confirm(`Remove ${memberName} from this room?`);
    if (!confirmed) return;

    try {
      await removeMember(id, membershipId);
      setMembers((prev) => prev.filter((m) => m._id !== membershipId));
    } catch (err: any) {
      console.error("Failed to remove member", err);
      alert(err.response?.data?.message || "Failed to remove member.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Room not found.</p>
      </div>
    );
  }

  const isOwner = room.owner === user?.id;
  const initials = room.name.slice(0, 2).toUpperCase();

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 mx-auto sm:mx-0">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-slate-900">{room.name}</h1>
                {room.isPublic ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Globe size={12} /> Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    <Lock size={12} /> Private
                  </span>
                )}
                {isOwner && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Crown size={12} /> Owner
                  </span>
                )}
              </div>

              {room.description && (
                <p className="text-sm text-slate-500 mb-3">{room.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <Users size={13} /> {members.length} member{members.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={13} /> {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
                </span>
              </div>

              {myStatus === "approved" && !isOwner && (
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
                  {joining ? "Joining..." : room.isPublic ? "Join Room" : "Request to Join"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            {isOwner && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={16} className="text-indigo-600" />
                  <h2 className="font-display font-bold text-slate-900 text-sm">Room Settings</h2>
                </div>

                {settingsError && (
                  <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {settingsError}
                  </div>
                )}
                {settingsSuccess && (
                  <div className="mb-3 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    {settingsSuccess}
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Room name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditIsPublic(true)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors ${
                        editIsPublic
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <Globe size={13} /> Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditIsPublic(false)}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors ${
                        !editIsPublic
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      <Lock size={13} /> Private
                    </button>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {isOwner && requests.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="font-display font-bold text-slate-900 text-sm mb-4">
                  Pending Requests ({requests.length})
                </h2>
                <div className="space-y-3">
                  {requests.map((req) => (
                    <div key={req._id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{req.user.name}</p>
                          <p className="text-xs text-slate-500">{req.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/users/${req.user._id}`}
                          className="text-xs font-semibold text-indigo-600 hover:underline flex-1"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleRespond(req._id, "approve")}
                          className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleRespond(req._id, "reject")}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-display font-bold text-slate-900 text-sm mb-4">
                Members ({members.length})
              </h2>
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3"
                    >
                      <Link to={`/users/${m.user._id}`} className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{m.user.email}</p>
                      </Link>
                      {isOwner && m.user._id !== room.owner && (
                        <button
                          onClick={() => handleRemoveMember(m._id, m.user.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                          aria-label="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">No members yet.</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Briefcase size={18} className="text-indigo-600" />
                <h2 className="font-display font-bold text-slate-900">Jobs in this room</h2>
              </div>

              {jobs.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm text-center py-10">
                  No jobs posted in this room yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};