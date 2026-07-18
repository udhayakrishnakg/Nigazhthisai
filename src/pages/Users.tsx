import React, { useEffect, useState } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Shield, 
  Mail, 
  Phone,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Globe,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const DISTRICTS = ['Chennai', 'Coimbatore', 'Tiruppur', 'Madurai', 'Salem', 'Trichy', 'Tirunelveli'];
const ZONES = ['North', 'South', 'East', 'West', 'Central'];

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Logged in user info
  const loggedInRole = localStorage.getItem('user_role') || 'MASTER_ADMIN';

  // Get admins list for control selection
  const admins = users.filter((u: any) => u.role === 'MASTER_ADMIN' || u.role === 'ADMIN' || u.role === 'OPERATIONS');
  const DEFAULT_ADMINS = [
    { id: 1, name: 'Master Admin', role: 'MASTER_ADMIN', email: 'master@nigazhthisai.com' },
    { id: 2, name: 'Admin Manager', role: 'ADMIN', email: 'admin@nigazhthisai.com' },
    { id: 3, name: 'Operations Manager', role: 'OPERATIONS', email: 'ops@nigazhthisai.com' }
  ];
  const displayAdmins = admins.length > 0 ? admins : DEFAULT_ADMINS;

  // Modal & Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'CONDUCTOR', // CONDUCTOR or DRIVER
    scopeType: loggedInRole === 'ADMIN' ? 'Local' : 'Global', // Global or Local
    district: 'Chennai',
    zone: 'North',
    controllingAdmin: 'Admin Manager'
  });

  const generateTempPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getUsers();
        setUsers(data);
      } catch (error) {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const scope = formData.scopeType === 'Global' ? 'Global' : `Admin: ${formData.controllingAdmin}`;
      
      const userData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        role: formData.role,
        scope: scope
      };

      await adminApi.createUser(userData);
      toast.success(`${formData.role} created successfully! Temporary password generated.`);
      setIsAddModalOpen(false);
      
      // Refresh the list
      const data = await adminApi.getUsers();
      setUsers(data);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: '',
        role: 'CONDUCTOR',
        scopeType: loggedInRole === 'ADMIN' ? 'Local' : 'Global',
        district: 'Chennai',
        zone: 'North',
        controllingAdmin: displayAdmins[0]?.name || 'Admin Manager'
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await adminApi.deleteUser(userToDelete.id);
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setUserToDelete(null);
      // Refresh list
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.scope && user.scope.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search by name, email, scope or role..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-sm font-bold shadow-xs placeholder-slate-400 text-[#0D2A5D]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            setIsAddModalOpen(true);
            generateTempPassword();
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm"
        >
          <Plus size={16} className="text-[#D97F00]" />
          Create Staff User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Scope / Zone</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#0D2A5D]" size={24} />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0D2A5D]/5 rounded-xl flex items-center justify-center text-[#0D2A5D] group-hover:bg-[#0D2A5D] group-hover:text-[#D97F00] transition-all">
                          <UsersIcon size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#0D2A5D]">{user.name}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            <span className="flex items-center gap-1">
                              <Mail size={12} className="text-[#D97F00]" />
                              {user.email}
                            </span>
                            {user.mobile && (
                              <span className="flex items-center gap-1">
                                <Phone size={12} className="text-slate-400" />
                                {user.mobile}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-[#D97F00]" />
                        <span className="text-xs font-bold text-slate-600 uppercase">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs">
                        {user.scope === 'Global' || !user.scope ? (
                          <>
                            <Globe size={14} className="text-emerald-500" />
                            <span className="font-semibold text-slate-600">Global</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={14} className="text-blue-500" />
                            <span className="font-semibold text-slate-600">{user.scope}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                        user.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {user.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setUserToDelete(user)}
                          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-[#0D2A5D]/5 rounded-xl flex items-center justify-center text-[#0D2A5D]">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-md font-extrabold text-[#0D2A5D]">Create Staff User</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {loggedInRole === 'MASTER_ADMIN' ? 'Global Admin privileges active' : 'Local Scope restrictions active'}
                    </p>
                  </div>
                </div>
                {loggedInRole === 'ADMIN' && (
                  <span className="text-[9px] font-black bg-rose-50 border border-rose-100 text-rose-700 uppercase px-2 py-0.5 rounded-md tracking-wider">
                    Local Only
                  </span>
                )}
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-left">
                {/* Role Switch */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Staff Role</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1">
                    {(['CONDUCTOR', 'DRIVER'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                        className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                          formData.role === r 
                            ? 'bg-[#0D2A5D] text-white shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none text-xs text-slate-800 font-bold"
                      placeholder="e.g. Ramesh Kumar"
                      required
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      type="tel" 
                      value={formData.mobile}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none text-xs text-slate-800 font-bold"
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none text-xs text-slate-800 font-bold"
                    placeholder="e.g. ramesh@nigazhthisai.com"
                    required
                  />
                </div>

                {/* Password field with label specifying Temporary Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporary Password at Creation</label>
                    <button
                      type="button"
                      onClick={generateTempPassword}
                      className="text-[9px] font-bold text-[#D97F00] uppercase hover:underline"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none text-xs text-slate-800 font-mono font-bold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0D2A5D]"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Scope Selection */}
                <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#0D2A5D] uppercase tracking-widest">Scope Restriction</label>
                    <div className="grid grid-cols-2 gap-2 bg-white border border-slate-100 rounded-lg p-1">
                      {/* Only MASTER_ADMIN can select Global scope */}
                      {loggedInRole === 'MASTER_ADMIN' ? (
                        (['Global', 'Local'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, scopeType: s }))}
                            className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${
                              formData.scopeType === s 
                                ? 'bg-[#0D2A5D]/10 text-[#0D2A5D]' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {s === 'Global' ? '🌐 Global' : '📍 Local'}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 py-1.5 px-3 bg-rose-50/50 border border-rose-100 text-rose-700 text-[10px] font-bold rounded-md flex items-center gap-1.5">
                          <Lock size={12} />
                          <span>Locked to local scope operations only</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.scopeType === 'Local' && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controlling Admin</label>
                      <select
                        value={formData.controllingAdmin}
                        onChange={(e) => setFormData(prev => ({ ...prev, controllingAdmin: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10"
                      >
                        {displayAdmins.map((admin) => (
                          <option key={admin.id || admin.email} value={admin.name}>
                            {admin.name} ({admin.role ? admin.role.replace('_', ' ') : 'Admin'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-100 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#0D2A5D] hover:bg-[#123673] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#0D2A5D]/15 flex items-center justify-center gap-2"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-md font-extrabold text-[#0D2A5D]">Delete Staff User?</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-[#0D2A5D]">{userToDelete.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-600/10"
                >
                  Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
