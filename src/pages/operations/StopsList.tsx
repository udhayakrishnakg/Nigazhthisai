import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MapPin, 
  Loader2, 
  X, 
  Save, 
  Map, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';

interface Stop {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
}

export const StopsList: React.FC = () => {
  const DISTRICTS = ['All', 'Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tiruppur', 'Trichy', 'Erode'];
  
  const [stops, setStops] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    district: 'Tiruppur',
    lat: 11.1085,
    lng: 77.3411
  });

  const userRole = localStorage.getItem('user_role') || 'ADMIN';
  const isMaster = userRole === 'MASTER_ADMIN';

  const fetchStops = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getStops();
      setStops(data);
    } catch (error) {
      toast.error('Failed to fetch stops');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, []);

  const handleOpenCreate = () => {
    setEditingStop(null);
    setFormData({
      name: '',
      district: DISTRICTS[1] === 'All' ? DISTRICTS[2] : DISTRICTS[1],
      lat: 11.1085,
      lng: 77.3411
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stop: Stop) => {
    setEditingStop(stop);
    setFormData({
      name: stop.name,
      district: stop.district,
      lat: stop.lat || 11.1085,
      lng: stop.lng || 77.3411
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Stop name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStop) {
        await adminApi.updateStop(editingStop.id, formData);
        toast.success('Stop updated successfully');
      } else {
        await adminApi.createStop(formData);
        toast.success('Stop created successfully');
      }
      setIsModalOpen(false);
      fetchStops();
    } catch (error) {
      toast.error('Failed to save stop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStop = async (id: string) => {
    try {
      await adminApi.deleteStop(id);
      toast.success('Stop deleted successfully');
      fetchStops();
    } catch (error) {
      toast.error('Failed to delete stop');
    }
  };

  const filteredStops = stops.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All' || s.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search stops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-sm font-bold shadow-xs placeholder-slate-400 text-[#0D2A5D]"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D97F00]" size={14} />
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-xs font-bold uppercase tracking-wider text-[#0D2A5D] cursor-pointer appearance-none min-w-[140px]"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'ALL DISTRICTS' : `${d.toUpperCase()} DISTRICT`}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0A2149] transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex-shrink-0"
        >
          <Plus size={16} className="text-[#D97F00]" />
          Create New Stop
        </button>
      </div>

      {/* Stops Grid / Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Stop ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Stop Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">District</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Coordinates (Lat, Lng)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 size={32} className="animate-spin text-[#0D2A5D] mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Stops...</p>
                  </td>
                </tr>
              ) : filteredStops.length > 0 ? filteredStops.map((stop) => (
                <tr key={stop.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">#{stop.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0D2A5D]/5 rounded-xl flex items-center justify-center text-[#0D2A5D] group-hover:bg-[#0D2A5D] group-hover:text-[#D97F00] transition-all">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0D2A5D]">{stop.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Active Transit Stop</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-[#0D2A5D]/5 text-[#0D2A5D] text-[10px] font-black uppercase tracking-wider rounded-lg">
                      {stop.district}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                      <Map size={13} className="text-[#D97F00]" />
                      <span>{stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenEdit(stop)}
                        className="p-2 hover:bg-slate-50 text-slate-400 hover:text-[#0D2A5D] transition-all rounded-lg"
                        title="Edit Stop"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(stop.id)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all rounded-lg"
                        title="Delete Stop"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No stops found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white shadow-2xl p-8 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0D2A5D] flex items-center justify-center text-white shadow-lg shadow-[#0D2A5D]/10 rounded-xl">
                    <MapPin size={20} className="text-[#D97F00]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                      {editingStop ? 'Edit Stop Point' : 'Create New Stop'}
                    </h2>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                      {editingStop ? 'Modify stop parameters' : 'Define new transit stop point'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 transition-all text-slate-400 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Stop Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tiruppur Railway Station"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#0D2A5D] focus:bg-white outline-none rounded-xl transition-all font-bold text-xs text-[#0D2A5D]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">District Location</label>
                  <select 
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#0D2A5D] focus:bg-white outline-none rounded-xl transition-all font-bold text-xs text-[#0D2A5D] appearance-none cursor-pointer"
                  >
                    {DISTRICTS.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Latitude</label>
                    <input 
                      type="number" 
                      step="any"
                      placeholder="e.g. 11.1085"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#0D2A5D] focus:bg-white outline-none rounded-xl transition-all font-bold text-xs text-[#0D2A5D]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Longitude</label>
                    <input 
                      type="number" 
                      step="any"
                      placeholder="e.g. 77.3411"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#0D2A5D] focus:bg-white outline-none rounded-xl transition-all font-bold text-xs text-[#0D2A5D]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-[#0D2A5D] hover:bg-[#0A2149] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Save size={14} />
                    )}
                    {editingStop ? 'Save Changes' : 'Create Stop'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-5 z-10"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Trash2 size={22} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-[#0D2A5D] uppercase tracking-tight">Delete Stop?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete this stop? This action cannot be undone and it will be removed from all future schedules.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deleteConfirmId;
                    setDeleteConfirmId(null);
                    handleDeleteStop(id);
                  }}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md shadow-rose-500/10 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
