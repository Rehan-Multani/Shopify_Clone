import React from 'react';
import logo from '../../../assets/storify-logo.png';

const MegaMenu = ({ activeMenu }) => {
  if (!activeMenu) return null;

  const sections = [
    {
      title: 'BUILD YOUR WEBSITE',
      links: [
        { label: 'Website Builder', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { label: 'Themes', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { label: 'Domains', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { label: 'Customer Accounts', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { label: 'Sidekick', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
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
      ]
    },
    {
      title: 'MARKETING & ANALYTICS',
      links: [
        { label: 'Advertising & Campaigns', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { label: 'Email & Customer Chat', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { label: 'Discounts', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
        { label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2' },
      ]
    },
    {
      title: 'RUN YOUR BUSINESS',
      links: [
        { label: 'Orders & Inventory', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { label: 'Shipping', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { label: 'Workflow Automation', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      ],
      extra: [
        { title: 'GET PAID', links: [
          { label: 'Checkout', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
          { label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
        ]}
      ]
    }
  ];

  return (
    <div 
      className="absolute top-full left-0 right-0 bg-[#111827]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] py-12 animate-in fade-in slide-in-from-top-4 duration-300 z-50 overflow-hidden"
      onMouseEnter={() => {}} // Maintain active state if needed
    >
      <div className="container mx-auto px-6 grid grid-cols-12 gap-8">
        
        {/* Links Grid */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-4 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a href="#" className="flex items-center gap-3 text-white/90 hover:text-storify transition-colors group">
                        <svg className="w-5 h-5 text-gray-500 group-hover:text-storify transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                        </svg>
                        <span className="text-[14px] font-medium">{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {section.extra && section.extra.map((ex, eIdx) => (
                <div key={eIdx}>
                  <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-4">
                    {ex.title}
                  </h4>
                  <ul className="space-y-2">
                    {ex.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <a href="#" className="flex items-center gap-3 text-white/90 hover:text-storify transition-colors group">
                          <svg className="w-5 h-5 text-gray-500 group-hover:text-storify transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                          </svg>
                          <span className="text-[14px] font-medium">{link.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Featured Section (Right side) */}
        <div className="col-span-12 lg:col-span-3 lg:border-l lg:border-white/5 lg:pl-8">
           <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-4">
                  NON-STOP INNOVATION
                </h4>
                <div className="bg-[#1F2937] rounded-2xl p-6 border border-white/5 group/card cursor-pointer hover:shadow-2xl transition-all hover:border-storify/30">
                   <div className="relative mb-4">
                      <div className="w-full aspect-video bg-gradient-to-br from-indigo-900 to-black rounded-lg overflow-hidden flex items-center justify-center p-4">
                         {/* Mockup "Editions" Visual */}
                         <div className="relative w-full h-full">
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-3/4 h-3/4 bg-white/5 rounded-lg transform -rotate-12 translate-x-2 border border-white/5"></div>
                               <div className="w-3/4 h-3/4 bg-white/5 rounded-lg transform rotate-6 translate-x-1 underline border border-white/5 shadow-2xl"></div>
                               <div className="w-3/4 h-3/4 bg-[#0B0F14] rounded-lg flex items-center justify-center p-4 shadow-inner border border-white/10">
                                  <img src={logo} alt="Storify Logo" className="w-full h-auto" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <h5 className="text-white font-bold mb-2">Storify Editions</h5>
                   <p className="text-xs text-white/70">150+ updates to Storify, twice a year.</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-storify-glow uppercase tracking-[0.2em] mb-4">
                  LATEST UPDATES
                </h4>
                <ul className="space-y-4">
                  {['Sidekick Pulse', 'Product Network', 'Full dev MCP support'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-storify flex-shrink-0"></div>
                       <a href="#" className="text-sm font-medium text-white/90 hover:text-storify transition-colors">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
           </div>
        </div>

      </div>

      {/* Full-width bottom bar */}
      <div className="border-t border-white/5 mt-8 pt-6 container mx-auto px-6">
         <div className="flex flex-wrap gap-8 lg:gap-16">
            {['CUSTOMIZE & EXTEND STORIFY', 'Commerce for Agents', 'Storify App Store', 'Storify.dev'].map((item, i) => (
               <a key={i} href="#" className={`text-[11px] font-black tracking-[0.1em] transition-colors uppercase ${i === 0 ? 'text-storify-glow' : 'text-white/50 hover:text-white'}`}>
                  {item}
               </a>
            ))}
         </div>
      </div>
    </div>
  );
};

export default MegaMenu;
