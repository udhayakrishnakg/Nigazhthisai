import React from 'react';
import { Bus, MapPin, Search, Ticket, User, LogOut, Navigation, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const PassengerDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('passenger_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0D2A5D] rounded-xl flex items-center justify-center text-white">
              <Bus size={18} className="text-[#D97F00]" />
            </div>
            <h1 className="text-lg font-extrabold uppercase tracking-tight text-[#0D2A5D]">Nigazhthisai</h1>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-[#0D2A5D] rounded-xl transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24 space-y-6">
        {/* Search Section */}
        <div className="bg-[#0D2A5D] p-6 rounded-3xl shadow-sm border border-slate-100/5">
          <h2 className="text-white text-xl font-extrabold uppercase tracking-tight mb-4">Where are you going?</h2>
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="From: Current Location" 
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#D97F00]/50 outline-none text-sm font-bold text-[#0D2A5D]"
              />
            </div>
            <div className="relative">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="To: Destination" 
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#D97F00]/50 outline-none text-sm font-bold text-[#0D2A5D]"
              />
            </div>
            <button className="w-full py-2.5 bg-[#D97F00] text-white hover:bg-[#D97F00]/90 font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
              Search Buses
            </button>
          </div>
        </div>

        {/* Recent/Favorite Routes */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recent Routes</h3>
          <div className="space-y-3">
            {[
              { from: 'Tiruppur', to: 'Avinashi', time: '15 mins', price: '₹25' },
              { from: 'Coimbatore', to: 'Gandhipuram', time: '45 mins', price: '₹45' }
            ].map((route, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-4 border border-slate-100 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-[#0D2A5D]/20 transition-all shadow-xs"
              >
                <div>
                  <p className="text-sm font-extrabold text-[#0D2A5D]">{route.from} → {route.to}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{route.time} • {route.price}</p>
                </div>
                <Star size={16} className="text-slate-200 group-hover:text-[#D97F00] group-hover:fill-[#D97F00] transition-all" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Tickets */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">My Active Tickets</h3>
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-6 text-center">
            <Ticket size={28} className="text-slate-300 mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No active tickets found</p>
            <button className="mt-4 text-[#D97F00] text-[10px] font-black uppercase tracking-wider hover:underline">
              Book a new ticket
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button className="flex flex-col items-center gap-1 text-[#0D2A5D]">
            <Search size={18} />
            <span className="text-[8px] font-bold uppercase tracking-wider">Search</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#0D2A5D] transition-all">
            <Ticket size={18} />
            <span className="text-[8px] font-bold uppercase tracking-wider">Tickets</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#0D2A5D] transition-all">
            <User size={18} />
            <span className="text-[8px] font-bold uppercase tracking-wider">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
