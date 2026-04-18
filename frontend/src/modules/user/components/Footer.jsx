import React from 'react';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Storify',
      links: ['About', 'Careers', 'Investors', 'Press and Media', 'Social impact'],
    },
    {
      title: 'Online Store',
      links: ['Sell online', 'Features', 'Examples', 'Website builder', 'Online retail'],
    },
    {
      title: 'Point of Sale',
      links: ['Sell in person', 'Features', 'Hardware', 'POS Go', 'POS Lite'],
    },
    {
      title: 'Support',
      links: ['Support around the clock', 'Storify Help Center', 'Storify Community', 'Storify App Store', 'API documentation'],
    },
    {
      title: 'Storify Plus',
      links: ['Enterprise commerce', 'Features', 'Customers', 'B2B', 'Custom storefront'],
    },
  ];

  return (
    <footer className="bg-[#0B0F14] text-gray-500 py-20 border-t border-white/5">
      <div className="container mx-auto px-6">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 border-b border-white/5 pb-16">
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">{column.title}</h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-storify-glow transition-colors text-[14px] font-medium">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[12px] font-bold tracking-wider uppercase">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-bold tracking-tight">English / India</span>
            <div className="flex gap-4">
              {/* Social Placeholders */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-5 bg-white/5 rounded-full hover:bg-storify transition-all cursor-pointer border border-white/5"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center md:text-left text-[11px] font-bold tracking-widest uppercase text-gray-600">
          &copy; {new Date().getFullYear()} Storify Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
