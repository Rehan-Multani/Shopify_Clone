import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import VendorDashboardSidebar from '../components/VendorDashboardSidebar';
import CategoryTab from '../components/dashboard/CategoryTab';
import AddCategorySingle from '../components/dashboard/AddCategory';
import SingleVendorProductsTab from '../components/dashboard/SingleVendorProductsTab';
import AddSingleVendorProduct from '../components/dashboard/AddSingleVendorProduct';
import ViewSingleVendorProduct from '../components/dashboard/ViewSingleVendorProduct';
import OrdersTab from '../components/dashboard/OrdersTab';
import OrderDetail from '../components/dashboard/OrderDetail';
import CouponsTab from '../components/dashboard/CouponsTab';
import CreateCouponSingle from '../components/dashboard/CreateCouponSingle';
import ReportsTab from '../components/dashboard/ReportsTab';
import AddVendorSingle from '../components/dashboard/AddVendorSingle';
import VendorSettingsTab from '../components/dashboard/VendorSettingsTab';
import EmailConfigurationTab from '../components/dashboard/EmailConfigurationTab';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL;

const VendorDashboard = () => {
    const { tab } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('vendorSidebarCollapsed') === 'true';
    });
    
    const [vendorData, setVendorData] = useState(null);
    const [dashboardStats, setDashboardStats] = useState({
        totalProducts: 0,
        approvedProducts: 0,
        pendingProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalCoupons: 0,
        pendingCoupons: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    const token = localStorage.getItem('vendorToken');
    const storeId = localStorage.getItem('activeStoreId');

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('vendorSidebarCollapsed', String(next));
            return next;
        });
    };

    // Load Vendor details and stats
    useEffect(() => {
        if (!token || !storeId) return;

        const fetchVendorProfile = async () => {
            try {
                const decodedInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
                if (decodedInfo._id) {
                    const res = await fetch(`${CATALOG_API_URL}/vendors/${decodedInfo._id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-store-id': storeId
                        }
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setVendorData(data);
                    }
                }
            } catch (err) {
                console.error('Failed to load vendor profile:', err);
            }
        };

        const fetchStats = async () => {
            try {
                setLoadingStats(true);
                const [productsRes, categoriesRes, ordersRes, couponsRes] = await Promise.all([
                    fetch(`${CATALOG_API_URL}/products`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } }),
                    fetch(`${CATALOG_API_URL}/categories`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } }),
                    fetch(`${import.meta.env.VITE_STORE_API_URL}/orders`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } }),
                    fetch(`${CATALOG_API_URL}/coupons`, { headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId } })
                ]);
                
                const products = productsRes.ok ? await productsRes.json() : [];
                const categories = categoriesRes.ok ? await categoriesRes.json() : [];
                const orders = ordersRes.ok ? await ordersRes.json() : [];
                const coupons = couponsRes.ok ? await couponsRes.json() : [];

                const approved = products.filter(p => p.isApproved !== false).length;
                const pending = products.filter(p => p.isApproved === false).length;
                const pendingCoupons = coupons.filter(c => c.isApproved === false).length;

                setDashboardStats({
                    totalProducts: products.length,
                    approvedProducts: approved,
                    pendingProducts: pending,
                    totalCategories: categories.length,
                    totalOrders: orders.length,
                    totalCoupons: coupons.length,
                    pendingCoupons: pendingCoupons
                });
            } catch (err) {
                console.error('Failed to load stats:', err);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchVendorProfile();
        fetchStats();
    }, [token, storeId]);

    const renderContent = () => {
        if (tab === 'category') {
            if (location.pathname.endsWith('/new')) return <AddCategorySingle />;
            if (location.pathname.includes('/edit/')) return <AddCategorySingle />;
            return <CategoryTab />;
        }

        if (tab === 'products') {
            if (location.pathname.endsWith('/new')) return <AddSingleVendorProduct />;
            if (location.pathname.includes('/edit/')) return <AddSingleVendorProduct />;
            if (location.pathname.includes('/view/')) return <ViewSingleVendorProduct />;
            return <SingleVendorProductsTab />;
        }

        if (tab === 'orders') {
            const pathParts = location.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.match(/^[a-f0-9]{24}$/)) {
                return <OrderDetail orderId={lastPart} />;
            }
            return <OrdersTab />;
        }

        if (tab === 'coupons') {
            if (location.pathname.endsWith('/new')) return <CreateCouponSingle />;
            if (location.pathname.includes('/edit/')) return <CreateCouponSingle />;
            return <CouponsTab />;
        }

        if (tab === 'reports') {
            return <ReportsTab />;
        }

        if (tab === 'settings') {
            return <VendorSettingsTab vendorId={vendorData?._id} />;
        }

        if (tab === 'email-configuration') {
            return <EmailConfigurationTab mode="vendor" />;
        }

        if (tab === 'profile') {
            return <AddVendorSingle isEdit={true} vendorId={vendorData?._id} />;
        }

        // Default: Vendor Dashboard Overview
        return (
            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="bg-teal-500/10 text-teal-600 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Vendor Portal
                        </span>
                        <h1 className="text-2xl lg:text-3xl font-bold text-[#202223] mt-3 tracking-tight">
                            Welcome back, {vendorData?.name || 'Vendor'}!
                        </h1>
                        <p className="text-sm text-[#5c5f62] mt-1.5 leading-relaxed max-w-xl">
                            Manage your shop <span className="font-bold text-[#202223]">{vendorData?.businessName || 'Branded Store'}</span>. Create products and categories for approval, keep track of payouts, and process customer orders.
                        </p>
                    </div>
                    {vendorData?.logo && (
                        <div className="w-16 h-16 rounded-2xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                            <img src={`${CATALOG_API_URL.replace('/api', '')}${vendorData.logo}`} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                {loadingStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved Products</p>
                            <h2 className="text-3xl font-black text-[#202223] mt-2">{dashboardStats.approvedProducts}</h2>
                            <p className="text-[11px] text-emerald-600 font-bold mt-1.5">Live on Storefront</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Products</p>
                            <h2 className="text-3xl font-black text-amber-600 mt-2">{dashboardStats.pendingProducts}</h2>
                            <p className="text-[11px] text-amber-500 font-medium mt-1.5">Awaiting store admin review</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Coupons</p>
                            <h2 className="text-3xl font-black text-amber-600 mt-2">{dashboardStats.pendingCoupons}</h2>
                            <p className="text-[11px] text-amber-500 font-medium mt-1.5">Awaiting approval</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Coupons</p>
                            <h2 className="text-3xl font-black text-[#202223] mt-2">{dashboardStats.totalCoupons}</h2>
                            <p className="text-[11px] text-teal-600 font-medium mt-1.5">Coupons created</p>
                        </div>
                    </div>
                )}

                {/* Quick actions & Profile snapshot */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-[#202223]">Quick Catalog Shortcuts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => navigate('/vendor/dashboard/products/new')}
                                className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50/20 text-left transition-all active:scale-[0.98]"
                            >
                                <p className="font-bold text-sm text-[#202223]">Create Product</p>
                                <p className="text-xs text-gray-500 mt-1">Submit a new product listing</p>
                            </button>
                            <button 
                                onClick={() => navigate('/vendor/dashboard/category/new')}
                                className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50/20 text-left transition-all active:scale-[0.98]"
                            >
                                <p className="font-bold text-sm text-[#202223]">Create Category</p>
                                <p className="text-xs text-gray-500 mt-1">Request a new category catalog group</p>
                            </button>
                            <button 
                                onClick={() => navigate('/vendor/dashboard/coupons/new')}
                                className="p-4 border border-dashed border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50/20 text-left transition-all active:scale-[0.98]"
                            >
                                <p className="font-bold text-sm text-[#202223]">Create Coupon</p>
                                <p className="text-xs text-gray-500 mt-1">Submit new discount coupon for store approval</p>
                            </button>
                        </div>
                    </div>

                    {/* Branding Preview card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            <h3 className="text-base font-bold text-[#202223]">Store Branding</h3>
                            <div className="flex items-center gap-4">
                                {vendorData?.profileImage ? (
                                    <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden bg-gray-50">
                                        <img src={`${CATALOG_API_URL.replace('/api', '')}${vendorData.profileImage}`} alt="Owner" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase">
                                        {vendorData?.name ? vendorData.name[0] : 'O'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-[#202223]">{vendorData?.name || 'Owner Name'}</p>
                                    <p className="text-xs text-gray-400">Vendor Owner</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/vendor/dashboard/profile')}
                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-[#202223] rounded-lg font-bold text-xs transition-all text-center"
                        >
                            Edit Shop Branding
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }} className="bg-[#f6f6f7] text-[#202223] relative">
            <VendorDashboardSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isCollapsed={isCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="h-14 bg-[#1a1c23] border-b border-white/5 px-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Desktop Sidebar Collapse Toggle */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex p-1.5 -ml-2.5 mr-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-lg transition-all"
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <svg className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M20 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 mr-2 text-gray-400 hover:bg-white/5 rounded-lg transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                        
                        {/* Breadcrumbs */}
                        <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Vendor</span>
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                {vendorData?.businessName || 'Store'}
                            </span>
                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-sm font-bold text-white capitalize">{tab || 'Dashboard'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-1 rounded-full font-bold">
                            Active Store: #{storeId?.slice(-6).toUpperCase()}
                        </span>
                    </div>
                </header>
                
                <main className={`p-4 lg:p-8 w-full space-y-6 relative z-10 bg-[#f6f6f7] ${location.pathname.includes('/new') || location.pathname.includes('/edit/') || location.pathname.includes('/view/') ? 'max-w-[1248px] mx-auto' : 'max-w-7xl mx-auto'}`}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default VendorDashboard;
