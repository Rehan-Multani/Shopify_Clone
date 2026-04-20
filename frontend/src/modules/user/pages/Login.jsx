import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';
import loginBg from '../../../assets/login-bg.png';
import video2 from '../../../assets/7687926-uhd_3840_2160_30fps.mp4';

const Login = () => {
  const [step, setStep] = useState('auth'); // 'auth' or 'onboarding'
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selections, setSelections] = useState({}); // { 1: [ids], 2: [ids] }
  const [storeName, setStoreName] = useState('');

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
      window.location.href = '/dashboard';
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
             onClick={() => window.location.href = '/'}
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
    <div className="min-h-screen bg-[#0B0D11] flex flex-col items-center justify-center px-6 py-10">

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <img src={logo} alt="Storify" className="h-20 w-auto" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.25)] p-8 space-y-5">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Log in</h1>
          <p className="text-gray-500 text-[15px] font-medium">Continue to Storify</p>
        </div>

        {/* Form area */}
        <div className="space-y-3">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700 block ml-0.5">
              Email
            </label>
            <input
              type="email"
              autoFocus
              required
              className="w-full border-2 border-gray-200 rounded-lg py-1.5 px-4 text-gray-900 text-base font-medium focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Continue Button */}
          <form onSubmit={handleContinue}>
            <button
              type="submit"
              className="w-full bg-[#1A1C21] text-white font-bold rounded-lg py-3 text-[15px] hover:bg-[#2A2C31] active:scale-[0.98] transition-all"
            >
              Continue with email
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm font-medium text-gray-400">or</span>
            </div>
          </div>

          {/* Passkey Button */}
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-3 bg-[#F1F2F4] text-gray-700 font-bold rounded-lg py-3 text-[15px] hover:bg-[#E1E2E4] transition-all"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Sign in with passkey
          </button>

          {/* Social Row */}
          <div className="flex gap-3 pt-1">
            {['apple', 'facebook', 'google'].map((provider) => (
              <button
                key={provider}
                onClick={handleContinue}
                className="flex-1 h-12 bg-[#F1F2F4] rounded-lg flex items-center justify-center hover:bg-[#E1E2E4] transition-all"
              >
                {provider === 'apple' && <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.011 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" /></svg>}
                {provider === 'facebook' && <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                {provider === 'google' && <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" /><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#FBBC05" d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /></svg>}
              </button>
            ))}
          </div>
        </div>

        {/* Signup Link */}
        <p className="text-sm font-medium text-gray-500">
          New to Storify?{' '}
          <Link to="/signup" className="text-black font-bold hover:underline transition-all">
            Get started →
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center space-y-4">
        <a href="#" className="text-white text-[13px] font-bold hover:underline block">Need Help?</a>
        <p className="text-gray-400 text-[12px] font-medium leading-relaxed">
          By continuing, you agree to the <a href="#" className="text-white font-bold hover:underline">Terms</a> and <a href="#" className="text-white font-bold hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
