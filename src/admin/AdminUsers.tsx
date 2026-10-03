import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  Shield,
  Calendar,
  UserPlus,
  Copy,
  X,
  Share2,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserTimezone, setNewUserTimezone] = useState('UTC');
  const [newUserTaskGoal, setNewUserTaskGoal] = useState(5);
  const [newUserFocusHours, setNewUserFocusHours] = useState(4);
  const [isCreating, setIsCreating] = useState(false);
  const [createdUserSuccess, setCreatedUserSuccess] = useState<any | null>(null);
  const [temporaryPasswordCopied, setTemporaryPasswordCopied] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const list = await api.adminUsers();
      setUsers(list);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = !user.isActive;
    await api.adminUpdateUserStatus(user.id, newStatus);
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
    );
  };

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await api.adminUpdateUserRole(user.id, newRole);
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
    );
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setIsCreating(true);
    try {
      const created = await api.adminCreateUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        role: newUserRole,
        timezone: newUserTimezone,
        dailyTaskGoal: Number(newUserTaskGoal),
        dailyFocusGoalMinutes: Number(newUserFocusHours) * 60,
      });

      setCreatedUserSuccess(created);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error creating user');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterActive === 'active' && !u.isActive) return false;
    if (filterActive === 'inactive' && u.isActive) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header with Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">User Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage accounts and monitor individual productivity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-xl">
            {users.length} Users
          </span>
          <button
            onClick={() => {
              setCreatedUserSuccess(null);
              setIsAddUserOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Sharing Instructions Card */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-teal-500/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-xs text-teal-200 uppercase tracking-wider">
              Secure user sign-in
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Users create their own account from the phone app. For accounts created here, share the one-time temporary password with that person through a private channel.
          </p>
        </div>
        <button
          onClick={() => {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            navigator.clipboard?.writeText(origin);
            alert('Main App URL copied to clipboard: ' + origin);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Main App Link</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['all', 'active', 'inactive'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterActive(mode)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                filterActive === mode
                  ? 'bg-teal-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role (not panel access)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tasks</th>
                <th className="py-3 px-4">Focus Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                return (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{u.name}</span>
                          <span className="text-[11px] text-slate-400 truncate block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition flex items-center gap-1 ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                        }`}
                        title="User roles do not grant access to the web admin panel"
                      >
                        <span>{u.role === 'admin' ? 'Admin' : 'User'}</span>
                        <span className="text-[9px] text-slate-400 font-normal">✎</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                      {u.completedTasks || 0} / {u.totalTasks || 0}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-teal-400">
                      {u.focusHours || 0}h
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                            u.isActive
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-base">Add New User</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdUserSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1 text-center">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-1" />
                  <h4 className="font-bold text-white text-sm">User Created Successfully!</h4>
                  <p className="text-xs text-slate-300">
                    Account for <strong>{createdUserSuccess.name}</strong> ({createdUserSuccess.email}) is ready.
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="block text-slate-400 font-medium">
                    One-time temporary password (share privately):
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <input
                      type="text"
                      readOnly
                      value={createdUserSuccess.temporaryPassword}
                      className="flex-1 bg-transparent text-white font-mono text-[11px] truncate outline-hidden"
                    />
                    <button
                      onClick={() => {
                        void navigator.clipboard?.writeText(createdUserSuccess.temporaryPassword);
                        setTemporaryPasswordCopied(true);
                        setTimeout(() => setTemporaryPasswordCopied(false), 2500);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-[11px] hover:bg-teal-500 transition shrink-0"
                    >
                      {temporaryPasswordCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-300 mt-1">
                    Copy and share this password privately. It cannot be retrieved again.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCreatedUserSuccess(null);
                      setNewUserName('');
                      setNewUserEmail('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    + Add Another User
                  </button>
                  <button
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.morgan@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Timezone</label>
                    <select
                      value={newUserTimezone}
                      onChange={(e) => setNewUserTimezone(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    >
                      <option value="UTC">UTC Universal</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Daily Task Target
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newUserTaskGoal}
                      onChange={(e) => setNewUserTaskGoal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Focus Target (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newUserFocusHours}
                      onChange={(e) => setNewUserFocusHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newUserName.trim() || !newUserEmail.trim()}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create User & Generate Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
