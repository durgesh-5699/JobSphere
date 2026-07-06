import { useState, useEffect, type FormEvent } from "react";
import { Plus, Lock, Globe, X } from "lucide-react";
import { fetchPublicRooms, fetchMyRooms, createRoom } from "../services/roomService";
import type { Room } from "../types/room.types";
import RoomCard from "../components/roomCard";

export default function Rooms(){
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const [pub, mine] = await Promise.all([fetchPublicRooms(), fetchMyRooms()]);
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

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-73px)]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Rooms</h1>
            <p className="text-slate-500">
              Join a room to see jobs shared with that group, or create your own.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors flex-shrink-0"
          >
            <Plus size={16} />
            Create Room
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500 text-center py-20">Loading rooms...</p>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="font-display font-bold text-slate-900 mb-4">My Rooms</h2>
              {myRooms.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {myRooms.map((room) => (
                    <RoomCard key={room._id} room={room} isMember />
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">You haven't joined any rooms yet.</p>
              )}
            </div>

            <div>
              <h2 className="font-display font-bold text-slate-900 mb-4">Discover Public Rooms</h2>
              {publicRooms.filter((r) => !myRoomIds.has(r._id)).length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {publicRooms
                    .filter((r) => !myRoomIds.has(r._id))
                    .map((room) => (
                      <RoomCard key={room._id} room={room} isMember={false} />
                    ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">No new public rooms to discover.</p>
              )}
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-xl font-bold text-slate-900 mb-5">Create a Room</h2>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name (e.g. IIIT BBS 2027)"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border transition-colors ${
                    isPublic
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  <Globe size={15} /> Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border transition-colors ${
                    !isPublic
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  <Lock size={15} /> Private
                </button>
              </div>

              <p className="text-xs text-slate-400">
                {isPublic
                  ? "Anyone can join instantly and see jobs in this room."
                  : "People must request to join — you approve them before they see jobs."}
              </p>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
