import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const DashboardSidebar = ({ isOpen, setIsOpen, isChatOpen, setIsChatOpen, isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [panelMode, setPanelMode] = useState(localStorage.getItem('adminPanelType') || 'single');
    const merchantInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');
    const realPlanType = merchantInfo?.plan?.planType || merchantInfo?.planType || (panelMode === 'multi' ? 'Multi Vendor' : 'Single Vendor');

    React.useEffect(() => {
        const expectedMode = realPlanType === 'Multi Vendor' ? 'multi' : 'single';
        if (localStorage.getItem('adminPanelType') !== expectedMode) {
            localStorage.setItem('adminPanelType', expectedMode);
            setPanelMode(expectedMode);
        }
    }, [realPlanType]);

    const handlePanelModeChange = (mode) => {
        localStorage.setItem('adminPanelType', mode);
        setPanelMode(mode);
        // Redirect to dashboard root to reload properly
        navigate('/dashboard');
    };

    const isActive = (id) => {
        if (id === 'home') {
            return location.pathname === '/dashboard' || location.pathname === '/dashboard/home';
        }
        return location.pathname.startsWith(`/dashboard/${id}`);
    };

    const singleVendorMenuItems = [
        { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'stores', label: 'Stores', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { id: 'support', label: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'merchant-profile', label: 'Merchant Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
    ];

    const multiVendorMenuItems = [
        { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'stores', label: 'Stores', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
        { id: 'support', label: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'merchant-profile', label: 'Merchant Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
    ];

    const salesChannels = [
        {
            id: 'online-store',
            label: 'Online Store',
            icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
            subItems: [
                { id: 'themes', label: 'Themes' },
                { id: 'pages', label: 'Pages' },
                { id: 'preferences', label: 'Preferences' }
            ]
        },
    ];

    const activeStoreId = localStorage.getItem('activeStoreId');

    const storeMenuItems = [
        { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { id: 'category', label: 'Category', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
        { id: 'customers', label: 'Customers', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 'vendors', label: 'Vendors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'banners', label: 'Banners', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'coupons', label: 'Coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
        { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'pages', label: 'Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { id: 'websites', label: 'Website', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
        { id: 'domains', label: 'Domains', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5v.5m-6-10a9 9 0 11-9 9 8.97 8.97 0 019-9z' },
        { id: 'store-profile', label: 'Store Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
    ];

    const menuItems = activeStoreId ? storeMenuItems : (panelMode === 'single' ? singleVendorMenuItems : multiVendorMenuItems);

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
                <div className="p-6 pb-2 transition-all duration-300" style={{ padding: isCollapsed ? '24px 16px' : '24px' }}>
                    <Link
                        to="/dashboard"
                        onClick={() => setIsChatOpen(false)}
                        className="flex items-center gap-2 group"
                    >
                        <img src={logo} alt="Storify" className="h-8 w-auto flex-shrink-0" />
                        {!isCollapsed && (
                            <span className="text-2xl brand-text leading-none text-white/90">storify</span>
                        )}
                    </Link>
                </div>

                 <div className="px-6 mb-4 transition-all duration-300" style={{ paddingLeft: isCollapsed ? '16px' : '24px', paddingRight: isCollapsed ? '16px' : '24px' }}>
                    <div className="flex justify-center">
                        <div
                            title={realPlanType}
                            className={`inline-flex items-center gap-2 rounded-full text-xs font-semibold tracking-wide shadow-sm border transition-all duration-300
                                ${isCollapsed ? 'p-2' : 'px-4 py-2'}
                                ${realPlanType === "Multi Vendor"
                                     ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                     : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                 }`}
                        >
                            <span className="h-2 w-2 rounded-full bg-current opacity-80"></span>
                            {!isCollapsed && (
                                <span>{realPlanType}</span>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="flex-grow px-2 py-2">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <div key={item.id}>
                                <Link
                                    to={item.id === 'content' ? '/dashboard/content/metaobjects' : (item.id === 'home' ? '/dashboard' : `/dashboard/${item.id}`)}
                                    onClick={() => setIsChatOpen(false)}
                                    title={isCollapsed ? item.label : ''}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all group relative ${isActive(item.id) && !item.subItems?.some(subItem => location.pathname.includes(`/dashboard/${item.id}/${subItem.id}`))
                                        ? 'bg-[#008060]/12 text-white shadow-sm border-l-4 border-[#008060] rounded-r-lg rounded-l-none'
                                        : isActive(item.id) ? 'text-white font-bold' : 'text-[#9ca3af] hover:bg-white/5 hover:text-white font-semibold'
                                        }`}
                                >
                                    <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive(item.id)
                                        ? 'text-[#008060]'
                                        : 'text-[#9ca3af] group-hover:text-white'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>

                                {/* Sub-items rendering */}
                                {!isCollapsed && isActive(item.id) && item.subItems && (
                                    <div className="mt-1 ml-4 space-y-0.5 relative">
                                        {/* Vertical line connecting all subitems */}
                                        <div className="absolute left-[13px] top-[-10px] bottom-[18px] w-[1.5px] bg-white/10 rounded-full"></div>

                                        {item.subItems.map((subItem, index) => {
                                            const isSubActive = location.pathname.includes(`/dashboard/${item.id}/${subItem.id}`);
                                            return (
                                                <div key={subItem.id} className="relative flex items-center group">
                                                    {/* L-connector arrow */}
                                                    <div className="ml-[13px] mr-2 flex-shrink-0">
                                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/10">
                                                            <path d="M0 0V8C0 9.10457 0.89543 10 2 10H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <path d="M8 7.5L10.5 10L8 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>

                                                    <Link
                                                        to={`/dashboard/${item.id}/${subItem.id}`}
                                                        className={`flex-grow py-1.5 px-2 text-sm transition-all rounded-md ${isSubActive
                                                            ? 'text-[#008060] font-bold bg-white/5 shadow-sm translate-x-1 border-l-2 border-[#008060] rounded-l-none'
                                                            : 'text-[#9ca3af] hover:text-white font-medium hover:translate-x-1'
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
                </nav>

                <div className="p-4 border-t border-white/5 space-y-4">
                    <div className="space-y-1">
                        <button 
                            onClick={() => {
                                localStorage.removeItem('merchantInfo');
                                localStorage.removeItem('shopStoreName');
                                navigate('/admin/login');
                            }} 
                            title={isCollapsed ? "Logout" : ""}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all mt-1"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
