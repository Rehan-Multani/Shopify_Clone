import React, { useState } from 'react';

const card = 'bg-white rounded-xl border border-[#e3e3e3] shadow-sm';

const Toggle = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'border-transparent' : 'border-transparent'}`}
        style={{ background: enabled ? '#008060' : '#D1D5DB' }}
    >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const SectionHeader = ({ title, desc }) => (
    <div className="px-6 py-4 border-b border-[#e3e3e3]">
        <h2 className="text-sm font-bold text-[#202223]">{title}</h2>
        {desc && <p className="text-xs text-[#9CA3AF] mt-0.5">{desc}</p>}
    </div>
);

const SettingsTab = () => {
    const [activeSection, setActiveSection] = useState('platform');
    const [saved, setSaved] = useState(false);

    const [platformConfig, setPlatformConfig] = useState({
        platformName: 'Storify',
        supportEmail: 'support@storify.com',
        adminEmail: 'admin@storify.com',
        maxStoresPerMerchant: '10',
        trialDays: '14',
        defaultCurrency: 'USD',
        defaultTimezone: 'UTC',
        maintenanceMode: false,
    });

    const [featureFlags, setFeatureFlags] = useState({
        aiDescriptions: true,
        multiCurrency: true,
        b2bFeatures: false,
        pointsRewards: false,
        dropshipping: true,
        customCheckout: false,
        advancedReports: true,
        apiAccess: true,
    });

    const [emailSettings, setEmailSettings] = useState({
        welcomeEmail: true,
        trialEndingReminder: true,
        paymentFailure: true,
        monthlyDigest: false,
        newFeatureAnnouncements: true,
        securityAlerts: true,
    });

    const [integrations] = useState([
        { name: 'Stripe', category: 'Payments', status: 'connected', icon: '💳' },
        { name: 'PayPal', category: 'Payments', status: 'connected', icon: '🅿️' },
        { name: 'Mailchimp', category: 'Email', status: 'connected', icon: '📧' },
        { name: 'Sendgrid', category: 'Email', status: 'connected', icon: '📨' },
        { name: 'Cloudflare', category: 'CDN', status: 'connected', icon: '🌐' },
        { name: 'AWS S3', category: 'Storage', status: 'connected', icon: '☁️' },
        { name: 'Intercom', category: 'Support', status: 'disconnected', icon: '💬' },
        { name: 'Datadog', category: 'Monitoring', status: 'connected', icon: '📊' },
    ]);

    const sections = [
        { id: 'platform', label: 'Platform Config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
        { id: 'features', label: 'Feature Flags', icon: 'M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z' },
        { id: 'email', label: 'Email Notifications', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { id: 'integrations', label: 'Integrations', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
        { id: 'security', label: 'Security', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    ];

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Platform Settings</h1>
                    <p className="text-sm text-[#5c5f62] mt-0.5">Configure platform-wide settings and integrations.</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Settings saved
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <div className={`${card} p-3 h-fit`}>
                    <nav className="space-y-0.5">
                        {sections.map(s => (
                            <button key={s.id} onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${activeSection === s.id ? 'bg-[#f6f6f7] text-[#202223]' : 'text-[#5c5f62] hover:bg-[#f6f6f7] hover:text-[#202223]'}`}>
                                <svg className={`w-4 h-4 flex-shrink-0 ${activeSection === s.id ? 'text-[#14B8A6]' : 'text-[#9CA3AF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={s.icon} />
                                </svg>
                                {s.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-5">
                    {/* Platform Config */}
                    {activeSection === 'platform' && (
                        <div className={card}>
                            <SectionHeader title="Platform Configuration" desc="Core platform settings and global defaults" />
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { key: 'platformName', label: 'Platform Name' },
                                        { key: 'supportEmail', label: 'Support Email' },
                                        { key: 'adminEmail', label: 'Admin Email' },
                                        { key: 'maxStoresPerMerchant', label: 'Max Stores Per Merchant' },
                                        { key: 'trialDays', label: 'Trial Period (days)' },
                                        { key: 'defaultCurrency', label: 'Default Currency' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs font-semibold text-[#5c5f62] mb-1.5">{f.label}</label>
                                            <input type="text" value={platformConfig[f.key]}
                                                onChange={e => setPlatformConfig(prev => ({ ...prev, [f.key]: e.target.value }))}
                                                className="w-full px-3 py-2 border border-[#d3d3d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between py-3 border-t border-[#f0f0f0]">
                                    <div>
                                        <p className="text-sm font-semibold text-[#202223]">Maintenance Mode</p>
                                        <p className="text-xs text-[#9CA3AF] mt-0.5">Show a maintenance page to all visitors</p>
                                    </div>
                                    <Toggle enabled={platformConfig.maintenanceMode} onChange={v => setPlatformConfig(prev => ({ ...prev, maintenanceMode: v }))} />
                                </div>
                                <div className="pt-2">
                                    <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feature Flags */}
                    {activeSection === 'features' && (
                        <div className={card}>
                            <SectionHeader title="Feature Flags" desc="Enable or disable platform features for all merchants" />
                            <div className="p-6 space-y-0 divide-y divide-[#f5f5f5]">
                                {[
                                    { key: 'aiDescriptions', label: 'AI Product Descriptions', desc: 'AI-powered product description generation' },
                                    { key: 'multiCurrency', label: 'Multi-Currency Support', desc: 'Allow merchants to sell in multiple currencies' },
                                    { key: 'b2bFeatures', label: 'B2B / Wholesale Features', desc: 'Enable B2B pricing and company accounts' },
                                    { key: 'pointsRewards', label: 'Points & Rewards', desc: 'Loyalty points program for customer stores' },
                                    { key: 'dropshipping', label: 'Dropshipping Support', desc: 'Enable dropshipping supplier connections' },
                                    { key: 'customCheckout', label: 'Custom Checkout UI', desc: 'Allow merchants to customize checkout flow' },
                                    { key: 'advancedReports', label: 'Advanced Analytics', desc: 'Detailed reporting and custom dashboards' },
                                    { key: 'apiAccess', label: 'API Access', desc: 'Enable REST API access for merchants' },
                                ].map(f => (
                                    <div key={f.key} className="flex items-center justify-between py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#202223]">{f.label}</p>
                                            <p className="text-xs text-[#9CA3AF] mt-0.5">{f.desc}</p>
                                        </div>
                                        <Toggle enabled={featureFlags[f.key]} onChange={v => setFeatureFlags(prev => ({ ...prev, [f.key]: v }))} />
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 pb-5">
                                <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Email Notifications */}
                    {activeSection === 'email' && (
                        <div className={card}>
                            <SectionHeader title="Email Notifications" desc="Control which automated emails are sent to merchants" />
                            <div className="p-6 divide-y divide-[#f5f5f5] space-y-0">
                                {[
                                    { key: 'welcomeEmail', label: 'Welcome Email', desc: 'Sent when a merchant signs up' },
                                    { key: 'trialEndingReminder', label: 'Trial Ending Reminder', desc: 'Sent 3 days before trial expires' },
                                    { key: 'paymentFailure', label: 'Payment Failure Alerts', desc: 'Sent when subscription payment fails' },
                                    { key: 'monthlyDigest', label: 'Monthly Digest', desc: 'Monthly performance summary email' },
                                    { key: 'newFeatureAnnouncements', label: 'Feature Announcements', desc: 'New features and product updates' },
                                    { key: 'securityAlerts', label: 'Security Alerts', desc: 'Unusual login attempts and security events' },
                                ].map(f => (
                                    <div key={f.key} className="flex items-center justify-between py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#202223]">{f.label}</p>
                                            <p className="text-xs text-[#9CA3AF] mt-0.5">{f.desc}</p>
                                        </div>
                                        <Toggle enabled={emailSettings[f.key]} onChange={v => setEmailSettings(prev => ({ ...prev, [f.key]: v }))} />
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 pb-5">
                                <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#1a1c23' }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Integrations */}
                    {activeSection === 'integrations' && (
                        <div className={card}>
                            <SectionHeader title="Integrations" desc="Manage third-party service connections" />
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {integrations.map(intg => (
                                    <div key={intg.name} className="flex items-center gap-3 p-4 rounded-xl border border-[#e3e3e3] hover:shadow-sm transition-all">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-[#f6f6f7] border border-[#e3e3e3] flex-shrink-0">
                                            {intg.icon}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-bold text-[#202223]">{intg.name}</p>
                                            <p className="text-xs text-[#9CA3AF]">{intg.category}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {intg.status === 'connected' ? (
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    Connected
                                                </div>
                                            ) : (
                                                <button className="text-[11px] font-bold px-2.5 py-1 rounded-lg text-white hover:opacity-90 transition-all" style={{ background: '#14B8A6' }}>
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security */}
                    {activeSection === 'security' && (
                        <div className={card}>
                            <SectionHeader title="Security Settings" desc="Platform-wide security and access controls" />
                            <div className="p-6 space-y-5">
                                {[
                                    { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin logins', enabled: true },
                                    { label: 'IP Whitelist for Admin', desc: 'Restrict admin access to specific IP addresses', enabled: false },
                                    { label: 'Login Attempt Locking', desc: 'Lock accounts after 5 failed attempts', enabled: true },
                                    { label: 'Session Timeout (30 min)', desc: 'Auto-logout inactive admin sessions', enabled: true },
                                    { label: 'Audit Logging', desc: 'Log all admin actions for compliance', enabled: true },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-[#f0f0f0] last:border-0">
                                        <div>
                                            <p className="text-sm font-semibold text-[#202223]">{s.label}</p>
                                            <p className="text-xs text-[#9CA3AF] mt-0.5">{s.desc}</p>
                                        </div>
                                        <Toggle enabled={s.enabled} onChange={() => {}} />
                                    </div>
                                ))}
                                <div className="pt-2 flex items-center gap-3">
                                    <button className="px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-all" style={{ background: '#DC2626' }}>
                                        Revoke All Sessions
                                    </button>
                                    <button className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#e3e3e3] text-[#5c5f62] hover:bg-gray-50 transition-all">
                                        View Audit Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
