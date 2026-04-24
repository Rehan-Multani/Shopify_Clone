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
import AddCustomer from '../components/dashboard/AddCustomer';
import AddCompany from '../components/dashboard/AddCompany';
import SidekickChat from '../components/dashboard/SidekickChat';
import CSVImportModal from '../components/dashboard/CSVImportModal';
import ThemesTab from '../components/dashboard/ThemesTab';
import AddCollection from '../components/dashboard/AddCollection';
import CreatePurchaseOrder from '../components/dashboard/CreatePurchaseOrder';
import CreateTransfer from '../components/dashboard/CreateTransfer';
import CreateGiftCard from '../components/dashboard/CreateGiftCard';
import CreateGiftCardProduct from '../components/dashboard/CreateGiftCardProduct';
import CreateSegment from '../components/dashboard/CreateSegment';
import CampaignsTab from '../components/dashboard/CampaignsTab';
import AttributionTab from '../components/dashboard/AttributionTab';
import AutomationsTab from '../components/dashboard/AutomationsTab';
import MarketingOverview from '../components/dashboard/MarketingOverview';
import CreateCampaign from '../components/dashboard/CreateCampaign';
import DiscountsTab from '../components/dashboard/DiscountsTab';
import CreateDiscount from '../components/dashboard/CreateDiscount';
import MetaobjectsTab from '../components/dashboard/MetaobjectsTab';
import FilesTab from '../components/dashboard/FilesTab';
import MenusTab from '../components/dashboard/MenusTab';
import BlogPostsTab from '../components/dashboard/BlogPostsTab';
import CreateMetaobjectDefinition from '../components/dashboard/CreateMetaobjectDefinition';

const Dashboard = () => {
    const { tab } = useParams();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [initialChatMessage, setInitialChatMessage] = React.useState('');
    const [homeInput, setHomeInput] = React.useState('');
    const [storeName, setStoreName] = React.useState(localStorage.getItem('shopStoreName') || 'My Store');
    const [isEditingStoreName, setIsEditingStoreName] = React.useState(false);
    const [isCSVModalOpen, setIsCSVModalOpen] = React.useState(false);
    const [editValue, setEditValue] = React.useState('');

    const handleSaveStoreName = () => {
        if (editValue.trim()) {
            localStorage.setItem('shopStoreName', editValue.trim());
            setStoreName(editValue.trim());
        }
        setIsEditingStoreName(false);
    };

    const renderContent = () => {
        if (tab === 'orders') {
            if (location.pathname.endsWith('/drafts')) return <DraftsTab />;
            if (location.pathname.endsWith('/abandoned')) return <AbandonedTab />;
            if (location.pathname.endsWith('/new')) return <CreateOrder />;
            return <OrdersTab />;
        }

        if (tab === 'products') {
            if (location.pathname.endsWith('/collections/new')) return <AddCollection />;
            if (location.pathname.endsWith('/collections')) return <CollectionsTab />;
            if (location.pathname.endsWith('/inventory')) return <InventoryTab />;
            if (location.pathname.endsWith('/purchase-orders/new')) return <CreatePurchaseOrder />;
            if (location.pathname.endsWith('/purchase-orders')) return <PurchaseOrdersTab />;
            if (location.pathname.endsWith('/transfers/new')) return <CreateTransfer />;
            if (location.pathname.endsWith('/transfers')) return <TransfersTab />;
            if (location.pathname.endsWith('/gift-cards/product/new')) return <CreateGiftCardProduct />;
            if (location.pathname.endsWith('/gift-cards/new')) return <CreateGiftCard />;
            if (location.pathname.endsWith('/gift-cards')) return <GiftCardsTab />;
            if (location.pathname.endsWith('/new')) return <AddProduct />;
            return <ProductsTab />;
        }

        if (tab === 'customers') {
            if (location.pathname.endsWith('/customers/new')) return <AddCustomer />;
            if (location.pathname.endsWith('/segments/new')) return <CreateSegment />;
            if (location.pathname.endsWith('/segments')) return <SegmentsTab />;
            if (location.pathname.endsWith('/companies/new')) return <AddCompany />;
            if (location.pathname.endsWith('/companies')) return <CompaniesTab />;
            return <CustomersTab />;
        }

        if (tab === 'marketing') {
            if (location.pathname.endsWith('/marketing/campaigns/new')) return <CreateCampaign />;
            if (location.pathname.endsWith('/marketing/campaigns')) return <CampaignsTab />;
            if (location.pathname.endsWith('/marketing/attribution')) return <AttributionTab />;
            if (location.pathname.endsWith('/marketing/automations')) return <AutomationsTab />;
            return <MarketingOverview />; // Default to Overview
        }

        if (tab === 'discounts') {
            if (location.pathname.includes('/discounts/new')) return <CreateDiscount />;
            return <DiscountsTab />;
        }

        if (tab === 'content') {
            if (location.pathname.endsWith('/content/metaobjects/new')) return <CreateMetaobjectDefinition />;
            if (location.pathname.endsWith('/content/metaobjects')) return <MetaobjectsTab />;
            if (location.pathname.endsWith('/content/files')) return <FilesTab />;
            if (location.pathname.endsWith('/content/menus')) return <MenusTab />;
            if (location.pathname.endsWith('/content/blog-posts')) return <BlogPostsTab />;
            return <MetaobjectsTab />; // Default to first child
        }

        if (tab === 'online-store') {
            if (location.pathname.endsWith('/themes')) return <ThemesTab />;
            return <ThemesTab />;
        }

        // Default: Home View
        return (
            <>
                {/* Trial Banner */}
                <div className="bg-[#1a1c23] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white shadow-lg relative overflow-hidden group gap-4">
                    <div className="flex items-center gap-4 relative z-10">
                        <div>
                            <h3 className="font-bold text-sm sm:text-base">Get 3 months for ₹20/month</h3>
                            <p className="text-xs sm:text-sm text-gray-400">Available for a limited time on select plans.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-end">
                        <Link to="/dashboard/plan" className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all flex-grow sm:flex-grow-0 block text-center shadow-lg">
                            Select a plan
                        </Link>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0 text-white/60 hover:text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Greeting & AI Input */}
                <div className="space-y-4">
                    <h1 className="text-lg lg:text-xl font-bold text-[#202223] tracking-tight">Good afternoon, let's get started.</h1>
                    
                    <div className="bg-white rounded-xl border border-gray-200 p-1.5 shadow-sm transition-all focus-within:ring-1 focus-within:ring-black/20">
                        <div className="px-3 lg:px-4 py-2 border-b border-gray-100 mb-2">
                             <span className="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Ask anything...</span>
                        </div>
                        <div className="px-3 lg:px-4 py-2 flex items-center justify-between gap-3">
                            <input 
                                type="text" 
                                value={homeInput}
                                onChange={(e) => setHomeInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && homeInput.trim()) {
                                        setInitialChatMessage(homeInput);
                                        setIsChatOpen(true);
                                        setHomeInput('');
                                    }
                                }}
                                placeholder="Describe a task..." 
                                className="flex-grow bg-transparent text-sm text-[#202223] outline-none placeholder:text-gray-400 min-w-0"
                            />
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black">
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => {
                                        if (homeInput.trim()) {
                                            setInitialChatMessage(homeInput);
                                            setIsChatOpen(true);
                                            setHomeInput('');
                                        }
                                    }}
                                    className="bg-gray-100 p-1.5 rounded-lg text-gray-400 hover:text-black transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Setup Guide */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isEditingStoreName ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        value={editValue} 
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveStoreName();
                                            if (e.key === 'Escape') setIsEditingStoreName(false);
                                        }}
                                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 w-48 sm:w-64"
                                        autoFocus
                                        placeholder="Enter store name"
                                    />
                                    <button 
                                        onClick={handleSaveStoreName}
                                        className="bg-black text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-black/80 transition-all shadow-sm"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingStoreName(false)}
                                        className="text-[#5c5f62] text-xs font-bold hover:text-black transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-bold text-[#202223] text-sm lg:text-base tracking-tight">
                                        {storeName !== 'My Store' ? storeName : 'Add store name'}
                                    </h2>
                                    <button 
                                        onClick={() => {
                                            setEditValue(storeName === 'My Store' ? '' : storeName);
                                            setIsEditingStoreName(true);
                                        }}
                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
 
                    <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                        {/* Setup Card 1 */}
                        <div className="bg-[#fbfcff] rounded-2xl p-4 lg:p-6 border border-gray-100 group cursor-pointer hover:shadow-md transition-all flex flex-col h-full">
                            <div className="aspect-[16/9] mb-4 lg:mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#f6f6f7] rounded-xl overflow-hidden shadow-inner flex items-center justify-center gap-2 scale-90 sm:scale-100 border border-gray-100">
                                    {/* Illustrations placeholder */}
                                    <div className="w-16 sm:w-24 h-24 sm:h-32 bg-white rounded-lg shadow-xl rotate-[-15deg] translate-x-4 border border-gray-100 flex items-center justify-center">
                                    </div>
                                    <div className="w-16 sm:w-24 h-24 sm:h-32 bg-white rounded-lg shadow-xl z-10 border border-gray-200 flex flex-col p-2 sm:p-4 space-y-1.5 sm:space-y-2">
                                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-50 rounded-lg self-center flex items-center justify-center border border-gray-100">
                                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-base lg:text-lg mb-2 text-[#202223] transition-colors">Import your products from Amazon</h3>
                            <p className="text-xs lg:text-sm text-[#5c5f62] mb-4 lg:mb-6 flex-grow leading-relaxed">Not ready to import? <span className="text-blue-600 underline">Add a product manually</span> to get started</p>
                            <div className="flex items-center gap-2 lg:gap-3">
                                <Link 
                                    to="/dashboard/products/new"
                                    className="bg-white text-black border border-gray-200 px-6 py-2 rounded-lg font-bold text-xs lg:text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                                >
                                    Add product
                                </Link>
                                <button 
                                    onClick={() => setIsCSVModalOpen(true)}
                                    className="bg-[#1a1c23] text-white px-6 py-2 rounded-lg font-bold text-xs lg:text-sm hover:bg-black transition-all shadow-md active:scale-95"
                                >
                                    Import products
                                </button>
                            </div>
                        </div>
 
                        {/* Setup Card 2 */}
                        <div className="bg-[#fbfcff] rounded-2xl p-6 border border-gray-100 group cursor-pointer hover:shadow-md transition-all flex flex-col h-full">
                            <div className="aspect-[16/9] mb-6 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#f6f6f7] rounded-xl overflow-hidden shadow-inner flex items-center justify-center gap-2 border border-gray-100">
                                     <div className="w-32 h-40 bg-white rounded-lg shadow-xl z-10 border border-gray-100 flex flex-col p-4 relative">
                                        <div className="w-full h-1/2 bg-gray-50 rounded-lg mb-4"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-[#202223] transition-colors">Customize your online store</h3>
                            <p className="text-sm text-[#5c5f62] mb-6 flex-grow leading-relaxed">Choose or generate a custom theme, then add your logo, colors, and images.</p>
                            <Link 
                                to="/dashboard/online-store/themes"
                                className="w-fit bg-white text-[#202223] border border-gray-200 px-6 py-2 rounded-lg font-extrabold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95 text-center"
                            >
                                Customize theme
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const isFullFocusPage = location.pathname.endsWith('/content/metaobjects/new');

    return (
        <div className="min-h-screen bg-[#f6f6f7] flex overflow-x-hidden relative text-[#202223]">
            {!isFullFocusPage && (
                <DashboardSidebar 
                    isOpen={isSidebarOpen} 
                    setIsOpen={setIsSidebarOpen} 
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                />
            )}
            
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative ${isSidebarOpen && !isFullFocusPage ? 'lg:ml-64' : 'ml-0'}`}>
                <DashboardHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} storeName={storeName} />
                
                {isChatOpen ? (
                   <div className="mt-14 h-[calc(100vh-3.5rem)] flex flex-col">
                        <SidekickChat 
                            isOpen={isChatOpen} 
                            onClose={() => setIsChatOpen(false)} 
                            initialMessage={initialChatMessage}
                        />
                   </div>
                ) : (
                    <main className={`mt-14 p-4 lg:p-8 w-full space-y-6 relative z-10 bg-[#f6f6f7] ${location.pathname.includes('/new') ? 'max-w-[1248px] mx-auto' : 'max-w-5xl mx-auto'}`}>
                        {renderContent()}
                    </main>
                )}
            </div>

            <CSVImportModal 
                isOpen={isCSVModalOpen} 
                onClose={() => setIsCSVModalOpen(false)} 
            />
        </div>
    );
};

export default Dashboard;
