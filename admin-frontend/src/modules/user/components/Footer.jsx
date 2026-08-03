import React from 'react';
import { Link } from 'react-router-dom';

const LEGAL_LINKS = [
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact us' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy-policy', label: 'Privacy' },
  { to: '/refund-policy', label: 'Refunds' }
];

const Footer = () => {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Online store', to: '/signup' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Enterprise', to: '/enterprise' },
        { label: 'Start free', to: '/signup' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', to: '/about' },
        { label: 'Contact us', to: '/contact' },
        { label: 'Careers', to: '/contact' },
        { label: 'Press', to: '/about' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help center', to: '/contact' },
        { label: 'Merchant login', to: '/admin/login' },
        { label: 'Vendor login', to: '/vendor/login' },
        { label: 'Email support', to: '/contact' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', to: '/privacy-policy' },
        { label: 'Refund Policy', to: '/refund-policy' },
        { label: 'Terms & Conditions', to: '/terms' },
        { label: 'Contact', to: '/contact' }
      ]
    },
    {
      title: 'Storify Plus',
      links: [
        { label: 'Enterprise commerce', to: '/enterprise' },
        { label: 'Plans & pricing', to: '/pricing' },
        { label: 'Talk to sales', to: '/contact' }
      ]
    }
  ];

  return (
    <footer className="bg-[#0B0F14] text-gray-500 py-20 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-12 border-b border-white/5 pb-16">
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-[0.2em]">
                {column.title}
              </h3>
              <ul className="space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="hover:text-storify-glow transition-colors text-[14px] font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Centered important links */}
        <nav className="pt-12 pb-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-[13px] font-semibold text-gray-400 hover:text-white transition-colors tracking-tight"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
          <p className="text-[11px] font-bold tracking-widest uppercase text-gray-600">
            &copy; {new Date().getFullYear()} Storify Inc. All rights reserved.
          </p>
          <p className="text-xs font-semibold text-gray-600">English / India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
