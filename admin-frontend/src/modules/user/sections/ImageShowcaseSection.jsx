import React from 'react';
import story1 from '../../../assets/story-1.png';
import story2 from '../../../assets/story-2.png';
import dashboard from '../../../assets/platform-laptop.png';
import girl from '../../../assets/girl.avif';
import hero from '../../../assets/hero.png';
import mobile from '../../../assets/platform-mobile.png';
import laptop from '../../../assets/platform-laptop.png';

const ImageShowcaseSection = () => {
  const images = [
    { src: story1, alt: 'Merchant Story 1' },
    { src: hero, alt: 'Hero' },
    { src: story2, alt: 'Merchant Story 2' },
    { src: dashboard, alt: 'Dashboard' },
    { src: girl, alt: 'Merchant Girl' },
    { src: mobile, alt: 'Mobile Platform' },
    { src: laptop, alt: 'Laptop Platform' },
  ];

  // Duplicate the array for a seamless infinite loop
  const displayImages = [...images, ...images];

  return (
    <section className="pt-32 pb-8 bg-[#0B0F14] overflow-hidden relative border-t border-white/5">
      {/* Section Heading */}
      <div className="container mx-auto px-6 mb-12 text-center">
        <h2 className="text-4xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
          See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-storify-glow to-storify">success</span> behind every store
        </h2>
        <p className="text-xl lg:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-normal italic">
          From solo founders to global enterprises, millions of merchants trust Storify to power their dreams.
        </p>
      </div>

      {/* Infinite Scrolling Container */}
      <div className="relative flex overflow-visible py-24 group">
        <div className="flex gap-10 animate-marquee px-6">
          {displayImages.map((image, index) => (
            <div 
              key={index} 
              className="w-[300px] flex-shrink-0"
            >
              <div className="w-full aspect-[4/5] rounded-[48px] overflow-hidden border border-white/5 bg-[#111827] shadow-2xl transition-all duration-700 hover:-translate-y-12 hover:rotate-[4deg] hover:scale-110 hover:z-50 hover:border-storify/50 hover:shadow-[0_40px_80px_rgba(20,184,166,0.2)] cursor-pointer group/image relative">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover grayscale-[40%] group-hover/image:grayscale-0 transition-all duration-700 opacity-80 group-hover/image:opacity-100"
                />
              </div>

              {/* Description below card */}
              <div className="mt-8 px-4 text-center space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <h3 className="text-xl font-bold text-white tracking-wide">{image.title}</h3>
                <p className="text-gray-500 text-sm font-black uppercase tracking-widest">{image.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default ImageShowcaseSection;
