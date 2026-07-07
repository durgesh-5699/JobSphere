import { useState, useEffect, type FormEvent } from "react";
import { Plus, Lock, Globe, X, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  fetchPublicRooms,
  fetchMyRooms,
  createRoom,
} from "../services/roomService";
import type { Room } from "../types/room.types";
import RoomCard from "../components/roomCard";
import { searchRooms } from "../services/roomService";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Rooms() {
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchRooms(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const [pub, mine] = await Promise.all([
        fetchPublicRooms(),
        fetchMyRooms(),
      ]);
      setPublicRooms(pub);
      setMyRooms(mine);
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  const myRoomIds = new Set(myRooms.map((r) => r._id));

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Room name is required.");
      return;
    }
    setError("");
    setCreating(true);
    try {
      await createRoom({ name, description, isPublic });
      setShowCreateModal(false);
      setName("");
      setDescription("");
      setIsPublic(true);
      loadRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create room.");
    } finally {
      setCreating(false);
    }
  };

  const sectionLabel = "font-mono text-[10px] font-semibold text-[#12151C]/35 uppercase tracking-[0.15em] mb-4";
  const toggleBtn = (active: boolean) =>
    `flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border transition-colors ${
      active
        ? "bg-[#EAF1EE] border-[#D3E3DC] text-[#2F5D50]"
        : "border-[#E4E2DC] text-[#12151C]/45 hover:bg-[#F6F5F2]"
    }`;

  return (
    <div className="bg-[#F6F5F2] min-h-[calc(100vh-73px)]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          className="flex items-center justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-semibold text-[#12151C] tracking-tight mb-2">
              Rooms
            </h1>
            <p className="text-[#12151C]/55">
              Join a room to see jobs shared with that group, or create your
              own.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#12151C] hover:bg-[#2F5D50] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
          >
            <Plus size={16} />
            Create room
          </button>
        </motion.div>

        {/* Search bar */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="relative mb-8">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#12151C]/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms by name..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow"
          />
        </motion.div>

        {/* Search results */}
        <AnimatePresence mode="wait">
          {searchQuery.trim().length >= 2 && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <p className={sectionLabel}>Search results for "{searchQuery}"</p>
              {searching ? (
                <p className="text-[#12151C]/45 text-sm">Searching...</p>
              ) : searchResults.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {searchResults.map((room) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      isMember={myRoomIds.has(room._id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[#12151C]/30 italic text-sm">No rooms found.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-[#E4E2DC] overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-[#F6F5F2] to-transparent" />
              </div>
            ))}
            <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
          </div>
        ) : (
          <>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} className="mb-8">
              <p className={sectionLabel}>My rooms</p>
              {myRooms.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {myRooms.map((room) => (
                    <RoomCard key={room._id} room={room} isMember />
                  ))}
                </div>
              ) : (
                <p className="text-[#12151C]/30 italic text-sm">
                  You haven't joined any rooms yet.
                </p>
              )}
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
              <p className={sectionLabel}>Discover public rooms</p>
              {publicRooms.filter((r) => !myRoomIds.has(r._id)).length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {publicRooms
                    .filter((r) => !myRoomIds.has(r._id))
                    .map((room) => (
                      <RoomCard key={room._id} room={room} isMember={false} />
                    ))}
                </div>
              ) : (
                <p className="text-[#12151C]/30 italic text-sm">
                  No new public rooms to discover.
                </p>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Create room modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-[#12151C]/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md relative border border-[#E4E2DC]"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-[#12151C]/35 hover:text-[#12151C] transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-display text-xl font-semibold text-[#12151C] tracking-tight mb-5">
                Create a room
              </h2>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="text-sm text-[#8C2F26] bg-[#FBEAE8] border border-[#F0CFC9] rounded-lg px-4 py-2.5">
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Room name (e.g. IIIT BBS 2027)"
                  className="w-full px-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#F6F5F2] border border-[#E4E2DC] rounded-xl text-sm text-[#12151C] placeholder:text-[#12151C]/30 focus:outline-none focus:ring-2 focus:ring-[#2F5D50]/40 focus:border-[#2F5D50] transition-shadow resize-none"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={toggleBtn(isPublic)}
                  >
                    <Globe size={15} /> Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={toggleBtn(!isPublic)}
                  >
                    <Lock size={15} /> Private
                  </button>
                </div>

                <p className="text-xs text-[#12151C]/40">
                  {isPublic
                    ? "Anyone can join instantly and see jobs in this room."
                    : "People must request to join — you approve them before they see jobs."}
                </p>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={creating}
                  className="w-full bg-[#12151C] hover:bg-[#2F5D50] text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create room"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}