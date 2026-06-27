import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;

const StorefrontPage = ({ cartCount, customer, onLogout, storeInfo }) => {
    const { storeId, slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sent, setSent] = useState(false);

    useEffect(() => {
        if (!storeId || !slug) return;
        const fetchPageDetails = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${GATEWAY_URL}/store-pages/${slug}?storeId=${storeId}`);
                const data = await res.json();
                if (res.ok && data.success) {
                    setPage(data.page);
                } else {
                    setPage(null);
                }
            } catch (err) {
                console.error('Error fetching storefront page details:', err);
                setPage(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPageDetails();
    }, [storeId, slug]);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSent(false), 5000);
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-3xl mx-auto py-16 px-4 space-y-8 animate-pulse">
                    {/* Page Title */}
                    <div className="w-1/2 h-7 bg-zinc-200 rounded-lg"></div>

                    {/* Paragraph blocks */}
                    <div className="space-y-3 pt-4">
                        <div className="w-full h-3 bg-zinc-200 rounded"></div>
                        <div className="w-11/12 h-3 bg-zinc-200 rounded"></div>
                        <div className="w-5/6 h-3 bg-zinc-200 rounded"></div>
                        <div className="w-4/5 h-3 bg-zinc-200 rounded"></div>
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    if (!page) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-md mx-auto py-20 text-center space-y-5 bg-white border border-zinc-200/60 p-8 rounded-3xl mt-12 shadow-sm animate-scale-in" style={{ borderRadius: 'var(--border-radius)' }}>
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-md font-black text-zinc-800 uppercase tracking-wider">Page Not Found</h2>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">The page you are trying to view does not exist or has been removed.</p>
                    <Link to={`/store/${storeId}`} className="inline-block px-6 py-2.5 bg-zinc-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-md active:scale-95">
                        Back to Home
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    // Dynamic Address Builder
    const formattedAddress = [
        storeInfo?.address,
        storeInfo?.city,
        storeInfo?.state,
        storeInfo?.pincode ? `Pin: ${storeInfo.pincode}` : '',
        'India'
    ].filter(Boolean).join(', ') || '123 Fashion Street, Sector 5, New Delhi, Pin: 110001, India';

    const dynamicEmail = storeInfo?.contactEmail || `support@${(storeInfo?.storeName?.toLowerCase().replace(/\s+/g, '') || 'rehanfashions')}.com`;
    const dynamicPhone = storeInfo?.contactPhone || '+91 98765 43210';

    let renderedContent = page.content || 'Content coming soon...';
    if (slug === 'contact-us' && page.content) {
        renderedContent = page.content
            .replace(/support@rehanfashions\.com/gi, dynamicEmail)
            .replace(/\+91\s*98765\s*43210/g, dynamicPhone)
            .replace(/123\s+Fashion\s+Street,\s+Sector\s+5,\s+New\s+Delhi,\s+Pin:\s*110001,\s*India/gi, formattedAddress);
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 bg-white border border-zinc-200/60 rounded-3xl mt-8 shadow-sm animate-fade-in-up" style={{ borderRadius: 'var(--border-radius)' }}>
                <div className="space-y-1">
                    <h1 className="text-xl font-black text-zinc-900 leading-tight uppercase tracking-wide">{page.title}</h1>
                    <div className="w-8 h-0.5 rounded-full mt-2" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>

                <div 
                    className="prose prose-slate max-w-none text-xs text-zinc-650 font-semibold leading-relaxed whitespace-pre-line mt-6"
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                />
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontPage;
