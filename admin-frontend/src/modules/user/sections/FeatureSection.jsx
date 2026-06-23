import React from 'react';
import { Link } from 'react-router-dom';
import sellImg from '../../../assets/platform-laptop.png';
import marketImg from '../../../assets/platform-laptop.png';
 
const FeatureSection = () => {
  return (
    <section className="py-24 bg-[#0B0F14] overflow-hidden">
      <div className="container mx-auto px-6 space-y-32">
        {/* Row 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Sell everywhere
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              <Link to="/login" className="text-storify hover:text-storify-glow hover:underline cursor-pointer font-bold transition-colors">Get a stunning store</Link> that's made to sell. Design fast with AI, choose a stylish theme, or build completely custom for full control.
            </p>
            <div className="pt-4">
              <a href="#" className="inline-flex items-center gap-2 text-storify font-bold hover:text-storify-glow hover:underline group transition-all">
                Explore how to sell 
                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-storify/10 rounded-3xl -rotate-2"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(20,184,166,0.1)] transition-transform hover:scale-[1.03] duration-500 border border-white/5">
               <img src={sellImg} alt="Sell everywhere illustration" className="w-full h-auto" />
            </div>
          </div>
        </div>
 
        {/* Row 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Market your business
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Take the guesswork out of marketing with built-in tools that help you create, execute, and analyze digital marketing campaigns.
            </p>
            <div className="pt-4">
              <a href="#" className="inline-flex items-center gap-2 text-storify font-bold hover:text-storify-glow hover:underline group transition-all">
                Reach more customers
                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-storify/10 rounded-3xl rotate-2"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(20,184,166,0.1)] transition-transform hover:scale-[1.03] duration-500 border border-white/5">
               <img src={marketImg} alt="Market your business illustration" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
