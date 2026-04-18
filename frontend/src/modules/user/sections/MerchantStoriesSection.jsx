import React from 'react';
import story1 from '../../../assets/story-1.png';
import story2 from '../../../assets/story-2.png';
import story3 from '../../../assets/girl.avif';

const MerchantStoriesSection = () => {
  const stories = [
    {
      img: story1,
      tag: 'Get started fast',
      title: 'You could be selling by tomorrow.',
    },
    {
      img: story2,
      tag: 'Switch to Storify',
      title: 'Get more customers. Make more sales.',
    },
    {
      img: story3,
      tag: 'Trusted by enterprise brands',
      title: 'No matter your size, complexity, or ambition.',
    },
  ];

  return (
    <section className="bg-[#0a0f1a] py-24 border-t border-white/5">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Stories (75% width on desktop) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="rounded-[24px] overflow-hidden mb-6 border border-white/5 bg-[#1a1c23] transition-all duration-700 group-hover:shadow-[0_20px_60px_rgba(255,255,255,0.05)] group-hover:-translate-y-2 group-hover:scale-[1.02]">
                  <img 
                    src={story.img} 
                    alt={story.tag} 
                    className="w-full h-80 object-cover transition-transform duration-700"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{story.tag}</h3>
                <p className="text-base text-white/70 font-normal leading-relaxed overflow-hidden">
                  {story.title}
                </p>
              </div>
            ))}
          </div>

          {/* Built-in Panel (25% width on desktop) */}
          <div className="lg:col-span-3">
              <div className="h-full bg-[#0a1622] rounded-[32px] p-8 border border-white/5 flex flex-col">
                 <span className="text-[#2dd4bf] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 block">
                   Built into every store
                </span>

                <div className="space-y-12">
                   {/* Shop Pay Card */}
                   <div className="group/item cursor-pointer">
                      <div className="w-full aspect-[16/9] bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover/item:-translate-y-2 group-hover/item:scale-[1.02] group-hover/item:shadow-2xl">
                         <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                            <span className="text-white font-black italic tracking-tighter text-xl">shop<span className="text-white/80 not-italic font-bold">Pay</span></span>
                         </div>
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">World's best checkout</h4>
                      <p className="text-sm text-gray-400">Proven to convert better.</p>
                   </div>

                   {/* Sidekick Card */}
                   <div className="group/item cursor-pointer">
                      <div className="w-full aspect-[16/9] bg-gradient-to-br from-purple-900 to-indigo-950 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover/item:-translate-y-2 group-hover/item:scale-[1.02] group-hover/item:shadow-2xl">
                         <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center p-3">
                            <svg className="w-full h-full text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                               <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                            </svg>
                         </div>
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">Sidekick</h4>
                      <p className="text-sm text-gray-400">Your commerce-obsessed AI assistant.</p>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Subtle footer copy from the reference image */}
        <div className="mt-24">
           <p className="text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-tight max-w-2xl">
              Dream big, build fast, and grow far on Storify.
           </p>
        </div>

      </div>
    </section>
  );
};

export default MerchantStoriesSection;
