import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';
import loginBg from '../../../assets/login-bg.png';
import video2 from '../../../assets/7687926-uhd_3840_2160_30fps.mp4';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('auth'); // 'auth' or 'onboarding'
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selections, setSelections] = useState({}); // { 1: [ids], 2: [ids] }
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('single@storify.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMerchantLogin = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
      const response = await fetch(`${AUTH_API_URL}/merchant/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('merchantInfo', JSON.stringify(data.merchant));
        localStorage.setItem('merchantToken', data.token);
        localStorage.setItem('shopStoreName', data.merchant.name);
        
        const isMulti =
          email.trim().toLowerCase() === 'multi@storify.com' ||
          data.merchant.planType === 'Multi Vendor' ||
          data.merchant.plan?.planType === 'Multi Vendor';
        localStorage.setItem('adminPanelType', isMulti ? 'multi' : 'single');
        
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const toggleSelection = (stepId, itemId) => {
    const currentSelections = selections[stepId] || [];
    if (currentSelections.includes(itemId)) {
      setSelections({
        ...selections,
        [stepId]: currentSelections.filter(s => s !== itemId)
      });
    } else {
      setSelections({
        ...selections,
        [stepId]: [...currentSelections, itemId]
      });
    }
  };

  const steps = {
    1: {
      title: "Where would you like to sell?",
      subtitle: "We'll make sure you're set up to sell in these places",
      options: [
        { id: 'store', title: 'An online store', desc: 'Create a fully customizable website' },
        { id: 'retail', title: 'In person at a retail store', desc: 'Brick-and-mortar stores' },
        { id: 'events', title: 'In person at events', desc: 'Markets, fairs, and pop-ups' },
        { id: 'existing', title: 'An existing website or blog', desc: 'Add a Buy Button to your website' },
        { id: 'social', title: 'Social media', desc: 'Reach customers on Facebook, Instagram, TikTok, and more' },
        { id: 'marketplaces', title: 'Online marketplaces', desc: 'List products on Etsy, Amazon, and more' },
      ]
    },
    2: {
      title: "Is this shop for a new or existing business?",
      subtitle: "This helps us suggest the right onboarding",
      options: [
        { id: 'new', title: 'New business or idea', desc: '' },
        { id: 'existing_business', title: 'Existing business', desc: '' },
      ]
    },
    3: {
      title: "Do you currently sell on other platforms?",
      subtitle: "We make it easy to migrate to Storify",
      options: [
        { id: 'none', title: "No, I'm not using any platform", desc: "" },
        { id: 'amazon', title: "Amazon", icon: "amazon" },
        { id: 'instagram', title: "Instagram", icon: "instagram" },
        { id: 'facebook', title: "Facebook Marketplace", icon: "facebook" },
        { id: 'etsy', title: "Etsy", icon: "etsy" },
        { id: 'tiktok', title: "TikTok", icon: "tiktok" },
        { id: 'ebay', title: "eBay", icon: "ebay" },
        { id: 'wix', title: "Wix", icon: "wix" },
        { id: 'square', title: "Square", icon: "square" },
      ]
    },
    4: {
      title: "Do you want to use your Instagram page as a starting point?",
      subtitle: "We'll help you import your content and data when you're ready",
      options: [
        { id: 'yes', title: 'Yes', desc: '' },
        { id: 'no', title: 'No', desc: '' },
      ]
    },
    5: {
      title: "What do you plan to sell?",
      subtitle: "We'll get you the right features and tools",
      options: [
        { id: 'buy_make', title: 'Products I buy or make myself', desc: 'Shipped by me' },
        { id: 'digital', title: 'Digital products', desc: 'Music, digital art, NFTs' },
        { id: 'dropshipping', title: 'Dropshipping products', desc: 'Sourced and shipped by a third party' },
        { id: 'services', title: 'Services', desc: 'Coaching, housekeeping, consulting' },
        { id: 'pod', title: 'Print-on-demand products', desc: 'My designs, printed and shipped by a third party' },
        { id: 'later', title: "I'll decide later", desc: '' },
      ]
    },
    6: {
      title: "Almost done! What should we call your store?",
      subtitle: "You can change your store name anytime",
      type: 'input'
    }
  };

  const renderIcon = (platform) => {
    switch (platform) {
      case 'amazon':
        return <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><path d="M15.93 17.13c-1.35.81-4.05 1.48-6.17 1.48-5.3 0-6.13-3.41-6.13-3.87 0-.46.33-1.02.8-1.02.47 0 .52.03.79.16 1.83.92 4.3 1.34 6.34 1.25 1.57-.07 3.39-.53 4.29-1.32.26-.23.1-.9-.12-1.44-.12-.31-.48-1.25-.48-1.25s.12-.13.33-.04c.21.09 1.43 1.5 1.44 2.8.01 1.05-.44 2.45-1.09 3.25zm.9-2.22c-.11-.11-.2-.1-.31 0s-1.12.87-2.3 1.55c-1.18.68-2.6 1.01-3.9 1.01-4 0-4.88-2.3-4.88-2.6 0-.3.3-.6.6-.6.3 0 1.2 1.3 4.28 1.3 3.08 0 5.4-1.32 5.5-1.42s.11-.1 0 0z"/></svg>;
      case 'instagram':
        return <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M13 3h-2c-3 0-5.5 2.5-5.5 5.5v2.5h11v-2.5c0-3-2.5-5.5-5.5-5.5zm-5 5.5v2.5h-2.5v-2.5h2.5zM12 18c-3.3 0-6-2.7-6-6h12c0 3.3-2.7 6-6 6zm7.5-7.5h-2.5v-2.5h2.5v2.5z"/></svg>;
      case 'facebook':
        return <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
      case 'etsy':
        return <span className="font-serif font-black text-[#F45800]">E</span>;
      case 'tiktok':
        return <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>;
      case 'ebay':
        return <span className="font-bold flex italic"><span className="text-[#E53238]">e</span><span className="text-[#0064D2]">b</span><span className="text-[#F5AF02]">a</span><span className="text-[#86B817]">y</span></span>;
      case 'wix':
        return <span className="font-black text-black tracking-tighter">Wix</span>;
      case 'square':
        return <svg className="w-6 h-6 text-gray-900" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3v18h18V3zm-2 16H5V5h14v14zM15 9H9v6h6V9z"/></svg>;
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (onboardingStep === 3) {
      if (selections[3]?.includes('instagram')) {
        setOnboardingStep(4);
      } else {
        setOnboardingStep(5);
      }
    } else if (onboardingStep < Object.keys(steps).length) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      localStorage.setItem('shopStoreName', storeName || 'My Store');
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (onboardingStep === 5) {
      if (selections[3]?.includes('instagram')) {
        setOnboardingStep(4);
      } else {
        setOnboardingStep(3);
      }
    } else if (onboardingStep === 4) {
      setOnboardingStep(3);
    } else if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    } else {
      setStep('auth');
    }
  };

  const handleContinue = (e) => {
    e?.preventDefault();
    setStep('onboarding');
    setOnboardingStep(1);
  };

  if (step === 'onboarding') {
    const currentStepData = steps[onboardingStep];
    const currentSelections = selections[onboardingStep] || [];

    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-6 py-12">
        {/* Stacked Cards Visual Effect */}
        <div className="w-full max-w-4xl relative">
          {/* Decorative Back Layers */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[92%] h-20 bg-black/5 rounded-t-[32px] z-0"></div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[96%] h-20 bg-black/10 rounded-t-[32px] z-[5]"></div>
          
          {/* Main Onboarding Card */}
          <div className="relative bg-white border border-black/5 rounded-[32px] p-8 lg:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.08)] animate-in slide-in-from-right-8 fade-in duration-500 z-10 transition-all">
             <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight leading-tight">
                  {currentStepData.title}
                 </h1>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  {currentStepData.subtitle}
                </p>
             </div>

             {/* Options Grid or Input Field */}
             {currentStepData.type === 'input' ? (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="relative border border-white/10 rounded-xl overflow-hidden focus-within:border-storify focus-within:ring-4 focus-within:ring-storify/10 transition-all">
                    <input 
                      type="text"
                      placeholder="Store name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-gray-50 py-4 px-6 text-lg font-medium text-gray-900 outline-none placeholder:text-gray-400"
                      autoFocus
                    />
                  </div>
                </div>
             ) : (
               <div className={`grid gap-4 mb-12 ${
                 onboardingStep === 3 
                   ? 'grid-cols-2 md:grid-cols-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar' 
                   : 'grid-cols-1 md:grid-cols-2'
               }`}>
                  {currentStepData.options.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => toggleSelection(onboardingStep, option.id)}
                      className={`relative rounded-2xl border transition-all duration-300 flex justify-between items-center group overflow-hidden ${
                        currentSelections.includes(option.id) 
                          ? 'border-storify bg-storify/5' 
                          : 'border-black/5 bg-gray-50 hover:bg-white hover:border-black/10 text-gray-900 shadow-sm'
                      } ${onboardingStep === 3 ? 'py-4 px-5' : 'p-6'}`}
                    >
                      <div className="flex items-center gap-4 max-w-[85%]">
                         {option.icon && (
                           <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-black/5 transition-transform group-hover:scale-110 ${currentSelections.includes(option.id) ? 'border-storify/30' : ''}`}>
                              {renderIcon(option.icon)}
                           </div>
                         )}
                         <div>
                            <h3 className={`font-bold text-sm lg:text-base transition-colors ${
                              currentSelections.includes(option.id) 
                                ? 'text-storify' 
                                : 'text-gray-900'
                            }`}>{option.title}</h3>
                            {option.desc && <p className="text-xs mt-1 leading-relaxed font-medium text-gray-500 group-hover:text-gray-300 transition-colors">{option.desc}</p>}
                         </div>
                      </div>
                      
                      {/* Selected Indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        currentSelections.includes(option.id)
                          ? 'bg-storify border-storify'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                        {currentSelections.includes(option.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
               </div>
             )}

             {/* Footer Navigation */}
             <div className="flex items-center justify-between border-t border-black/5 pt-8">
                <button 
                  onClick={handleBack}
                  className="px-6 py-2.5 text-gray-400 font-bold hover:text-gray-900 hover:bg-black/5 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>

                <button 
                  onClick={handleNext}
                  disabled={onboardingStep !== 6 && currentSelections.length === 0}
                  className={`px-10 py-3 font-bold rounded-lg transition-all flex items-center gap-2 shadow-xl ${
                    onboardingStep === 6 || currentSelections.length > 0 
                      ? 'teal-gradient text-white hover:opacity-90 active:scale-95 teal-glow' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-black/5'
                  }`}
                >
                  {onboardingStep === 6 ? (storeName ? 'Next' : "I'll do this later") : 'Next'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
             </div>
          </div>
        </div>

        {/* Global Skip Link */}
        <div className="mt-12">
           <button 
             onClick={() => navigate('/')}
             className="text-gray-400 hover:text-storify font-bold text-sm flex items-center gap-2 transition-all group"
           >
              Skip customized setup
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center px-6 py-10">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <img src={logo} alt="Storify" className="h-12 w-auto" />
        <span className="text-4xl brand-text leading-none text-white">storify</span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[440px] bg-[#1F2937] border border-white/10 rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-8 space-y-5">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Merchant Login</h1>
          <p className="text-gray-400 text-[15px] font-medium">Log in to manage your store admin panel</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form area */}
        <form onSubmit={handleMerchantLogin} className="space-y-5">
          {/* Demo Login Tab Selector */}
          <div className="flex gap-2 bg-[#111827] p-1 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => {
                setEmail('single@storify.com');
                setPassword('password123');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                email.trim().toLowerCase() === 'single@storify.com'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Single Vendor Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('multi@storify.com');
                setPassword('password123');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                email.trim().toLowerCase() === 'multi@storify.com'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Multi Vendor Demo
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111827] border-2 border-white/10 rounded-lg py-2.5 px-4 text-white text-base font-medium focus:outline-none focus:border-storify transition-all"
              placeholder="name@store.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-[13px] font-semibold text-gray-300 block">
                Password
              </label>
              <Link to="/forgot-password" className="text-[12px] font-semibold text-storify hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111827] border-2 border-white/10 rounded-lg py-2.5 px-4 text-white text-base font-medium focus:outline-none focus:border-storify transition-all pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-storify text-white font-bold rounded-lg py-3 mt-2 text-[15px] transition-all flex justify-center items-center cursor-pointer ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-storify-glow active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-gray-400 text-[14px]">
            New to Storify?{' '}
            <Link to="/signup" className="text-storify font-semibold hover:underline">
              Create your store
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
