import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Navigation, 
  Bus as BusIcon, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Search,
  Loader2,
  MapPin,
  Activity,
  Plus,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../lib/api';
import { toast } from 'sonner';

const ROUTE_PIPELINE_DATA: Record<string, { stops: string[]; currentIndex: number; location: string; nextStop: string; nextStopDist: string }> = {
  'LT-001': {
    stops: ['Tiruppur Old BS', 'Pushpa Theater', 'SAP Stop', 'Thendral Nagar', 'Avinashi Bypass', 'Avinashi New Stand'],
    currentIndex: 4, // 'Avinashi Bypass'
    location: 'Near Avinashi Bypass',
    nextStop: 'Avinashi New Stand',
    nextStopDist: '2.4 km'
  },
  'LT-002': {
    stops: ['Koyambedu CMBT', 'Vadapalani', 'Ashok Nagar', 'Guindy', 'Chromepet', 'Tambaram Gate'],
    currentIndex: 2, // 'Ashok Nagar'
    location: 'Near Ashok Nagar Metro',
    nextStop: 'Guindy Junction',
    nextStopDist: '3.8 km'
  },
  'LT-003': {
    stops: ['Gandhipuram Central', 'Railway Station', 'Town Hall', 'Ukkadam Bypass', 'Ukkadam Bus Stand'],
    currentIndex: 2, // 'Town Hall'
    location: 'Town Hall Main Signal',
    nextStop: 'Ukkadam Bypass',
    nextStopDist: '1.2 km'
  }
};

export const LiveMonitoring: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [liveTrips, setLiveTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const userRole = localStorage.getItem('user_role') || 'ADMIN';
  const isMaster = userRole === 'MASTER_ADMIN';

  const DISTRICTS = ['All', 'Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tiruppur', 'Trichy', 'Erode'];
  const ZONES = ['All', 'North', 'South', 'West', 'East', 'Central'];

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const data = await adminApi.getLiveTrips();
        setLiveTrips(data);
        
        // If we have a search query, try to auto-select the matching trip
        const initialSearch = searchParams.get('search');
        if (initialSearch && !selectedTrip) {
          const trip = data.find((t: any) => t.bus_id.includes(initialSearch));
          if (trip) setSelectedTrip(trip);
        }
      } catch (error) {
        toast.error('Failed to fetch live data');
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredLiveTrips = liveTrips.filter(trip => {
    const matchesSearch = trip.bus_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         trip.route_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = selectedDistrict === 'All' || trip.district === selectedDistrict;
    const matchesZone = selectedZone === 'All' || trip.zone === selectedZone;
    return matchesSearch && matchesDistrict && matchesZone;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search active buses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all text-sm font-bold shadow-xs placeholder-slate-400 text-[#0D2A5D]"
          />
        </div>

        {isMaster && (
          <>
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-100 focus:border-[#0D2A5D] outline-none transition-all font-bold text-xs uppercase tracking-wider text-slate-700 rounded-xl cursor-pointer shadow-xs"
            >
              {DISTRICTS.map(d => (
                <option key={d} value={d}>{d} DISTRICT</option>
              ))}
            </select>

            <select 
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-100 focus:border-[#0D2A5D] outline-none transition-all font-bold text-xs uppercase tracking-wider text-slate-700 rounded-xl cursor-pointer shadow-xs"
            >
              {ZONES.map(z => (
                <option key={z} value={z}>{z} ZONE</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="h-[calc(100vh-16rem)] flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Active Trips */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <Loader2 className="animate-spin text-[#0D2A5D]" size={20} />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tracking buses...</p>
              </div>
            ) : (
              filteredLiveTrips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
                    selectedTrip?.id === trip.id 
                      ? 'bg-[#0D2A5D] border-[#0D2A5D] text-white shadow-md' 
                      : 'bg-white border-slate-100 hover:border-[#0D2A5D]/20 hover:shadow-md shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <BusIcon size={16} className={selectedTrip?.id === trip.id ? 'text-[#D97F00]' : 'text-[#0D2A5D]'} />
                      <span className="text-sm font-black">{trip.bus_id}</span>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                      trip.status === 'ON_TIME' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                      trip.status === 'DELAYED' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                      'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${
                    selectedTrip?.id === trip.id ? 'text-white/70' : 'text-slate-400'
                  }`}>
                    {trip.route_name}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Activity size={12} className={selectedTrip?.id === trip.id ? 'text-white/70' : 'text-[#D97F00]'} />
                        <span className="text-[10px] font-mono">{trip.speed} km/h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi size={12} className={selectedTrip?.id === trip.id ? 'text-[#D97F00]' : 'text-emerald-500'} />
                        <span className="text-[10px] font-mono">Live</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-black">
                      {trip.occupancy}% <span className="text-[8px] opacity-70">Load</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Map View Area */}
        <div className="flex-1 bg-white border border-slate-100 rounded-3xl relative overflow-hidden shadow-sm flex flex-col">
          {selectedTrip ? (() => {
            const tripPipeline = ROUTE_PIPELINE_DATA[selectedTrip.id] || {
              stops: ['Start Stop', 'Intermediate A', 'Intermediate B', 'Destination Stop'],
              currentIndex: 1,
              location: 'In transit',
              nextStop: 'Intermediate B',
              nextStopDist: '3.0 km'
            };

            return (
              <div className="absolute inset-0 flex flex-col bg-slate-50/50">
                {/* Header of Pipeline Map */}
                <div className="bg-white border-b border-slate-100 p-4 px-6 flex justify-between items-center shrink-0">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-[#D97F00] font-black uppercase tracking-widest text-left">Interactive Telemetry</p>
                    <h3 className="text-sm font-black text-[#0D2A5D] uppercase tracking-tight flex items-center gap-2">
                      Route Pipeline Map 
                      <span className="text-[10px] bg-[#0D2A5D]/5 text-[#0D2A5D] px-2 py-0.5 rounded-md font-bold">
                        {tripPipeline.stops.length} STOPS
                      </span>
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black border border-emerald-100 shadow-xs uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Telemetry Streaming
                  </div>
                </div>

                {/* Main Pipeline Display - scrolling horizontally for clean presentation */}
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center overflow-y-auto">
                  
                  {/* Pipeline Visualization Container */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-x-auto no-scrollbar">
                    
                    {/* The horizontal track */}
                    <div className="min-w-[650px] relative py-12 flex items-center justify-between">
                      
                      {/* Background pipeline line */}
                      <div className="absolute left-6 right-6 h-2 bg-slate-100 rounded-full top-1/2 -translate-y-1/2 overflow-hidden border border-slate-200/50">
                        {/* Completed dynamic path fill */}
                        <div 
                          className="h-full bg-gradient-to-r from-[#0D2A5D] to-[#D97F00] rounded-full transition-all duration-1000"
                          style={{ width: `${(tripPipeline.currentIndex / (tripPipeline.stops.length - 1)) * 100}%` }}
                        />
                      </div>

                      {/* Stops list mapping */}
                      {tripPipeline.stops.map((stop, sIdx) => {
                        const isPassed = sIdx < tripPipeline.currentIndex;
                        const isCurrent = sIdx === tripPipeline.currentIndex;
                        const isUpcoming = sIdx > tripPipeline.currentIndex;

                        return (
                          <div key={stop} className="relative flex flex-col items-center flex-1 z-10 group">
                            
                            {/* Circle Node Indicator */}
                            <div className="mb-4">
                              {isPassed ? (
                                <div className="w-8 h-8 rounded-full bg-[#0D2A5D] border-4 border-white flex items-center justify-center shadow-md text-white transition-all duration-300 scale-100 group-hover:scale-105">
                                  <CheckCircle2 size={14} className="text-white" />
                                </div>
                              ) : isCurrent ? (
                                <div className="w-12 h-12 rounded-full bg-[#D97F00] border-4 border-white flex items-center justify-center shadow-xl text-white animate-pulse scale-105 ring-4 ring-orange-100">
                                  <BusIcon size={18} className="text-white animate-bounce" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center shadow-xs text-slate-400 transition-all duration-300 group-hover:scale-105">
                                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                                </div>
                              )}
                            </div>

                            {/* Node Labels */}
                            <div className="text-center absolute top-14 w-32">
                              <p className={`text-xs font-black tracking-tight leading-none ${isCurrent ? 'text-[#D97F00] font-black' : isPassed ? 'text-slate-700 font-extrabold' : 'text-slate-400 font-semibold'}`}>
                                {stop}
                              </p>
                              <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-1">
                                {isPassed ? 'Passed' : isCurrent ? 'Approaching' : `Stop ${sIdx + 1}`}
                              </p>
                            </div>

                          </div>
                        );
                      })}

                    </div>

                  </div>

                  {/* Telemetry Metric details below the pipeline */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Speed indicator */}
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-[#0D2A5D] rounded-xl flex items-center justify-center">
                        <Activity size={20} className="animate-pulse" />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Telemetry Speed</p>
                        <p className="text-lg font-black text-slate-800 mt-1">{selectedTrip.speed} <span className="text-[10px] text-slate-500 font-bold uppercase">km/h</span></p>
                      </div>
                    </div>

                    {/* Occupancy Indicator */}
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-orange-50 text-[#D97F00] rounded-xl flex items-center justify-center">
                        <BusIcon size={20} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Passenger Load Factor</p>
                        <p className="text-lg font-black text-slate-800 mt-1">{selectedTrip.occupancy}% <span className="text-[10px] text-slate-500 font-bold uppercase">Capacity</span></p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-200/40">
                          <div 
                            className={`h-full rounded-full ${selectedTrip.occupancy > 80 ? 'bg-rose-500' : selectedTrip.occupancy > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${selectedTrip.occupancy}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Geofence & Status */}
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                      <div className={`p-3 rounded-xl flex items-center justify-center ${selectedTrip.is_idle ? 'bg-amber-50 text-[#D97F00]' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Wifi size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Geofence Status</p>
                        <p className={`text-xs font-black mt-1 uppercase ${selectedTrip.is_idle ? 'text-[#D97F00]' : 'text-emerald-600'}`}>
                          {selectedTrip.is_idle ? `IDLE ${selectedTrip.idle_minutes} MINS` : 'INSIDE GEOFENCE ACTIVE'}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Footer with telemetry information details */}
                <div className="border-t border-slate-100 flex flex-wrap items-center p-5 gap-6 bg-white rounded-b-3xl shrink-0">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Current GPS Location</p>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-[#D97F00]" />
                      <span className="text-xs font-black text-[#0D2A5D]">{tripPipeline.location}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Target Milestone</p>
                    <div className="flex items-center gap-2">
                      <Navigation size={15} className="text-[#D97F00]" />
                      <span className="text-xs font-black text-[#0D2A5D]">{tripPipeline.nextStop} ({tripPipeline.nextStopDist})</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2.5">
                    <button 
                      onClick={() => toast.success(`Calling ETM/Conductor device registered to bus: ${selectedTrip.bus_id}`)}
                      className="px-4 py-2.5 bg-[#0D2A5D] hover:bg-[#123673] text-white font-extrabold text-[10px] uppercase tracking-wider transition-all rounded-xl shadow-xs cursor-pointer"
                    >
                      Contact Driver
                    </button>
                    <button 
                      onClick={() => toast.error(`Broadcasting Emergency Distress signals for bus ${selectedTrip.bus_id}`)}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all rounded-xl shadow-xs cursor-pointer"
                    >
                      Emergency Alert
                    </button>
                  </div>
                </div>

              </div>
            );
          })() : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-[#0D2A5D]/40 mb-6 border border-slate-100">
                <Navigation size={40} className="text-[#D97F00]" />
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-[#0D2A5D] mb-2">Select a Bus to Monitor</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider max-w-xs leading-relaxed">
                Click on an active trip from the sidebar to view live GPS tracking, speed, and occupancy data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
