import React from 'react';
import { Link } from 'react-router-dom';
import mockupBg from '../../../assets/platform-laptop.png';

const SellEverywhereSection = () => {
  return (
    <section className="bg-[#0a0f1a] pt-8 pb-24 overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-6">
        {/* Text Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <p className="text-[#2dd4bf] font-bold text-sm uppercase tracking-widest mb-4">
              Online and in person
            </p>
            <h2 className="text-4xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight lg:leading-[0.95]">
              Sell here, there, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">everywhere</span>
            </h2>
          </div>
          <p className="text-lg lg:text-xl text-white/70 max-w-sm lg:text-right font-normal leading-relaxed">
            <Link to="/login" className="text-[#00c2c2] hover:underline cursor-pointer font-bold">Get a stunning store</Link> that's made to sell. Design fast with AI, choose a stylish theme, or build completely custom for full control.
          </p>
        </div>

        {/* Mockup Showcase */}
        <div className="relative rounded-[40px] bg-[#001c1c] p-6 lg:p-12 overflow-hidden shadow-2xl border border-white/5 group">
          
          <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-[30px] overflow-hidden flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar UI Mockup (Left) - NOW DARK THEMED */}
            <div className="hidden lg:block w-72 h-full bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl relative z-20 flex-shrink-0 border border-white/10 animate-in fade-in slide-in-from-left duration-1000">
               <div className="border-b border-white/10 pb-4 mb-6">
                  <h3 className="text-xl font-bold text-white">Home page</h3>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Header</span>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-sm text-gray-300 border border-white/5">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                      Header
                    </div>
                  </div>

                  <div>
                     <div className="flex items-center gap-2 text-sm text-[#00c2c2] font-bold mb-4 cursor-pointer hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add section
                     </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-3">Template</span>
                    <div className="flex items-center gap-2 p-2 text-sm text-gray-300 border border-white/10 rounded-lg bg-white/5">
                       <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                       Rich text
                    </div>
                  </div>
               </div>

               <div className="absolute top-6 -right-3">
                  <div className="bg-[#00c2c2] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">Draft</div>
               </div>
            </div>

            {/* Storefront Preview (Center/Right) */}
            <div className="flex-grow relative h-full rounded-2xl overflow-hidden shadow-inner group/preview border border-white/5">
               <img 
                  src={mockupBg} 
                  alt="Store mockup" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover/preview:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
               
               {/* Store Branding Overlay */}
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/10">
                  <h4 className="text-white text-3xl font-light mb-6 tracking-[0.2em] transform transition-transform duration-700 group-hover:translate-y-[-5px]">
                     THE STATEMENT SWEATER
                  </h4>
                  <button className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all active:scale-95 shadow-2xl">
                     SHOP ALL
                  </button>
               </div>

               {/* Corner Video Overlay */}
               <div className="absolute bottom-6 right-6">
                  <div className="bg-black/80 backdrop-blur-xl p-3 border border-white/10 rounded-2xl flex items-center gap-3 shadow-2xl transition-transform hover:scale-105 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                       <svg className="w-3 h-3 text-black fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <span className="text-white text-xs font-bold whitespace-nowrap">Why we build Shopify</span>
                  </div>
               </div>
            </div>

          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00c2c2]/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00c2c2]/5 blur-[80px] rounded-full pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};

export default SellEverywhereSection;
