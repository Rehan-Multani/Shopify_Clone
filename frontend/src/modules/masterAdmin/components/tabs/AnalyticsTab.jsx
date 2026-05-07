import React, { useState } from 'react';

const monthlyRevenue = [
    { month: 'Dec', gmv: 1840, sub: 61 }, { month: 'Jan', gmv: 1980, sub: 68 },
    { month: 'Feb', gmv: 2120, sub: 72 }, { month: 'Mar', gmv: 2290, sub: 78 },
    { month: 'Apr', gmv: 2350, sub: 83 }, { month: 'May', gmv: 2410, sub: 88 },
];

const topCountries = [
    { country: 'United States', flag: '🇺🇸', stores: 312, gmv: '$842K', pct: 35 },
    { country: 'India', flag: '🇮🇳', stores: 187, gmv: '$312K', pct: 21 },
    { country: 'United Kingdom', flag: '🇬🇧', stores: 98, gmv: '$198K', pct: 11 },
    { country: 'Germany', flag: '🇩🇪', stores: 76, gmv: '$167K', pct: 9 },
    { country: 'Canada', flag: '🇨🇦', stores: 64, gmv: '$141K', pct: 7 },
    { country: 'Australia', flag: '🇦🇺', stores: 53, gmv: '$108K', pct: 6 },
];

const topStores = [
    { name: 'LuxuryWatches', owner: 'I. Ferrari', gmv: '$112,400', growth: '+22%', plan: 'Plus' },
    { name: 'FashionForward', owner: 'P. Patel', gmv: '$89,100', growth: '+18%', plan: 'Plus' },
    { name: 'BeautyEssentials', owner: 'A. Johnson', gmv: '$67,800', growth: '+14%', plan: 'Plus' },
    { name: 'TechGadgets Pro', owner: 'J. Wilson', gmv: '$48,250', growth: '+31%', plan: 'Advanced' },
    { name: 'ArtisanCrafts', owner: 'M. Santos', gmv: '$41,200', growth: '+9%', plan: 'Plus' },
];

const growthMetrics = [
    { label: 'Store Retention', value: '94.2%', change: '+1.4%', positive: true },
    { label: 'Avg Session Duration', value: '8m 32s', change: '+0:42', positive: true },
    { label: 'Trial Conversion', value: '38.7%', change: '+2.1%', positive: true },
    { label: 'Churn Rate', value: '2.1%', change: '-0.3%', positive: true },
];

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';
const maxGmv = Math.max(...monthlyRevenue.map(m => m.gmv));
const maxSub = Math.max(...monthlyRevenue.map(m => m.sub));

const AnalyticsTab = () => {
    const [range, setRange] = useState('6m');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Analytics</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Platform-wide performance and growth metrics.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white border border-[#e3e3e3] rounded-lg p-1">
                        {['7d', '30d', '3m', '6m', '1y'].map(r => (
                            <button key={r} onClick={() => setRange(r)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${range === r ? 'text-white shadow-sm' : 'text-[#5c5f62] hover:text-[#202223]'}`}
                                style={range === r ? { background: '#1a1c23' } : {}}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#14B8A6' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Report
                    </button>
                </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-4 gap-4">
                {growthMetrics.map(m => (
                    <div key={m.label} className={`${card} p-5`}>
                        <p className="text-2xl font-black text-[#202223]">{m.value}</p>
                        <p className="text-xs font-semibold text-[#5c5f62] mt-1">{m.label}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${m.positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {m.change}
                        </span>
                    </div>
                ))}
            </div>

            {/* Revenue + Subscriptions Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* GMV Trend */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-sm font-bold text-[#202223]">Platform GMV</h2>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">Monthly gross merchandise value ($K)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-[#202223]">$2.41M</p>
                            <p className="text-xs text-green-600 font-semibold">↑ 18.4%</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-36">
                        {monthlyRevenue.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                                <div className="relative w-full group-hover:opacity-90 transition-opacity">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a1c23] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        ${d.gmv}K
                                    </div>
                                </div>
                                <div className="w-full rounded-t-md" style={{
                                    height: `${(d.gmv / maxGmv) * 128}px`,
                                    background: i === monthlyRevenue.length - 1
                                        ? 'linear-gradient(180deg, #14B8A6, #0F766E)'
                                        : '#E5E7EB',
                                    minHeight: 8
                                }} />
                                <span className="text-[10px] font-semibold text-[#9CA3AF]">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subscription Revenue */}
                <div className={`${card} p-6`}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-sm font-bold text-[#202223]">Subscription Revenue</h2>
                            <p className="text-xs text-[#9CA3AF] mt-0.5">Monthly recurring revenue ($K)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-[#202223]">$88.3K</p>
                            <p className="text-xs text-green-600 font-semibold">↑ 8.7%</p>
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-36">
                        {monthlyRevenue.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                <div className="w-full rounded-t-md" style={{
                                    height: `${(d.sub / maxSub) * 128}px`,
                                    background: i === monthlyRevenue.length - 1
                                        ? 'linear-gradient(180deg, #8B5CF6, #6D28D9)'
                                        : '#E5E7EB',
                                    minHeight: 8
                                }} />
                                <span className="text-[10px] font-semibold text-[#9CA3AF]">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Geography + Top Stores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Geographic Breakdown */}
                <div className={`${card} p-6`}>
                    <div className="mb-5">
                        <h2 className="text-sm font-bold text-[#202223]">Geographic Breakdown</h2>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">Top countries by store count</p>
                    </div>
                    <div className="space-y-4">
                        {topCountries.map((c, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-base">{c.flag}</span>
                                        <span className="text-sm font-semibold text-[#202223]">{c.country}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-[#202223]">{c.gmv}</span>
                                        <span className="text-xs text-[#9CA3AF] ml-2">{c.stores} stores</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: '#14B8A6' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performing Stores */}
                <div className={`${card} p-6`}>
                    <div className="mb-5">
                        <h2 className="text-sm font-bold text-[#202223]">Top Performing Stores</h2>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">By monthly GMV this period</p>
                    </div>
                    <div className="space-y-3">
                        {topStores.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#f5f5f5] last:border-0">
                                <span className="text-xs font-black text-[#9CA3AF] w-4">{i + 1}</span>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: '#1a1c23' }}>
                                    {s.name.charAt(0)}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-bold text-[#202223] truncate">{s.name}</p>
                                    <p className="text-[11px] text-[#9CA3AF]">{s.owner} · {s.plan}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-bold text-[#202223]">{s.gmv}</p>
                                    <p className="text-[11px] font-bold text-green-600">{s.growth}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Funnel & Conversion */}
            <div className={`${card} p-6`}>
                <div className="mb-5">
                    <h2 className="text-sm font-bold text-[#202223]">Merchant Conversion Funnel</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Signup to paying merchant journey — last 30 days</p>
                </div>
                <div className="grid grid-cols-5 gap-4 items-center">
                    {[
                        { label: 'Visited', value: 12840, pct: 100, color: '#E5E7EB' },
                        { label: 'Signed Up', value: 498, pct: 3.9, color: '#3B82F6' },
                        { label: 'Started Trial', value: 287, pct: 2.2, color: '#8B5CF6' },
                        { label: 'Activated Store', value: 156, pct: 1.2, color: '#14B8A6' },
                        { label: 'Subscribed', value: 124, pct: 0.97, color: '#008060' },
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="relative flex items-end justify-center" style={{ height: 80 }}>
                                <div className="w-12 rounded-t-md" style={{ height: `${step.pct / 100 * 80}px`, background: step.color, minHeight: 12 }} />
                            </div>
                            <p className="text-sm font-black text-[#202223]">{step.value.toLocaleString()}</p>
                            <p className="text-[10px] text-center text-[#9CA3AF] font-semibold">{step.label}</p>
                            <span className="text-[10px] font-bold text-[#5c5f62]">{step.pct}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
