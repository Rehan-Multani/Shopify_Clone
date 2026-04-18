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
    <section className="pt-32 pb-8 bg-[#0a0f1a] overflow-hidden relative border-t border-white/5">
      {/* Section Heading */}
      <div className="container mx-auto px-6 mb-12 text-center">
        <h2 className="text-4xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
          See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">success</span> behind every store
        </h2>
        <p className="text-xl lg:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed font-normal">
          From solo founders to global enterprises, millions of merchants trust Shopify to power their dreams.
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
              <div className="w-full aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 bg-[#1a1c23] shadow-2xl transition-all duration-500 hover:-translate-y-8 hover:rotate-[3deg] hover:scale-110 hover:z-50 hover:border-[#00c2c2]/50 hover:shadow-[0_40px_80px_rgba(0,194,194,0.15)] cursor-pointer group/image relative">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover/image:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Description below card */}
              <div className="mt-8 px-4 text-center space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <h3 className="text-xl font-bold text-white tracking-wide">{image.title}</h3>
                <p className="text-white/50 text-sm font-medium">{image.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default ImageShowcaseSection;
