import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import OrdersTab from '../components/dashboard/OrdersTab';
import DraftsTab from '../components/dashboard/DraftsTab';
import AbandonedTab from '../components/dashboard/AbandonedTab';
import CreateOrder from '../components/dashboard/CreateOrder';
import ProductsTab from '../components/dashboard/ProductsTab';
import CollectionsTab from '../components/dashboard/CollectionsTab';
import InventoryTab from '../components/dashboard/InventoryTab';
import PurchaseOrdersTab from '../components/dashboard/PurchaseOrdersTab';
import TransfersTab from '../components/dashboard/TransfersTab';
import GiftCardsTab from '../components/dashboard/GiftCardsTab';
import SegmentsTab from '../components/dashboard/SegmentsTab';
import CompaniesTab from '../components/dashboard/CompaniesTab';
import CustomersTab from '../components/dashboard/CustomersTab';
import AddProduct from '../components/dashboard/AddProduct';

const Dashboard = () => {
    const { tab } = useParams();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const storeName = localStorage.getItem('shopStoreName') || 'My Store';

    const renderContent = () => {
        if (tab === 'orders') {
            if (location.pathname.endsWith('/drafts')) return <DraftsTab />;
            if (location.pathname.endsWith('/abandoned')) return <AbandonedTab />;
            if (location.pathname.endsWith('/new')) return <CreateOrder />;
            return <OrdersTab />;
        }

        if (tab === 'products') {
            if (location.pathname.endsWith('/collections')) return <CollectionsTab />;
            if (location.pathname.endsWith('/inventory')) return <InventoryTab />;
            if (location.pathname.endsWith('/purchase-orders')) return <PurchaseOrdersTab />;
            if (location.pathname.endsWith('/transfers')) return <TransfersTab />;
            if (location.pathname.endsWith('/gift-cards')) return <GiftCardsTab />;
            if (location.pathname.endsWith('/new')) return <AddProduct />;
            return <ProductsTab />;
        }

        if (tab === 'customers') {
            if (location.pathname.endsWith('/segments')) return <SegmentsTab />;
            if (location.pathname.endsWith('/companies')) return <CompaniesTab />;
            return <CustomersTab />;
        }

        // Default: Home View
        return (
            <>
                {/* Trial Banner */}
                <div className="bg-[#111827] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white shadow-2xl border border-white/5 relative overflow-hidden group gap-4 teal-glow">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-storify/10 p-2 rounded-lg flex-shrink-0">
                            <svg className="w-5 h-5 text-storify-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm sm:text-base">Get 3 months for ₹20/month</h3>
                            <p className="text-xs sm:text-sm text-gray-400">Available for a limited time on select plans.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-end">
                        <Link to="/dashboard/plan" className="teal-gradient text-white px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all flex-grow sm:flex-grow-0 block text-center shadow-lg">
                            Select a plan
                        </Link>
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-all flex-shrink-0 text-gray-400 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {/* Decorative flare */}
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-storify/10 to-transparent pointer-events-none"></div>
                </div>

                {/* Greeting & AI Input */}
                <div className="space-y-4">
                    <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight">Good evening, let's get started.</h1>
                    
                    <div className="bg-[#111827] rounded-xl border border-white/5 p-1.5 shadow-2xl focus-within:ring-2 focus-within:ring-storify/50 focus-within:border-storify/50 transition-all">
                        <div className="flex items-center gap-2 px-3 lg:px-4 py-2 border-b border-white/5 mb-2">
                            <div className="w-6 h-6 teal-gradient rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" />
                                </svg>
                            </div>
                            <span className="text-[10px] lg:text-xs font-black text-storify-glow uppercase tracking-[0.2em]">Ask anything...</span>
                        </div>
                        <div className="px-3 lg:px-4 py-2 flex items-center justify-between gap-3">
                            <input 
                                type="text" 
                                placeholder="Boost my sales..." 
                                className="flex-grow bg-transparent text-sm text-white outline-none placeholder:text-gray-600 min-w-0"
                            />
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <button className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                                <button className="bg-white/5 p-1.5 rounded-lg text-gray-400 hover:bg-storify hover:text-white transition-all teal-glow shadow-md">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Setup Guide */}
                <div className="bg-[#111827] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                    <div className="p-4 lg:p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-white text-sm lg:text-base tracking-tight">Setup Guide</h2>
                            <button className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                    </div>
 
                    <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {/* Setup Card 1 */}
                        <div className="bg-[#1F2937] rounded-2xl p-4 lg:p-6 border border-white/5 group cursor-pointer hover:border-storify/30 hover:shadow-xl transition-all flex flex-col h-full">
                            <div className="aspect-[16/9] mb-4 lg:mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#111827] rounded-xl overflow-hidden shadow-inner flex items-center justify-center gap-2 scale-90 sm:scale-100 border border-white/5">
                                    {/* Icons placeholder */}
                                    <div className="w-16 sm:w-24 h-24 sm:h-32 bg-[#1F2937] rounded-lg shadow-2xl rotate-[-15deg] translate-x-4 border border-white/5 flex items-center justify-center">
                                        <div className="w-6 sm:w-8 h-8 sm:h-10 bg-[#0B0F14] rounded"></div>
                                    </div>
                                    <div className="w-16 sm:w-24 h-24 sm:h-32 bg-[#1F2937] rounded-lg shadow-2xl z-10 border border-white/10 flex flex-col p-2 sm:p-4 space-y-1.5 sm:space-y-2">
                                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#0B0F14] rounded-lg self-center flex items-center justify-center border border-white/5">
                                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-storify" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                        </div>
                                        <div className="h-1.5 sm:h-2 w-full bg-[#111827] rounded"></div>
                                        <div className="h-1.5 sm:h-2 w-2/3 bg-[#111827] rounded opacity-50"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-base lg:text-lg mb-2 text-white group-hover:text-storify-glow transition-colors">Add your first product</h3>
                            <p className="text-xs lg:text-sm text-gray-400 mb-4 lg:mb-6 flex-grow leading-relaxed">Describe your product, add photos, and set the price.</p>
                            <div className="flex items-center gap-2 lg:gap-3">
                                <Link to="/dashboard/products/new" className="teal-gradient text-white px-6 py-2 rounded-lg font-bold text-xs lg:text-sm hover:opacity-90 transition-all shadow-md active:scale-95 teal-glow">
                                    Add product
                                </Link>
                                <button className="px-3 lg:px-4 py-2 text-gray-300 font-bold text-xs lg:text-sm hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                    Import
                                </button>
                            </div>
                        </div>
 
                        {/* Setup Card 2 */}
                        <div className="bg-[#1F2937] rounded-2xl p-6 border border-white/5 group cursor-pointer hover:border-storify/30 hover:shadow-xl transition-all flex flex-col h-full">
                            <div className="aspect-[16/9] mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#111827] rounded-xl overflow-hidden shadow-inner flex items-center justify-center gap-2 border border-white/5">
                                    {/* Dashboard icons placeholder */}
                                    <div className="w-32 h-40 bg-[#1F2937] rounded-lg shadow-2xl z-10 border border-white/5 flex flex-col p-4 relative">
                                        <div className="w-full h-1/2 bg-[#0B0F14] rounded-lg mb-4 opacity-50"></div>
                                        <div className="flex gap-2 mb-2">
                                            <div className="w-6 h-6 bg-storify/20 rounded border border-storify/20"></div>
                                            <div className="w-6 h-6 bg-storify/20 rounded border border-storify/20"></div>
                                            <div className="w-6 h-6 bg-storify/20 rounded border border-storify/20"></div>
                                        </div>
                                        <div className="absolute bottom-4 right-4 bg-storify/10 px-2 py-1 rounded text-[8px] font-black text-storify tracking-widest uppercase shadow-sm">Theme</div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-white group-hover:text-storify-glow transition-colors">Customize your store</h3>
                            <p className="text-sm text-gray-400 mb-6 flex-grow leading-relaxed">Choose a clean theme and add your brand personality.</p>
                            <button className="w-fit bg-white/5 text-white border border-white/10 px-6 py-2 rounded-lg font-extrabold text-sm hover:bg-white/10 transition-all shadow-lg active:scale-95">
                                Customize theme
                            </button>
                        </div>
                    </div>
                </div>v>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B0F14] flex overflow-x-hidden relative">
            <DashboardSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                <DashboardHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                
                <main className="mt-14 p-4 lg:p-8 max-w-5xl mx-auto w-full space-y-6 relative z-10 bg-[#0B0F14]">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
