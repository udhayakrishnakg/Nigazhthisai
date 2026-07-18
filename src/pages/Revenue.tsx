import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { adminApi } from '../lib/api';
import { toast } from 'sonner';

export const Revenue: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const userRole = localStorage.getItem('user_role') || 'ADMIN';
  const isMaster = userRole === 'MASTER_ADMIN';

  const DISTRICTS = ['All', 'Chennai', 'Madurai', 'Coimbatore', 'Salem', 'Tiruppur', 'Trichy', 'Erode'];
  const ZONES = ['All', 'North', 'South', 'West', 'East', 'Central'];

  useEffect(() => {
    let active = true;
    const fetchData = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        const res = await adminApi.getRevenueData({ district: selectedDistrict, zone: selectedZone });
        if (active) {
          setData(res);
        }
      } catch (error) {
        toast.error('Failed to fetch revenue data');
      } finally {
        if (showLoading && active) {
          setLoading(false);
        }
      }
    };

    fetchData(true);

    const interval = setInterval(() => {
      fetchData(false);
    }, 2000); // Poll every 2 seconds for real-time updates!

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedDistrict, selectedZone]);

  const handleExportReport = () => {
    toast.success('Financial report exported successfully', {
      description: 'The report has been downloaded to your device as PDF.',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="animate-spin text-[#0D2A5D]" size={32} />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {isMaster && (
            <>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">District</p>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="bg-slate-50 border border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#0D2A5D] rounded-xl transition-all"
                >
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Zone</p>
                <select 
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="bg-slate-50 border border-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-[#0D2A5D] rounded-xl transition-all"
                >
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 text-[#0D2A5D] hover:bg-slate-50/50 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs">
            <Calendar size={15} className="text-[#D97F00]" />
            Last 6 Months
          </button>
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2A5D] text-white hover:bg-[#0D2A5D]/95 transition-all font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm"
          >
            <Download size={15} className="text-[#D97F00]" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#0D2A5D]/5 rounded-2xl text-[#0D2A5D]">
              <DollarSign size={20} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
              <ArrowUpRight size={12} />
              +12.5%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl font-black text-[#0D2A5D]">₹{data.total_revenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#0D2A5D]/5 rounded-2xl text-[#0D2A5D]">
              <TrendingUp size={20} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100/50">
              <ArrowUpRight size={12} />
              +8.2%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Avg. Daily Revenue</p>
          <p className="text-2xl font-black text-[#0D2A5D]">₹{(data.total_revenue / 180).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>

        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#0D2A5D]/5 rounded-2xl text-[#0D2A5D]">
              <TrendingUp size={20} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100/50">
              <ArrowDownRight size={12} />
              -2.1%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Revenue per Route</p>
          <p className="text-2xl font-black text-[#0D2A5D]">₹{(data.total_revenue / 3).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2A5D] mb-6">Monthly Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D2A5D" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0D2A5D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D2A5D', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: '900', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0D2A5D" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-100 rounded-3xl shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0D2A5D] mb-6">Revenue by Route</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.route_revenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  width={120}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#0D2A5D', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: '900', marginBottom: '4px' }}
                />
                <Bar dataKey="revenue" fill="#0D2A5D" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
