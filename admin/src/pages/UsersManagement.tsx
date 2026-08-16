import { useEffect, useState } from 'react';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import { api } from '../lib/axios';
import { User, GetUsersResponse } from '../types';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Mocking the logged-in admin ID. In reality, pull this from your AuthContext.
  const currentAdminId = "logged-in-admin-id-here"; 

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get<GetUsersResponse>('/api/admin/users');
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: 'admin' | 'student') => {
    if (userId === currentAdminId) return; // Prevent self-demotion
    
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Failed to update role', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentAdminId) return;
    
    if (!window.confirm('Delete user? Warning: This will leave their jobs and rooms orphaned.')) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  if (loading) return <div className="text-zinc-400">Loading users...</div>;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Users</h1>
        <p className="text-zinc-400 mt-1">Manage platform members and permissions.</p>
      </header>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-100">{user.name}</div>
                  <div className="text-zinc-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.role === 'admin' ? 'bg-teal-950/50 text-teal-400 border border-teal-900' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => toggleRole(user._id, user.role)}
                      disabled={user._id === currentAdminId}
                      className="text-teal-500 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      disabled={user._id === currentAdminId}
                      className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}