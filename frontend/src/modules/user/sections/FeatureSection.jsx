import React from 'react';
import sellImg from '../../../assets/platform-laptop.png';
import marketImg from '../../../assets/platform-laptop.png';

const FeatureSection = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 space-y-32">
        {/* Row 1 */}
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#202223] leading-tight">
              Sell everywhere
            </h2>
            <p className="text-lg text-[#6d7175] leading-relaxed">
              <Link to="/login" className="text-[#00c2c2] hover:underline cursor-pointer font-bold">Get a stunning store</Link> that's made to sell. Design fast with AI, choose a stylish theme, or build completely custom for full control.
            </p>
            <div className="pt-4">
              <a href="#" className="inline-flex items-center gap-2 text-shopify font-bold hover:underline group">
                Explore how to sell 
                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-shopify/5 rounded-3xl -rotate-2"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.03] duration-500">
               <img src={sellImg} alt="Sell everywhere illustration" className="w-full h-auto" />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#202223] leading-tight">
              Market your business
            </h2>
            <p className="text-lg text-[#6d7175] leading-relaxed">
              Take the guesswork out of marketing with built-in tools that help you create, execute, and analyze digital marketing campaigns.
            </p>
            <div className="pt-4">
              <a href="#" className="inline-flex items-center gap-2 text-shopify font-bold hover:underline group">
                Reach more customers
                <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-blue-500/5 rounded-3xl rotate-2"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.03] duration-500">
               <img src={marketImg} alt="Market your business illustration" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
