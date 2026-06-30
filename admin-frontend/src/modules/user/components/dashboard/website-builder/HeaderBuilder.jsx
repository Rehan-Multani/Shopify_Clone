import React, { useState } from 'react';

const ColorPickerField = ({ value, onChange }) => {
    return (
        <div className="flex gap-2 items-center">
            <input 
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded border border-zinc-200 p-0 cursor-pointer"
            />
            <input 
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#ffffff"
                maxLength={7}
                className="w-20 px-2 py-1.5 border border-zinc-200 rounded-lg text-[10px] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white shadow-sm"
            />
        </div>
    );
};

export default function HeaderBuilder({ headerConfig = {}, onChange }) {
    const handleFieldChange = (field, value) => {
        onChange({
            ...headerConfig,
            [field]: value
        });
    };

    const handleAnnounceChange = (field, value) => {
        const announce = headerConfig.announcementBar || {};
        onChange({
            ...headerConfig,
            announcementBar: {
                ...announce,
                [field]: value
            }
        });
    };

    const handleMenuItemChange = (index, field, value) => {
        const items = [...(headerConfig.menuItems || [])];
        items[index] = {
            ...items[index],
            [field]: value
        };
        handleFieldChange('menuItems', items);
    };

    const addMenuItem = () => {
        const items = [...(headerConfig.menuItems || [])];
        items.push({ label: 'New Link', link: '/catalog' });
        handleFieldChange('menuItems', items);
    };

    const removeMenuItem = (index) => {
        const items = (headerConfig.menuItems || []).filter((_, i) => i !== index);
        handleFieldChange('menuItems', items);
    };

    const announce = headerConfig.announcementBar || { enabled: true, text: '✨ Free Shipping above ₹499!' };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    Announcement Bar
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-700">Enable Bar</label>
                        <input 
                            type="checkbox"
                            checked={!!announce.enabled}
                            onChange={(e) => handleAnnounceChange('enabled', e.target.checked)}
                            className="w-4 h-4 text-[#008060] rounded focus:ring-0 cursor-pointer"
                        />
                    </div>

                    {announce.enabled && (
                        <>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Banner Text</label>
                                <input 
                                    type="text"
                                    value={announce.text || ''}
                                    onChange={(e) => handleAnnounceChange('text', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Banner Icon</label>
                                <select 
                                    value={announce.icon || ''}
                                    onChange={(e) => handleAnnounceChange('icon', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white cursor-pointer"
                                >
                                    <option value="">None</option>
                                    <option value="✨">Sparkles ✨</option>
                                    <option value="🚚">Truck 🚚</option>
                                    <option value="🎁">Gift 🎁</option>
                                    <option value="🔥">Fire 🔥</option>
                                    <option value="❤️">Heart ❤️</option>
                                    <option value="⭐">Star ⭐</option>
                                    <option value="🛡️">Shield 🛡️</option>
                                    <option value="🕒">Clock 🕒</option>
                                    <option value="ℹ️">Info ℹ️</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Bg Color</label>
                                    <ColorPickerField 
                                        value={announce.backgroundColor || '#2563eb'}
                                        onChange={(val) => handleAnnounceChange('backgroundColor', val)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Text Color</label>
                                    <ColorPickerField 
                                        value={announce.textColor || '#ffffff'}
                                        onChange={(val) => handleAnnounceChange('textColor', val)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    Header Setup
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-2">
                        <label className="text-xs font-bold text-zinc-700">Show Header</label>
                        <input 
                            type="checkbox"
                            checked={headerConfig.enabled !== false}
                            onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                            className="w-4 h-4 text-[#008060] rounded focus:ring-0 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Logo URL</label>
                        <input 
                            type="text"
                            placeholder="https://example.com/logo.png"
                            value={headerConfig.logoUrl || ''}
                            onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Logo Width</label>
                                <span className="text-[10px] font-semibold text-zinc-650 bg-zinc-100 px-1.5 py-0.5 rounded">{parseInt(headerConfig.logoWidth) || 120}px</span>
                            </div>
                            <input 
                                type="range"
                                min="40"
                                max="300"
                                value={parseInt(headerConfig.logoWidth) || 120}
                                onChange={(e) => handleFieldChange('logoWidth', `${e.target.value}px`)}
                                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#008060]"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase">Logo Height</label>
                                <span className="text-[10px] font-semibold text-zinc-650 bg-zinc-100 px-1.5 py-0.5 rounded">{parseInt(headerConfig.logoHeight) || 32}px</span>
                            </div>
                            <input 
                                type="range"
                                min="20"
                                max="120"
                                value={parseInt(headerConfig.logoHeight) || 32}
                                onChange={(e) => handleFieldChange('logoHeight', `${e.target.value}px`)}
                                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#008060]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Height</label>
                            <input 
                                type="text"
                                placeholder="70px"
                                value={headerConfig.height || '70px'}
                                onChange={(e) => handleFieldChange('height', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                            />
                        </div>
                        <div className="flex flex-col justify-end gap-2.5 pb-1">
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={!!headerConfig.sticky}
                                    onChange={(e) => handleFieldChange('sticky', e.target.checked)}
                                    className="w-4 h-4 text-[#008060] rounded focus:ring-0"
                                />
                                Sticky
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={!!headerConfig.transparent}
                                    onChange={(e) => handleFieldChange('transparent', e.target.checked)}
                                    className="w-4 h-4 text-[#008060] rounded focus:ring-0"
                                />
                                Transparent
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Header Bg Color</label>
                            <ColorPickerField 
                                value={headerConfig.backgroundColor || '#ffffff'}
                                onChange={(val) => handleFieldChange('backgroundColor', val)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Header Link Color</label>
                            <ColorPickerField 
                                value={headerConfig.textColor || '#000000'}
                                onChange={(val) => handleFieldChange('textColor', val)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-3">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Custom Header Info Text</label>
                            <input 
                                type="text"
                                placeholder="e.g. Call us: 1800-123-456"
                                value={headerConfig.customText || ''}
                                onChange={(e) => handleFieldChange('customText', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Custom Info Icon</label>
                            <select 
                                value={headerConfig.customIcon || ''}
                                onChange={(e) => handleFieldChange('customIcon', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white cursor-pointer"
                            >
                                <option value="">None</option>
                                <option value="📞">Phone 📞</option>
                                <option value="📍">Map Pin 📍</option>
                                <option value="🚚">Truck 🚚</option>
                                <option value="🕒">Clock 🕒</option>
                                <option value="🎁">Gift 🎁</option>
                                <option value="✨">Sparkles ✨</option>
                                <option value="❤️">Heart ❤️</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                        <label className="block text-[10px] font-black text-zinc-450 uppercase tracking-wider">Toggles</label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-750 hover:text-zinc-900 cursor-pointer bg-zinc-50 hover:bg-zinc-100/80 px-3 py-2.5 rounded-xl border border-zinc-200/70 transition-all select-none shadow-[0_1px_2px_rgba(0,0,0,0.01)] active:scale-98">
                                <input 
                                    type="checkbox"
                                    checked={headerConfig.searchEnabled !== false}
                                    onChange={(e) => handleFieldChange('searchEnabled', e.target.checked)}
                                    className="w-4 h-4 text-[#008060] rounded border-zinc-300 focus:ring-[#008060] cursor-pointer accent-[#008060]"
                                />
                                Search Bar
                            </label>
                            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-750 hover:text-zinc-900 cursor-pointer bg-zinc-50 hover:bg-zinc-100/80 px-3 py-2.5 rounded-xl border border-zinc-200/70 transition-all select-none shadow-[0_1px_2px_rgba(0,0,0,0.01)] active:scale-98">
                                <input 
                                    type="checkbox"
                                    checked={headerConfig.cartEnabled !== false}
                                    onChange={(e) => handleFieldChange('cartEnabled', e.target.checked)}
                                    className="w-4 h-4 text-[#008060] rounded border-zinc-300 focus:ring-[#008060] cursor-pointer accent-[#008060]"
                                />
                                Cart Icon
                            </label>
                            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-750 hover:text-zinc-900 cursor-pointer bg-zinc-50 hover:bg-zinc-100/80 px-3 py-2.5 rounded-xl border border-zinc-200/70 transition-all select-none shadow-[0_1px_2px_rgba(0,0,0,0.01)] active:scale-98">
                                <input 
                                    type="checkbox"
                                    checked={headerConfig.wishlistEnabled !== false}
                                    onChange={(e) => handleFieldChange('wishlistEnabled', e.target.checked)}
                                    className="w-4 h-4 text-[#008060] rounded border-zinc-300 focus:ring-[#008060] cursor-pointer accent-[#008060]"
                                />
                                Wishlist
                            </label>
                            <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-750 hover:text-zinc-900 cursor-pointer bg-zinc-50 hover:bg-zinc-100/80 px-3 py-2.5 rounded-xl border border-zinc-200/70 transition-all select-none shadow-[0_1px_2px_rgba(0,0,0,0.01)] active:scale-98">
                                <input 
                                    type="checkbox"
                                    checked={headerConfig.profileEnabled !== false}
                                    onChange={(e) => handleFieldChange('profileEnabled', e.target.checked)}
                                    className="w-4 h-4 text-[#008060] rounded border-zinc-300 focus:ring-[#008060] cursor-pointer accent-[#008060]"
                                />
                                Profile
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center border-b pb-1.5 mb-3">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                        Navigation Menu Links
                    </h4>
                    <button
                        onClick={addMenuItem}
                        className="text-[9px] bg-emerald-555 text-white bg-[#008060] hover:bg-[#006e52] px-2 py-0.5 rounded font-black uppercase tracking-wider"
                    >
                        + Add Link
                    </button>
                </div>
                <div className="space-y-3">
                    {(headerConfig.menuItems || []).map((item, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5 relative group">
                            <button
                                onClick={() => removeMenuItem(idx)}
                                className="absolute top-2 right-2 text-[10px] text-zinc-400 hover:text-red-500 font-bold"
                                title="Delete Link"
                            >
                                ✕
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-450 uppercase mb-0.5">Label</label>
                                    <input 
                                        type="text"
                                        value={item.label || ''}
                                        onChange={(e) => handleMenuItemChange(idx, 'label', e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-450 uppercase mb-0.5">Link Path</label>
                                    <input 
                                        type="text"
                                        value={item.link || ''}
                                        onChange={(e) => handleMenuItemChange(idx, 'link', e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
