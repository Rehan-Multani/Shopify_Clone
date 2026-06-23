import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import ThemeRenderer from './ThemeRenderer';

const GATEWAY_URL = 'http://localhost:5000/api';

const StorefrontLayout = ({ children, cartCount, customer, onLogout, storeInfo }) => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [pages, setPages] = useState([]);

    useEffect(() => {
        if (!storeId) return;
        // Fetch pages to display in navigation and footer
        fetch(`${GATEWAY_URL}/store-pages?storeId=${storeId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.pages) {
                    setPages(data.pages.filter(p => p.slug !== 'home'));
                }
            })
            .catch(err => console.error('Error fetching pages for storefront layout:', err));
    }, [storeId]);

    const primaryColor = storeInfo?.themeSettings?.primaryColor || '#2563eb';
    const borderRadius = storeInfo?.themeSettings?.borderRadius || '8px';

    return (
        <ThemeRenderer themeSettings={storeInfo?.themeSettings || {}}>
            <div className="flex flex-col min-h-screen bg-gray-50/50">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm backdrop-blur-md bg-white/95">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        {/* Logo & Name */}
                        <Link to={`/store/${storeId}`} className="flex items-center gap-2.5 group">
                            {storeInfo?.storeLogo ? (
                                <img 
                                    src={storeInfo.storeLogo.startsWith('http') || storeInfo.storeLogo.startsWith('data:') ? storeInfo.storeLogo : `http://localhost:5000${storeInfo.storeLogo}`} 
                                    alt={storeInfo.storeName} 
                                    className="h-9 w-9 rounded-lg object-cover border border-gray-100 shadow-sm group-hover:scale-105 transition-transform" 
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
                                    {storeInfo?.storeName?.charAt(0).toUpperCase() || 'S'}
                                </div>
                            )}
                            <span className="font-black text-lg text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                                {storeInfo?.storeName || 'My Store'}
                            </span>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link 
                                to={`/store/${storeId}`} 
                                className={`text-xs font-black uppercase tracking-wider transition-colors hover:text-emerald-600 ${location.pathname === `/store/${storeId}` ? 'text-emerald-700' : 'text-gray-600'}`}
                            >
                                Home
                            </Link>
                            <Link 
                                to={`/store/${storeId}/catalog`} 
                                className={`text-xs font-black uppercase tracking-wider transition-colors hover:text-emerald-600 ${location.pathname.includes('/catalog') ? 'text-emerald-700' : 'text-gray-600'}`}
                            >
                                Catalog
                            </Link>
                            {pages.map(page => (
                                <Link 
                                    key={page.slug}
                                    to={`/store/${storeId}/pages/${page.slug}`} 
                                    className={`text-xs font-black uppercase tracking-wider transition-colors hover:text-emerald-600 ${location.pathname.includes(`/pages/${page.slug}`) ? 'text-emerald-700' : 'text-gray-600'}`}
                                >
                                    {page.title}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            {/* Customer Auth */}
                            {customer ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-700 hidden sm:inline">Hi, {customer.name}</span>
                                    <button 
                                        onClick={onLogout}
                                        className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link 
                                    to={`/store/${storeId}/login`}
                                    className="text-xs font-black uppercase tracking-wider text-gray-600 hover:text-emerald-700 transition-colors"
                                >
                                    Login
                                </Link>
                            )}

                            {/* Cart Icon */}
                            <Link 
                                to={`/store/${storeId}/cart`}
                                className="relative p-2.5 bg-gray-50 border border-gray-150 rounded-xl hover:bg-gray-100 transition-all text-gray-700"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span 
                                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-md animate-bounce"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white mt-16 border-t-4" style={{ borderColor: 'var(--color-primary)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Store Info & Socials */}
                        <div className="md:col-span-4 space-y-4">
                            <span className="font-black text-xl tracking-tight uppercase">
                                {storeInfo?.storeName || 'My Store'}
                            </span>
                            <p className="text-sm text-gray-400 font-medium">
                                {storeInfo?.storeDescription || 'Welcome to our premium online shop. Explore our collection of premium quality products curated just for you.'}
                            </p>
                            {/* Social Links */}
                            {storeInfo?.socialLinks && Object.values(storeInfo.socialLinks).some(Boolean) && (
                                <div className="flex gap-4 pt-2">
                                    {storeInfo.socialLinks.instagram && (
                                        <a href={storeInfo.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            Instagram
                                        </a>
                                    )}
                                    {storeInfo.socialLinks.facebook && (
                                        <a href={storeInfo.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            Facebook
                                        </a>
                                    )}
                                    {storeInfo.socialLinks.twitter && (
                                        <a href={storeInfo.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            Twitter
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="md:col-span-3 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Quick Links</h3>
                            <ul className="space-y-2.5 text-sm font-semibold">
                                <li>
                                    <Link to={`/store/${storeId}`} className="text-gray-300 hover:text-white transition-colors">Home</Link>
                                </li>
                                <li>
                                    <Link to={`/store/${storeId}/catalog`} className="text-gray-300 hover:text-white transition-colors">Catalog</Link>
                                </li>
                                {pages.map(page => (
                                    <li key={page.slug}>
                                        <Link to={`/store/${storeId}/pages/${page.slug}`} className="text-gray-300 hover:text-white transition-colors">{page.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Details */}
                        <div className="md:col-span-5 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Contact Us</h3>
                            <ul className="space-y-3 text-sm text-gray-300 font-semibold">
                                {storeInfo?.contactEmail && (
                                    <li className="flex items-center gap-2">
                                        <span className="text-gray-500">✉</span>
                                        <span>{storeInfo.contactEmail}</span>
                                    </li>
                                )}
                                {storeInfo?.contactPhone && (
                                    <li className="flex items-center gap-2">
                                        <span className="text-gray-500">📞</span>
                                        <span>{storeInfo.contactPhone}</span>
                                    </li>
                                )}
                                {(storeInfo?.address || storeInfo?.city) && (
                                    <li className="flex gap-2">
                                        <span className="text-gray-500 mt-1">📍</span>
                                        <span>
                                            {storeInfo.address}{storeInfo.city ? `, ${storeInfo.city}` : ''}
                                            {storeInfo.state ? `, ${storeInfo.state}` : ''}
                                            {storeInfo.pincode ? ` - ${storeInfo.pincode}` : ''}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom copyright */}
                    <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500 font-medium">
                        © {new Date().getFullYear()} {storeInfo?.storeName || 'Storify'}. Powered by Storify.
                    </div>
                </footer>
            </div>
        </ThemeRenderer>
    );
};

export default StorefrontLayout;
