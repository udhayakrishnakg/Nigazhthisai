import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Navigation,
  Activity,
  History,
  Check,
  CalendarDays,
  Bus as BusIcon,
  Search,
  Eye
} from 'lucide-react';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import { getCurrentDayName } from '../../lib/routeScheduler';

export const OperationalAlerts: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [liveTrips, setLiveTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const currentDay = getCurrentDayName();

  const userRole = localStorage.getItem('user_role');
  const isMaster = userRole === 'MASTER_ADMIN';

  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const DISTRICTS = ['All', 'Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tiruppur', 'Trichy', 'Erode'];
  const ZONES = ['All', 'North', 'South', 'West', 'East', 'Central'];

  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [statsData, liveData] = await Promise.all([
        adminApi.getDashboardStats({ district: selectedDistrict, zone: selectedZone }),
        adminApi.getLiveTrips()
      ]);
      setStats(statsData);
      setLiveTrips(liveData);
    } catch (error) {
      toast.error('Failed to update alert data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [selectedDistrict, selectedZone]);

  const handleAcknowledge = async (id: string) => {
    try {
      await adminApi.acknowledgeAlert(id);
      setAcknowledgedAlerts(prev => [...prev, id]);
      toast.success('Alert acknowledged and team notified');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  const idleBuses = liveTrips.filter(t => {
    const isStationary = t.is_idle && t.idle_minutes >= 20;
    const isNotAcked = !acknowledgedAlerts.includes(t.id);
    const matchesDistrict = selectedDistrict === 'All' || t.district === selectedDistrict;
    const matchesZone = selectedZone === 'All' || t.zone === selectedZone;
    return isStationary && matchesDistrict && matchesZone && (activeTab === 'ACTIVE' ? isNotAcked : !isNotAcked);
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Filters */}
      {isMaster && (
        <div className="flex flex-wrap items-center gap-4 bg-white p-5 border border-slate-100 rounded-3xl shadow-sm">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-1">District Filter</p>
            <div className="relative">
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-white border border-slate-100 pl-4 pr-8 py-2 text-xs font-bold uppercase tracking-wider text-[#0D2A5D] outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all rounded-xl cursor-pointer appearance-none min-w-[150px]"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider px-1">Zone Filter</p>
            <div className="relative">
              <select 
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-white border border-slate-100 pl-4 pr-8 py-2 text-xs font-bold uppercase tracking-wider text-[#0D2A5D] outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all rounded-xl cursor-pointer appearance-none min-w-[150px]"
              >
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                ▼
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header section with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('alerts.active_idle')}</p>
              <p className="text-2xl font-extrabold text-slate-900">{idleBuses.length}</p>
            </div>
          </div>
          <div className="h-1.5 bg-rose-50 overflow-hidden rounded-full">
            <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((idleBuses.length / 10) * 100, 100)}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('alerts.resolved_today')}</p>
              <p className="text-2xl font-extrabold text-slate-900">12</p>
            </div>
          </div>
          <div className="h-1.5 bg-emerald-50 overflow-hidden rounded-full">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#0D2A5D]/5 text-[#0D2A5D] rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('alerts.avg_response')}</p>
              <p className="text-2xl font-extrabold text-[#0D2A5D]">8.4m</p>
            </div>
          </div>
          <div className="h-1.5 bg-slate-50 overflow-hidden rounded-full">
            <div className="h-full bg-[#D97F00] rounded-full" style={{ width: '40%' }} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 flex bg-slate-50/30">
          <button 
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'ACTIVE' ? 'text-[#0D2A5D]' : 'text-slate-400'}`}
          >
            {t('alerts.realtime_detection')}
            {activeTab === 'ACTIVE' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0D2A5D]" />}
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === 'HISTORY' ? 'text-[#0D2A5D]' : 'text-slate-400'}`}
          >
            {t('alerts.history')}
            {activeTab === 'HISTORY' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0D2A5D]" />}
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'ACTIVE' ? (
              <motion.div 
                key="active" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {idleBuses.length > 0 ? (
                  idleBuses.map((bus) => (
                    <div key={bus.id} className="border border-rose-100 bg-rose-50/10 hover:shadow-md transition-all p-5 rounded-2xl group">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Map Preview Placeholder */}
                        <div className="w-full lg:w-72 h-40 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden shrink-0">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white animate-pulse shadow-lg ring-4 ring-rose-500/20">
                              <BusIcon size={18} />
                            </div>
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 border border-slate-100 text-[9px] font-bold uppercase tracking-wider text-[#0D2A5D] rounded-lg">
                            {t('alerts.gps')}: {bus.current_lat.toFixed(4)}, {bus.current_lng.toFixed(4)}
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2.5 mb-1">
                                <h3 className="text-base font-extrabold text-[#0D2A5D]">{bus.bus_id}</h3>
                                <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                                  <AlertCircle size={10} />
                                  {t('alerts.stationary_label')}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  {t('alerts.route')}: {bus.route_name}
                                </p>
                                <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1">
                                  <CalendarDays size={10} />
                                  Applying {currentDay} Specific Sequence
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-rose-600">{bus.idle_minutes}m</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t('alerts.idle_duration')}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('alerts.status')}</p>
                              <div className="flex items-center gap-1 text-rose-500 font-extrabold text-xs uppercase">
                                <Activity size={12} />
                                {t('alerts.abnormal_stop')}
                              </div>
                            </div>
                            <div className="bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('alerts.last_movement')}</p>
                              <p className="text-xs font-extrabold text-[#0D2A5D]">{bus.idle_minutes} {t('alerts.min_ago')}</p>
                            </div>
                            <div className="bg-slate-50/50 p-2.5 border border-slate-100 rounded-xl">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('alerts.distance_to_stop')}</p>
                              <p className="text-xs font-extrabold text-[#0D2A5D]">1.2 km (Avinashi)</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button 
                              onClick={() => navigate(`/live?search=${bus.bus_id}`)}
                              className="px-4 py-2 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-1.5"
                            >
                              <Eye size={12} className="text-[#D97F00]" />
                              Track Live
                            </button>
                            {!isMaster && (
                              <button 
                                onClick={() => handleAcknowledge(bus.id)}
                                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5"
                              >
                                <Check size={12} className="text-[#D97F00]" />
                                {t('alerts.acknowledge')}
                              </button>
                            )}
                            <a 
                              href={`https://www.google.com/maps?q=${bus.current_lat},${bus.current_lng}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-4 py-2 border border-slate-100 text-[#0D2A5D] hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5"
                            >
                              <ExternalLink size={12} />
                              {t('alerts.map_link')}
                            </a>
                            {!isMaster && (
                              <button className="ml-auto text-xs font-black text-rose-500 uppercase tracking-widest hover:underline">
                                {t('alerts.escalate')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center bg-slate-50/50 border border-dashed border-slate-100 rounded-2xl">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                      <ShieldAlert size={24} />
                    </div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-1">{t('alerts.no_alerts')}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('alerts.scanning')}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="history" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <History size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('alerts.last_24h')}</span>
                  </div>
                  <button className="text-xs font-bold text-[#0D2A5D] uppercase tracking-wider hover:underline">{t('alerts.export')}</button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-50">
                        <th className="px-5 py-3 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">{t('alerts.bus_trip')}</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">{t('alerts.alert_time')}</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">{t('alerts.duration')}</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider">{t('alerts.resolution')}</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider text-right">{t('alerts.details')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="hover:bg-slate-50/30 transition-all">
                          <td className="px-5 py-3">
                            <p className="text-xs font-extrabold text-[#0D2A5D]">TN 39 AB 100{i}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trip #TRP-10{i}</p>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-xs font-bold text-slate-600">Today, 10:24 AM</p>
                          </td>
                          <td className="px-5 py-3 text-xs font-extrabold text-[#0D2A5D]">32m</td>
                          <td className="px-5 py-3">
                             <div className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{t('alerts.acknowledged_status')}</span>
                             </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button className="p-2 text-slate-400 hover:text-[#0D2A5D] rounded-lg">
                              <ExternalLink size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold text-[#0D2A5D]">{value}</p>
      </div>
    </div>
  </div>
);
