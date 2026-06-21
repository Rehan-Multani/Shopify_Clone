import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Signup = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    planType: 'Single Vendor',
    plan: '',
    gstNumber: '',
    address: '',
    profile: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/plans`);
        const data = await res.json();
        if (res.ok) setPlans(data);
      } catch (err) {
        console.error('Failed to fetch plans', err);
      }
    };
    fetchPlans();
  }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const filteredPlans = plans.filter(p => p.planType === form.planType);

  const handleSignup = async (e) => {
    e?.preventDefault();
    setIsLoading(true);

    // Simulate signup for now since public API endpoint might not be available
    setTimeout(() => {
        setIsLoading(false);
        navigate('/admin/login');
    }, 1200);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Note: The /merchants/upload route currently requires master admin token.
    // For a real public signup, we would need an open upload endpoint or base64 encode the image.
    // For now we will mock the upload visually with base64 for preview.
    const reader = new FileReader();
    reader.onloadend = () => {
        set('profile', reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center py-12 px-6">
      
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <img src={logo} alt="Storify" className="h-12 w-auto" />
        <span className="text-4xl brand-text leading-none text-white">storify</span>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-[600px] bg-[#1F2937] border border-white/10 rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-8 md:p-10">
        
        <div className="space-y-1 mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Create your store</h1>
          <p className="text-gray-400 text-[15px] font-medium">Start your free trial today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          
          {/* Profile Upload Area */}
          <div className="flex flex-col items-center justify-center pb-6 border-b border-white/10">
              <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-md bg-[#111827] flex items-center justify-center">
                  {form.profile ? (
                      <img src={form.profile} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                  )}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                      <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {form.profile ? 'Change' : 'Upload'}
                      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
              </div>
              <p className="text-[11px] font-semibold text-gray-400 mt-3 uppercase tracking-wider">Merchant Avatar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">Merchant Name</label>
                  <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="e.g. John Doe" className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-storify transition-all" />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">Email Address</label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="e.g. john@store.com" className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-storify transition-all" />
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">Mobile Number</label>
                  <input type="text" required value={form.mobile} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      set('mobile', val);
                  }}
                      placeholder="10-digit mobile number" className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-storify transition-all" />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">Password</label>
                  <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)}
                          placeholder="••••••••" className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-storify transition-all pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          {showPassword ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                          )}
                      </button>
                  </div>
              </div>
          </div>

          {/* Plan selection removed - signup is free */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">GST Number</label>
                  <input type="text" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value.toUpperCase())}
                      placeholder="e.g. 22AAAAA0000A1Z5" className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-storify transition-all" />
              </div>
              <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">Address</label>
                  <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                      placeholder="e.g. 123 Main St, New York, US" className="w-full bg-[#111827] border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:outline-none focus:border-storify transition-all" />
              </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !form.name.trim() || !form.email || !form.password || form.mobile.length !== 10}
            className={`w-full bg-storify text-white font-bold rounded-lg py-3 mt-6 text-[15px] transition-all flex justify-center items-center ${(isLoading || !form.name.trim() || !form.email || !form.password || form.mobile.length !== 10) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-storify-glow active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="text-center pt-5 border-t border-white/10 mt-6">
          <p className="text-gray-400 text-[14px]">
            Already have a Storify account?{' '}
            <Link to="/admin/login" className="text-storify font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
