import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MegaMenu from './MegaMenu';
import logo from '../../../assets/storify-logo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const isDarkPage = location.pathname === '/' || location.pathname === '/enterprise' || location.pathname === '/pricing';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setActiveMenu(null);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || activeMenu ? 'bg-[#111827]/90 backdrop-blur-md py-3 shadow-2xl border-b border-white/5' : 'bg-transparent py-5'}`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center cursor-pointer group">
          <img src={logo} alt="Storify" className="h-6 w-auto" />
          <span className="ml-2 text-3xl font-black italic text-white tracking-tighter group-hover:text-storify-glow transition-colors">Storify</span>
        </Link>
 
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-[15px] text-white transition-colors duration-300">
          <div 
            className="flex items-center gap-1 hover:text-storify transition-colors h-full py-4 group cursor-pointer"
            onMouseEnter={() => setActiveMenu('why')}
            onClick={() => setActiveMenu(activeMenu === 'why' ? null : 'why')}
          >
            Why Storify
            <svg className={`w-4 h-4 transition-transform duration-300 ${activeMenu === 'why' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div 
            className="flex items-center gap-1 hover:text-storify transition-colors h-full py-4 group cursor-pointer"
            onMouseEnter={() => setActiveMenu('products')}
            onClick={() => setActiveMenu(activeMenu === 'products' ? null : 'products')}
          >
            Products
            <svg className={`w-4 h-4 transition-transform duration-300 ${activeMenu === 'products' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <Link to="/pricing" className="hover:text-storify transition-colors">Pricing</Link>
          <Link to="/enterprise" className="hover:text-storify transition-colors">Enterprise</Link>
        </nav>
 
        {/* CTAs */}
        <div className="flex items-center gap-6">
          <Link to="/login" className="hidden sm:block text-sm font-semibold text-white hover:text-white/80 transition-colors">Log in</Link>
          <Link to="/signup" className="px-6 py-2.5 rounded-full text-sm font-bold transition-all teal-gradient text-white teal-glow active:scale-95 flex items-center justify-center hover:opacity-90">
            Start for free
          </Link>
          
          {/* Mobile Menu Icon */}
          <button className="lg:hidden p-2 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mega Menu Overlay */}
      <MegaMenu activeMenu={activeMenu} />
    </header>
  );
};

export default Header;


