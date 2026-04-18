import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const DashboardSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    
    const isActive = (id) => {
        if (id === 'home') {
            return location.pathname === '/dashboard' || location.pathname === '/dashboard/home';
        }
        return location.pathname.startsWith(`/dashboard/${id}`);
    };

    const menuItems = [
        { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { 
            id: 'orders', 
            label: 'Orders', 
            icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
            subItems: [
                { id: 'drafts', label: 'Drafts' },
                { id: 'abandoned', label: 'Abandoned checkouts' }
            ]
        },
        { 
            id: 'products', 
            label: 'Products', 
            icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            subItems: [
                { id: 'collections', label: 'Collections' },
                { id: 'inventory', label: 'Inventory' },
                { id: 'purchase-orders', label: 'Purchase orders' },
                { id: 'transfers', label: 'Transfers' },
                { id: 'gift-cards', label: 'Gift cards' }
            ]
        },
        { 
            id: 'customers', 
            label: 'Customers', 
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            subItems: [
                { id: 'segments', label: 'Segments' },
                { id: 'companies', label: 'Companies' }
            ]
        },
        { id: 'marketing', label: 'Marketing', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { id: 'discounts', label: 'Discounts', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
        { id: 'content', label: 'Content', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { id: 'analytics', label: 'Analytics', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ];

    const salesChannels = [
        { id: 'online-store', label: 'Online Store', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`w-64 bg-[#0B0F14] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-[70] overflow-y-auto transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
            <div className="p-6 mb-2">
                <Link to="/dashboard" className="flex items-center">
                    <img src={logo} alt="Storify" className="h-8 w-auto" />
                </Link>
            </div>

            <nav className="flex-grow px-2 py-4">
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <div key={item.id}>
                            <Link
                                to={item.id === 'home' ? '/dashboard' : `/dashboard/${item.id}`}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all group ${
                                    isActive(item.id)
                                        ? 'bg-storify/10 text-storify-glow border border-storify/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <svg className={`w-5 h-5 transition-colors ${
                                    isActive(item.id)
                                        ? 'text-storify-glow'
                                        : 'text-gray-500 group-hover:text-white'
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.label}
                            </Link>

                            {/* Sub-items rendering */}
                            {isActive(item.id) && item.subItems && (
                                <div className="mt-1 ml-4 space-y-0.5 relative">
                                    {/* Vertical line connecting all subitems */}
                                    <div className="absolute left-[13px] top-[-10px] bottom-[18px] w-[1.5px] bg-[#d3d6d9] rounded-full"></div>
                                    
                                    {item.subItems.map((subItem, index) => {
                                        const isSubActive = location.pathname.endsWith(`/${subItem.id}`);
                                        return (
                                            <div key={subItem.id} className="relative flex items-center group">
                                                {/* L-connector arrow */}
                                                <div className="ml-[13px] mr-2 flex-shrink-0">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#d3d6d9]">
                                                        <path d="M0 0V8C0 9.10457 0.89543 10 2 10H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                        <path d="M8 7.5L10.5 10L8 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                                
                                                <Link 
                                                    to={`/dashboard/${item.id}/${subItem.id}`}
                                                    className={`flex-grow py-1.5 px-2 text-sm transition-all rounded-md ${
                                                        isSubActive
                                                            ? 'text-black font-bold bg-[#ffffff] shadow-sm translate-x-1'
                                                            : 'text-[#5c5f62] hover:text-black font-medium hover:translate-x-1'
                                                    }`}
                                                >
                                                    {subItem.label}
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <div className="px-3 mb-2 flex items-center justify-between group">
                        <span className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase">Sales channels</span>
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                    <div className="space-y-1">
                        {salesChannels.map((item) => (
                            <Link
                                key={item.id}
                                to={`/dashboard/${item.id}`}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all transition-all ${
                                    isActive(item.id) ? 'bg-storify/10 text-storify-glow' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                </svg>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <div className="px-3 mb-2 flex items-center justify-between group">
                        <span className="text-xs font-bold text-[#5c5f62] tracking-wider uppercase">Apps</span>
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#e4e3e6] rounded transition-all">
                            <svg className="w-4 h-4 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                    <button className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-semibold text-[#5c5f62] hover:bg-[#e4e3e6] transition-all">
                        <div className="w-5 h-5 flex items-center justify-center bg-[#e4e3e6] rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        Add apps
                    </button>
                </div>
            </nav>

            <div className="p-4 border-t border-white/5 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                </button>
                <div className="p-4 bg-[#111827] border border-white/5 rounded-2xl text-white mt-4 relative overflow-hidden group cursor-pointer hover:border-white/10 transition-all shadow-2xl teal-glow">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Trial ends in 3 days</p>
                        <p className="text-sm font-bold mb-4">Subscribe for <span className="text-storify-glow">₹20</span></p>
                        <Link to="/dashboard/plan" className="w-full py-2.5 teal-gradient text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all block text-center shadow-lg active:scale-95">
                            Subscribe
                        </Link>
                    </div>
                    {/* Abstract background flare */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-storify/10 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-storify/20 transition-all"></div>
                </div>
            </div>
        </aside>
      </>
    );
};

export default DashboardSidebar;
