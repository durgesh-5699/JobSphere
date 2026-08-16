import { useState, useEffect } from 'react';
import { 
  Globe, 
  Lock, 
  User, 
  Calendar, 
  Loader2, 
  AlertCircle,
  Info
} from 'lucide-react';
import axios from 'axios';

interface Owner {
  _id: string;
  name: string;
  email: string;
}

interface Room {
  _id: string;
  name: string;
  description: string;
  isPublic: boolean;
  owner: Owner;
  createdAt: string;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/rooms`, {
        withCredentials: true
      });
      
      console.log("Backend Rooms Data:", response.data);
      setRooms(response.data?.rooms || []);
      
    } catch (err: any) {
      console.error("Error fetching rooms:", err);
      setError(err.response?.data?.message || "Failed to load rooms data from the server.");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Room Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Monitor all public and private spaces created across the platform.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800 shadow-sm">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-bold text-blue-900 mb-0.5">Moderation Actions Unavailable</p>
          <p>
            The backend API currently does not support <code className="bg-blue-100 px-1 rounded text-blue-900">DELETE /api/admin/rooms/:id</code> or moderation endpoints. Room deletion and editing have been disabled in the UI until these routes are implemented by the backend team.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#3b6051] mb-4" />
          <p className="font-medium">Loading rooms data...</p>
        </div>
      ) : error ? (
        <div className="p-8 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
          <h3 className="text-lg font-bold text-red-900">Failed to load</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button onClick={fetchRooms} className="mt-4 px-4 py-2 bg-white text-red-700 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
            Try Again
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-500">No rooms have been created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div 
              key={room._id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-xl font-bold text-gray-900 line-clamp-1" title={room?.name}>
                  {room?.name}
                </h2>
                {room?.isPublic ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-[10px] uppercase tracking-wider font-bold border border-green-100 shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                    Public
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] uppercase tracking-wider font-bold border border-amber-100 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    Private
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3">
                {room?.description}
              </p>

              <div className="pt-4 border-t border-gray-50 space-y-2 text-xs font-medium text-gray-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-bold">{room?.owner?.name || 'Unknown User'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(room?.createdAt)}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}