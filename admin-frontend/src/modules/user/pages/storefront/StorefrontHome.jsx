import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StorefrontLayout from '../../components/storefront/StorefrontLayout';
import SectionRenderer from '../../components/storefront/SectionRenderer';
import BannerSection from '../../components/storefront/sections/BannerSection';
import { getStorePath } from '../../components/storefront/storeUrlHelper';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL.replace('/api', '');

const StorefrontHome = ({ cartCount, onAddToCart, customer, onLogout, storeInfo }) => {
    const { storeId: paramStoreId } = useParams();
    const storeId = storeInfo?._id || paramStoreId;
    const navigate = useNavigate();
    const [pageSections, setPageSections] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribing, setSubscribing] = useState(false);
    const [newsletterMsg, setNewsletterMsg] = useState({ text: '', type: '' });

    const handleSubscribeNewsletter = async (e) => {
        e.preventDefault();
        if (!newsletterEmail || !newsletterEmail.trim()) return;

        setSubscribing(true);
        setNewsletterMsg({ text: '', type: '' });

        try {
            const res = await fetch(`${GATEWAY_URL}/customers/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-store-id': storeId
                },
                body: JSON.stringify({ email: newsletterEmail })
            });

            const data = await res.json();
            if (res.ok) {
                setNewsletterMsg({ text: data.message || 'Successfully subscribed!', type: 'success' });
                setNewsletterEmail('');
            } else {
                setNewsletterMsg({ text: data.message || 'Failed to subscribe.', type: 'error' });
            }
        } catch (err) {
            console.error('Error subscribing to newsletter:', err);
            setNewsletterMsg({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setSubscribing(false);
        }
    };

    useEffect(() => {
        if (!storeId) return;
        const fetchHomeLayout = async () => {
            try {
                // Fetch page sections (passing previewThemeId/themeId if present in browser query string)
                const searchParams = new URLSearchParams(window.location.search);
                const previewThemeId = searchParams.get('previewThemeId') || searchParams.get('themeId') || '';
                const url = previewThemeId
                    ? `${GATEWAY_URL}/store-pages/home?storeId=${storeId}&previewThemeId=${previewThemeId}`
                    : `${GATEWAY_URL}/store-pages/home?storeId=${storeId}`;

                const res = await fetch(url);
                const data = await res.json();
                if (data.success && data.page?.sections) {
                    const sorted = (data.page.sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
                    setPageSections(sorted.filter(s => s.enabled));
                }

                // Fetch banners to check if we have any active ones
                const bannersRes = await fetch(`${GATEWAY_URL}/banners`, {
                    headers: { 'x-store-id': storeId }
                });
                if (bannersRes.ok) {
                    const bannersData = await bannersRes.json();
                    const bannerList = Array.isArray(bannersData) ? bannersData : (bannersData.banners || []);
                    setBanners(bannerList.filter(b => b.isActive));
                }
            } catch (err) {
                console.error('Error fetching home page sections/banners:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeLayout();
    }, [storeId]);

    const handleSearchClick = () => {
        navigate(getStorePath(storeId, '/catalog'));
    };

    if (loading) {
        return (
            <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
                <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-16 animate-fade-in">
                    <div className="w-full aspect-[21/9] animate-shimmer rounded-3xl"></div>
                    <div className="space-y-4">
                        <div className="w-48 h-8 animate-shimmer rounded-xl mx-auto"></div>
                        <div className="w-12 h-1 animate-shimmer rounded-full mx-auto"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="w-full aspect-square animate-shimmer rounded-2xl"></div>
                                    <div className="w-3/4 h-5 animate-shimmer rounded-lg mx-auto"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </StorefrontLayout>
        );
    }

    const hasBanners = banners.length > 0;

    return (    
        <StorefrontLayout cartCount={cartCount} customer={customer} onLogout={onLogout} storeInfo={storeInfo}>
            <div className="space-y-0 animate-fade-in">
                {/* Render banners at the top of the homepage by default if not explicitly added in customized layout */}
                {hasBanners && !pageSections.some(s => s.type === 'banners') && (
                    <BannerSection storeId={storeId} />
                )}
                {pageSections.map((section, idx) => (
                    <div key={section.sectionId || section._id || idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        <SectionRenderer section={section} />
                    </div>
                ))}
            </div>
        </StorefrontLayout>
    );
};

export default StorefrontHome;
