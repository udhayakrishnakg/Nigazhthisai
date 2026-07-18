import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Bus as BusIcon, 
  Navigation, 
  Save, 
  Plus, 
  Trash2, 
  Map as MapIcon,
  Loader2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../../lib/api';
import { toast } from 'sonner';
import { useTranslation } from '../../lib/i18n';

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

type Step = 'ROUTE' | 'BUS' | 'TRIP' | 'FINISH';

export const OperationalPipeline: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>('ROUTE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared Data
  const DISTRICTS = ['Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tiruppur', 'Trichy', 'Erode'];
  const ZONES = ['North', 'South', 'West', 'East', 'Central'];

  // Route Data
  const [routeData, setRouteData] = useState({
    name: '',
    code: '',
    district: DISTRICTS[0],
    zone: ZONES[0],
    stops: [] as string[]
  });
  const [newStop, setNewStop] = useState('');

  // Existing Routes selection states
  const [existingRoutes, setExistingRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | number>('');
  const [isCreatingNewRoute, setIsCreatingNewRoute] = useState(false);
  const [etms, setEtms] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const routes = await adminApi.getRoutes();
        setExistingRoutes(routes);
        if (routes.length > 0) {
          // Select the first route by default
          const firstRoute = routes[0];
          setSelectedRouteId(firstRoute.id);
          setRouteData({
            name: firstRoute.name,
            code: firstRoute.code,
            district: firstRoute.district || DISTRICTS[0],
            zone: firstRoute.zone || ZONES[0],
            stops: firstRoute.stops || []
          });
        } else {
          setIsCreatingNewRoute(true);
        }
      } catch (err) {
        console.error('Failed to load existing routes', err);
      }
    };
    const fetchEtms = async () => {
      try {
        const data = await adminApi.getEtms();
        setEtms(data);
        if (data.length > 0) {
          setBusData(prev => ({ ...prev, etm_id: data[0].device_id }));
        }
      } catch (err) {
        console.error('Failed to load ETM devices', err);
      }
    };
    fetchRoutes();
    fetchEtms();
  }, []);

  const handleRouteSelection = (id: string | number) => {
    setSelectedRouteId(id);
    if (id === 'NEW') {
      setIsCreatingNewRoute(true);
      setRouteData({
        name: '',
        code: '',
        district: DISTRICTS[0],
        zone: ZONES[0],
        stops: []
      });
    } else {
      setIsCreatingNewRoute(false);
      const route = existingRoutes.find(r => String(r.id) === String(id));
      if (route) {
        setRouteData({
          name: route.name,
          code: route.code,
          district: route.district || DISTRICTS[0],
          zone: route.zone || ZONES[0],
          stops: route.stops || []
        });
      }
    }
  };

  // Bus Data
  const [busData, setBusData] = useState({
    reg_no: '',
    model: '',
    type: 'NON-AC' as 'AC' | 'NON-AC',
    etm_id: '',
    district: DISTRICTS[0],
    zone: ZONES[0]
  });

  // Trip Data
  const [tripData, setTripData] = useState({
    start_time: '08:00',
    driver_name: '',
    conductor_name: '',
    status: 'ACTIVE'
  });

  const handleAddStop = () => {
    if (!newStop.trim()) return;
    setRouteData({ ...routeData, stops: [...routeData.stops, newStop.trim()] });
    setNewStop('');
  };

  const handleRemoveStop = (idx: number) => {
    const updated = [...routeData.stops];
    updated.splice(idx, 1);
    setRouteData({ ...routeData, stops: updated });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let finalRouteId = selectedRouteId;

      // 1. Create Route if creating a new one
      if (isCreatingNewRoute || !selectedRouteId) {
        const route = await adminApi.createRoute({
          name: routeData.name,
          code: routeData.code,
          district: routeData.district,
          zone: routeData.zone,
          stops: routeData.stops
        });
        finalRouteId = (route as any).id;
      }

      // 2. Create Bus
      await adminApi.addBus({
        ...busData
      });

      // 3. Create Trip
      await adminApi.scheduleTrip({
        route_id: Number(finalRouteId),
        bus_id: busData.reg_no,
        ...tripData,
        district: routeData.district,
        zone: routeData.zone
      });

      toast.success(t('ops.success_pipeline'));
      setCurrentStep('FINISH');
    } catch (err) {
      toast.error(t('ops.err_pipeline'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 font-sans">
      {/* progress Tracker */}
      <div className="mb-10 flex items-center justify-between px-4">
        {[
          { id: 'ROUTE', label: t('ops.route_stops'), icon: MapPin },
          { id: 'BUS', label: t('ops.bus_etm'), icon: BusIcon },
          { id: 'TRIP', label: t('ops.trip_schedule'), icon: Navigation },
          { id: 'FINISH', label: t('ops.confirmation'), icon: CheckCircle2 }
        ].map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 flex items-center justify-center transition-all rounded-2xl border ${
                currentStep === s.id ? 'bg-[#0D2A5D] text-white border-[#0D2A5D] shadow-sm' : 
                ['ROUTE', 'BUS', 'TRIP', 'FINISH'].indexOf(currentStep) > idx ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}>
                <s.icon size={18} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${currentStep === s.id ? 'text-[#0D2A5D]' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {idx < 3 && <div className={`flex-1 h-0.5 mx-4 rounded-full ${['ROUTE', 'BUS', 'TRIP', 'FINISH'].indexOf(currentStep) > idx ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {/* Step Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 'ROUTE' && (
              <motion.div 
                key="route" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  {/* Toggle Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#0D2A5D] uppercase tracking-wider ml-1">Route Creation Mode</label>
                    <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-2xl max-w-md">
                      <button
                        type="button"
                        onClick={() => {
                          if (existingRoutes.length > 0) {
                            handleRouteSelection(existingRoutes[0].id);
                          } else {
                            handleRouteSelection('NEW');
                          }
                        }}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-xl ${
                          !isCreatingNewRoute ? 'bg-[#0D2A5D] text-white shadow-xs' : 'text-slate-400'
                        }`}
                      >
                        Select Pre-configured Route
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRouteSelection('NEW')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-xl ${
                          isCreatingNewRoute ? 'bg-[#0D2A5D] text-white shadow-xs' : 'text-slate-400'
                        }`}
                      >
                        Create New Route
                      </button>
                    </div>
                  </div>

                  {!isCreatingNewRoute ? (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Select Route</label>
                        {existingRoutes.length > 0 ? (
                          <div className="relative">
                            <select
                              value={selectedRouteId}
                              onChange={(e) => handleRouteSelection(e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D] appearance-none cursor-pointer"
                            >
                              <option value="" disabled>-- Select Route --</option>
                              {existingRoutes.map(r => (
                                <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 text-amber-800 border border-amber-100 text-xs font-bold rounded-xl">
                            No pre-configured routes found. Please toggle "Create New Route" to establish one.
                          </div>
                        )}
                      </div>

                      {selectedRouteId && !isCreatingNewRoute && (
                        <div className="bg-slate-50/50 border border-slate-100/80 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Metadata</span>
                            <span className="text-[9px] px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-[#D97F00] font-black uppercase tracking-wider rounded-md">Read-Only</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">District</p>
                              <p className="text-xs font-extrabold text-[#0D2A5D]">{t('dist.' + routeData.district) || routeData.district}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Zone</p>
                              <p className="text-xs font-extrabold text-[#0D2A5D]">{t('ops.zone.' + routeData.zone) || routeData.zone}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Transit Stops Sequence</p>
                            <div className="flex flex-wrap gap-2">
                              {routeData.stops.map((stop, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-[#0D2A5D]/5 border border-[#0D2A5D]/10 rounded-lg text-[10px] font-extrabold text-[#0D2A5D]">
                                  <span className="w-3.5 h-3.5 bg-[#0D2A5D] text-[#D97F00] text-[8px] font-black rounded-sm flex items-center justify-center mr-1">{idx + 1}</span>
                                  {stop}
                                </span>
                              ))}
                              {routeData.stops.length === 0 && (
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">No stops associated with this route</span>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100">
                            <p className="text-[9px] text-[#D97F00] font-black uppercase tracking-wide leading-relaxed">
                              ℹ️ To modify route attributes or append new transit stops, navigate to the dedicated "Routes" and "Stops" admin menu options.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.route_name')}</label>
                          <input 
                            className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D]" 
                            placeholder="e.g. Tiruppur – Avinashi"
                            value={routeData.name}
                            onChange={e => setRouteData({...routeData, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.route_code')}</label>
                          <input 
                            className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D]" 
                            placeholder="e.g. TUP-AVI"
                            value={routeData.code}
                            onChange={e => setRouteData({...routeData, code: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.district')}</label>
                          <div className="relative">
                            <select 
                              className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D] appearance-none cursor-pointer"
                              value={routeData.district}
                              onChange={e => setRouteData({...routeData, district: e.target.value})}
                            >
                              {DISTRICTS.map(d => <option key={d} value={d}>{t('dist.' + d)}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.zone')}</label>
                          <div className="relative">
                            <select 
                              className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D] appearance-none cursor-pointer"
                              value={routeData.zone}
                              onChange={e => setRouteData({...routeData, zone: e.target.value})}
                            >
                              {ZONES.map(z => <option key={z} value={z}>{t('ops.zone.' + z)}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-50">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block">{t('ops.route_stops_sequence')}</label>
                        <div className="flex gap-3 mb-4">
                          <input 
                            className="flex-1 px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D]" 
                            placeholder={t('ops.enter_stop_name')}
                            value={newStop}
                            onChange={e => setNewStop(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddStop()}
                          />
                          <button 
                            onClick={handleAddStop}
                            className="px-6 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                          >
                            {t('ops.add_stop')}
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                          {routeData.stops.map((stop, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl group">
                              <div className="flex items-center gap-3">
                                <span className="w-5 h-5 bg-[#0D2A5D] text-[#D97F00] text-[9px] font-black flex items-center justify-center rounded-lg">{idx + 1}</span>
                                <span className="font-bold text-xs text-[#0D2A5D]">{stop}</span>
                              </div>
                              <button onClick={() => handleRemoveStop(idx)} className="text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          {routeData.stops.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] rounded-xl">
                              {t('ops.no_stops_added')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 'BUS' && (
              <motion.div 
                key="bus" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.registration_number')}</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D]" 
                      placeholder="e.g. TN 37 BV 1234"
                      value={busData.reg_no}
                      onChange={e => setBusData({...busData, reg_no: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.model_chassis')}</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D]" 
                      placeholder="e.g. Tata Marcopolo"
                      value={busData.model}
                      onChange={e => setBusData({...busData, model: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.etm_device_id')}</label>
                    <div className="relative">
                      <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D97F00]" size={16} />
                      <select 
                        className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D] appearance-none cursor-pointer" 
                        value={busData.etm_id}
                        onChange={e => setBusData({...busData, etm_id: e.target.value})}
                      >
                        <option value="">Select ETM Device</option>
                        {etms.map(etm => (
                          <option key={etm.id} value={etm.device_id}>
                            {etm.device_id} ({etm.model})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.bus_type')}</label>
                    <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
                      {['NON-AC', 'AC'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBusData({...busData, type: type as any})}
                          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg ${
                            busData.type === type ? 'bg-[#0D2A5D] text-white shadow-xs' : 'text-slate-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'TRIP' && (
              <motion.div 
                key="trip" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.start_time')}</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D]" 
                      value={tripData.start_time}
                      onChange={e => setTripData({...tripData, start_time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.operations_base')}</label>
                    <div className="px-4 py-2.5 bg-slate-50 text-slate-500 font-bold border border-slate-100 rounded-xl text-xs">
                      {t('ops.auto_synced')} {t('dist.' + routeData.district)}, {t('ops.zone.' + routeData.zone)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.allocated_driver')}</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D] cursor-pointer" 
                      value={tripData.driver_name}
                      onChange={e => setTripData({...tripData, driver_name: e.target.value})}
                    >
                      <option value="">{t('ops.operator_name_placeholder')}</option>
                      {AVAILABLE_DRIVERS.map(driver => (
                        <option key={driver.id} value={driver.name}>
                          {driver.name} ({driver.id} - {driver.experience})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{t('ops.allocated_conductor')}</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all font-bold text-sm text-[#0D2A5D] cursor-pointer" 
                      value={tripData.conductor_name}
                      onChange={e => setTripData({...tripData, conductor_name: e.target.value})}
                    >
                      <option value="">{t('ops.staff_name_placeholder')}</option>
                      {AVAILABLE_CONDUCTORS.map(conductor => (
                        <option key={conductor.id} value={conductor.name}>
                          {conductor.name} ({conductor.id} - {conductor.experience})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'FINISH' && (
              <motion.div 
                key="finish" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold uppercase tracking-tight text-[#0D2A5D]">{t('ops.setup_complete')}</h2>
                  <p className="text-slate-400 font-medium text-xs max-w-xs mx-auto mt-2 leading-relaxed">{t('ops.setup_complete_desc')}</p>
                </div>
                <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
                  <button 
                    onClick={() => {
                        window.location.reload(); // Quick reset
                    }}
                    className="px-6 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
                  >
                    {t('ops.setup_new_pipeline')}
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-100"
                  >
                    {t('ops.return_dashboard')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        {currentStep !== 'FINISH' && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={() => {
                if (currentStep === 'BUS') setCurrentStep('ROUTE');
                if (currentStep === 'TRIP') setCurrentStep('BUS');
              }}
              disabled={currentStep === 'ROUTE'}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
              {t('ops.previous_phase')}
            </button>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-700 transition-all"
              >
                {t('ops.cancel_setup')}
              </button>
              <button 
                onClick={() => {
                  if (currentStep === 'ROUTE') {
                    if (!routeData.name || !routeData.code || routeData.stops.length === 0) {
                      toast.error(t('ops.err_route'));
                      return;
                    }
                    setBusData({...busData, district: routeData.district, zone: routeData.zone});
                    setCurrentStep('BUS');
                  } else if (currentStep === 'BUS') {
                    if (!busData.reg_no || !busData.etm_id) {
                      toast.error(t('ops.err_bus'));
                      return;
                    }
                    setCurrentStep('TRIP');
                  } else if (currentStep === 'TRIP') {
                    if (!tripData.driver_name || !tripData.conductor_name) {
                      toast.error(t('ops.err_staff'));
                      return;
                    }
                    handleFinalSubmit();
                  }
                }}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    {currentStep === 'TRIP' ? t('ops.complete_pipeline') : t('ops.proceed_next_phase')}
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helper Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('ops.relational_integrity'), desc: t('ops.relational_integrity_desc'), status: t('ops.enforced') },
          { label: t('ops.data_validation'), desc: t('ops.data_validation_desc'), status: t('ops.healthy') },
          { label: t('ops.etm_sync'), desc: t('ops.etm_sync_desc'), status: t('ops.ready') }
        ].map(h => (
          <div key={h.label} className="p-4 bg-white border border-slate-100 rounded-3xl text-center shadow-xs">
            <p className="text-[10px] font-bold uppercase text-[#0D2A5D] tracking-wider mb-1">{h.label}</p>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3">{h.desc}</p>
            <span className="text-[8px] px-2.5 py-0.5 bg-slate-50 border border-slate-100 text-[#0D2A5D] font-black uppercase tracking-wider rounded-lg">{h.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
