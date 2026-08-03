import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SIDE_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/refund-policy', label: 'Refund Policy' },
  { to: '/terms', label: 'Terms & Conditions' }
];

/**
 * Shared shell for Storify marketing legal / info pages.
 */
const LegalPageLayout = ({ title, subtitle, children, currentPath }) => {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <Header />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-storify-glow text-[10px] font-black tracking-[0.35em] uppercase mb-4">
              Storify
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-400 text-base md:text-lg leading-relaxed font-medium">
                {subtitle}
              </p>
            )}
            <p className="text-gray-600 text-xs font-semibold mt-4 tracking-wide">
              Last updated: August 3, 2026
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <nav className="sticky top-28 space-y-1 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-3 mb-3">
                  Company
                </p>
                {SIDE_LINKS.map((link) => {
                  const active = currentPath === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <article className="lg:col-span-9 order-1 lg:order-2 prose-legal space-y-8 text-gray-300 leading-relaxed">
              {children}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export const LegalSection = ({ title, children }) => (
  <section className="space-y-3">
    {title && (
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    )}
    <div className="space-y-3 text-[15px] font-medium text-gray-400">{children}</div>
  </section>
);

export default LegalPageLayout;
