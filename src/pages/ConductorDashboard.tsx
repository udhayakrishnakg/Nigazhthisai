import React from 'react';
import { Bus, MapPin, Navigation, Clock, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const ConductorDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('conductor_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <header className="bg-[#0D2A5D] text-white p-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bus size={24} className="text-[#D97F00]" />
            <h1 className="text-xl font-extrabold uppercase tracking-tight">Conductor Portal</h1>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <LogOut size={20} className="text-[#D97F00]" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Active Trip Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 border border-slate-100 rounded-3xl shadow-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Current Trip</p>
              <h2 className="text-2xl font-extrabold text-[#0D2A5D]">Tiruppur - Avinashi</h2>
            </div>
            <span className="bg-[#D97F00]/10 text-[#D97F00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Running
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-50">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bus No</p>
              <p className="text-sm font-extrabold text-[#0D2A5D]">TN 39 AB 1234</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ETM ID</p>
              <p className="text-sm font-extrabold text-[#0D2A5D]">ETM-452</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tickets Issued</p>
              <p className="text-sm font-extrabold text-[#0D2A5D]">42</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue</p>
              <p className="text-sm font-extrabold text-[#D97F00]">₹1,240</p>
            </div>
          </div>
        </motion.div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button className="bg-white p-6 border border-slate-100 hover:border-[#0D2A5D]/20 rounded-3xl shadow-xs transition-all flex items-center gap-4 group text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0D2A5D]/5 group-hover:text-[#0D2A5D] transition-all">
              <Navigation size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0D2A5D]">Issue Ticket</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scan QR or Manual Entry</p>
            </div>
          </button>

          <button className="bg-white p-6 border border-slate-100 hover:border-[#0D2A5D]/20 rounded-3xl shadow-xs transition-all flex items-center gap-4 group text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0D2A5D]/5 group-hover:text-[#0D2A5D] transition-all">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0D2A5D]">Update Stop</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Next: Avinashi Bypass</p>
            </div>
          </button>

          <button className="bg-white p-6 border border-slate-100 hover:border-[#0D2A5D]/20 rounded-3xl shadow-xs transition-all flex items-center gap-4 group text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#0D2A5D]/5 group-hover:text-[#0D2A5D] transition-all">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-[#0D2A5D]">Trip Summary</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">View all transactions</p>
            </div>
          </button>

          <button className="bg-white p-6 border border-slate-100 hover:border-rose-100 rounded-3xl shadow-xs transition-all flex items-center gap-4 group text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">End Trip</p>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Complete current schedule</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};
