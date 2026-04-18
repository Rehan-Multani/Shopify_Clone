import React from 'react';
import { Link } from 'react-router-dom';
import laptopImg from '../../../assets/platform-laptop.png';
import mobileImg from '../../../assets/platform-mobile.png';

const StartSellingSection = () => {
  const steps = [
    { number: '01', title: 'Add your first product' },
    { number: '02', title: 'Customize your store' },
    { number: '03', title: 'Set up payments' },
  ];

  return (
    <section className="bg-[#0B0F14] py-20 overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-10 text-center tracking-tight leading-tight">
          It's <span className="text-transparent bg-clip-text bg-gradient-to-r from-storify-glow to-storify">easy</span> to start selling
        </h2>

        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Side: Overlapping Images */}
          <div className="lg:w-1/2 relative flex items-center justify-center">
            {/* Main Image (Laptop) */}
            <div className="w-[80%] aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl z-10 transform -rotate-3 transition-transform hover:rotate-0 duration-700">
               <img src={laptopImg} alt="Laptop storefront" className="w-full h-full object-cover" />
            </div>
            {/* Secondary Image (Lifestyle) */}
            <div className="absolute -right-4 -bottom-10 w-[60%] aspect-square rounded-[40px] overflow-hidden border border-white/10 shadow-2xl z-20 translate-y-6 rotate-6 transition-transform hover:rotate-3 duration-700">
               <img src={mobileImg} alt="Mobile storefront" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right Side: Numbered List */}
          <div className="lg:w-1/2">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="group cursor-default">
                  <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                    <span className="text-storify-glow text-xl font-bold opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {step.number}
                    </span>
                    <h3 className="text-2xl lg:text-4xl text-white font-extrabold tracking-tight group-hover:text-storify-glow transition-colors duration-300 leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-16 flex flex-col md:flex-row items-center justify-between gap-12">
              <Link
                to="/login"
                className="h-16 px-10 teal-gradient text-white rounded-full text-lg font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center teal-glow uppercase tracking-widest"
              >
                Take your shot
              </Link>
 
              {/* Small Video Thumbnail Link */}
              <div className="bg-[#111827] backdrop-blur-xl p-3 border border-white/5 rounded-2xl flex items-center gap-4 shadow-2xl transition-all hover:scale-105 hover:border-storify/30 cursor-pointer max-w-xs group">
                <div className="w-10 h-10 rounded-full bg-storify flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-4 h-4 text-white fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </div>
                <div className="flex flex-col">
                   <span className="text-white text-xs font-bold leading-none mb-1 group-hover:text-storify-glow transition-colors">Why we build Storify</span>
                   <span className="text-gray-500 text-[10px] font-bold tracking-tight uppercase">Watch the story (2:30)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StartSellingSection;
