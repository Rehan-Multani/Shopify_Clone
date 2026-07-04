import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const navItems = [
    { id: 'overview',      label: 'Overview',       icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'stores',        label: 'Stores',          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'merchants',     label: 'Merchants',       icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'plans',         label: 'Plans',           icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'billing',       label: 'Billing',         icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'themes',        label: 'Themes',          icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'analytics',     label: 'Analytics',       icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'support',       label: 'Support',         icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z' },
    { id: 'settings',      label: 'Settings',        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const NavItem = ({ item, active, isCollapsed }) => (
    <Link
        to={`/superadmin/${item.id}`}
        title={isCollapsed ? item.label : undefined}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group relative select-none"
        style={{
            background: active ? 'rgba(20,184,166,0.12)' : 'transparent',
            color: active ? '#fff' : '#9CA3AF',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#fff' : '#9CA3AF'; }}
    >
        {active && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r" style={{ background: '#14B8A6' }} />
        )}
        <svg className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? '#14B8A6' : 'inherit' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
        </svg>
        {!isCollapsed && <span className="flex-grow">{item.label}</span>}
        {!isCollapsed && item.badge && (
            <span className="text-[10px] font-black text-white rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#ef4444', minWidth: 18, height: 18, padding: '0 4px' }}>
                {item.badge}
            </span>
        )}
        {isCollapsed && item.badge && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#1a1c23]" />
        )}
    </Link>
);

const MasterAdminSidebar = ({ isOpen, setIsOpen, isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (id) => {
        if (id === 'overview') return location.pathname === '/superadmin' || location.pathname === '/superadmin/overview';
        return location.pathname.startsWith(`/superadmin/${id}`);
    };

    const sidebarContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {/* Logo */}
            <div style={{ padding: isCollapsed ? '20px 12px' : '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <Link to="/superadmin/overview" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: 10, marginBottom: 14 }}>
                    <img src={logo} alt="Storify" style={{ height: 28, width: 'auto' }} />
                    {!isCollapsed && <span className="brand-text text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>storify</span>}
                </Link>
                {isCollapsed ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} title="Master Admin Mode" />
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 8, padding: '6px 12px' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#14B8A6', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 900, color: '#14B8A6', letterSpacing: '0.13em', textTransform: 'uppercase' }}>Master Admin</span>
                    </div>
                )}
            </div>

            {/* Main Nav */}
            <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }} className="custom-scrollbar">
                <div className="space-y-0.5">
                    {navItems.map(item => <NavItem key={item.id} item={item} active={isActive(item.id)} isCollapsed={isCollapsed} />)}
                </div>
            </nav>

            {/* Bottom Actions */}
            <div style={{ padding: '0 12px 12px 12px', flexShrink: 0 }}>
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate('/superadmin/login');
                    }}
                    title={isCollapsed ? "Log Out" : undefined}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group"
                    style={{ color: '#ef4444', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                    <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!isCollapsed && <span className="flex-grow text-left">Log Out</span>}
                </button>
            </div>

            {/* Admin Profile */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.15s' }}
                    title={isCollapsed ? "Master Admin (admin@storify.com)" : undefined}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#14B8A6,#0F766E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        MA
                    </div>
                    {!isCollapsed && (
                        <>
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Master Admin</p>
                                <p style={{ fontSize: 11, color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>admin@storify.com</p>
                            </div>
                            <svg style={{ width: 16, height: 16, color: '#4B5563', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                        </>
                    )}
                </div>
            </div>
            

        </div>
    );

    return (
        <>
            {/* Mobile backdrop */}
            <div
                onClick={() => setIsOpen(false)}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60,
                    opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s',
                }}
                className="lg:hidden"
            />

            {/* Sidebar — desktop: flex child (full height via parent), mobile: fixed overlay */}
            <aside
                style={{
                    width: isCollapsed ? 72 : 256,
                    background: '#1a1c23',
                    flexShrink: 0,
                    height: '100%',              /* fills the h-screen flex parent */
                    overflowY: 'visible',        /* allow collapse toggle to overflow */
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                /* Mobile transform handled via className */
                className={`
                    fixed inset-y-0 left-0 z-[70]
                    lg:relative lg:inset-auto lg:z-auto lg:h-full
                    transform transition-all duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default MasterAdminSidebar;
