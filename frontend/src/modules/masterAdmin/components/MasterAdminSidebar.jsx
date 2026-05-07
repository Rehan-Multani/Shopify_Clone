import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const navItems = [
    { id: 'overview',      label: 'Overview',       icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
    { id: 'stores',        label: 'Stores',          icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'merchants',     label: 'Merchants',       icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'plans',         label: 'Plans & Billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'apps',          label: 'Apps',            icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
    { id: 'analytics',     label: 'Analytics',       icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'support',       label: 'Support',         badge: 8, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z' },
    { id: 'announcements', label: 'Announcements',   icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
];

const platformItems = [
    { id: 'audit-logs', label: 'Audit Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'settings',   label: 'Settings',   icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const NavItem = ({ item, active }) => (
    <Link
        to={`/master-admin/${item.id}`}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group relative select-none"
        style={{
            background: active ? 'rgba(20,184,166,0.12)' : 'transparent',
            color: active ? '#14B8A6' : '#9CA3AF',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = active ? '#14B8A6' : '#fff'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#14B8A6' : '#9CA3AF'; }}
    >
        {/* Active indicator bar */}
        {active && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r" style={{ background: '#14B8A6' }} />
        )}
        <svg className="w-[18px] h-[18px] flex-shrink-0" style={{ color: active ? '#14B8A6' : 'inherit' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
        </svg>
        <span className="flex-grow">{item.label}</span>
        {item.badge && (
            <span className="text-[10px] font-black text-white rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#ef4444', minWidth: 18, height: 18, padding: '0 4px' }}>
                {item.badge}
            </span>
        )}
    </Link>
);

const MasterAdminSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    const isActive = (id) => {
        if (id === 'overview') return location.pathname === '/master-admin' || location.pathname === '/master-admin/overview';
        return location.pathname.startsWith(`/master-admin/${id}`);
    };

    const sidebarContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <Link to="/master-admin/overview" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <img src={logo} alt="Storify" style={{ height: 28, width: 'auto' }} />
                    <span className="brand-text text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>storify</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 8, padding: '6px 12px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#14B8A6', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#14B8A6', letterSpacing: '0.13em', textTransform: 'uppercase' }}>Master Admin</span>
                </div>
            </div>

            {/* Main Nav */}
            <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }} className="custom-scrollbar">
                <div className="space-y-0.5">
                    {navItems.map(item => <NavItem key={item.id} item={item} active={isActive(item.id)} />)}
                </div>

                <div style={{ margin: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                <div style={{ padding: '0 12px', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#374151', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Platform</span>
                </div>
                <div className="space-y-0.5">
                    {platformItems.map(item => <NavItem key={item.id} item={item} active={isActive(item.id)} />)}
                </div>
            </nav>

            {/* Admin Profile */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#14B8A6,#0F766E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                        MA
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Master Admin</p>
                        <p style={{ fontSize: 11, color: '#4B5563', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>admin@storify.com</p>
                    </div>
                    <svg style={{ width: 16, height: 16, color: '#4B5563', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
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
                    width: 256,
                    background: '#1a1c23',
                    flexShrink: 0,
                    height: '100%',              /* fills the h-screen flex parent */
                    overflowY: 'auto',
                }}
                /* Mobile transform handled via className */
                className={`
                    fixed inset-y-0 left-0 z-[70] w-64
                    lg:relative lg:inset-auto lg:z-auto lg:h-full
                    transform transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default MasterAdminSidebar;
