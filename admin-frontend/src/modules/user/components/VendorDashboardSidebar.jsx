import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const VendorDashboardSidebar = ({ isOpen, setIsOpen, isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');

    const isActive = (id) => {
        if (id === 'home') {
            return location.pathname === '/vendor/dashboard' || location.pathname === '/vendor/dashboard/home';
        }
        return location.pathname.startsWith(`/vendor/dashboard/${id}`);
    };

    const vendorMenuItems = [
        { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'category', label: 'Category', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
        { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { id: 'orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { id: 'coupons', label: 'Coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
        { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
        { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('vendorInfo');
        localStorage.removeItem('vendorToken');
        localStorage.removeItem('activeStoreId');
        localStorage.removeItem('userRole');
        navigate('/vendor/login');
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <aside 
                style={{
                    width: isCollapsed ? 72 : 256,
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className={`
                    fixed inset-y-0 left-0 z-[70]
                    lg:relative lg:inset-auto lg:z-auto lg:h-full
                    transform transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    bg-[#1a1c23] border-r border-white/5 flex flex-col overflow-y-auto no-scrollbar shadow-2xl lg:shadow-none
                `}
            >
                {/* Logo and Brand */}
                <div className="p-6 pb-2 transition-all duration-300" style={{ padding: isCollapsed ? '24px 16px' : '24px' }}>
                    <Link to="/vendor/dashboard" className="flex items-center gap-2 group">
                        <img src={logo} alt="Storify" className="h-8 w-auto flex-shrink-0" />
                        {!isCollapsed && (
                            <span className="text-2xl brand-text leading-none text-white/90">storify</span>
                        )}
                    </Link>
                </div>

                {/* Plan/Role Badge */}
                <div className="px-6 mb-4 transition-all duration-300" style={{ paddingLeft: isCollapsed ? '16px' : '24px', paddingRight: isCollapsed ? '16px' : '24px' }}>
                    <div className="flex justify-center">
                        <div
                            className={`inline-flex items-center gap-2 rounded-full text-xs font-semibold tracking-wide shadow-sm border transition-all duration-300
                                ${isCollapsed ? 'p-2' : 'px-4 py-2'}
                                bg-teal-500/10 text-teal-400 border-teal-500/20`}
                        >
                            <span className="h-2 w-2 rounded-full bg-current opacity-80 animate-pulse"></span>
                            {!isCollapsed && (
                                <span>Vendor Portal</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-grow px-2 py-2">
                    <div className="space-y-1">
                        {vendorMenuItems.map((item) => {
                            const active = isActive(item.id);
                            return (
                                <Link
                                    key={item.id}
                                    to={item.id === 'home' ? '/vendor/dashboard' : `/vendor/dashboard/${item.id}`}
                                    title={isCollapsed ? item.label : ''}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all group relative ${active
                                        ? 'bg-[#008060]/12 text-white shadow-sm border-l-4 border-[#008060] rounded-r-lg rounded-l-none'
                                        : 'text-[#9ca3af] hover:bg-white/5 hover:text-white font-semibold'
                                    }`}
                                >
                                    <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${active
                                        ? 'text-[#008060]'
                                        : 'text-[#9ca3af] group-hover:text-white'
                                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Footer Section */}
                <div className="p-4 border-t border-white/5 space-y-4">
                    {!isCollapsed && (
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold uppercase text-sm flex-shrink-0">
                                {vendorInfo.email ? vendorInfo.email[0] : 'V'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Vendor</p>
                                <p className="text-xs font-bold text-white truncate max-w-[140px]">{vendorInfo.email || 'vendor@store.com'}</p>
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? "Sign Out" : ""}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all mt-1"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default VendorDashboardSidebar;
