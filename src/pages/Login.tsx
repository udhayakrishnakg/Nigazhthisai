import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Lock, Mail, ArrowRight, Loader2, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminApi, conductorApi } from '../lib/api';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('master@nigazhthisai.com');
  const [password, setPassword] = useState('master123');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [role, setRole] = useState<'MASTER_ADMIN' | 'ADMIN' | 'CONDUCTOR' | 'PASSENGER'>('MASTER_ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Registration States
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleRoleChange = (r: any) => {
    setRole(r);
    setIsRegistering(false); // Reset register mode on role change
    if (r === 'MASTER_ADMIN') {
      setEmail('master@nigazhthisai.com');
      setPassword('master123');
    } else if (r === 'ADMIN') {
      setEmail('admin@nigazhthisai.com');
      setPassword('admin123');
    } else if (r === 'CONDUCTOR') {
      setEmail('conductor@nigazhthisai.com');
      setPassword('conductor123');
    } else {
      setEmail('passenger@nigazhthisai.com');
      setPassword('passenger123');
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setIsLoading(true);
    try {
      await conductorApi.sendOTP(phone);
      setShowOtp(true);
      toast.success('OTP sent to your phone');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegistering && role === 'PASSENGER') {
        if (!regName || !regEmail || !regMobile || !regPassword) {
          toast.error('Please fill in all registration fields');
          setIsLoading(false);
          return;
        }
        await adminApi.registerPassenger({
          name: regName,
          email: regEmail,
          mobile: regMobile,
          password: regPassword
        });
        toast.success('Registration successful! You can now sign in.');
        setEmail(regEmail);
        setPassword(regPassword);
        setIsRegistering(false);
      } else {
        if (role === 'MASTER_ADMIN' || role === 'ADMIN') {
          const response = await adminApi.login({ email, password });
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('user_role', response.user.role);
          localStorage.setItem('passenger_email', response.user.email);
          localStorage.setItem('passenger_name', response.user.name);
          toast.success(`Welcome ${response.user.name}`);
          navigate('/dashboard');
        } else if (role === 'CONDUCTOR') {
          const response = await conductorApi.login({ email, password });
          localStorage.setItem('admin_token', response.token);
          localStorage.setItem('user_role', response.user.role);
          toast.success('Login successful');
          navigate('/conductor');
        } else {
          // Passenger login
          try {
            const response = await adminApi.login({ email, password });
            if (response.user.role === 'PASSENGER') {
              localStorage.setItem('admin_token', response.token);
              localStorage.setItem('user_role', 'PASSENGER');
              localStorage.setItem('passenger_email', response.user.email);
              localStorage.setItem('passenger_name', response.user.name);
              toast.success(`Welcome ${response.user.name}`);
              navigate('/passenger');
              return;
            }
          } catch (err) {
            // Fallback for default passenger
            if (email === '' && password === '') {
              localStorage.setItem('admin_token', 'passenger-token');
              localStorage.setItem('user_role', 'PASSENGER');
              toast.success('Login successful');
              navigate('/passenger');
              return;
            }
            throw err;
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, #0D2A5D 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl relative z-10 space-y-6"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-[#0D2A5D] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#0D2A5D]/20 overflow-hidden">
            <img src="/favicon.jpeg" className="w-full h-full object-cover" alt="Logo" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0D2A5D]">
            NIGAZHTHISAI
          </h1>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.25em] font-bold mt-1">Management Portal</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-100">
          {(['MASTER_ADMIN', 'ADMIN', 'CONDUCTOR', 'PASSENGER'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${
                role === r 
                  ? 'bg-[#0D2A5D] text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && role === 'PASSENGER' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D2A5D]">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none transition-all font-medium text-xs text-slate-800"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D2A5D]">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none transition-all font-medium text-xs text-slate-800"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D2A5D]">
                    <Phone size={16} />
                  </div>
                  <input 
                    type="tel" 
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none transition-all font-medium text-xs text-slate-800"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D2A5D]">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none transition-all font-medium text-xs text-slate-800"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0D2A5D] hover:bg-[#123673] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    Register Account
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D2A5D]">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none transition-all font-medium text-xs text-slate-800"
                    placeholder="conductor@nigazhthisai.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D2A5D]">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-[#0D2A5D] rounded-xl outline-none transition-all font-medium text-xs text-slate-800"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#0D2A5D] hover:bg-[#123673] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </>
          )}
        </form>

        {role === 'PASSENGER' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[10px] text-[#0D2A5D] hover:text-[#D97F00] font-black uppercase tracking-wider transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'New here? Register as Passenger'}
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
            Forgot password? Contact administrator
          </p>
        </div>
      </motion.div>
    </div>
  );
};
