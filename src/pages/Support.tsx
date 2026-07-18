import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  FileText, 
  Send, 
  Phone, 
  Mail, 
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const Support: React.FC = () => {
  const [formState, setFormState] = useState({
    subject: '',
    message: ''
  });
  const [priority, setPriority] = useState('Normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.message) {
      toast.error('Please enter a message');
      return;
    }
    toast.success('Your message has been sent to our technical team');
    setFormState({ subject: '', message: '' });
  };

  const faqs = [
    { q: 'How to register a new bus?', a: 'Go to Operations > Buses and click "Add New Bus". You will need the RC details and ETM ID.' },
    { q: 'Idle alert not clearing?', a: 'Alerts must be manually acknowledged by an Admin. If the bus is moving but still shows idle, check GPS signal strength.' },
    { q: 'User permission mismatch?', a: 'Only Master Admins can modify user roles. Check the "Users & Roles" section under Settings.' },
    { q: 'How to filter by Zone?', a: 'Zone filter is a feature exclusive to Master Administrators. It is available on Dashboard, Monitoring, and Operations lists.' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 font-sans">
      {/* Support Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#0D2A5D] text-white rounded-2xl">
            <HelpCircle size={28} className="text-[#D97F00]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D2A5D] uppercase tracking-tight">Help Center</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nigazhthisai Ops Support & Documentation</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-extrabold text-[#0D2A5D]">24/7 Priority Support</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
              <ShieldCheck size={10} />
              Operational for Administrators
            </p>
          </div>
          <a href="tel:+914424794242" className="p-3.5 bg-white border border-slate-100 rounded-2xl text-[#0D2A5D] hover:bg-slate-50 hover:text-[#D97F00] transition-all shadow-xs">
            <Phone size={18} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <MessageSquare size={18} className="text-[#D97F00]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0D2A5D]">Send us a message</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Department</label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-100 text-xs font-bold text-[#0D2A5D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] appearance-none cursor-pointer">
                    <option>Technical Support</option>
                    <option>Revenue Discrepancy</option>
                    <option>Hardware/ETM Issues</option>
                    <option>User Management</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Priority</label>
                <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl">
                  {['Normal', 'High', 'Urgent'].map(p => (
                    <button 
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${priority === p ? 'bg-[#0D2A5D] text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Issue Subject</label>
              <input 
                type="text" 
                value={formState.subject}
                onChange={e => setFormState({...formState, subject: e.target.value})}
                placeholder="e.g. GPS Delay in Route 102"
                className="w-full px-4 py-2.5 bg-white border border-slate-100 text-xs font-bold text-[#0D2A5D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Detailed Description</label>
              <textarea 
                rows={4}
                value={formState.message}
                onChange={e => setFormState({...formState, message: e.target.value})}
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-2.5 bg-white border border-slate-100 text-xs font-bold text-[#0D2A5D] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2A5D]/10 focus:border-[#0D2A5D] transition-all resize-none"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-[#0D2A5D] hover:bg-[#0D2A5D]/95 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all">
              <Send size={14} className="text-[#D97F00]" />
              Submit Ticket
            </button>
          </form>
        </div>

        {/* Quick Help & FAQs */}
        <div className="space-y-6">
          <div className="bg-[#0D2A5D] rounded-3xl p-8 text-white shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-5 border-b border-white/10 pb-3 text-[#D97F00]">Knowledge Base</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="group flex items-center gap-3 text-xs font-bold text-slate-300 hover:text-white transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D97F00] group-hover:text-white transition-all">
                    <Book size={12} />
                  </div>
                  User Guide v2.4
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center gap-3 text-xs font-bold text-slate-300 hover:text-white transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D97F00] group-hover:text-white transition-all">
                    <FileText size={12} />
                  </div>
                  System API Specs
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center gap-3 text-xs font-bold text-slate-300 hover:text-white transition-all">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#D97F00] group-hover:text-white transition-all">
                    <Clock size={12} />
                  </div>
                  Maintenance Schedule
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="group cursor-help">
                  <p className="text-xs font-extrabold text-[#0D2A5D] mb-1 flex items-center justify-between">
                    {faq.q}
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#D97F00] transition-all" />
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium hidden group-hover:block transition-all py-2 border-t border-slate-50 mt-1.5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-150 border-dashed rounded-3xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Emergency Hotline</p>
            <p className="text-lg font-extrabold text-[#0D2A5D] mb-4">+91 (044) 2479 4242</p>
            <button className="w-full py-2 text-[10px] font-bold text-[#D97F00] uppercase tracking-wider border border-[#D97F00]/20 hover:bg-[#D97F00] hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 bg-white">
              <ExternalLink size={12} />
              Open Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
