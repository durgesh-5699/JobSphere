import { useState, useEffect } from 'react';
import { 
  Shield, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

// 1. Define the TypeScript interface for a User
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean; // Made optional depending on your backend schema
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for tracking which user's role is currently being updated
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // State for the delete confirmation modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 2. Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        withCredentials: true
      });
      
      setUsers(response.data?.users || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load user data from the server.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Connect Role Change to Backend
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/role`,
        { role: newRole },
        { withCredentials: true }
      );

      // Update local state with the newly updated user from the database
      setUsers(prevUsers => prevUsers.map(user => 
        user._id === userId ? { ...user, role: response.data.user.role } : user
      ));
      
    } catch (err: any) {
      console.error("Role update error:", err);
      alert(err.response?.data?.message || "Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. Connect User Deletion to Backend
  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${userToDelete._id}`, {
        withCredentials: true
      });

      // Remove user from local state instantly after successful backend deletion
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userToDelete._id));
      setUserToDelete(null); 
    } catch (err: any) {
      console.error("Delete user error:", err);
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setIsDeleting(false);
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            View, promote, and manage system access for all registered accounts.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#3b6051] mb-4" />
            <p className="font-medium">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
            <h3 className="text-lg font-bold text-red-900">Failed to load</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-white text-red-700 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="font-medium">No users found in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-[#f6f7f6]/50 transition-colors">
                    
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b6051] to-[#2a4539] flex items-center justify-center text-white font-bold shadow-inner">
                          {user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
                          <XCircle className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Role Management */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          disabled={updatingId === user._id}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className={`appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg focus:ring-[#3b6051] focus:border-[#3b6051] block w-full px-3 py-2 pr-8 cursor-pointer ${
                            user.role === 'admin' ? 'text-[#826227] bg-[#826227]/10 border-[#826227]/20' : ''
                          }`}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                        {updatingId === user._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400 absolute right-2.5 top-2.5" />
                        ) : (
                          <Shield className={`w-3.5 h-3.5 absolute right-2.5 top-2.5 pointer-events-none ${user.role === 'admin' ? 'text-[#826227]' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setUserToDelete(user)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Warning Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete User?</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              Are you sure you want to delete <span className="font-bold text-gray-900">{userToDelete.name}</span>? This action is permanent and cannot be undone.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex gap-3 text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Warning:</strong> Deleting this user will <strong>not</strong> remove their posted jobs, rooms, or applications. These records will remain in the database as orphaned data.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, delete user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}