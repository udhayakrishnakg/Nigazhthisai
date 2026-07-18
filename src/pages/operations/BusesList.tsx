import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus as BusIcon, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Cpu,
  Loader2,
  X,
  Filter,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';
import { useServices } from '../../contexts/CleanArchitectureContext';

export const BusesList: React.FC = () => {
  const navigate = useNavigate();
  const { busService } = useServices();
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<any | null>(null);
  const userRole = localStorage.getItem('user_role') || 'ADMIN';
  const isMaster = userRole === 'MASTER_ADMIN';

  const DISTRICTS = ['All', 'Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tiruppur', 'Trichy', 'Erode'];
  const ZONES = ['All', 'North', 'South', 'West', 'East', 'Central'];
  const [submitting, setSubmitting] = useState(false);
  const [editingBus, setEditingBus] = useState<any | null>(null);
  const [newBus, setNewBus] = useState({
    reg_no: '',
    model: '',
    type: 'NON-AC',
    etm_id: '',
    district: '',
    zone: '',
    status: 'ACTIVE',
    controllingAdmin: 'Admin Manager'
  });

  // ETM Local Scope States
  const [activeTab, setActiveTab] = useState<'buses' | 'etms'>('buses');
  const [etms, setEtms] = useState<any[]>([]);
  const [etmsLoading, setEtmsLoading] = useState(true);
  const [isEtmModalOpen, setIsEtmModalOpen] = useState(false);
  const [editingEtm, setEditingEtm] = useState<any | null>(null);
  const [newEtm, setNewEtm] = useState({
    device_id: '',
    serial_number: '',
    model: '',
    status: 'ACTIVE'
  });
  const [etmSubmitting, setEtmSubmitting] = useState(false);
  const [etmDeleteConfirmId, setEtmDeleteConfirmId] = useState<any | null>(null);

  const [adminsList, setAdminsList] = useState<any[]>([]);

  const fetchAdmins = async () => {
    try {
      const allUsers = await adminApi.getUsers();
      const filtered = allUsers.filter((u: any) => u.role === 'MASTER_ADMIN' || u.role === 'ADMIN' || u.role === 'OPERATIONS');
      setAdminsList(filtered);
    } catch (e) {
      console.error('Failed to load admins', e);
    }
  };

  const handleOpenAdd = () => {
    setEditingBus(null);
    setNewBus({
      reg_no: '',
      model: '',
      type: 'NON-AC',
      etm_id: etms.length > 0 ? etms[0].device_id : '',
      district: DISTRICTS[1] === 'All' ? DISTRICTS[2] : DISTRICTS[1],
      zone: ZONES[1] === 'All' ? ZONES[2] : ZONES[1],
      status: 'ACTIVE',
      controllingAdmin: adminsList[0]?.name || 'Admin Manager'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (bus: any) => {
    setEditingBus(bus);
    setNewBus({
      reg_no: bus.reg_no,
      model: bus.model,
      type: bus.type,
      etm_id: bus.etm_id,
      district: bus.district || DISTRICTS[1],
      zone: bus.zone || ZONES[1],
      status: bus.status || 'ACTIVE',
      controllingAdmin: bus.controllingAdmin || adminsList[0]?.name || 'Admin Manager'
    });
    setIsAddModalOpen(true);
  };

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const result = await busService.getBuses();
      if (result.success && result.data) {
        setBuses(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch buses');
      }
    } catch (error) {
      toast.error('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEtms = async () => {
    setEtmsLoading(true);
    try {
      const data = await adminApi.getEtms();
      setEtms(data);
    } catch (error) {
      toast.error('Failed to fetch ETM devices');
    } finally {
      setEtmsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    fetchEtms();
    fetchAdmins();
  }, []);

  // ETM Handler Methods
  const handleOpenAddEtm = () => {
    setEditingEtm(null);
    setNewEtm({
      device_id: '',
      serial_number: '',
      model: '',
      status: 'ACTIVE'
    });
    setIsEtmModalOpen(true);
  };

  const handleOpenEditEtm = (etm: any) => {
    setEditingEtm(etm);
    setNewEtm({
      device_id: etm.device_id,
      serial_number: etm.serial_number,
      model: etm.model,
      status: etm.status || 'ACTIVE'
    });
    setIsEtmModalOpen(true);
  };

  const handleAddEtm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEtm.device_id || !newEtm.serial_number || !newEtm.model) {
      toast.error('Please fill all mandatory ETM fields');
      return;
    }

    setEtmSubmitting(true);
    try {
      if (editingEtm) {
        await adminApi.updateEtm(editingEtm.id, newEtm);
        toast.success('ETM device updated successfully');
      } else {
        await adminApi.addEtm(newEtm);
        toast.success('ETM device added successfully');
      }
      setIsEtmModalOpen(false);
      fetchEtms();
    } catch (error) {
      toast.error(editingEtm ? 'Failed to update ETM device' : 'Failed to add ETM device');
    } finally {
      setEtmSubmitting(false);
    }
  };

  const handleDeleteEtm = async (id: any) => {
    try {
      await adminApi.deleteEtm(id);
      toast.success('ETM device deleted successfully');
      fetchEtms();
    } catch (error) {
      toast.error('Failed to delete ETM device');
    }
  };

  const handleAddBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBus.reg_no || !newBus.model || !newBus.etm_id || !newBus.district || !newBus.zone || !newBus.controllingAdmin) {
      toast.error('Please fill all mandatory fields including District, Zone and Controlling Admin');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBus) {
        await adminApi.updateBus(editingBus.id, newBus);
        toast.success('Bus updated successfully');
      } else {
        await adminApi.addBus(newBus);
        toast.success('Bus added successfully');
      }
      setIsAddModalOpen(false);
      setNewBus({ reg_no: '', model: '', type: 'NON-AC', etm_id: '', district: '', zone: '', status: 'ACTIVE', controllingAdmin: adminsList[0]?.name || 'Admin Manager' });
      setEditingBus(null);
      fetchBuses();
    } catch (error) {
      toast.error(editingBus ? 'Failed to update bus' : 'Failed to add bus');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBus = async (id: any) => {
    try {
      await adminApi.deleteBus(id);
      toast.success('Bus deleted successfully');
      fetchBuses();
    } catch (error) {
      toast.error('Failed to delete bus');
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.reg_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bus.etm_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDistrict = selectedDistrict === 'All' || bus.district === selectedDistrict;
    const matchesZone = selectedZone === 'All' || bus.zone === selectedZone;
    
    return matchesSearch && matchesDistrict && matchesZone;
  });

  const filteredEtms = etms.filter(etm => {
    const matchesSearch = etm.device_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         etm.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         etm.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-100 bg-white p-1 rounded-2xl shadow-xs max-w-md">
        <button
          onClick={() => setActiveTab('buses')}
          className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'buses'
              ? 'bg-[#0D2A5D] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          Fleet List (Buses)
        </button>
        <button
          onClick={() => {
            setActiveTab('etms');
            fetchEtms();
          }}
          className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all ${
            activeTab === 'etms'
              ? 'bg-[#0D2A5D] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          ETM Devices
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={activeTab === 'buses' ? "Search by Registration No or ETM ID..." : "Search by ETM ID, Serial No or Model..."}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-sm font-bold shadow-xs placeholder-slate-400 text-[#0D2A5D]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === 'buses' && isMaster && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D97F00]" size={14} />
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-xs font-bold uppercase tracking-wider text-[#0D2A5D] cursor-pointer appearance-none min-w-[140px]"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d} DISTRICT</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D97F00]" size={14} />
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-xs font-bold uppercase tracking-wider text-[#0D2A5D] cursor-pointer appearance-none min-w-[140px]"
                >
                  {ZONES.map(z => (
                    <option key={z} value={z}>{z} ZONE</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'buses' ? (
            <>
              <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0D2A5D] transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm border border-slate-200"
              >
                <Plus size={16} />
                Add Bus
              </button>
              <button 
                onClick={() => navigate('/operations/setup')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm"
              >
                <Plus size={16} className="text-[#D97F00]" />
                Setup New Bus
              </button>
            </>
          ) : (
            <button 
              onClick={handleOpenAddEtm}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm"
            >
              <Plus size={16} className="text-[#D97F00]" />
              Add ETM Device
            </button>
          )}
        </div>
      </div>

      {/* Table / List Container */}
      {activeTab === 'buses' ? (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Bus Info</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">ETM Device</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Controlling Admin</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-[#0D2A5D]" size={24} />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading buses...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredBuses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No buses found</p>
                    </td>
                  </tr>
                ) : (
                  filteredBuses.map((bus) => (
                    <tr key={bus.id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0D2A5D]/5 rounded-xl flex items-center justify-center text-[#0D2A5D] group-hover:bg-[#0D2A5D] group-hover:text-[#D97F00] transition-all">
                            <BusIcon size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#0D2A5D]">{bus.reg_no}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{bus.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                          bus.type === 'AC' 
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-100' 
                            : 'bg-orange-50 text-orange-700 border-orange-100'
                        }`}>
                          {bus.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Cpu size={14} className="text-[#D97F00]" />
                          <span className="text-xs font-bold font-mono">{bus.etm_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-600">
                          {bus.controllingAdmin || 'Master Admin'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                          bus.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          bus.status === 'MAINTENANCE' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            bus.status === 'ACTIVE' ? 'bg-emerald-500' : 
                            bus.status === 'MAINTENANCE' ? 'bg-amber-500' : 
                            'bg-slate-400'
                          }`} />
                          {bus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => navigate(`/live?search=${bus.reg_no}`)}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-[#0D2A5D] transition-all rounded-lg"
                            title="View Live Status"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(bus)}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-[#0D2A5D] transition-all rounded-lg"
                            title="Edit Bus"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(bus.id)}
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
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Device ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Serial Number</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Model</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {etmsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-[#0D2A5D]" size={24} />
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading ETM devices...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEtms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No ETM devices found</p>
                    </td>
                  </tr>
                ) : (
                  filteredEtms.map((etm) => (
                    <tr key={etm.id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#0D2A5D]/5 rounded-xl flex items-center justify-center text-[#0D2A5D] group-hover:bg-[#0D2A5D] group-hover:text-[#D97F00] transition-all">
                            <Cpu size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-[#0D2A5D]">{etm.device_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-slate-600">{etm.serial_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">{etm.model}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                          etm.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          'bg-slate-50 text-slate-700 border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            etm.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          {etm.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEditEtm(etm)}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-[#0D2A5D] transition-all rounded-lg"
                            title="Edit ETM Device"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setEtmDeleteConfirmId(etm.id)}
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
      )}

      {/* Add / Edit Bus Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl p-12 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0D2A5D] flex items-center justify-center text-[#D97F00] shadow-xl shadow-[#0D2A5D]/20 rounded-xl">
                    {editingBus ? <Edit2 size={22} /> : <Plus size={22} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0D2A5D]">{editingBus ? 'Edit Bus Properties' : 'Add New Bus'}</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">{editingBus ? 'Modify existing bus parameters' : 'Register a new bus in the operations fleet'}</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 transition-all text-slate-400 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddBus} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Registration No</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TN 39 AB 1234"
                      value={newBus.reg_no}
                      onChange={(e) => setNewBus({ ...newBus, reg_no: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Model Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Leyland Viking"
                      value={newBus.model}
                      onChange={(e) => setNewBus({ ...newBus, model: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D]"
                    />
                  </div>
                </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">ETM Device ID</label>
                    <div className="relative">
                      <select 
                        value={newBus.etm_id}
                        onChange={(e) => setNewBus({ ...newBus, etm_id: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] appearance-none cursor-pointer"
                      >
                        <option value="">Select ETM Device</option>
                        {etms.map(etm => (
                          <option key={etm.id} value={etm.device_id}>
                            {etm.device_id} ({etm.model} - {etm.status})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Bus Type</label>
                    <select 
                      value={newBus.type}
                      onChange={(e) => setNewBus({ ...newBus, type: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="AC">AC</option>
                      <option value="NON-AC">NON-AC</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">District</label>
                    <select 
                      value={newBus.district}
                      onChange={(e) => setNewBus({ ...newBus, district: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.filter(d => d !== 'All').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Zone</label>
                    <select 
                      value={newBus.zone}
                      onChange={(e) => setNewBus({ ...newBus, zone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="">Select Zone</option>
                      {ZONES.filter(z => z !== 'All').map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Controlling Admin (Owner)</label>
                  <select 
                    value={newBus.controllingAdmin}
                    onChange={(e) => setNewBus({ ...newBus, controllingAdmin: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                  >
                    <option value="">Select Controlling Admin</option>
                    {adminsList.map(admin => (
                      <option key={admin.id} value={admin.name}>{admin.name} ({admin.role.replace('_', ' ')})</option>
                    ))}
                  </select>
                </div>

                {editingBus && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={newBus.status}
                      onChange={(e) => setNewBus({ ...newBus, status: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-[#0D2A5D] hover:bg-[#0D2A5D]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#0D2A5D]/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        {editingBus ? 'Saving...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        {editingBus ? 'Save Changes' : 'Add Bus'}
                      </>
                    )}
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
                <h3 className="text-base font-black text-[#0D2A5D] uppercase tracking-tight">Delete Bus?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete this bus? This action cannot be undone and will remove the bus and its tracking configuration from the fleet.
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
                    handleDeleteBus(id);
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

      {/* Add / Edit ETM Modal */}
      <AnimatePresence>
        {isEtmModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEtmModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl p-12 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0D2A5D] flex items-center justify-center text-[#D97F00] shadow-xl shadow-[#0D2A5D]/20 rounded-xl">
                    {editingEtm ? <Edit2 size={22} /> : <Plus size={22} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0D2A5D]">{editingEtm ? 'Edit ETM Device' : 'Add ETM Device'}</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">{editingEtm ? 'Modify existing ETM parameter details' : 'Register a new ETM machine'}</p>
                  </div>
                </div>
                <button onClick={() => setIsEtmModalOpen(false)} className="p-2 hover:bg-slate-100 transition-all text-slate-400 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddEtm} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Device ID (Unique Identifier)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ETM-105"
                      disabled={!!editingEtm}
                      value={newEtm.device_id}
                      onChange={(e) => setNewEtm({ ...newEtm, device_id: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Serial Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. SN987654321"
                      value={newEtm.serial_number}
                      onChange={(e) => setNewEtm({ ...newEtm, serial_number: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Model Name / Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Verifone V240m"
                      value={newEtm.model}
                      onChange={(e) => setNewEtm({ ...newEtm, model: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={newEtm.status}
                      onChange={(e) => setNewEtm({ ...newEtm, status: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEtmModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={etmSubmitting}
                    className="flex-[2] py-4 bg-[#0D2A5D] hover:bg-[#0D2A5D]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#0D2A5D]/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {etmSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        {editingEtm ? 'Saving...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        {editingEtm ? 'Save Changes' : 'Add ETM'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete ETM Confirmation Modal */}
      <AnimatePresence>
        {etmDeleteConfirmId !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEtmDeleteConfirmId(null)}
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
                <h3 className="text-base font-black text-[#0D2A5D] uppercase tracking-tight">Delete ETM Device?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete this ETM device? This will permanently remove the device registration from the system.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEtmDeleteConfirmId(null)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = etmDeleteConfirmId;
                    setEtmDeleteConfirmId(null);
                    handleDeleteEtm(id);
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
