import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';

const GATEWAY_URL = 'http://localhost:5000/api';

const StorefrontPage = ({ cartCount, customer, onLogout, storeInfo }) => {
    const { storeId, slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="flex items-center justify-center min-h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            </StorefrontLayout>
        );
    }

    if (!page) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-xl mx-auto py-20 text-center space-y-4">
                    <span className="text-4xl">⚠️</span>
                    <h2 className="text-xl font-black text-gray-800">Page Not Found</h2>
                    <p className="text-sm text-gray-500">The page you are trying to view does not exist.</p>
                    <Link to={`/store/${storeId}`} className="inline-block px-6 py-2.5 bg-gray-900 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-black transition-all">
                        Back to Home
                    </Link>
                </div>
            </StorefrontLayout>
        );
    }

    return (
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 bg-white border border-gray-100 rounded-3xl mt-8 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{page.title}</h1>
                    <div className="w-12 h-1 bg-[var(--color-primary)] rounded-full mt-2"></div>
                </div>

                <div 
                    className="prose prose-emerald max-w-none text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: page.content || 'Content coming soon...' }}
                />
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontPage;
