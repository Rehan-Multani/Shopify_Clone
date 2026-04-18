import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MegaMenu from './MegaMenu';

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || activeMenu ? 'bg-[#0d1117] py-3 shadow-xl' : 'bg-transparent py-5'}`}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 cursor-pointer">
          <svg className={`w-8 h-8 fill-current transition-colors duration-300 ${isScrolled || activeMenu || isDarkPage ? 'text-shopify' : 'text-shopify'}`} viewBox="0 0 24 24">
            <path d="M19.1 6.5l-1.4-3.6C17.4 2.1 16.6 1.6 15.7 1.6H8.3c-.9 0-1.7.5-2 1.3L4.9 6.5C3.3 7.3 2.1 8.8 2.1 10.7c0 3.1 2.5 5.6 5.6 5.6h8.6c3.1 0 5.6-2.5 5.6-5.6 0-1.9-1.2-3.4-2.8-4.2zM8.3 3.6h7.4l.7 1.9H7.6l.7-1.9zm10.6 7.1c0 1.9-1.5 3.5-3.5 3.5H7.7c-1.9 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5h7.5c1.1 0 2.2.5 3 1.3.6.7 1 1.4 1 2.2z"/>
          </svg>
          <span className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${isScrolled || activeMenu || isDarkPage ? 'text-white' : 'text-[#202223]'}`}>shopify</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`hidden lg:flex items-center gap-8 font-medium text-[15px] transition-colors duration-300 ${isScrolled || activeMenu || isDarkPage ? 'text-white/80' : 'text-gray-600'}`}>
          <div 
            className="flex items-center gap-1 hover:text-shopify transition-colors h-full py-4 group cursor-pointer"
            onMouseEnter={() => setActiveMenu('why')}
          >
            Why Shopify
            <svg className={`w-4 h-4 transition-transform duration-300 ${activeMenu === 'why' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div 
            className="flex items-center gap-1 hover:text-shopify transition-colors h-full py-4 group cursor-pointer"
            onMouseEnter={() => setActiveMenu('products')}
          >
            Products
            <svg className={`w-4 h-4 transition-transform duration-300 ${activeMenu === 'products' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <Link to="/pricing" className="hover:text-shopify transition-colors">Pricing</Link>
          <Link to="/enterprise" className="hover:text-shopify transition-colors">Enterprise</Link>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-6">
          <Link to="/login" className={`hidden sm:block text-sm font-semibold transition-colors duration-300 ${isScrolled || activeMenu || isDarkPage ? 'text-white/70 hover:text-white' : 'text-gray-600 hover:text-black'}`}>Log in</Link>
          <Link to="/login" className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center ${isScrolled || activeMenu || isDarkPage ? 'bg-shopify text-white hover:bg-shopify-dark' : 'bg-black text-white hover:bg-gray-800'}`}>
            Start for free
          </Link>
          
          {/* Mobile Menu Icon */}
          <button className={`lg:hidden p-2 transition-colors ${isScrolled || activeMenu || isDarkPage ? 'text-white' : 'text-black'}`}>
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


