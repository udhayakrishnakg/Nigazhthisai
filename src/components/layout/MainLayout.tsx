import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Bus, 
  MapPin, 
  Navigation, 
  Ticket, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  UserCircle,
  TrendingUp,
  Activity,
  ShieldAlert,
  ShoppingBag
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/i18n';
import { isFeatureEnabled } from '../../lib/featureFlags';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'operations', label: 'Operations', icon: Activity, subItems: [
    { id: 'routes', label: 'Routes & Stops', icon: MapPin, path: '/operations/routes' },
    { id: 'buses', label: 'Buses & ETM', icon: Bus, path: '/operations/buses' },
    { id: 'trips', label: 'Trips & Schedules', icon: Navigation, path: '/operations/trips' },
  ]},
  { id: 'live', label: 'Live Monitoring', icon: TrendingUp, path: '/live' },
  { id: 'revenue', label: 'Tickets & Revenue', icon: Ticket, path: '/revenue' },
  { id: 'users', label: 'Users & Roles', icon: Users, path: '/users' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'support', label: 'Support', icon: HelpCircle, path: '/support' },
];

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, language, setLanguage } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [, setTick] = useState(0); // For re-renders
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role') || 'ADMIN';

  React.useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('feature_flags_updated', handleUpdate);
    return () => window.removeEventListener('feature_flags_updated', handleUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, path: '/dashboard', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'DASHBOARD' },
    { id: 'live', label: t('nav.live'), icon: TrendingUp, path: '/live', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'LIVE_MONITORING' },
    { id: 'operational-setup', label: t('nav.operational_setup'), icon: Activity, path: '/operations/setup', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'OPERATIONS' },
    { id: 'operational-alerts', label: t('nav.alerts'), icon: ShieldAlert, path: '/operations/alerts', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'ALERTS' },
    { id: 'sos-center', label: t('nav.sos'), icon: ShieldAlert, path: '/operations/sos', roles: ['MASTER_ADMIN', 'ADMIN'] },
    { id: 'stops', label: t('nav.stops'), icon: MapPin, path: '/operations/stops', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'ROUTES' },
    { id: 'routes', label: t('nav.routes'), icon: Navigation, path: '/operations/routes', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'ROUTES' },
    { id: 'buses', label: t('nav.buses'), icon: Bus, path: '/operations/buses', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'BUSES' },
    { id: 'trips', label: t('nav.trips'), icon: Navigation, path: '/operations/trips', roles: ['MASTER_ADMIN', 'ADMIN'], feature: 'TRIPS' },
    { id: 'revenue', label: t('nav.revenue'), icon: Ticket, path: '/revenue', roles: ['MASTER_ADMIN'], feature: 'REVENUE' },
    { id: 'users', label: t('nav.users'), icon: Users, path: '/users', roles: ['MASTER_ADMIN'] },
  ].filter(item => {
    const hasRole = item.roles.includes(userRole);
    const isEnabled = !item.feature || isFeatureEnabled(item.feature as any);
    return hasRole && isEnabled;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-[#0D2A5D] text-white flex flex-col fixed h-full z-50 transition-all duration-300 border-r border-[#0D2A5D]/10"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 overflow-hidden bg-[#0D2A5D]/90">
          <div className="w-8 h-8 bg-[#D97F00] flex items-center justify-center shrink-0 rounded-lg shadow-md shadow-[#D97F00]/20 overflow-hidden">
            <img src="/favicon.jpeg" className="w-full h-full object-cover" alt="Logo" />
          </div>
          {isSidebarOpen && (
            <span className="ml-3 font-extrabold uppercase tracking-tight text-base whitespace-nowrap text-white">
              {t('app.name')} <span className="text-[#D97F00] font-black">{userRole === 'MASTER_ADMIN' ? 'MASTER' : 'ADMIN'}</span>
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 no-scrollbar space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.id} className="px-3">
                <Link
                  to={item.path!}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-white/10 text-white font-bold border-l-4 border-[#D97F00]' 
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon 
                    size={18} 
                    className={isActive ? 'text-[#D97F00]' : 'text-white/60 group-hover:text-white transition-colors'} 
                  />
                  {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-semibold">{item.label}</span>}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0D2A5D]/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all rounded-xl group"
          >
            <LogOut size={18} className="text-red-400" />
            {isSidebarOpen && <span className="text-xs uppercase tracking-wider font-bold">{t('nav.logout')}</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-xl transition-all text-[#0D2A5D]"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            {location.pathname !== '/dashboard' && (
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#0D2A5D] transition-all pr-4 border-r border-slate-100"
              >
                <LayoutDashboard size={14} />
                {t('ui.back')}
              </button>
            )}
            <h1 className="text-xs font-black text-[#0D2A5D] uppercase tracking-wider">
              {MENU_ITEMS.find(i => i.path === location.pathname || i.subItems?.some(s => s.path === location.pathname))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button 
                onClick={() => setLanguage('EN')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${language === 'EN' ? 'bg-[#0D2A5D] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('TA')}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${language === 'TA' ? 'bg-[#0D2A5D] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                TA
              </button>
            </div>
            <button className="relative p-2 hover:bg-slate-50 rounded-xl transition-all text-[#0D2A5D]">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D97F00] rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-extrabold text-[#0D2A5D] leading-none">{userRole === 'MASTER_ADMIN' ? 'MASTER ADMIN' : 'ADMIN USER'}</p>
                <p className="text-[9px] text-[#D97F00] font-bold uppercase tracking-widest mt-1">{userRole.replace('_', ' ')}</p>
              </div>
              <div className="w-10 h-10 bg-[#0D2A5D]/5 rounded-xl flex items-center justify-center text-[#0D2A5D] border border-[#0D2A5D]/10 shadow-sm">
                <UserCircle size={22} />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
};
