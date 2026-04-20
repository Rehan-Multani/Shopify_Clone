import React from 'react';
import getStartedImg from '../../../assets/megamenu_get_started.png';
import switchImg from '../../../assets/megamenu_switch_storify.png';
import enterpriseImg from '../../../assets/megamenu_enterprise_brands.png';
import edition1 from '../../../assets/editions_1.png';
import edition2 from '../../../assets/editions_2.png';
import edition3 from '../../../assets/editions_3.png';
import edition4 from '../../../assets/editions_4.png';

const MegaMenu = ({ activeMenu }) => {
  if (!activeMenu) return null;

  // Custom layout for 'Why Storify'
  if (activeMenu === 'why') {
    const cards = [
      { title: 'Get started fast', desc: 'You could be selling by tomorrow.', img: getStartedImg },
      { title: 'Switch to Storify', desc: 'Get more customers. Make more sales.', img: switchImg },
      { title: 'Trusted by enterprise brands', desc: 'No matter your size, complexity, or ambition.', img: enterpriseImg },
    ];

    return (
      <div className="absolute top-full left-0 right-0 bg-[#0B0F14]/98 backdrop-blur-2xl border-t border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)] py-12 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
        <div className="max-w-[1400px] mx-auto px-10 grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-[#1F2937] border border-white/10 group-hover:border-storify/50 group-hover:teal-glow transition-all duration-500">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-storify-glow transition-colors">{card.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{card.desc}</p>
              </div>
            ))}
          </div>
          <div className="hidden lg:block w-px bg-white/5 h-full col-span-1 ml-auto mr-auto"></div>
          <div className="col-span-12 lg:col-span-2 space-y-10">
            <div>
              <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-6">BUILT INTO EVERY STORE</h4>
              <div className="group cursor-pointer">
                <div className="w-full aspect-[16/10] bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl mb-4 flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-[1.02] transition-all">
                  <span className="text-white font-black text-xl italic tracking-tighter">shop<span className="text-white/80">Pay</span></span>
                </div>
                <h5 className="text-white font-bold text-sm mb-1 group-hover:text-storify-glow">World's best checkout</h5>
                <p className="text-xs text-gray-400 font-medium">Proven to convert better.</p>
              </div>
            </div>
            <div className="group cursor-pointer">
              <div className="w-full aspect-[16/10] bg-gradient-to-br from-[#111827] to-[#0B0F14] rounded-xl mb-4 flex items-center justify-center border border-white/5 group-hover:border-storify/30 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-storify/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/40">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
              </div>
              <h5 className="text-white font-bold text-sm mb-1 group-hover:text-storify-glow">Sidekick</h5>
              <p className="text-xs text-gray-400 font-medium">Your commerce-obsessed AI assistant.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-column link grid for 'Products'
  const sections = [
    {
      title: 'BUILD YOUR WEBSITE',
      links: [
        { label: 'Website Builder', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { label: 'Themes', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { label: 'Domains', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { label: 'Customer Accounts', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { label: 'Sidekick', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      ],
      runBusiness: [
        { label: 'Orders & Inventory', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { label: 'Shipping', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { label: 'Workflow Automation', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      ]
    },
    {
      title: 'SELL ANYWHERE',
      links: [
        { label: 'Online', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { label: 'AI Chats', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
        { label: 'Point of Sale', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { label: 'Shop App', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { label: 'Social & Marketplaces', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
        { label: 'Global', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { label: 'B2B', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { label: 'Across Markets', icon: 'M9 20l-5.447-2.724A2 2 0 013 15.488V5.512a2 2 0 011.553-1.946L9 2l5 2.5L19 2l5 2.5v9.976a2 2 0 01-1.553 1.946L19 18l-5 2.5-5-2.5z' }
      ]
    },
    {
      title: 'MARKETING & ANALYTICS',
      links: [
        { label: 'Advertising & Campaigns', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { label: 'Email & Customer Chat', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { label: 'Discounts', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
        { label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 02 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2' },
      ],
      getPaid: [
        { label: 'Checkout', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      ]
    }
  ];

  return (
    <div className="absolute top-full left-0 right-0 bg-[#0B0F14]/98 backdrop-blur-2xl border-t border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)] py-12 animate-in fade-in slide-in-from-top-2 duration-300 z-50">
      <div className="max-w-[1400px] mx-auto px-10">
        {activeMenu === 'why' ? (
          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Get started fast', desc: 'You could be selling by tomorrow.', img: getStartedImg },
                { title: 'Switch to Storify', desc: 'Get more customers. Make more sales.', img: switchImg },
                { title: 'Trusted by enterprise brands', desc: 'No matter your size, complexity, or ambition.', img: enterpriseImg },
              ].map((card, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-[#1F2937] border border-white/10 group-hover:border-storify/50 group-hover:teal-glow transition-all duration-500">
                    <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-storify-glow transition-colors">{card.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{card.desc}</p>
                </div>
              ))}
            </div>
            <div className="hidden lg:block w-px bg-white/5 h-full col-span-1 ml-auto mr-auto"></div>
            <div className="col-span-12 lg:col-span-2 space-y-10">
              <div>
                <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-6">BUILT INTO EVERY STORE</h4>
                <div className="group cursor-pointer">
                  <div className="w-full aspect-[16/10] bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl mb-4 flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-[1.02] transition-all">
                    <span className="text-white font-black text-xl italic tracking-tighter">shop<span className="text-white/80">Pay</span></span>
                  </div>
                  <h5 className="text-white font-bold text-sm mb-1 group-hover:text-storify-glow">World's best checkout</h5>
                  <p className="text-xs text-gray-400 font-medium">Proven to convert better.</p>
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="w-full aspect-[16/10] bg-gradient-to-br from-[#111827] to-[#0B0F14] rounded-xl mb-4 flex items-center justify-center border border-white/5 group-hover:border-storify/30 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-storify/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/40">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                </div>
                <h5 className="text-white font-bold text-sm mb-1 group-hover:text-storify-glow">Sidekick</h5>
                <p className="text-xs text-gray-400 font-medium">Your commerce-obsessed AI assistant.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-12">
               {sections.map((section, idx) => (
                 <div key={idx} className="space-y-10">
                   <div>
                      <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-6">{section.title}</h4>
                      <ul className="space-y-4">
                        {section.links.map((link, lIdx) => (
                          <li key={lIdx} className="group cursor-pointer">
                            <a href="#" className="flex items-center gap-4 text-white hover:text-storify transition-all">
                               <svg className="w-5 h-5 text-gray-500 group-hover:text-storify transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} /></svg>
                               <span className="text-[15px] font-bold">{link.label}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                   </div>
                   {section.runBusiness && (
                     <div>
                        <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-6">RUN YOUR BUSINESS</h4>
                        <ul className="space-y-4">
                          {section.runBusiness.map((link, lIdx) => (
                            <li key={lIdx} className="group cursor-pointer">
                              <a href="#" className="flex items-center gap-4 text-white hover:text-storify transition-all">
                                 <svg className="w-5 h-5 text-gray-500 group-hover:text-storify transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} /></svg>
                                 <span className="text-[15px] font-bold">{link.label}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                     </div>
                   )}
                   {section.getPaid && (
                     <div>
                        <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-6">GET PAID</h4>
                        <ul className="space-y-4">
                          {section.getPaid.map((link, lIdx) => (
                            <li key={lIdx} className="group cursor-pointer">
                              <a href="#" className="flex items-center gap-4 text-white hover:text-storify transition-all">
                                 <svg className="w-5 h-5 text-gray-500 group-hover:text-storify transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} /></svg>
                                 <span className="text-[15px] font-bold">{link.label}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          <div className="col-span-12 lg:col-span-3 lg:border-l lg:border-white/5 lg:pl-12 space-y-12">
               <div>
                  <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-6">NON-STOP INNOVATION</h4>
                  <div className="group cursor-pointer">
                     <div className="bg-[#1F2937] border border-white/10 rounded-2xl p-2 mb-4 group-hover:border-storify/30 transition-all">
                        <div className="aspect-[16/10] bg-gradient-to-br from-[#132338] via-[#0B0F14] to-black rounded-xl p-4 flex items-center justify-center relative overflow-hidden group/stack">
                           <div className="absolute inset-0 bg-storify/5 opacity-0 group-hover/stack:opacity-100 transition-opacity"></div>
                           
                           {/* Fan-out Stack Layout */}
                           <div className="relative w-full h-full flex items-center justify-center">
                              {[edition4, edition3, edition2, edition1].map((img, i) => (
                                <img 
                                  key={i} 
                                  src={img} 
                                  alt={`Edition ${4-i}`} 
                                  className="absolute rounded-lg object-cover border border-white/10 shadow-2xl transition-all duration-500 group-hover/stack:scale-110"
                                  style={{
                                    width: i === 3 ? '100px' : '90px', // The first card (last in array) is largest
                                    height: i === 3 ? '135px' : '120px',
                                    left: `${35 + (i * 12)}%`,
                                    zIndex: i,
                                    transform: `translateX(-50%) rotate(${(-15 + (i * 8))}deg) perspective(1000px) ${i < 3 ? 'translateZ(-50px)' : 'translateZ(0)'}`,
                                    opacity: 0.6 + (i * 0.15)
                                  }}
                                />
                              ))}
                           </div>
                        </div>
                     </div>
                     <h5 className="text-white font-bold text-sm mb-1 group-hover:text-storify-glow">Storify Editions</h5>
                     <p className="text-xs text-gray-500">150+ updates to Storify, twice a year.</p>
                  </div>
               </div>
               <div>
                  <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-6">LATEST UPDATES</h4>
                  <ul className="space-y-6">{['Sidekick Pulse', 'Product Network', 'Full dev MCP support'].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 group cursor-pointer">
                         <div className="w-1.5 h-1.5 rounded-full bg-storify shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                         <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">{item}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          </div>
        )}

        {/* Common Footer bar */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-wrap gap-x-16 gap-y-4">
            <a href="#" className="text-[11px] font-black tracking-widest text-storify-glow uppercase hover:opacity-80 transition-all">CUSTOMIZE & EXTEND STORIFY</a>
            {['Commerce for Agents', 'Storify App Store', 'Storify.dev'].map((link, i) => (
               <a key={i} href="#" className="text-[11px] font-black tracking-widest text-gray-500 uppercase hover:text-white transition-all">{link}</a>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
