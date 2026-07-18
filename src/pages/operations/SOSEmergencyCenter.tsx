import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Send, 
  Bus as BusIcon, 
  History, 
  AlertCircle,
  MessageSquare,
  Volume2,
  VolumeX,
  User,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getSOSSessions, addSOSMessage, resolveSOSSession, SOSSession } from '../../lib/sos';

export const SOSEmergencyCenter: React.FC = () => {
  const [sessions, setSessions] = useState<SOSSession[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user data to identify sender info
  const userRole = localStorage.getItem('user_role') || 'ADMIN';
  const adminEmail = localStorage.getItem('passenger_email') || 'admin@nigazhthisai.com';
  const adminName = localStorage.getItem('passenger_name') || (userRole === 'MASTER_ADMIN' ? 'Master Admin' : 'Admin Manager');
  const isMaster = userRole === 'MASTER_ADMIN';

  // Load owned buses for normal admins
  const getOwnedBusNumbers = (): string[] => {
    if (isMaster) return [];
    const storedBusesRaw = localStorage.getItem('nigazhthisai_buses');
    if (storedBusesRaw) {
      try {
        const parsedBuses = JSON.parse(storedBusesRaw);
        return parsedBuses
          .filter((b: any) => b.controllingAdmin === adminName)
          .map((b: any) => b.reg_no);
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback: If no buses are stored or matches, filter based on some defaults
    // Since 'Admin Manager' owns Bus 1 & 2 by default, let's include them as fallback
    if (adminName === 'Admin Manager') {
      return ['TN 39 AB 1234', 'TN 01 CD 5678'];
    }
    if (adminName === 'Operations Manager') {
      return ['TN 37 EF 9012', 'TN 66 GH 3456'];
    }
    return [];
  };

  const ownedBusNumbers = getOwnedBusNumbers();

  const isBusOwnedByAdmin = (busNo: string | undefined): boolean => {
    if (isMaster) return true;
    if (!busNo) return false;
    const normBusNo = busNo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return ownedBusNumbers.some(ownedNo => {
      const normOwned = ownedNo.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return normBusNo === normOwned || normBusNo.includes(normOwned) || normOwned.includes(normBusNo);
    });
  };

  // Fetch sessions
  const fetchSessions = () => {
    const list = getSOSSessions();
    setSessions(list);
  };

  useEffect(() => {
    fetchSessions();

    // Listen to custom event for real-time live updates
    const handleStorageUpdate = () => {
      fetchSessions();
    };

    window.addEventListener('sos_storage_update', handleStorageUpdate);

    // Also poll every 1000ms for fast "live" interaction within the iframe/same browser
    const pollInterval = setInterval(fetchSessions, 1000);

    return () => {
      window.removeEventListener('sos_storage_update', handleStorageUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  // Filter sessions visible to this admin
  const visibleSessions = sessions.filter(s => isBusOwnedByAdmin(s.busNo));

  // Play alert sound on new active SOS (optional/mocked using system Beep)
  useEffect(() => {
    const activeCount = visibleSessions.filter(s => s.status === 'ACTIVE').length;
    if (activeCount > 0 && soundEnabled && activeTab === 'ACTIVE') {
      // Gentle emergency beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // AudioContext browser security blocks this until first click, which is expected
      }
    }
  }, [visibleSessions.length, soundEnabled]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSessionId, sessions]);

  // Filter sessions by active/history tab
  const filteredSessions = visibleSessions.filter(s => {
    if (activeTab === 'ACTIVE') {
      return s.status === 'ACTIVE';
    } else {
      return s.status === 'SOLVED';
    }
  });

  // Auto-select first active session if none is selected
  useEffect(() => {
    if (filteredSessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(filteredSessions[0].id);
    }
  }, [filteredSessions, selectedSessionId]);

  const activeSession = sessions.find(s => s.id === selectedSessionId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSessionId) return;

    const updated = addSOSMessage(
      selectedSessionId,
      adminName,
      userRole as any,
      adminEmail,
      replyText.trim()
    );

    if (updated) {
      setReplyText('');
      fetchSessions();
    } else {
      toast.error('Failed to send message');
    }
  };

  const handleResolve = (id: string) => {
    const resolved = resolveSOSSession(id);
    if (resolved) {
      toast.success('SOS marked as Solved and emergency channel resolved.');
      fetchSessions();
      // Auto select next if available
      const remaining = sessions.filter(s => s.status === 'ACTIVE' && s.id !== id);
      if (remaining.length > 0) {
        setSelectedSessionId(remaining[0].id);
      } else {
        setSelectedSessionId(null);
      }
    } else {
      toast.error('Failed to resolve SOS');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-600 text-white rounded-2xl animate-pulse shadow-lg shadow-red-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0D2A5D] uppercase tracking-tight">SOS EMERGENCY CENTER</h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Live Crisis Management & Dispatch Communications
              </p>
              {!isMaster && (
                <span className="text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
                  Scoped: {adminName} ({ownedBusNumbers.length} Owned Buses)
                </span>
              )}
              {isMaster && (
                <span className="text-[9px] font-extrabold tracking-widest uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                  Global Visibility (Master Admin)
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 border rounded-xl flex items-center justify-center transition-all ${soundEnabled ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
            title={soundEnabled ? 'Mute Alert Sound' : 'Enable Alert Sound'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-xl">
            <button 
              onClick={() => {
                setActiveTab('ACTIVE');
                setSelectedSessionId(null);
              }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'ACTIVE' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <AlertCircle size={14} />
              Active ({visibleSessions.filter(s => s.status === 'ACTIVE').length})
            </button>
            <button 
              onClick={() => {
                setActiveTab('HISTORY');
                setSelectedSessionId(null);
              }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-[#0D2A5D]' : 'text-slate-500 hover:text-slate-800'} ${activeTab === 'HISTORY' ? 'text-white shadow-md' : ''}`}
            >
              <History size={14} />
              History ({visibleSessions.filter(s => s.status === 'SOLVED').length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* Left Side: Sessions List */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col h-[580px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
            {activeTab === 'ACTIVE' ? 'Incoming Distress Signals' : 'Resolved Incident Records'}
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 no-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredSessions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl"
                >
                  <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
                  <p className="text-xs font-bold text-[#0D2A5D] uppercase tracking-wide">All Clear</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                    {activeTab === 'ACTIVE' ? 'No active emergency distress signals at the moment.' : 'No completed emergency incident records found.'}
                  </p>
                </motion.div>
              ) : (
                filteredSessions.map((s) => {
                  const isSelected = s.id === selectedSessionId;
                  const lastMsg = s.messages[s.messages.length - 1];
                  
                  return (
                    <motion.div
                      key={s.id}
                      layoutId={`sos-card-${s.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-red-500 bg-red-50/10 shadow-md ring-2 ring-red-500/15' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${s.status === 'ACTIVE' ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                            <h3 className="text-xs font-black text-[#0D2A5D] uppercase tracking-tight">
                              {s.senderName}
                            </h3>
                          </div>
                          <p className="text-[10px] text-[#D97F00] font-bold uppercase tracking-wider flex items-center gap-1">
                            <BusIcon size={10} />
                            {s.busNo} ({s.district})
                          </p>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                          {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {lastMsg && (
                        <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-2 font-medium bg-white/40 p-2 rounded-lg border border-slate-100">
                          {lastMsg.message}
                        </p>
                      )}

                      {s.status === 'ACTIVE' && (
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(s.id);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Check size={10} />
                            Mark Solved
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Active Chat Frame */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col h-[580px] overflow-hidden">
          {activeSession ? (
            <div className="flex-1 flex flex-col h-full">
              
              {/* Active Session Header Info */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#0D2A5D] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {activeSession.id}
                    </span>
                    <h2 className="text-sm font-black text-[#0D2A5D] uppercase tracking-tight">
                      {activeSession.senderName}
                    </h2>
                  </div>
                  
                  {/* Detailed caller metadata */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Mail size={10} />
                      {activeSession.senderEmail}
                    </span>
                    {activeSession.senderMobile && (
                      <span className="flex items-center gap-1">
                        <Phone size={10} />
                        {activeSession.senderMobile}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[#D97F00]">
                      <BusIcon size={10} />
                      {activeSession.busNo} • {activeSession.routeName}
                    </span>
                  </div>
                </div>

                {activeSession.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleResolve(activeSession.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/10 transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    Mark Solved
                  </button>
                )}
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                {activeSession.messages.map((m) => {
                  const isAdminMsg = m.senderRole === 'ADMIN' || m.senderRole === 'MASTER_ADMIN';
                  const isSys = m.senderEmail === 'system@nigazhthisai.com' || m.senderEmail === 'system@nigazhthisai.com';
                  
                  if (isSys) {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <span className="bg-red-50 border border-red-200 text-red-600 font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full text-center max-w-md shadow-xs flex items-center gap-2">
                          <AlertCircle size={10} className="animate-bounce" />
                          {m.message}
                        </span>
                      </div>
                    );
                  }

                  if (m.message.includes('RESOLVED/SOLVED')) {
                    return (
                      <div key={m.id} className="flex justify-center my-2">
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full text-center max-w-md shadow-xs flex items-center gap-2">
                          <CheckCircle2 size={10} />
                          {m.message}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md rounded-2xl p-4 shadow-xs ${isAdminMsg ? 'bg-[#0D2A5D] text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <p className={`text-[9px] font-black uppercase tracking-wider ${isAdminMsg ? 'text-[#D97F00]' : 'text-[#0D2A5D]'}`}>
                            {m.senderName} ({m.senderRole.replace('_', ' ')})
                          </p>
                          <p className="text-[8px] opacity-60 font-medium">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-xs leading-relaxed font-semibold">
                          {m.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Sender Form */}
              <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                {activeSession.status === 'ACTIVE' ? (
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type priority response instructions here..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] text-xs font-semibold text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="bg-[#0D2A5D] hover:bg-[#123673] disabled:opacity-40 text-white p-3 px-5 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all"
                    >
                      <Send size={14} className="text-[#D97F00]" />
                      Reply
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-50 text-slate-400 text-center rounded-2xl border border-dashed border-slate-200 text-xs font-bold uppercase tracking-wider">
                    Closed Channel — Resolved History Mode
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={48} className="text-[#0D2A5D]/15 mb-4" />
              <h3 className="text-xs font-black text-[#0D2A5D] uppercase tracking-widest">Select Incident</h3>
              <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                Choose an emergency distress signal from the left column to engage live communication with the passenger.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
