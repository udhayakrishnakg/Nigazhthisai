import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  Clock,
  User,
  Users,
  Loader2,
  X,
  Calendar,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';

const AVAILABLE_DRIVERS = [
  { name: 'Ramesh', id: 'D-001', experience: '8 Years', badge: 'West Zone' },
  { name: 'Kumar', id: 'D-002', experience: '5 Years', badge: 'North Zone' },
  { name: 'Anbu', id: 'D-003', experience: '12 Years', badge: 'West Zone' },
  { name: 'Murugan', id: 'D-004', experience: '6 Years', badge: 'Central Zone' },
  { name: 'Karthikeyan', id: 'D-005', experience: '10 Years', badge: 'East Zone' },
  { name: 'Saravanan', id: 'D-006', experience: '4 Years', badge: 'South Zone' }
];

const AVAILABLE_CONDUCTORS = [
  { name: 'Suresh', id: 'C-001', experience: '6 Years', badge: 'West Zone' },
  { name: 'Mani', id: 'C-002', experience: '3 Years', badge: 'North Zone' },
  { name: 'Selvam', id: 'C-003', experience: '9 Years', badge: 'West Zone' },
  { name: 'Sundar', id: 'C-004', experience: '4 Years', badge: 'Central Zone' },
  { name: 'Venkataraman', id: 'C-005', experience: '11 Years', badge: 'East Zone' },
  { name: 'Raja', id: 'C-006', experience: '2 Years', badge: 'South Zone' }
];

export const TripsList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const userRole = localStorage.getItem('user_role') || 'ADMIN';
  const isMaster = userRole === 'MASTER_ADMIN';

  const DISTRICTS = ['All', 'Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tiruppur', 'Trichy', 'Erode'];
  const ZONES = ['All', 'North', 'South', 'West', 'East', 'Central'];
  const [submitting, setSubmitting] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [newTrip, setNewTrip] = useState({
    route_id: '',
    bus_id: '',
    driver_name: '',
    conductor_name: '',
    start_time: ''
  });

  const handleOpenAdd = () => {
    setEditingTrip(null);
    setNewTrip({
      route_id: '',
      bus_id: '',
      driver_name: '',
      conductor_name: '',
      start_time: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trip: any) => {
    setEditingTrip(trip);
    setNewTrip({
      route_id: String(trip.route_id),
      bus_id: String(trip.bus_id || ''),
      driver_name: trip.driver_name,
      conductor_name: trip.conductor_name,
      start_time: trip.start_time || '08:00'
    });
    setIsModalOpen(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsData, routesData, busesData] = await Promise.all([
        adminApi.getTrips(),
        adminApi.getRoutes(),
        adminApi.getBuses()
      ]);
      setTrips(tripsData);
      setRoutes(routesData);
      setBuses(busesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.route_id || !newTrip.bus_id || !newTrip.driver_name || !newTrip.conductor_name || !newTrip.start_time) {
      toast.error('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTrip) {
        await adminApi.updateTrip(editingTrip.id, {
          route_id: Number(newTrip.route_id),
          bus_id: newTrip.bus_id,
          driver_name: newTrip.driver_name,
          conductor_name: newTrip.conductor_name,
          start_time: newTrip.start_time
        });
        toast.success('Trip updated successfully');
      } else {
        await adminApi.scheduleTrip({
          route_id: Number(newTrip.route_id),
          bus_id: newTrip.bus_id,
          driver_name: newTrip.driver_name,
          conductor_name: newTrip.conductor_name,
          start_time: newTrip.start_time
        });
        toast.success('Trip scheduled successfully');
      }
      setIsModalOpen(false);
      setNewTrip({ route_id: '', bus_id: '', driver_name: '', conductor_name: '', start_time: '' });
      setEditingTrip(null);
      fetchData();
    } catch (error) {
      toast.error(editingTrip ? 'Failed to update trip' : 'Failed to schedule trip');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (id: number) => {
    try {
      await adminApi.deleteTrip(id);
      toast.success('Trip deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const filteredTrips = trips.filter(trip => {
    const route = routes.find(r => r.id.toString() === trip.route_id.toString());
    const matchesSearch = trip.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.conductor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (route && (route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                   route.code.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesDistrict = selectedDistrict === 'All' || trip.district === selectedDistrict;
    const matchesZone = selectedZone === 'All' || trip.zone === selectedZone;
    
    return matchesSearch && matchesDistrict && matchesZone;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search by Driver or Conductor name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-sm font-bold shadow-xs placeholder-slate-400 text-[#0D2A5D]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isMaster && (
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
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0D2A5D] transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm border border-slate-200"
          >
            <Plus size={16} />
            Schedule Trip
          </button>
          <button 
            onClick={() => navigate('/operations/setup')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm"
          >
            <Plus size={16} className="text-[#D97F00]" />
            Setup New Operation
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Trip Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Staff</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">Occupancy</th>
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
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading trips...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No trips found</p>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0D2A5D]/5 rounded-xl flex items-center justify-center text-[#0D2A5D] group-hover:bg-[#0D2A5D] group-hover:text-[#D97F00] transition-all">
                          <Navigation size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#0D2A5D]">Trip #{trip.id}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Route ID: {trip.route_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <User size={12} className="text-[#D97F00]" />
                          <span className="text-xs font-bold">{trip.driver_name} <span className="text-slate-400 text-[10px]">(D)</span></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users size={12} className="text-[#D97F00]" />
                          <span className="text-xs font-bold">{trip.conductor_name} <span className="text-slate-400 text-[10px]">(C)</span></span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={12} className="text-slate-400" />
                        <span className="text-xs font-bold">{trip.start_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[100px] space-y-1">
                        <div className="flex justify-between text-[10px] font-extrabold text-[#0D2A5D]">
                          <span>{trip.occupancy}%</span>
                          <span className="text-slate-400">Full</span>
                        </div>
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                          <div 
                            className={`h-full transition-all rounded-full ${
                              trip.occupancy > 80 ? 'bg-rose-500' : 
                              trip.occupancy > 50 ? 'bg-amber-500' : 
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${trip.occupancy}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                        trip.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        trip.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                        'bg-slate-50 text-slate-700 border-slate-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          trip.status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' : 
                          trip.status === 'SCHEDULED' ? 'bg-blue-500' : 
                          'bg-slate-400'
                        }`} />
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenEdit(trip)}
                          className="p-2 hover:bg-slate-50 text-slate-400 hover:text-[#0D2A5D] transition-all rounded-lg"
                          title="Edit Trip"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(trip.id)}
                          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all rounded-lg"
                          title="Delete Trip"
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

      {/* Schedule / Edit Trip Modal */}
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
              className="relative w-full max-w-2xl bg-white shadow-2xl p-12 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0D2A5D] flex items-center justify-center text-[#D97F00] shadow-xl shadow-[#0D2A5D]/20 rounded-xl">
                    {editingTrip ? <Edit2 size={22} /> : <Calendar size={22} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0D2A5D]">{editingTrip ? 'Edit Scheduled Trip' : 'Schedule New Trip'}</h2>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">{editingTrip ? 'Modify existing scheduled parameters' : 'Schedule a new trip on an existing route'}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 transition-all text-slate-400 rounded-xl">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleScheduleTrip} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Select Route</label>
                    <select 
                      value={newTrip.route_id}
                      onChange={(e) => setNewTrip({ ...newTrip, route_id: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="">Choose Route</option>
                      {routes.map(r => (
                        <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Select Bus</label>
                    <select 
                      value={newTrip.bus_id}
                      onChange={(e) => setNewTrip({ ...newTrip, bus_id: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="">Choose Bus</option>
                      {buses.map(b => (
                        <option key={b.id} value={b.id}>{b.reg_no} ({b.model})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Driver</label>
                    <select 
                      value={newTrip.driver_name}
                      onChange={(e) => setNewTrip({ ...newTrip, driver_name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="">Select Driver</option>
                      {AVAILABLE_DRIVERS.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.id} - {d.experience})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Conductor</label>
                    <select 
                      value={newTrip.conductor_name}
                      onChange={(e) => setNewTrip({ ...newTrip, conductor_name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D] cursor-pointer"
                    >
                      <option value="">Select Conductor</option>
                      {AVAILABLE_CONDUCTORS.map(c => (
                        <option key={c.id} value={c.name}>{c.name} ({c.id} - {c.experience})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest ml-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newTrip.start_time}
                    onChange={(e) => setNewTrip({ ...newTrip, start_time: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#0D2A5D] focus:bg-white outline-none transition-all font-bold text-[#0D2A5D]"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                        {editingTrip ? 'Saving...' : 'Scheduling...'}
                      </>
                    ) : (
                      <>
                        {editingTrip ? 'Save Changes' : 'Schedule Trip'}
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
                <h3 className="text-base font-black text-[#0D2A5D] uppercase tracking-tight">Delete Trip?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete this trip? This action cannot be undone and will remove the trip from the operational board.
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
                    handleDeleteTrip(id);
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
