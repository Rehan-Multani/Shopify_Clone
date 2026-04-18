import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

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
        return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M15.93 17.13c-1.35.81-4.05 1.48-6.17 1.48-5.3 0-6.13-3.41-6.13-3.87 0-.46.33-1.02.8-1.02.47 0 .52.03.79.16 1.83.92 4.3 1.34 6.34 1.25 1.57-.07 3.39-.53 4.29-1.32.26-.23.1-.9-.12-1.44-.12-.31-.48-1.25-.48-1.25s.12-.13.33-.04c.21.09 1.43 1.5 1.44 2.8.01 1.05-.44 2.45-1.09 3.25zm.9-2.22c-.11-.11-.2-.1-.31 0s-1.12.87-2.3 1.55c-1.18.68-2.6 1.01-3.9 1.01-4 0-4.88-2.3-4.88-2.6 0-.3.3-.6.6-.6.3 0 1.2 1.3 4.28 1.3 3.08 0 5.4-1.32 5.5-1.42s.11-.1 0 0z"/></svg>;
      case 'instagram':
        return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M13 3h-2c-3 0-5.5 2.5-5.5 5.5v2.5h11v-2.5c0-3-2.5-5.5-5.5-5.5zm-5 5.5v2.5h-2.5v-2.5h2.5zM12 18c-3.3 0-6-2.7-6-6h12c0 3.3-2.7 6-6 6zm7.5-7.5h-2.5v-2.5h2.5v2.5z"/></svg>;
      case 'facebook':
        return <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
      case 'etsy':
        return <span className="font-serif font-black text-[#F45800]">E</span>;
      case 'tiktok':
        return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>;
      case 'ebay':
        return <span className="font-bold flex italic"><span className="text-[#E53238]">e</span><span className="text-[#0064D2]">b</span><span className="text-[#F5AF02]">a</span><span className="text-[#86B817]">y</span></span>;
      case 'wix':
        return <span className="font-black text-black tracking-tighter">Wix</span>;
      case 'square':
        return <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3v18h18V3zm-2 16H5V5h14v14zM15 9H9v6h6V9z"/></svg>;
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
      <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center px-6 py-12">
        {/* Stacked Cards Visual Effect */}
        <div className="w-full max-w-4xl relative">
          {/* Decorative Back Layers */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[92%] h-20 bg-white/5 rounded-t-[32px] z-0"></div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[96%] h-20 bg-white/10 rounded-t-[32px] z-[5]"></div>
          
          {/* Main Onboarding Card */}
          <div className="relative bg-[#111827] border border-white/5 rounded-[32px] p-8 lg:p-12 shadow-2xl animate-in slide-in-from-right-8 fade-in duration-500 z-10 transition-all">
             <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight leading-tight">
                  {currentStepData.title}
                </h1>
                <p className="text-gray-400 font-medium text-lg leading-relaxed">
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
                      className="w-full bg-[#1F2937] py-4 px-6 text-lg font-medium text-white outline-none placeholder:text-gray-500"
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
                          ? 'border-storify bg-storify/10 teal-glow shadow-lg' 
                          : 'border-white/5 bg-[#1F2937] hover:bg-[#2c3747] hover:border-white/10 text-white'
                      } ${onboardingStep === 3 ? 'py-4 px-5' : 'p-6'}`}
                    >
                      <div className="flex items-center gap-4 max-w-[85%]">
                         {option.icon && (
                           <div className={`w-10 h-10 rounded-lg bg-[#0B0F14] shadow-sm flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110 ${currentSelections.includes(option.id) ? 'border-storify/30' : ''}`}>
                              {renderIcon(option.icon)}
                           </div>
                         )}
                         <div>
                            <h3 className={`font-bold text-sm lg:text-base transition-colors ${
                              currentSelections.includes(option.id) 
                                ? 'text-storify-glow' 
                                : 'text-white'
                            }`}>{option.title}</h3>
                            {option.desc && <p className="text-xs mt-1 leading-relaxed font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{option.desc}</p>}
                         </div>
                      </div>
                      
                      {/* Selected Indicator */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        currentSelections.includes(option.id)
                          ? 'bg-storify border-storify teal-glow'
                          : 'border-gray-600 group-hover:border-gray-500'
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
             <div className="flex items-center justify-between border-t border-white/5 pt-8">
                <button 
                  onClick={handleBack}
                  className="px-6 py-2.5 text-gray-400 font-bold hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
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
                      : 'bg-[#1F2937] text-gray-500 cursor-not-allowed border border-white/5'
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
             className="text-white/40 hover:text-storify-glow font-bold text-sm flex items-center gap-2 transition-all group"
           >
              Skip customized setup
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
           </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center px-6 py-12">
      
      {/* Logo */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
         <img src={logo} alt="Storify" className="w-24 h-auto" />
      </div>
 
      {/* Header Texts */}
      <div className="text-center mb-10">
         <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
            Start your free trial
         </h1>
         <p className="text-gray-400 text-sm lg:text-base font-medium">
            3 days free, then 3 months for <span className="text-storify-glow">₹20/month</span>
         </p>
      </div>
 
      {/* Main Card (Auth Step) */}
      <div className="w-full max-w-md bg-[#111827] border border-white/5 rounded-[32px] p-8 lg:p-10 shadow-2xl animate-in fade-in zoom-in duration-500">
        <form className="space-y-6" onSubmit={handleContinue}>
          <div className="space-y-1">
            <div className="relative border border-white/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-storify focus-within:border-transparent transition-all bg-[#1F2937]">
               <label className="absolute top-2 left-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email address</label>
               <input 
                  type="email" 
                  autoFocus
                  required
                  placeholder="name@company.com"
                  className="w-full bg-transparent pt-6 pb-2 px-4 text-white text-sm font-medium focus:outline-none placeholder:text-gray-600"
               />
            </div>
          </div>
 
          <button type="submit" className="w-full teal-gradient text-white font-bold py-4 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm tracking-wide shadow-lg teal-glow">
            Continue with email
          </button>
        </form>
 
        <div className="relative my-10 flex items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 lowercase tracking-widest">or</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>
 
        {/* Social Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={handleContinue} className="w-12 h-12 bg-[#1F2937] border border-white/5 rounded-lg flex items-center justify-center hover:bg-[#2c3747] hover:border-white/10 transition-all group shadow-md">
             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.011 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/></svg>
          </button>
          <button onClick={handleContinue} className="w-12 h-12 bg-[#1F2937] border border-white/5 rounded-lg flex items-center justify-center hover:bg-[#2c3747] hover:border-white/10 transition-all group shadow-md">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.91 3.22-1.92 4.24-1.2 1.2-3.08 1.48-4.92 1.48-3.04 0-5.48-2.48-5.48-5.52s2.44-5.52 5.48-5.52c1.68 0 3.12.6 4.24 1.64l2.32-2.32c-1.88-1.76-4.36-2.84-7.56-2.84-6.4 0-11.64 5.24-11.64 11.64s5.24 11.64 11.64 11.64c3.48 0 6.12-1.16 8.16-3.28 2.08-2.08 2.72-5 2.72-7.44 0-.48-.04-.96-.12-1.44h-9.76z"/></svg>
          </button>
          <button onClick={handleContinue} className="w-12 h-12 bg-[#1F2937] border border-white/5 rounded-lg flex items-center justify-center hover:bg-[#2c3747] hover:border-white/10 transition-all group shadow-md">
             <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </button>
        </div>
 
        {/* Card Footer */}
        <div className="text-center">
            <p className="text-gray-500 text-[13px] font-medium leading-relaxed">
                Already have a Storify account? <Link to="/login" onClick={() => setStep('auth')} className="text-white font-bold hover:text-storify-glow hover:underline underline-offset-4 decoration-1 transition-all">Log in</Link>
            </p>
        </div>
      </div>
 
      {/* Regional Selector Footer */}
      <div className="mt-16 bg-[#111827] border border-white/5 rounded-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-[#1F2937] transition-all group shadow-sm">
          <span className="text-white text-xs font-bold">India</span>
          <svg className="w-4 h-4 text-gray-500 group-hover:text-storify-glow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
      </div>
 
      {/* Page Links Footer */}
      <div className="mt-8 flex gap-8">
          {['Help', 'Privacy', 'Terms'].map((link) => (
              <a key={link} href="#" className="text-gray-600 text-[11px] font-bold tracking-[0.2em] uppercase hover:text-white transition-colors">{link}</a>
          ))}
      </div>
    </div>
  );
};

export default Login;
