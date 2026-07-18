import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Bell, 
  Shield, 
  Database, 
  Monitor, 
  Save,
  User,
  Lock,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTranslation, Language } from '../lib/i18n';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getFeatureFlags, setFeatureFlags } from '../lib/featureFlags';

export const Settings: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const userRole = localStorage.getItem('user_role');
  const isMaster = userRole === 'MASTER_ADMIN';

  const [notifications, setNotifications] = useState({
    alerts: true,
    revenue: false,
    system: true
  });

  const [featureFlags, setFlags] = useState(getFeatureFlags());

  const handleToggleFeature = (id: string) => {
    const updated = featureFlags.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    );
    setFlags(updated);
    setFeatureFlags(updated);
    toast.success('Access permissions updated');
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    const toastMsg = {
      EN: 'Language changed successfully',
      TA: 'மொழி மாற்றப்பட்டது',
      ML: 'ഭാഷ വിജയകരമായി മാറ്റി',
      KN: 'ಭಾಷೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ',
      TE: 'భాష విజయవంతంగా మార్చబడింది',
      HI: 'भाषा सफलतापूर्वक बदल दी गई'
    }[newLang] || 'Language changed successfully';
    toast.success(toastMsg);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans">
      {/* Settings Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3.5 bg-[#0D2A5D] text-[#D97F00] rounded-2xl shadow-sm">
          <SettingsIcon size={24} className="animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#0D2A5D] uppercase tracking-tight">System Settings</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manage your dashboard preferences and system configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation / Sidebar */}
        <div className="space-y-2">
          <button className="w-full text-left px-5 py-3.5 bg-[#0D2A5D] text-white text-xs font-black uppercase tracking-wider flex items-center justify-between rounded-2xl shadow-sm">
            General
            <ChevronRight size={14} className="text-[#D97F00]" />
          </button>
          <button className="w-full text-left px-5 py-3.5 hover:bg-[#0D2A5D]/5 text-slate-600 hover:text-[#0D2A5D] text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all rounded-2xl">
            Notifications
            <ChevronRight size={14} />
          </button>
          {isMaster && (
            <>
              <button className="w-full text-left px-5 py-3.5 hover:bg-[#0D2A5D]/5 text-slate-600 hover:text-[#0D2A5D] text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all rounded-2xl">
                Location Management
                <ChevronRight size={14} />
              </button>
              <button className="w-full text-left px-5 py-3.5 hover:bg-[#0D2A5D]/5 text-slate-600 hover:text-[#0D2A5D] text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all rounded-2xl">
                Security & Privacy
                <ChevronRight size={14} />
              </button>
            </>
          )}
          <button className="w-full text-left px-5 py-3.5 hover:bg-[#0D2A5D]/5 text-slate-600 hover:text-[#0D2A5D] text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all rounded-2xl">
            Audit logs
            <ChevronRight size={14} />
          </button>
        </div>

        {/* content area */}
        <div className="md:col-span-2 space-y-6">
          {/* Alert Configuration Section */}
          <section className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <Bell size={18} className="text-[#D97F00]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0D2A5D]">Alert Configuration</h3>
            </div>
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Idle Time Threshold (Minutes)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="5" max="60" defaultValue="20" className="flex-1 accent-[#D97F00]" />
                  <span className="text-xs font-black text-[#0D2A5D] w-12 text-right">20m</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Geofence Radius (Meters)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="10" max="200" defaultValue="50" className="flex-1 accent-[#D97F00]" />
                  <span className="text-xs font-black text-[#0D2A5D] w-12 text-right">50m</span>
                </div>
              </div>
            </div>
          </section>

          {/* Language Section */}
          <section className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <Globe size={18} className="text-[#D97F00]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0D2A5D]">Language & Localization</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'EN', name: 'ENGLISH', native: 'English', desc: 'System Default' },
                { id: 'TA', name: 'தமிழ்', native: 'Tamil', desc: 'Tamil Content' },
                { id: 'ML', name: 'മലയാളം', native: 'Malayalam', desc: 'Malayalam Content' },
                { id: 'KN', name: 'ಕನ್ನಡ', native: 'Kannada', desc: 'Kannada Content' },
                { id: 'TE', name: 'తెలుగు', native: 'Telugu', desc: 'Telugu Content' },
                { id: 'HI', name: 'हिन्दी', native: 'Hindi', desc: 'Hindi Content' }
              ].map((lang) => (
                <button 
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id as Language)}
                  className={`p-4 border transition-all text-center rounded-2xl flex flex-col justify-center items-center ${
                    language === lang.id 
                      ? 'border-[#D97F00] bg-[#0D2A5D]/5 text-[#0D2A5D] shadow-xs' 
                      : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
                  }`}
                >
                  <p className="text-xs font-extrabold mb-0.5">{lang.name}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">{lang.native}</p>
                  <p className="text-[8px] tracking-tight opacity-60 mt-1">{lang.desc}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Access Control Section (Master only) */}
          {isMaster && (
            <section className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <Shield size={18} className="text-[#D97F00]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0D2A5D]">Normal Admin Access Control</h3>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-6">
                Enable or disable specific features for Standard Administrators. Master Admins always retain full access.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featureFlags.map((flag) => (
                  <button
                    key={flag.id}
                    onClick={() => handleToggleFeature(flag.id)}
                    className={`flex items-center justify-between p-3.5 border transition-all rounded-xl ${
                      flag.enabled 
                        ? 'border-emerald-100 bg-emerald-50/20 text-emerald-700' 
                        : 'border-slate-100 bg-slate-50/30 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {flag.enabled ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} />}
                      <span className="text-[9px] font-black uppercase tracking-wider">{flag.label}</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${flag.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <motion.div 
                        animate={{ x: flag.enabled ? 16 : 4 }}
                        className="absolute top-1 w-2 h-2 bg-white rounded-full" 
                      />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* User Profile Summary */}
          <section className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <User size={18} className="text-[#D97F00]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0D2A5D]">Profile Information</h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100/50 rounded-2xl">
              <div className="w-16 h-16 bg-[#0D2A5D]/5 rounded-2xl flex items-center justify-center text-[#0D2A5D]">
                <User size={32} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#0D2A5D]">{isMaster ? 'Master Administrator' : 'Standard Admin'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">{userRole}</p>
                <button className="text-[9px] font-black text-[#D97F00] uppercase tracking-wider hover:underline flex items-center gap-1">
                  <Lock size={10} />
                  Change Password
                </button>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <Monitor size={18} className="text-[#D97F00]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0D2A5D]">Preferences</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <p className="text-xs font-bold text-[#0D2A5D]">Dark Mode</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Adjust dashboard appearance</p>
                </div>
                <div className="w-12 h-6 bg-slate-100 rounded-full cursor-not-allowed opacity-50" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold text-[#0D2A5D]">Real-time Updates</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Auto-refresh live monitoring data</p>
                </div>
                <div className="w-12 h-6 bg-emerald-500 rounded-full relative">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Master Only Security */}
          {isMaster && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 border border-slate-100 border-l-4 border-l-[#D97F00] rounded-r-3xl rounded-l-lg shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-6">
                <Shield size={18} className="text-[#D97F00]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0D2A5D]">Master Controls</h3>
              </div>
              <div className="space-y-4">
                <button className="w-full p-4 border border-slate-50 rounded-xl flex items-center justify-between text-left hover:bg-slate-50 transition-all">
                  <div>
                    <p className="text-xs font-bold text-[#0D2A5D]">API Access Tokens</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Manage external service integrations</p>
                  </div>
                  <Database size={16} className="text-slate-300" />
                </button>
              </div>
            </motion.section>
          )}

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-8 py-3.5 bg-[#0D2A5D] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all rounded-xl active:scale-98"
            >
              <Save size={16} className="text-[#D97F00]" />
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
