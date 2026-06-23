import React from 'react';

const ReportsTab = () => {
    const reports = [
        { title: 'Sales Report', desc: 'Detailed breakdown of sales by product, collection, and region.', category: 'Sales', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { title: 'Customer Acquisition', desc: 'Overview of new vs. returning customers and acquisition channels.', category: 'Customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { title: 'Inventory Valuation', desc: 'Current stock value, cost of goods, and projected margins.', category: 'Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { title: 'Discount Performance', desc: 'Analysis of discount usage, coupon codes, and promotion revenue.', category: 'Marketing', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
        { title: 'Tax Liabilities', desc: 'Summary of taxes collected by state, region, and order type.', category: 'Finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V3' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Reports</h1>
                    <p className="text-xs text-[#5c5f62] mt-0.5">Generate and download custom analytical reports for your business.</p>
                </div>
                <button className="px-4 py-2 bg-[#1a1c23] border border-[#1a1c23] rounded-lg text-sm font-bold text-white hover:bg-black transition-all shadow-md active:scale-95">
                    Export All Reports
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((r, i) => (
                    <div key={i} className="bg-white rounded-xl border border-[#e3e3e3] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#202223] flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={r.icon} /></svg>
                        </div>
                        <div className="flex-grow space-y-1">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{r.category}</span>
                            <h3 className="text-sm font-bold text-[#202223]">{r.title}</h3>
                            <p className="text-xs text-[#5c5f62] leading-relaxed">{r.desc}</p>
                            <div className="pt-2 flex gap-3">
                                <button className="text-[11px] font-bold text-black hover:underline">View Report</button>
                                <button className="text-[11px] font-bold text-gray-400 hover:text-black">Download PDF</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportsTab;
