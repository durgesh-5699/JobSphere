import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Globe, Lock, Users, Check, X, Clock, Settings, Briefcase,
  Save, Trash2, Crown, ArrowLeft, UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  fetchRoomById, joinRoom, fetchPendingRequests, respondToRequest,
  fetchRoomMembers, updateRoom, removeMember, fetchRoomJobs,
} from "../services/roomService";
import useAuth from "../context/useAuth";
import JobCard from "../components/jobCard";
import type { Room, RoomMember } from "../types/room.types";
import type { Job } from "../types/job.types";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: Math.min(i, 6) * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const toggleBtnSm = (active: boolean) =>
  `flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-colors ${
    active
      ? "bg-[#EAF1EE] border-[#D3E3DC] text-[#2F5D50]"
      : "border-[#E4E2DC] text-[#12151C]/45 hover:bg-[#F6F5F2]"
  }`;

const avatarPalette = [
  { bg: "#EAF1EE", fg: "#2F5D50" },
  { bg: "#FBF3E3", fg: "#8A6316" },
  { bg: "#F1EEE8", fg: "#12151C" },
];
const avatarColorFor = (name: string) => {
  const idx = name.charCodeAt(0) % avatarPalette.length;
  return avatarPalette[idx];
};

export default function RoomDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [myStatus, setMyStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

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
      <div className="min-h-[calc(100vh-73px)] bg-[#F6F5F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#12151C]/50">
          <span className="w-4 h-4 rounded-full border-2 border-[#12151C]/20 border-t-[#2F5D50] animate-spin" />
          <span className="font-mono text-xs tracking-[0.15em] uppercase">Loading room</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-[#12151C]/45 mb-4">Room not found.</p>
        <Link to="/rooms" className="text-[#2F5D50] font-semibold hover:text-[#12151C] transition-colors text-sm">
          Back to rooms
        </Link>
      </div>
    );
  }

  const isOwner = room.owner === user?.id;
  const initials = room.name.slice(0, 2).toUpperCase();

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <motion.button
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-[#12151C]/50 hover:text-[#12151C] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to rooms
        </motion.button>

        {/* Hero */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          className="relative bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8 mb-5 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#2F5D50] via-[#C08B2C] to-[#2F5D50]" />

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#12151C] text-white flex items-center justify-center text-2xl font-display font-semibold flex-shrink-0 mx-auto sm:mx-0">
              {initials}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-semibold text-[#12151C] tracking-tight">{room.name}</h1>
                {room.isPublic ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide text-[#12151C]/50 bg-[#F6F5F2] px-2.5 py-1 rounded-full">
                    <Globe size={12} /> PUBLIC
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide text-[#12151C]/50 bg-[#F6F5F2] px-2.5 py-1 rounded-full">
                    <Lock size={12} /> PRIVATE
                  </span>
                )}
                {isOwner && (
                  <span className="flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wide text-[#8A6316] bg-[#FBF3E3] px-2.5 py-1 rounded-full">
                    <Crown size={12} /> OWNER
                  </span>
                )}
              </div>

              {room.description && (
                <p className="text-sm text-[#12151C]/55 mb-4 max-w-md">{room.description}</p>
              )}

              {myStatus === "approved" && !isOwner && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F5D50] bg-[#EAF1EE] px-3 py-1.5 rounded-full">
                  <Check size={14} /> You're a member
                </span>
              )}
              {myStatus === "pending" && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8A6316] bg-[#FBF3E3] px-3 py-1.5 rounded-full">
                  <Clock size={14} /> Request pending approval
                </span>
              )}
              {myStatus === null && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex items-center gap-2 bg-[#12151C] hover:bg-[#2F5D50] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  {joining ? "Joining..." : room.isPublic ? "Join room" : "Request to join"}
                </motion.button>
              )}
            </div>

            {/* Stat tiles */}
            <div className="flex sm:flex-col gap-3 sm:w-32 flex-shrink-0">
              <div className="flex-1 sm:flex-none bg-[#F6F5F2] border border-[#EDEBE5] rounded-xl px-4 py-3 text-center">
                <p className="font-display text-xl font-semibold text-[#12151C]">{members.length}</p>
                <p className="font-mono text-[9px] uppercase tracking-wide text-[#12151C]/40 flex items-center justify-center gap-1 mt-0.5">
                  <Users size={10} /> Members
                </p>
              </div>
              <div className="flex-1 sm:flex-none bg-[#F6F5F2] border border-[#EDEBE5] rounded-xl px-4 py-3 text-center">
                <p className="font-display text-xl font-semibold text-[#12151C]">{jobs.length}</p>
                <p className="font-mono text-[9px] uppercase tracking-wide text-[#12151C]/40 flex items-center justify-center gap-1 mt-0.5">
                  <Briefcase size={10} /> Jobs
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-1 space-y-5">
            {isOwner && (
              <motion.div
                variants={fadeUp} initial="hidden" animate="show" custom={2}
                className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Settings size={15} className="text-[#2F5D50]" />
                  <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em]">Room settings</p>
                </div>

                <AnimatePresence>
                  {settingsError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-xs text-[#8C2F26] bg-[#FBEAE8] border border-[#F0CFC9] rounded-lg px-3 py-2">
                        {settingsError}
                      </div>
                    </motion.div>
                  )}
                  {settingsSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-xs text-[#2F5D50] bg-[#EAF1EE] border border-[#D3E3DC] rounded-lg px-3 py-2 flex items-center gap-1.5">
                        <Check size={13} /> {settingsSuccess}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Room name"
                    className="w-full px-3 py-2 bg-[#F6F5F2] border border-[#E4E2DC] rounded-lg text-sm text-[#12151C] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-3 py-2 bg-[#F6F5F2] border border-[#E4E2DC] rounded-lg text-sm text-[#12151C] focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow resize-none"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditIsPublic(true)}
                      className={toggleBtnSm(editIsPublic)}
                    >
                      <Globe size={13} /> Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditIsPublic(false)}
                      className={toggleBtnSm(!editIsPublic)}
                    >
                      <Lock size={13} /> Private
                    </button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-[#12151C] hover:bg-[#2F5D50] text-white font-semibold text-xs py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save changes"}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {isOwner && requests.length > 0 && (
              <motion.div
                variants={fadeUp} initial="hidden" animate="show" custom={3}
                className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
              >
                <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4">
                  Pending requests ({requests.length})
                </p>
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {requests.map((req) => {
                      const color = avatarColorFor(req.user.name);
                      return (
                        <motion.div
                          key={req._id}
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl p-3"
                        >
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-semibold flex-shrink-0"
                              style={{ backgroundColor: color.bg, color: color.fg }}
                            >
                              {req.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#12151C] truncate">{req.user.name}</p>
                              <p className="text-xs text-[#12151C]/45 truncate">{req.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/users/${req.user._id}`}
                              className="text-xs font-semibold text-[#2F5D50] hover:text-[#12151C] transition-colors flex-1"
                            >
                              View profile
                            </Link>
                            <button
                              onClick={() => handleRespond(req._id, "approve")}
                              className="p-1.5 rounded-lg bg-[#EAF1EE] text-[#2F5D50] hover:bg-[#D3E3DC] transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleRespond(req._id, "reject")}
                              className="p-1.5 rounded-lg bg-[#FBEAE8] text-[#B3413A] hover:bg-[#F5DBD6] transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={4}
              className="bg-white border border-[#E4E2DC] rounded-2xl p-6"
            >
              <p className="font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4">
                Members ({members.length})
              </p>
              {members.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {members.map((m) => {
                      const color = avatarColorFor(m.user.name);
                      const owner = m.user._id === room.owner;
                      return (
                        <motion.div
                          key={m._id}
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl p-3"
                        >
                          <Link to={`/users/${m.user._id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-semibold flex-shrink-0"
                              style={{ backgroundColor: color.bg, color: color.fg }}
                            >
                              {m.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#12151C] truncate flex items-center gap-1.5">
                                {m.user.name}
                                {owner && <Crown size={11} className="text-[#C08B2C] flex-shrink-0" />}
                              </p>
                              <p className="text-xs text-[#12151C]/45 truncate">{m.user.email}</p>
                            </div>
                          </Link>
                          {isOwner && !owner && (
                            <button
                              onClick={() => handleRemoveMember(m._id, m.user.name)}
                              className="p-1.5 rounded-lg text-[#12151C]/30 hover:text-[#B3413A] hover:bg-[#FBEAE8] transition-colors flex-shrink-0"
                              aria-label="Remove member"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-[#12151C]/30 italic text-sm">No members yet.</p>
              )}
            </motion.div>
          </div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="md:col-span-2">
            <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Briefcase size={17} className="text-[#2F5D50]" />
                <h2 className="font-display font-semibold text-[#12151C] tracking-tight">Jobs in this room</h2>
                {jobs.length > 0 && (
                  <span className="font-mono text-[10px] font-semibold text-[#2F5D50] bg-[#EAF1EE] px-2 py-0.5 rounded-full ml-auto">
                    {jobs.length}
                  </span>
                )}
              </div>

              {jobs.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-14">
                  <div className="w-12 h-12 rounded-full bg-[#EAF1EE] flex items-center justify-center mx-auto mb-3">
                    <Briefcase size={18} className="text-[#2F5D50]" />
                  </div>
                  <p className="text-[#12151C]/40 text-sm">No jobs posted in this room yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};