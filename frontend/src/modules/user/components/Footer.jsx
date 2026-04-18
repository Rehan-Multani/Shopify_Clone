import React from 'react';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Shopify',
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
      links: ['Support around the clock', 'Shopify Help Center', 'Shopify Community', 'Shopify App Store', 'API documentation'],
    },
    {
      title: 'Shopify Plus',
      links: ['Enterprise commerce', 'Features', 'Customers', 'B2B', 'Custom storefront'],
    },
  ];

  return (
    <footer className="bg-[#0a0f1a] text-[#9ca3af] py-20 border-t border-white/5">
      <div className="container mx-auto px-6">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 border-b border-gray-800 pb-16">
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">{column.title}</h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors text-[15px]">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-8 text-[13px]">
            <a href="#" className="hover:text-white transition-colors underline underline-offset-4">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors underline underline-offset-4">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors underline underline-offset-4">Sitemap</a>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm">English / United States</span>
            <div className="flex gap-4">
              {/* Social Placeholders */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-5 h-5 bg-gray-700 rounded-full hover:bg-shopify transition-colors cursor-pointer"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center md:text-left text-[13px]">
          &copy; {new Date().getFullYear()} Shopify Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
