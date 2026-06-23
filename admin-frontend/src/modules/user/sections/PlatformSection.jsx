import React, { useState, useEffect } from 'react';
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
  const [activeCategory, setActiveCategory] = useState(0);

  // Auto-switch categories every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Custom keyframes for swipe transition
  const swipeStyle = `
    @keyframes swipeLeft {
      from { transform: translateX(50px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-swipe {
      animation: swipeLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `;

  const categories = [
    {
      label: "Sell online and in person.",
      items: [
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
      ]
    },
    {
      label: "Sell locally and globally.",
      items: [
        {
          frontImg: hero,
          backImg: story1,
          title: 'Global Expansion',
          description: 'Reach customers in every corner of the world with localized shopping experiences.',
          alt: 'Global Store',
        },
        {
          frontImg: shopify1,
          backImg: story2,
          title: 'Local Presence',
          description: 'Master your local market with targeted delivery and pickup options.',
          alt: 'Local Store',
        },
        {
          frontImg: girl,
          backImg: cloth,
          title: 'Cross-Border Payments',
          description: 'Accept payments in any currency with automatic conversion and tax handling.',
          alt: 'Payments',
        },
      ]
    },
    {
      label: "Sell direct and wholesale.",
      items: [
        {
          frontImg: cloth,
          backImg: laptopImg,
          title: 'B2B Solutions',
          description: 'Power your wholesale business with custom pricing and bulk ordering tools.',
          alt: 'B2B',
        },
        {
          frontImg: story1,
          backImg: mobileImg,
          title: 'Direct-to-Consumer',
          description: 'Build direct relationships with your customers and own your brand data.',
          alt: 'DTC',
        },
        {
          frontImg: story2,
          backImg: hero,
          title: 'Custom Storefronts',
          description: 'Create unique shopping experiences tailored specifically to your business model.',
          alt: 'Custom',
        },
      ]
    },
    {
      label: "Sell on desktop and mobile.",
      items: [
        {
          frontImg: mobileImg,
          backImg: dashboardImg,
          title: 'Responsive Web',
          description: 'Your store stays perfectly aligned across any monitor size or resolution.',
          alt: 'Responsive',
        },
        {
          frontImg: girl,
          backImg: hero,
          title: 'Shop App',
          description: 'Meet your customers where they are with a dedicated mobile shopping app.',
          alt: 'App',
        },
        {
          frontImg: laptopImg,
          backImg: story1,
          title: 'Merchant Dashboard',
          description: 'Manage your entire business from anywhere using our robust mobile tools.',
          alt: 'Admin',
        },
      ]
    }
  ];

  return (
    <section className="bg-[#0B0F14] py-24 overflow-hidden relative">
      <style>{swipeStyle}</style>
      <div className="container mx-auto px-6 mb-16">
        <h2 className="text-5xl lg:text-7xl font-medium text-white mb-6 tracking-tight leading-tight">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-storify-glow to-storify">one commerce platform</span> behind it all
        </h2>
        <div className="text-3xl lg:text-5xl max-w-none leading-tight font-medium">
          <p className="flex flex-wrap gap-x-[0.3em]">
            {categories.map((cat, idx) => (
              <React.Fragment key={idx}>
                <span 
                  onClick={() => setActiveCategory(idx)}
                  className={`cursor-pointer transition-colors duration-500 hover:text-white ${activeCategory === idx ? 'text-white' : 'text-white/50'}`}
                >
                  {cat.label}
                </span>
                {idx === 1 && <br className="hidden lg:block w-full" />}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>

      {/* Interactive Grid Container */}
      <div className="container mx-auto px-6">
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 animate-swipe" 
          key={activeCategory}
        >
          {categories[activeCategory].items.map((item, index) => (
            <div 
              key={index} 
              className="group cursor-pointer"
            >
              <div className="relative w-full h-[320px] rounded-[32px] overflow-hidden border border-white/5 bg-[#111827] transition-all duration-500 hover:border-storify/50 group-hover:shadow-[0_0_40px_rgba(20,184,166,0.15)]">
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
                <div className="absolute inset-0 bg-[#0B0F14]/10 group-hover:bg-[#0B0F14]/40 transition-colors pointer-events-none"></div>
              </div>

              {/* Text Below Card */}
              <div className="mt-8 space-y-3">
                <h3 className="text-2xl font-bold text-white group-hover:text-storify-glow transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed font-normal">
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
