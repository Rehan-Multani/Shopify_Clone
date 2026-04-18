import React from 'react';
import laptopImg from '../../../assets/platform-laptop.png';
import mobileImg from '../../../assets/platform-mobile.png';
import dashboardImg from '../../../assets/platform-laptop.png';
import story1 from '../../../assets/story-1.png';
import story2 from '../../../assets/story-2.png';
import girl from '../../../assets/girl.avif';
import hero from '../../../assets/hero.png';
import cloth from '../../../assets/cloth.avif';
import shopify1 from '../../../assets/shopify1.avif';

const PlatformSection = () => {
  const platforms = [
    {
      frontImg: laptopImg,
      backImg: hero,
      title: 'Online Store',
      description: 'Build a beautiful, high-converting online store with our powerful website builder.',
      alt: 'Laptop Storefront',
    },
    {
      frontImg: mobileImg,
      backImg: girl,
      title: 'Mobile Commerce',
      description: 'Sell on the go with a responsive site that looks great on every device.',
      alt: 'Mobile Storefront',
    },
    {
      frontImg: dashboardImg,
      backImg: shopify1,
      title: 'Point of Sale',
      description: 'Connect your online and offline sales with our seamless POS integration.',
      alt: 'Dashboard Storefront',
    },
  ];

  return (
    <section className="bg-[#0a0f1a] py-24 overflow-hidden relative">
      <div className="container mx-auto px-6 mb-16">
        <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">one commerce platform</span> behind it all
        </h2>
        <p className="text-xl lg:text-3xl text-white/70 max-w-4xl leading-tight font-normal">
          Sell online and in person. Sell locally and globally. Sell direct and wholesale. Sell on desktop and mobile.
        </p>
      </div>

      {/* Static Grid Container */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {platforms.map((item, index) => (
            <div 
              key={index} 
              className="group cursor-pointer"
            >
              <div className="relative w-full h-[320px] rounded-[32px] overflow-hidden border border-white/10 bg-[#1a1c23] transition-all duration-500 hover:border-[#00c2c2]/50">
                {/* Front Image (Fades out) */}
                <img 
                  src={item.frontImg} 
                  alt={item.alt} 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                />
                
                {/* Back Image (Fades in) */}
                <img 
                  src={item.backImg} 
                  alt={`${item.alt} detail`} 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100"
                />

                {/* Optional Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none"></div>
              </div>

              {/* Text Below Card */}
              <div className="mt-8 space-y-3">
                <h3 className="text-2xl font-bold text-white group-hover:text-[#00c2c2] transition-colors">
                  {item.title}
                </h3>
                <p className="text-white/60 text-lg leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformSection;
