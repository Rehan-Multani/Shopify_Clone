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

const FONTS = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Outfit', value: 'Outfit' },
    { name: 'Poppins', value: 'Poppins' },
    { name: 'Playfair Display', value: 'Playfair Display' },
    { name: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' }
];

const BORDERS = [
    { name: 'None (Brutalist)', value: '0px' },
    { name: 'Small (Sleek)', value: '4px' },
    { name: 'Medium (Standard)', value: '8px' },
    { name: 'Large (Modern)', value: '16px' },
    { name: 'Pill (Round)', value: '99px' }
];

export default function ThemeSettingsPanel({ themeSettings = {}, onChange }) {
    const handleFieldChange = (key, value) => {
        onChange({
            ...themeSettings,
            [key]: value
        });
    };

    const handleNestedChange = (group, key, value) => {
        onChange({
            ...themeSettings,
            [group]: {
                ...(themeSettings[group] || {}),
                [key]: value
            }
        });
    };

    const typo = themeSettings.typography || { headingFont: 'Inter', bodyFont: 'Inter', headingWeight: '700', bodyWeight: '400', lineHeight: '1.5', letterSpacing: '0px', responsive: true };
    const btn = themeSettings.buttons || { size: 'medium', borderRadius: '8px', shadow: 'sm', hoverEffect: 'brightness', ripple: true, gradient: false };
    const spc = themeSettings.spacing || { containerWidth: '1280px', sectionPadding: '40px', gridGap: '24px' };
    const globalSt = themeSettings.globalStyles || { customCss: '', customJs: '' };

    return (
        <div className="space-y-6">
            {/* Color Palette */}
            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    Color System
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Primary Color</label>
                        <ColorPickerField 
                            value={themeSettings.primaryColor || '#2563eb'}
                            onChange={(val) => handleFieldChange('primaryColor', val)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Secondary Color</label>
                        <ColorPickerField 
                            value={themeSettings.secondaryColor || '#ffffff'}
                            onChange={(val) => handleFieldChange('secondaryColor', val)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Accent Color</label>
                        <ColorPickerField 
                            value={themeSettings.accentColor || '#14B8A6'}
                            onChange={(val) => handleFieldChange('accentColor', val)}
                        />
                    </div>
                </div>
            </div>

            {/* Typography */}
            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    Typography (Google Fonts)
                </h4>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Heading Font</label>
                            <select 
                                value={typo.headingFont || 'Inter'}
                                onChange={(e) => handleNestedChange('typography', 'headingFont', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white"
                            >
                                {FONTS.map(f => (
                                    <option key={f.value} value={f.value}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Body Font</label>
                            <select 
                                value={typo.bodyFont || 'Inter'}
                                onChange={(e) => handleNestedChange('typography', 'bodyFont', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white"
                            >
                                {FONTS.map(f => (
                                    <option key={f.value} value={f.value}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Heading Weight</label>
                            <select 
                                value={typo.headingWeight || '700'}
                                onChange={(e) => handleNestedChange('typography', 'headingWeight', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white"
                            >
                                <option value="500">Medium (500)</option>
                                <option value="600">Semi Bold (600)</option>
                                <option value="700">Bold (700)</option>
                                <option value="800">Extra Bold (800)</option>
                                <option value="900">Black (900)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Body Weight</label>
                            <select 
                                value={typo.bodyWeight || '400'}
                                onChange={(e) => handleNestedChange('typography', 'bodyWeight', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white"
                            >
                                <option value="300">Light (300)</option>
                                <option value="400">Regular (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">Semi Bold (600)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Line Height</label>
                            <input 
                                type="text"
                                placeholder="1.5"
                                value={typo.lineHeight || '1.5'}
                                onChange={(e) => handleNestedChange('typography', 'lineHeight', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Letter Spacing</label>
                            <input 
                                type="text"
                                placeholder="0px"
                                value={typo.letterSpacing || '0px'}
                                onChange={(e) => handleNestedChange('typography', 'letterSpacing', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Buttons Setup */}
            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    Buttons Customizer
                </h4>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Default Size</label>
                            <select 
                                value={btn.size || 'medium'}
                                onChange={(e) => handleNestedChange('buttons', 'size', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                            >
                                <option value="small">Small Padding</option>
                                <option value="medium">Medium Standard</option>
                                <option value="large">Large Button</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Border Radius</label>
                            <select 
                                value={btn.borderRadius || '8px'}
                                onChange={(e) => handleNestedChange('buttons', 'borderRadius', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                            >
                                {BORDERS.map(b => (
                                    <option key={b.value} value={b.value}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Hover Effect</label>
                            <select 
                                value={btn.hoverEffect || 'brightness'}
                                onChange={(e) => handleNestedChange('buttons', 'hoverEffect', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                            >
                                <option value="none">No Effect</option>
                                <option value="brightness">Brighten Color</option>
                                <option value="scale">Scale Up Zoom</option>
                                <option value="translate">Lift Up (-2px)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Default Shadow</label>
                            <select 
                                value={btn.shadow || 'sm'}
                                onChange={(e) => handleNestedChange('buttons', 'shadow', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                            >
                                <option value="none">No Shadow</option>
                                <option value="sm">Soft Sm (Default)</option>
                                <option value="md">Medium Border Shadow</option>
                                <option value="lg">Large Elevated Shadow</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={!!btn.ripple}
                                onChange={(e) => handleNestedChange('buttons', 'ripple', e.target.checked)}
                                className="w-4 h-4 text-[#008060] rounded focus:ring-0"
                            />
                            Micro-Ripple click
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={!!btn.gradient}
                                onChange={(e) => handleNestedChange('buttons', 'gradient', e.target.checked)}
                                className="w-4 h-4 text-[#008060] rounded focus:ring-0"
                            />
                            Gradient Fill
                        </label>
                    </div>
                </div>
            </div>

            {/* Spacing / Containers */}
            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    Containers & Borders
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Favicon URL</label>
                        <input 
                            type="text"
                            placeholder="https://example.com/favicon.ico"
                            value={themeSettings.favicon || ''}
                            onChange={(e) => handleFieldChange('favicon', e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Max Canvas Width</label>
                            <input 
                                type="text"
                                placeholder="1280px"
                                value={spc.containerWidth || '1280px'}
                                onChange={(e) => handleNestedChange('spacing', 'containerWidth', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Global Border Radius</label>
                            <select 
                                value={themeSettings.borderRadius || '8px'}
                                onChange={(e) => handleFieldChange('borderRadius', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                            >
                                {BORDERS.map(b => (
                                    <option key={b.value} value={b.value}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Scripts / CSS (Developer Mode) */}
            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    Developer Mode (Custom CSS/JS)
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Custom CSS Styling</label>
                        <textarea 
                            value={globalSt.customCss || ''}
                            onChange={(e) => handleNestedChange('globalStyles', 'customCss', e.target.value)}
                            rows={3}
                            placeholder=".btn-custom { color: red; }"
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Global Head Script Tag (JS)</label>
                        <textarea 
                            value={globalSt.customJs || ''}
                            onChange={(e) => handleNestedChange('globalStyles', 'customJs', e.target.value)}
                            rows={3}
                            placeholder="console.log('Theme scripts initialized');"
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
