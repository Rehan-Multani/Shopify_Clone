import React, { useState } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import MasterAdminSidebar from '../components/MasterAdminSidebar';
import MasterAdminHeader from '../components/MasterAdminHeader';
import OverviewTab from '../components/tabs/OverviewTab';
import StoresTab from '../components/tabs/StoresTab';
import MerchantsTab from '../components/tabs/MerchantsTab';
import PlansTab from '../components/tabs/PlansTab';
import BillingTab from '../components/tabs/BillingTab';
import AppsTab from '../components/tabs/AppsTab';
import ThemesTab from '../components/tabs/ThemesTab';
import AnalyticsTab from '../components/tabs/AnalyticsTab';
import SupportTab from '../components/tabs/SupportTab';
import AnnouncementsTab from '../components/tabs/AnnouncementsTab';
import SettingsTab from '../components/tabs/SettingsTab';

const MasterAdminPage = () => {
    const { tab } = useParams();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebarCollapsed', String(next));
            return next;
        });
    };

    if (location.pathname === '/master-admin') {
        return <Navigate to="/master-admin/overview" replace />;
    }

    const renderTab = () => {
        switch (tab) {
            case 'overview':      return <OverviewTab />;
            case 'stores':        return <StoresTab />;
            case 'merchants':     return <MerchantsTab />;
            case 'plans':         return <PlansTab />;
            case 'billing':       return <BillingTab />;
            case 'apps':          return <AppsTab />;
            case 'themes':        return <ThemesTab />;
            case 'analytics':     return <AnalyticsTab />;
            case 'support':       return <SupportTab />;
            case 'announcements': return <AnnouncementsTab />;
            case 'settings':      return <SettingsTab />;
            default:              return <Navigate to="/master-admin/overview" replace />;
        }
    };

    return (
        /* Fixed viewport layout: sidebar + scrollable content side-by-side */
        <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: '#f6f6f7', color: '#202223' }}>
            <MasterAdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />

            {/* Right panel — header sticky, main scrollable */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 }}>
                <MasterAdminHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
                <main style={{ flex: 1, padding: '2rem', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
                    <div className="space-y-6">
                        {renderTab()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MasterAdminPage;
