import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const notifications = [
    { id: 1, text: 'New store registration: ArtisanCrafts Brazil', time: '2m ago', urgent: false },
    { id: 2, text: 'App submitted for review: ShipTracker Pro v2.1', time: '15m ago', urgent: false },
    { id: 3, text: 'Support ticket #1082: Payment gateway failure', time: '1h ago', urgent: true },
    { id: 4, text: '3 accounts flagged for suspicious activity', time: '2h ago', urgent: true },
    { id: 5, text: 'Monthly revenue report is ready to view', time: '3h ago', urgent: false },
];

const pageTitles = {
    overview: 'Platform Overview',
    stores: 'Stores',
    merchants: 'Merchants',
    plans: 'Plans & Billing',
    apps: 'Apps Marketplace',
    analytics: 'Analytics',
    support: 'Support',
    announcements: 'Announcements',
    'audit-logs': 'Audit Logs',
    settings: 'Settings',
};

const MasterAdminHeader = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const currentTab = location.pathname.split('/')[2] || 'overview';
    const pageTitle = pageTitles[currentTab] || 'Master Admin';

    return (
        <header className="h-14 bg-[#1a1c23] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-40 shadow-xl flex-shrink-0">
            {/* Mobile toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 mr-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#4B5563' }}>Admin</span>
                <svg className="w-3 h-3" style={{ color: '#4B5563' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-bold text-white">{pageTitle}</span>
            </div>

            {/* Search */}
            <div className="flex-grow max-w-md mx-6">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder="Search stores, merchants, tickets..."
                        className="block w-full rounded-lg py-1.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                        style={{ background: '#2f313a', border: 'none' }}
                        onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(20,184,166,0.3)'}
                        onBlur={e => e.target.style.boxShadow = 'none'}
                    />
                </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                {/* Status indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg mr-1" style={{ background: 'rgba(0,128,96,0.12)', border: '1px solid rgba(0,128,96,0.2)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }}></div>
                    <span className="text-[11px] font-bold" style={{ color: '#34d399' }}>All systems online</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(v => !v)}
                        className="p-2 text-gray-400 rounded-lg transition-all relative group"
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg className="w-5 h-5 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" style={{ border: '2px solid #1a1c23' }}></span>
                    </button>

                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ background: '#1e2028', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span className="text-sm font-bold text-white">Notifications</span>
                                    <button className="text-xs font-semibold" style={{ color: '#14B8A6' }}>Mark all read</button>
                                </div>
                                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                                    {notifications.map(n => (
                                        <div key={n.id} className="px-4 py-3 cursor-pointer transition-all flex items-start gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.urgent ? '#f87171' : '#14B8A6' }}></div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-xs leading-relaxed" style={{ color: '#D1D5DB' }}>{n.text}</p>
                                                <p className="text-[10px] mt-0.5" style={{ color: '#4B5563' }}>{n.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3">
                                    <button className="w-full text-center text-xs font-semibold" style={{ color: '#14B8A6' }}>View all notifications</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }}></div>

                {/* Admin profile */}
                <button className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all group"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #14B8A6, #0F766E)' }}>
                        MA
                    </div>
                    <span className="text-sm font-semibold text-white hidden sm:block">Master Admin</span>
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default MasterAdminHeader;
