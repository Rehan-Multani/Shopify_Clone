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
import ViewCustomer from '../components/dashboard/ViewCustomer';
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
import PagesTab from '../components/dashboard/PagesTab';
import EditPageTab from '../components/dashboard/EditPageTab';
import CreateMetaobjectDefinition from '../components/dashboard/CreateMetaobjectDefinition';
import ReportsTab from '../components/dashboard/ReportsTab';
import MerchantProfileTab from '../components/dashboard/MerchantProfileTab';
import StoreProfileTab from '../components/dashboard/StoreProfileTab';
import CategoryTab from '../components/dashboard/CategoryTab';
import AddCategorySingle from '../components/dashboard/AddCategory';
import SingleVendorProductsTab from '../components/dashboard/SingleVendorProductsTab';
import AddSingleVendorProduct from '../components/dashboard/AddSingleVendorProduct';
import ViewSingleVendorProduct from '../components/dashboard/ViewSingleVendorProduct';
import CouponsTab from '../components/dashboard/CouponsTab';
import CreateCouponSingle from '../components/dashboard/CreateCouponSingle';
import StoresTabSingle from '../components/dashboard/StoresTabSingle';
import AddStoreSingle from '../components/dashboard/AddStoreSingle';
import MerchantDashboard from '../components/dashboard/MerchantDashboard';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import SupportTab from '../components/dashboard/SupportTab';
import BannersTab from '../components/dashboard/BannersTab';
import AddBanner from '../components/dashboard/AddBanner';
import ThemeCustomizer from '../components/dashboard/ThemeCustomizer';
import DomainsTab from '../components/dashboard/DomainsTab';

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
    const panelMode = localStorage.getItem('adminPanelType') || 'single';

    const handleSaveStoreName = () => {
        if (editValue.trim()) {
            localStorage.setItem('shopStoreName', editValue.trim());
            setStoreName(editValue.trim());
        }
        setIsEditingStoreName(false);
    };

    const renderContent = () => {
        if (tab === 'category') {
            if (panelMode === 'single') {
                if (location.pathname.endsWith('/new')) return <AddCategorySingle />;
                if (location.pathname.includes('/edit/')) return <AddCategorySingle />;
                return <CategoryTab />;
            }
            if (location.pathname.endsWith('/new')) return <AddCollection />;
            return <CollectionsTab />;
        }

        if (tab === 'coupons') {
            if (panelMode === 'single') {
                if (location.pathname.endsWith('/new')) return <CreateCouponSingle />;
                if (location.pathname.includes('/edit/')) return <CreateCouponSingle />;
                return <CouponsTab />;
            }
            if (location.pathname.endsWith('/new')) return <CreateDiscount />;
            return <DiscountsTab />;
        }

        if (tab === 'stores') {
            if (panelMode === 'single') {
                if (location.pathname.endsWith('/new')) return <AddStoreSingle />;
                if (location.pathname.includes('/edit/')) return <AddStoreSingle />;
                return <StoresTabSingle />;
            }
        }

        if (tab === 'analytics') {
            return <AnalyticsTab />;
        }

        if (tab === 'reports') {
            return <ReportsTab />;
        }

        if (tab === 'pages') {
            if (location.pathname.endsWith('/new')) return <EditPageTab />;
            if (location.pathname.includes('/edit/')) return <EditPageTab />;
            return <PagesTab />;
        }

        if (tab === 'websites') {
            return <ThemesTab />;
        }

        if (tab === 'theme-customizer') {
            return <ThemeCustomizer />;
        }

        if (tab === 'merchant-profile') {
            return <MerchantProfileTab />;
        }

        if (tab === 'store-profile') {
            return <StoreProfileTab />;
        }

        if (tab === 'inventory') {
            return <InventoryTab />;
        }

        if (tab === 'orders') {
            if (location.pathname.endsWith('/drafts')) return <DraftsTab />;
            if (location.pathname.endsWith('/abandoned')) return <AbandonedTab />;
            if (location.pathname.endsWith('/new')) return <CreateOrder />;
            return <OrdersTab />;
        }

        if (tab === 'products') {
            if (panelMode === 'single') {
                if (location.pathname.endsWith('/new')) return <AddSingleVendorProduct />;
                if (location.pathname.includes('/edit/')) return <AddSingleVendorProduct />;
                if (location.pathname.includes('/view/')) return <ViewSingleVendorProduct />;
                if (location.pathname.endsWith('/inventory')) return <InventoryTab />;
                if (location.pathname.endsWith('/purchase-orders')) return <PurchaseOrdersTab />;
                return <SingleVendorProductsTab />;
            }
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
            if (location.pathname.endsWith('/new')) return <AddCustomer />;
            if (location.pathname.includes('/edit/')) return <AddCustomer />;
            if (location.pathname.includes('/view/')) return <ViewCustomer />;
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
            if (location.pathname.includes('/pages/edit/')) return <EditPageTab />;
            if (location.pathname.endsWith('/pages')) return <PagesTab />;
            return <ThemesTab />;
        }

        if (tab === 'domains') {
            return <DomainsTab />;
        }

        if (tab === 'support') {
            return <SupportTab />;
        }

        if (tab === 'banners') {
            if (location.pathname.endsWith('/new')) return <AddBanner />;
            if (location.pathname.includes('/edit/')) return <AddBanner />;
            return <BannersTab />;
        }

        // Default: Home View
        return <MerchantDashboard />;
    };

    const isFullFocusPage = location.pathname.endsWith('/content/metaobjects/new');

    return (
        <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }} className="bg-[#f6f6f7] text-[#202223] relative">
            {!isFullFocusPage && (
                <DashboardSidebar
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isChatOpen={isChatOpen}
                    setIsChatOpen={setIsChatOpen}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative overflow-y-auto custom-scrollbar">
                <DashboardHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} storeName={storeName} />
                
                {isChatOpen ? (
                   <div className="h-[calc(100vh-3.5rem)] flex flex-col">
                        <SidekickChat 
                            isOpen={isChatOpen} 
                            onClose={() => setIsChatOpen(false)} 
                            initialMessage={initialChatMessage}
                        />
                   </div>
                ) : (
                    <main className={`p-4 lg:p-8 w-full space-y-6 relative z-10 bg-[#f6f6f7] ${location.pathname.includes('/new') ? 'max-w-[1248px] mx-auto' : 'max-w-5xl mx-auto'}`}>
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
