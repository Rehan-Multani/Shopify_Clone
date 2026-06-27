import React, { useState, useEffect } from 'react';

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const BillingTab = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [billingHistory, setBillingHistory] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalSubs, setTotalSubs] = useState(0);

    const getAuthHeaders = () => {
        const info = JSON.parse(localStorage.getItem('masterAdminInfo') || '{}');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${info.token || ''}`
        };
    };

    const fetchBillingData = async () => {
        try {
            setIsLoading(true);
            const billingApiUrl = import.meta.env.VITE_BILLING_API_URL;
            const res = await fetch(`${billingApiUrl}/admin/history`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (res.ok) {
                setBillingHistory(data.billingHistory || []);
                setTotalRevenue(data.totalRevenue || 0);
                setTotalSubs(data.totalSubs || 0);
            } else {
                console.error('Failed to fetch billing stats:', data.message);
            }
        } catch (error) {
            console.error('Error fetching billing data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBillingData();
    }, []);

    const downloadExcelInvoice = (b) => {
        const csvRows = [
            ["Invoice Details", ""],
            ["Invoice ID", b.id],
            ["Merchant Name", b.merchantName],
            ["Store Name", b.storeName],
            ["Plan Name", b.planName],
            ["Start Date", b.startDate],
            ["End Date", b.endDate],
            ["Amount", b.amount],
            ["Status", b.status === 'active' ? 'Active' : 'Inactive'],
            ["Payment ID", b.paymentId]
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + csvRows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Invoice_${b.storeName.replace(/\s+/g, '_')}_${b.startDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDFInvoice = (b) => {
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - ${b.storeName}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                    .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); padding: 30px; border-radius: 10px; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #14B8A6; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { font-size: 28px; font-weight: bold; color: #14B8A6; }
                    .title { font-size: 24px; font-weight: bold; text-align: right; }
                    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .details-table td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
                    .details-table td.label { font-weight: bold; color: #5c5f62; width: 30%; }
                    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div class="logo">Storify</div>
                        <div class="title">INVOICE</div>
                    </div>
                    <table class="details-table">
                        <tr><td class="label">Invoice ID</td><td>${b.id}</td></tr>
                        <tr><td class="label">Merchant Name</td><td>${b.merchantName}</td></tr>
                        <tr><td class="label">Store Name</td><td>${b.storeName}</td></tr>
                        <tr><td class="label">Subscription Plan</td><td>${b.planName}</td></tr>
                        <tr><td class="label">Start Date</td><td>${b.startDate}</td></tr>
                        <tr><td class="label">End Date</td><td>${b.endDate}</td></tr>
                        <tr><td class="label">Amount Paid</td><td><strong>${b.amount}</strong></td></tr>
                        <tr><td class="label">Status</td><td>${b.status.toUpperCase()}</td></tr>
                        <tr><td class="label">Payment ID</td><td>${b.paymentId}</td></tr>
                    </table>
                    <div class="footer">
                        Thank you for partnering with Storify!
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Billing Overview</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Manage revenue and billing history.</p>
                </div>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={`summary-skel-${i}`} className={`${card} p-5 animate-pulse`}>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                        </div>
                    ))
                ) : (
                    [
                        { label: 'Monthly Subscription Revenue', val: `₹${totalRevenue.toLocaleString()}`, sub: '+18.4% from last month' },
                        { label: 'Total Subscribers', val: totalSubs.toLocaleString(), sub: '+8.7% from last month' },
                        { label: 'Avg Revenue Per User', val: `₹${totalSubs ? (totalRevenue / totalSubs).toFixed(0) : 0}`, sub: '+9.2% from last month' },
                    ].map(s => (
                        <div key={s.label} className={`${card} p-5`}>
                            <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-2">{s.label}</p>
                            <p className="text-3xl font-black text-[#202223]">{s.val}</p>
                            <p className="text-xs font-semibold text-green-600 mt-1.5 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                {s.sub}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Billing History */}
            <div className={card}>
                <div className="px-5 py-4 border-b border-[#e3e3e3]">
                    <h2 className="text-sm font-bold text-[#202223]">Billing History</h2>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">Store-wise platform subscription details</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#f0f0f0]">
                                {['Merchant Name', 'Store Name', 'Plan', 'Start Date', 'End Date', 'Amount', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-widest text-[#9CA3AF]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={`bill-skel-${i}`} className="border-b border-[#f5f5f5] animate-pulse">
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                    </tr>
                                ))
                            ) : billingHistory.length > 0 ? billingHistory.map((b, i) => (
                                <tr key={i} className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors">
                                    <td className="px-5 py-3.5 text-sm font-semibold text-[#202223]">{b.merchantName}</td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{b.storeName}</td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{b.planName}</td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{b.startDate}</td>
                                    <td className="px-5 py-3.5 text-sm text-[#5c5f62]">{b.endDate}</td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-[#202223]">{b.amount}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                            b.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            {b.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => downloadPDFInvoice(b)}
                                                className="text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1" 
                                                style={{ color: '#E11D48' }}
                                                title="Download PDF"
                                            >
                                                PDF
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button 
                                                onClick={() => downloadExcelInvoice(b)}
                                                className="text-xs font-semibold hover:opacity-80 transition-opacity flex items-center gap-1" 
                                                style={{ color: '#16A34A' }}
                                                title="Download Excel"
                                            >
                                                Excel
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="8" className="px-5 py-8 text-center text-sm text-gray-500 bg-gray-50/50">
                                        No billing history available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingTab;
