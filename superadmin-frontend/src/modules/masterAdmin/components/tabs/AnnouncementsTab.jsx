import React, { useState } from 'react';

const pastAnnouncements = [
    {
        id: 1, title: 'Scheduled Maintenance: May 8, 2026 2–4 AM UTC',
        body: 'We will be performing scheduled maintenance on May 8th from 2:00 AM to 4:00 AM UTC. During this window, stores may experience brief interruptions. We apologize for any inconvenience.',
        audience: 'All Merchants', sentAt: '2026-05-06 10:00', status: 'sent', type: 'maintenance', opens: 734,
    },
    {
        id: 2, title: 'New Feature: AI-Powered Product Description Generator',
        body: 'We are excited to announce the launch of our AI product description tool! Generate compelling product descriptions in seconds directly from your product editor.',
        audience: 'Advanced + Plus Plans', sentAt: '2026-05-01 14:00', status: 'sent', type: 'feature', opens: 498,
    },
    {
        id: 3, title: 'May Pricing Update: Revised Transaction Fees',
        body: 'Starting June 1st, 2026, we are reducing transaction fees across all paid plans. Basic: 1.2% → 1.0%, Advanced: 0.8% → 0.6%, Plus: remains 0%.',
        audience: 'Basic & Advanced Plans', sentAt: '2026-04-25 09:30', status: 'sent', type: 'billing', opens: 621,
    },
    {
        id: 4, title: 'Summer Seller Summit — Register Now',
        body: 'Join us for our virtual Summer Seller Summit on June 15th! Learn from top merchants, get tips from the Storify team, and network with thousands of sellers.',
        audience: 'All Merchants', sentAt: '2026-04-18 11:00', status: 'sent', type: 'event', opens: 812,
    },
    {
        id: 5, title: 'Breaking: Critical Security Patch Applied',
        body: 'We have successfully applied a critical security patch to all platform instances. No action is required from merchants. Your data remains fully protected.',
        audience: 'All Merchants', sentAt: '2026-04-10 03:00', status: 'sent', type: 'security', opens: 923,
    },
];

const typeConfig = {
    maintenance: { color: '#B45309', bg: '#FFFBEB', icon: '🔧' },
    feature: { color: '#14B8A6', bg: '#F0FDFA', icon: '✨' },
    billing: { color: '#8B5CF6', bg: '#F5F3FF', icon: '💳' },
    event: { color: '#3B82F6', bg: '#EFF6FF', icon: '🎉' },
    security: { color: '#DC2626', bg: '#FEF2F2', icon: '🔒' },
};

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const AnnouncementsTab = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState('all');
    const [type, setType] = useState('feature');
    const [scheduledAt, setScheduledAt] = useState('');
    const [sendNow, setSendNow] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    const audienceOptions = [
        { value: 'all', label: 'All Merchants (891)' },
        { value: 'plus', label: 'Plus Plan Only (187)' },
        { value: 'advanced_plus', label: 'Advanced + Plus (499)' },
        { value: 'paid', label: 'All Paid Plans (767)' },
        { value: 'trial', label: 'Trial Users (124)' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Announcements</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Broadcast messages and updates to merchants.</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#5c5f62]">
                    <span>Total sent this month:</span>
                    <span className="font-bold text-[#202223]">5</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Create Form */}
                <div className={`${card} p-6 lg:col-span-2`}>
                    <h2 className="text-sm font-bold text-[#202223] mb-5">Create Announcement</h2>

                    <div className="space-y-4">
                        {/* Type */}
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Announcement Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(typeConfig).map(([key, cfg]) => (
                                    <button key={key} onClick={() => setType(key)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center`}
                                        style={{
                                            borderColor: type === key ? cfg.color : '#e3e3e3',
                                            background: type === key ? cfg.bg : 'white',
                                        }}>
                                        <span className="text-lg">{cfg.icon}</span>
                                        <span className="text-[10px] font-bold capitalize" style={{ color: type === key ? cfg.color : '#9CA3AF' }}>{key}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Subject Line</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. New feature: Advanced Analytics"
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Message</label>
                            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
                                placeholder="Write your announcement message here..."
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                            <p className="text-[11px] text-[#9CA3AF] mt-1">{body.length}/500 characters</p>
                        </div>

                        {/* Audience */}
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">Target Audience</label>
                            <select value={audience} onChange={e => setAudience(e.target.value)}
                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 bg-white">
                                {audienceOptions.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Schedule */}
                        <div>
                            <label className="block text-xs font-semibold text-[#5c5f62] mb-2">Delivery</label>
                            <div className="space-y-2">
                                {[
                                    { value: true, label: 'Send immediately' },
                                    { value: false, label: 'Schedule for later' },
                                ].map(o => (
                                    <label key={String(o.value)} className="flex items-center gap-2.5 cursor-pointer">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sendNow === o.value ? 'border-[#14B8A6]' : 'border-[#d3d3d3]'}`}
                                            onClick={() => setSendNow(o.value)}>
                                            {sendNow === o.value && <div className="w-2 h-2 rounded-full" style={{ background: '#14B8A6' }} />}
                                        </div>
                                        <span className="text-sm font-medium text-[#202223]">{o.label}</span>
                                    </label>
                                ))}
                            </div>
                            {!sendNow && (
                                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                                    className="mt-3 w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <button onClick={() => setShowPreview(v => !v)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#d3d3d3] text-[#5c5f62] hover:bg-gray-50 transition-all">
                                {showPreview ? 'Hide Preview' : 'Preview'}
                            </button>
                            <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: '#1a1c23' }}>
                                {sendNow ? 'Send Now' : 'Schedule'}
                            </button>
                        </div>

                        {showPreview && title && (
                            <div className="mt-1 p-4 rounded-xl" style={{ background: '#f6f6f7', border: '1px dashed #d3d3d3' }}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-2">Email Preview</p>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg">{typeConfig[type]?.icon}</span>
                                        <span className="text-sm font-bold text-[#202223]">{title || 'Subject line...'}</span>
                                    </div>
                                    <p className="text-xs text-[#5c5f62] leading-relaxed">{body || 'Your message will appear here...'}</p>
                                    <p className="text-[10px] text-[#9CA3AF] mt-3">Sent by Storify Admin · Unsubscribe</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Past Announcements */}
                <div className={`${card} lg:col-span-3`}>
                    <div className="px-5 py-4 border-b border-[#e3e3e3] flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#202223]">Sent Announcements</h2>
                        <span className="text-xs text-[#9CA3AF]">{pastAnnouncements.length} total</span>
                    </div>
                    <div className="divide-y divide-[#f5f5f5]">
                        {pastAnnouncements.map(a => {
                            const cfg = typeConfig[a.type];
                            return (
                                <div key={a.id} className="px-5 py-4 hover:bg-[#fafafa] transition-colors group">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cfg.bg }}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-bold text-[#202223] truncate">{a.title}</p>
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: cfg.color, background: cfg.bg }}>
                                                    {a.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#5c5f62] mt-1 line-clamp-2">{a.body}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-[11px] text-[#9CA3AF]">{a.audience}</span>
                                                <span className="text-[11px] text-[#9CA3AF]">·</span>
                                                <span className="text-[11px] text-[#9CA3AF]">{a.sentAt}</span>
                                                <span className="text-[11px] text-[#9CA3AF]">·</span>
                                                <span className="text-[11px] font-semibold text-[#14B8A6]">{a.opens} opens</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-xs font-semibold text-[#5c5f62] hover:text-[#202223] border border-[#e3e3e3] px-3 py-1 rounded-lg transition-all">
                                            Duplicate
                                        </button>
                                        <button className="text-xs font-semibold text-[#5c5f62] hover:text-[#202223] border border-[#e3e3e3] px-3 py-1 rounded-lg transition-all">
                                            View Stats
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementsTab;
