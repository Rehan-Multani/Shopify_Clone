import React, { Suspense, lazy } from 'react';

const BannerSection = lazy(() => import('../../storefront/sections/BannerSection'));

export default function BuilderCanvas({
    sections,
    selectedId,
    onSelectSection,
    viewport, // 'desktop' | 'tablet' | 'mobile'
    themeSettings = {},
    renderSectionContent // function that renders a section based on type and settings
}) {
    const { primaryColor = '#2563eb', secondaryColor = '#ffffff', fontFamily = 'Inter', borderRadius = '8px' } = themeSettings;

    // Viewport Width classes
    const viewportWidths = {
        desktop: 'w-full max-w-full',
        tablet: 'w-[768px] border-x border-zinc-300 shadow-xl rounded-2xl',
        mobile: 'w-[375px] border-x border-zinc-300 shadow-xl rounded-2xl'
    };

    // Header announcement config
    const announceBar = themeSettings.headerConfig?.announcementBar || { enabled: true, text: '✨ Announcement Bar' };

    // Dynamic menu rendering
    const menuItems = themeSettings.headerConfig?.menuItems || [];
    const logoUrl = themeSettings.headerConfig?.logoUrl || themeSettings.logo || '';

    const isDarkColor = (hex) => {
        try {
            const cleanHex = (hex || '').replace('#', '');
            let r, g, b;
            if (cleanHex.length === 3) {
                r = parseInt(cleanHex[0] + cleanHex[0], 16);
                g = parseInt(cleanHex[1] + cleanHex[1], 16);
                b = parseInt(cleanHex[2] + cleanHex[2], 16);
            } else {
                r = parseInt(cleanHex.substring(0, 2), 16);
                g = parseInt(cleanHex.substring(2, 4), 16);
                b = parseInt(cleanHex.substring(4, 6), 16);
            }
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness < 128;
        } catch (e) {
            return false;
        }
    };

    const isSecondaryDark = isDarkColor(secondaryColor);
    const canvasBg = secondaryColor || '#ffffff';
    const canvasText = isSecondaryDark ? '#f4f4f5' : '#09090b';

    return (
        <div className="flex-grow flex items-start justify-center p-6 bg-zinc-100 overflow-y-auto h-full storefront-scrollbar">
            <style>{`
                .builder-canvas-preview-mode a,
                .builder-canvas-preview-mode button,
                .builder-canvas-preview-mode input,
                .builder-canvas-preview-mode select,
                .builder-canvas-preview-mode textarea {
                    pointer-events: none !important;
                }
            `}</style>
            <div 
                className={`transition-all duration-300 flex flex-col min-h-full overflow-hidden builder-canvas-preview-mode ${viewportWidths[viewport]}`}
                style={{
                    fontFamily: fontFamily || 'Inter, sans-serif',
                    backgroundColor: canvasBg,
                    color: canvasText
                }}
            >
                {/* 1. Announcement Bar & Header */}
                {themeSettings.headerConfig?.enabled !== false && (
                    <>
                        {announceBar.enabled && (
                            <div 
                                className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-white z-10"
                                style={{
                                    backgroundColor: announceBar.backgroundColor || primaryColor,
                                    color: announceBar.textColor || '#ffffff',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {announceBar.icon && <span className="mr-1.5">{announceBar.icon}</span>}
                                {announceBar.text}
                            </div>
                        )}

                 {/* 2. Builder Dynamic Header */}
                <header 
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectSection('header');
                    }}
                    className={`w-full border-b flex items-center justify-between px-6 z-10 sticky top-0 backdrop-blur-md transition-all cursor-pointer group/header relative ${
                        selectedId === 'header' ? 'ring-2 ring-[#008060] ring-offset-2' : 'hover:ring-1 hover:ring-zinc-400'
                    }`}
                    style={{ 
                        height: themeSettings.headerConfig?.height || '70px',
                        backgroundColor: themeSettings.headerConfig?.transparent ? 'transparent' : (themeSettings.headerConfig?.backgroundColor || canvasBg),
                        borderBottomColor: isSecondaryDark ? '#27272a' : '#e4e4e7',
                        color: themeSettings.headerConfig?.textColor || canvasText
                    }}
                >
                    {/* Action Label Badge */}
                    <div className={`absolute -bottom-6 left-4 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest z-25 transition-all shadow-sm bg-zinc-800 text-white opacity-0 group-hover/header:opacity-100 ${
                        selectedId === 'header' ? 'opacity-100 bg-[#008060]' : ''
                    }`}>
                        Header Settings
                    </div>
                    <div className="flex items-center gap-6">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt="Logo" 
                                className="object-contain" 
                                style={{
                                    width: themeSettings.headerConfig?.logoWidth || 'auto',
                                    height: themeSettings.headerConfig?.logoHeight || '32px'
                                }}
                            />
                        ) : (
                            <span className="text-lg font-black tracking-tighter" style={{ color: themeSettings.headerConfig?.textColor || canvasText }}>STORE LOGO</span>
                        )}

                        {themeSettings.headerConfig?.customText && (
                            <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg" style={{ color: themeSettings.headerConfig?.textColor || (isSecondaryDark ? '#a1a1aa' : '#52525b') }}>
                                {themeSettings.headerConfig.customIcon && <span className="text-[12px]">{themeSettings.headerConfig.customIcon}</span>}
                                <span>{themeSettings.headerConfig.customText}</span>
                            </div>
                        )}

                        {viewport !== 'mobile' && (
                            <nav className="flex items-center gap-4.5">
                                {menuItems.map((item, idx) => (
                                    <span key={idx} className="text-xs font-bold transition-colors cursor-default" style={{ color: themeSettings.headerConfig?.textColor || (isSecondaryDark ? '#a1a1aa' : '#52525b') }}>
                                        {item.label}
                                    </span>
                                ))}
                            </nav>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {themeSettings.headerConfig?.searchEnabled !== false && (
                            <button className="p-2 rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-center" style={{ color: themeSettings.headerConfig?.textColor || canvasText }}>
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.3-4.3"></path>
                                </svg>
                            </button>
                        )}
                        {themeSettings.headerConfig?.wishlistEnabled !== false && (
                            <button className="p-2 rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-center" style={{ color: themeSettings.headerConfig?.textColor || canvasText }}>
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        )}
                        {themeSettings.headerConfig?.profileEnabled !== false && (
                            <button className="p-2 rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-center" style={{ color: themeSettings.headerConfig?.textColor || canvasText }}>
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </button>
                        )}
                        {themeSettings.headerConfig?.cartEnabled !== false && (
                            <button className="p-2 rounded-full hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors relative flex items-center justify-center" style={{ color: themeSettings.headerConfig?.textColor || canvasText }}>
                                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="absolute -top-1.5 -right-1.5 bg-[#008060] text-white rounded-full text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center shadow-sm">
                                    0
                                </span>
                            </button>
                        )}
                    </div>
                    </header>
                </>
            )}

                {/* 3. Sections Content Canvas */}
                <div className="flex-grow py-4 px-2 space-y-6 min-h-[400px] bg-transparent">
                    {!sections.some(s => s.type === 'banners' || s.type === 'hero' || s.type === 'image-banner' || s.type === 'video-banner') && (
                        <Suspense fallback={<div className="w-full h-40 animate-pulse bg-zinc-100 rounded-2xl" />}>
                            <BannerSection storeId={localStorage.getItem('activeStoreId') || ''} />
                        </Suspense>
                    )}
                    {sections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="text-3xl mb-3">🎨</span>
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Canvas is Empty</h3>
                            <p className="text-[10px] text-zinc-500 font-semibold mt-1 max-w-xs leading-relaxed">
                                Click component templates on the left sidebar to insert them and build your pages visually.
                            </p>
                        </div>
                    ) : (
                        sections.map((sec, idx) => {
                            const secId = sec.sectionId || sec._id || `sec-${idx}`;
                            const isSelected = selectedId === secId;
                            if (!sec.enabled) return null;

                            return (
                                <div
                                    key={secId}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectSection(secId);
                                    }}
                                    className={`relative group cursor-pointer transition-all rounded-3xl ${
                                        isSelected 
                                            ? 'ring-2 ring-[#008060] ring-offset-2 scale-[0.99] shadow-md' 
                                            : 'hover:ring-1 hover:ring-zinc-400 hover:ring-offset-1'
                                    }`}
                                >
                                    {/* Action Label Badge */}
                                    <div className={`absolute -top-3 left-4 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-25 transition-all shadow-sm ${
                                        isSelected 
                                            ? 'bg-[#008060] text-white opacity-100' 
                                            : 'bg-zinc-800 text-white opacity-0 group-hover:opacity-100'
                                    }`}>
                                        {sec.type} {sec.locked ? '🔒' : ''}
                                    </div>

                                    {/* Render actual section body */}
                                    <div className="pointer-events-none overflow-hidden rounded-3xl shadow-sm border border-zinc-200/40">
                                        {renderSectionContent(sec)}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* 4. Builder Dynamic Footer */}
                {themeSettings.footerConfig?.enabled !== false && (
                    <footer 
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectSection('footer');
                        }}
                        className={`w-full border-t p-8 space-y-6 cursor-pointer group/footer relative ${
                            selectedId === 'footer' ? 'ring-2 ring-[#008060] ring-offset-2' : 'hover:ring-1 hover:ring-zinc-400'
                        }`}
                        style={{
                            backgroundColor: canvasBg,
                            color: canvasText,
                            borderColor: isSecondaryDark ? '#27272a' : '#e4e4e7'
                        }}
                    >
                        {/* Action Label Badge */}
                        <div className={`absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest z-25 transition-all shadow-sm bg-zinc-800 text-white opacity-0 group-hover/footer:opacity-100 ${
                            selectedId === 'footer' ? 'opacity-100 bg-[#008060]' : ''
                        }`}>
                            Footer Settings
                        </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(themeSettings.footerConfig?.columns || []).map((col, idx) => (
                            <div key={idx} className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: canvasText }}>{col.title}</h4>
                                {col.type === 'links' && (
                                    <ul className="space-y-1.5 text-[11px] font-semibold">
                                        {(col.links || []).map((link, lIdx) => (
                                            <li key={lIdx} className="transition-colors cursor-default hover:opacity-85" style={{ color: isSecondaryDark ? '#a1a1aa' : '#52525b' }}>
                                                {link.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {col.type === 'newsletter' && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] leading-relaxed font-semibold" style={{ color: isSecondaryDark ? '#a1a1aa' : '#52525b' }}>{col.text}</p>
                                        <div className="flex gap-2">
                                            <input 
                                                type="email" 
                                                disabled 
                                                placeholder="Your email address" 
                                                className="text-xs px-3 py-1.5 rounded-lg w-full border outline-none" 
                                                style={{
                                                    backgroundColor: isSecondaryDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                                    borderColor: isSecondaryDark ? '#27272a' : '#e4e4e7',
                                                    color: canvasText
                                                }}
                                            />
                                            <button disabled className="bg-[#008060] text-white text-[10px] px-3 py-1.5 rounded-lg font-black uppercase">
                                                Join
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-semibold" style={{ color: isSecondaryDark ? '#a1a1aa' : '#52525b', borderColor: isSecondaryDark ? '#27272a' : '#e4e4e7' }}>
                        <span>{themeSettings.footerConfig?.copyrightText || '© 2026 Store.'}</span>
                        {themeSettings.footerConfig?.showPaymentIcons && (
                            <div className="flex gap-1.5 opacity-60">
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border" style={{ backgroundColor: isSecondaryDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: isSecondaryDark ? '#27272a' : '#e4e4e7' }}>VISA</span>
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border" style={{ backgroundColor: isSecondaryDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: isSecondaryDark ? '#27272a' : '#e4e4e7' }}>MC</span>
                                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase border" style={{ backgroundColor: isSecondaryDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderColor: isSecondaryDark ? '#27272a' : '#e4e4e7' }}>UPI</span>
                            </div>
                        )}
                    </div>
                    </footer>
                )}
            </div>
        </div>
    );
}
