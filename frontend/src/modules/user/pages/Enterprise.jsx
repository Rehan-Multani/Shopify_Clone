import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import enterpriseHero from '../../../assets/atmospheric-hero-bg.png';

const Enterprise = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Header />
      
      <main className="pt-32 pb-24">
        {/* Enterprise Hero */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden mb-24 px-6">
           <div className="absolute inset-0 z-0">
              <img 
                 src={enterpriseHero} 
                 alt="Enterprise background" 
                 className="w-full h-full object-cover opacity-30 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-transparent to-[#0a0f1a]"></div>
           </div>

           <div className="relative z-10 text-center max-w-5xl">
              <span className="text-shopify text-sm font-bold tracking-[0.3em] uppercase mb-10 block">SHOPIFY PLUS</span>
              <h1 className="text-6xl lg:text-[100px] font-extrabold tracking-tight leading-[0.9] mb-12">
                 The platform for <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">high-volume brands</span>
              </h1>
              <p className="text-xl lg:text-3xl text-gray-400 font-normal leading-tight mb-16 max-w-3xl mx-auto">
                 Scalability, customization, and performance for the world's most innovative companies.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                 <button className="px-10 py-5 bg-shopify text-white font-bold rounded-full hover:bg-shopify-dark transition-all shadow-2xl active:scale-95">
                    Contact Sales
                 </button>
                 <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all active:scale-95">
                    View Case Studies
                 </button>
              </div>
           </div>
        </section>

        {/* Brand Logos */}
        <section className="container mx-auto px-6 mb-32">
           <div className="text-center mb-16">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">TRUSTED BY INDUSTRY LEADERS</p>
           </div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              {['MATTEL', 'STAPLES', 'GYMSHARK', 'HEINZ'].map((brand) => (
                 <div key={brand} className="flex items-center justify-center text-3xl font-black tracking-tighter text-gray-400">
                    {brand}
                 </div>
              ))}
           </div>
        </section>

        {/* Feature Grid */}
        <section className="container mx-auto px-6 mb-48">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div>
                 <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-8">
                    Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">speed</span> and conversion
                 </h2>
                 <p className="text-xl text-gray-400 font-normal leading-relaxed mb-12">
                    Access deep customization with Checkout Extensibility and Shopify Functions to create unique buying experiences that convert up to 30% better than other platforms.
                 </p>
                 <hr className="border-white/10 mb-12" />
                 <div className="space-y-12">
                    <div>
                       <h3 className="text-xl font-bold mb-4">Automation</h3>
                       <p className="text-gray-500">Free up your team to focus on growth with Shopify Flow's visual workflow builder.</p>
                    </div>
                    <div>
                       <h3 className="text-xl font-bold mb-4">International B2B</h3>
                       <p className="text-gray-500">Sell direct and wholesale from a single platform with native multi-store management.</p>
                    </div>
                 </div>
              </div>

               <div className="bg-[#111827] rounded-[40px] p-12 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                 <div>
                    <span className="text-shopify text-xs font-bold uppercase mb-8 block">UNLIMITED SCALE</span>
                    <h3 className="text-3xl font-bold mb-6">Handle any traffic spike</h3>
                    <p className="text-gray-400">With 99.99% uptime and unlimited bandwidth, Shopify Plus keeps your store running during the massive traffic spikes of flash sales and holidays.</p>
                 </div>
                 <div className="mt-12 bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-xs text-gray-500">Real-time Traffic</span>
                       <span className="text-shopify font-black text-xl">+124k/s</span>
                    </div>
                    <div className="w-full h-32 flex items-end gap-1">
                       {[0.2, 0.4, 0.3, 0.7, 0.5, 0.8, 1, 0.9, 1, 1, 1, 1, 1].map((h, i) => (
                          <div key={i} className="flex-grow bg-shopify rounded-t-sm" style={{ height: `${h * 100}%` }}></div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>


      </main>

      <Footer />
    </div>
  );
};

export default Enterprise;
