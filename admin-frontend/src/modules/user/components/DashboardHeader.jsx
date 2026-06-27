import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const tabLabels = {
    home: 'Dashboard',
    category: 'Category',
    products: 'Products',
    customers: 'Customers',
    orders: 'Orders',
    coupons: 'Coupons',
    analytics: 'Analytics',
    reports: 'Reports',
    pages: 'Pages',
    websites: 'Website',
    profile: 'Profile',
    stores: 'Stores',
    support: 'Support'
};

const DashboardHeader = ({ isOpen, setIsOpen, storeName: propStoreName, isCollapsed, toggleCollapse }) => {
    const storeName = propStoreName || localStorage.getItem('shopStoreName') || 'My Store';
    
    // Instead of store name, we use Merchant Name as requested by the image "Rehan"
    const merchantInfoStr = localStorage.getItem('merchantInfo');
    let merchantName = 'Merchant';
    if (merchantInfoStr) {
        try {
            merchantName = JSON.parse(merchantInfoStr).name || 'Merchant';
        } catch(e) {}
    }
    const merchantInitials = merchantName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [stores, setStores] = useState([]);
    const activeStoreId = localStorage.getItem('activeStoreId');
    const currentTab = location.pathname.split('/')[2] || 'home';

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const token = localStorage.getItem('merchantToken');
                if (!token) return;
                const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
                const response = await fetch(`${STORE_API_URL}/stores/my-stores`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setStores(data);
                }
            } catch (err) {
                console.error('Failed to load stores inside header dropdown:', err);
            }
        };
        fetchStores();
    }, []);

    const handleSwitchStore = (storeId, storeName) => {
        localStorage.setItem('activeStoreId', storeId);
        localStorage.setItem('shopStoreName', storeName);
        setIsProfileOpen(false);
        window.location.href = '/dashboard';
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-14 bg-[#1a1c23] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-[40] transition-all duration-300 shadow-xl flex-shrink-0">
            {/* Desktop Sidebar Collapse Toggle */}
            <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-1.5 -ml-2.5 mr-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-all"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                <svg className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M20 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 mr-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Merchant</span>
                {activeStoreId && (
                    <>
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {storeName}
                        </span>
                    </>
                )}
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-bold text-white">{tabLabels[currentTab] || 'Dashboard'}</span>
            </div>

            {/* Search Bar */}
            <div className="flex-grow max-w-md mx-6">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="block w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-10 pr-12 text-sm text-white placeholder-gray-400 focus:placeholder-white/30 focus:outline-none focus:bg-[#1a1c23]/60 focus:border-[#008060]/70 focus:ring-1 focus:ring-[#008060]/30 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 text-[9px] font-bold text-gray-400 tracking-widest uppercase">
                            <span>CTRL</span>
                            <span>K</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all relative group">
                    <svg className="w-5 h-5 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1c23]"></span>
                </button>
                <button className="p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all group">
                    <svg className="w-5 h-5 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21l-1.414-1.414A17.933 17.933 0 0112 17.24a17.933 17.933 0 011.414 2.346L12 21zm0 0v-5m0 0a5.333 5.333 0 01-5-5.333V5a5 5 0 0110 0v5.667A5.333 5.333 0 0112 16z" />
                    </svg>
                </button>
                
                <div className="h-8 w-px bg-white/10 mx-1"></div>

                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-white/5 rounded-lg transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#008060] flex items-center justify-center text-[10px] font-black tracking-widest text-white shadow-lg transition-transform group-hover:scale-105 active:scale-95">
                            {merchantInitials}
                        </div>
                        <span className="text-sm font-bold text-white group-hover:opacity-80 transition-opacity">{merchantName}</span>
                        <svg className={`w-4 h-4 text-gray-400 group-hover:text-white transition-all ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#1a1c23] rounded-xl shadow-2xl py-2 z-50 border border-white/10 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                            {/* Signed In Header */}
                            <div className="px-4 py-2 border-b border-white/5 mb-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Signed in as</p>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('activeStoreId');
                                        localStorage.setItem('shopStoreName', merchantName);
                                        setIsProfileOpen(false);
                                        window.location.href = '/dashboard';
                                    }}
                                    className="text-sm font-bold text-white hover:text-emerald-400 transition-colors truncate text-left w-full flex items-center justify-between group mt-0.5"
                                    title="Switch to Global Merchant View"
                                >
                                    <span className="truncate">{merchantName}</span>
                                    {!activeStoreId ? (
                                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-0.5">
                                            <span className="h-1 w-1 bg-emerald-400 rounded-full"></span>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Exit Store</span>
                                    )}
                                </button>
                            </div>
                            
                            {/* Stores List */}
                            <div className="px-2 py-1 max-h-48 overflow-y-auto border-b border-white/5 custom-scrollbar">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 py-1">My Stores</p>
                                {stores.length > 0 ? (
                                    stores.map(store => (
                                        <button
                                            key={store._id}
                                            onClick={() => handleSwitchStore(store._id, store.storeName)}
                                            className={`w-full text-left px-2 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${store._id === activeStoreId ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            <span className="truncate">{store.storeName}</span>
                                            {store._id === activeStoreId && (
                                                <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 px-2 py-1">No stores found</p>
                                )}
                            </div>
                            
                            {/* Create Store & Profile */}
                            <div className="py-1">
                                <Link 
                                    to="/dashboard/stores/new" 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-4 py-1.5 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Create store
                                </Link>
                                <Link 
                                    to="/dashboard/profile" 
                                    onClick={() => setIsProfileOpen(false)}
                                    className="w-full text-left px-4 py-1.5 text-sm font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    My profile
                                </Link>
                            </div>
                            
                            {/* Logout */}
                            <div className="border-t border-white/5 mt-1 pt-1">
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('merchantInfo');
                                        localStorage.removeItem('shopStoreName');
                                        localStorage.removeItem('activeStoreId');
                                        navigate('/admin/login');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
