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

export default function BlockStyleEditor({
    blockType,
    styleSettings = {},
    onChangeStyle
}) {
    const handleChange = (key, val) => {
        onChangeStyle(key, val);
    };

    const isHeading = ['heading', 'subheading', 'paragraph', 'text'].includes(blockType);
    const isButton = blockType === 'button';
    const isImage = blockType === 'image';

    return (
        <div className="space-y-4 border-t border-zinc-200 pt-4 mt-2">
            <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Element Styling
            </span>

            {/* Common Typography Styles */}
            {isHeading && (
                <div className="space-y-4">
                    {blockType === 'heading' && (
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Heading Tag Level</label>
                            <select
                                value={styleSettings.tag || 'h2'}
                                onChange={(e) => handleChange('tag', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                            >
                                <option value="h1">H1 - Largest</option>
                                <option value="h2">H2 - Section Heading</option>
                                <option value="h3">H3 - Sub Heading</option>
                                <option value="h4">H4 - Small Sub Heading</option>
                                <option value="h5">H5 - Tiny Header</option>
                                <option value="h6">H6 - Minimalist</option>
                                <option value="p">Paragraph Paragraph</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Font Size (px)</label>
                        <div className="flex gap-2.5 items-center">
                            <input
                                type="range"
                                min="8"
                                max="72"
                                step="1"
                                value={styleSettings.fontSize || (blockType === 'heading' ? 24 : 14)}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                className="flex-1 accent-[#008060] cursor-pointer"
                            />
                            <span className="text-xs font-bold text-zinc-500 min-w-[28px] text-right">
                                {styleSettings.fontSize || (blockType === 'heading' ? 24 : 14)}px
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Text Color</label>
                            <ColorPickerField 
                                value={styleSettings.color || '#000000'}
                                onChange={(val) => handleChange('color', val)}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Font Weight</label>
                            <select
                                value={styleSettings.fontWeight || '600'}
                                onChange={(e) => handleChange('fontWeight', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                            >
                                <option value="300">Light (300)</option>
                                <option value="400">Regular (400)</option>
                                <option value="500">Medium (500)</option>
                                <option value="600">SemiBold (600)</option>
                                <option value="700">Bold (700)</option>
                                <option value="800">Extra Bold (800)</option>
                                <option value="900">Black (900)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Line Height</label>
                            <input
                                type="text"
                                placeholder="1.2 or 1.5"
                                value={styleSettings.lineHeight || ''}
                                onChange={(e) => handleChange('lineHeight', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Letter Spacing</label>
                            <input
                                type="text"
                                placeholder="0px or 1px"
                                value={styleSettings.letterSpacing || ''}
                                onChange={(e) => handleChange('letterSpacing', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Text Transform</label>
                            <select
                                value={styleSettings.textTransform || 'none'}
                                onChange={(e) => handleChange('textTransform', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                            >
                                <option value="none">None</option>
                                <option value="uppercase">UPPERCASE</option>
                                <option value="lowercase">lowercase</option>
                                <option value="capitalize">Capitalize</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Alignment</label>
                            <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                                {['left', 'center', 'right'].map((align) => (
                                    <button
                                        key={align}
                                        type="button"
                                        onClick={() => handleChange('textAlign', align)}
                                        className={`flex-grow py-1 rounded text-xs capitalize font-bold transition-all ${
                                            (styleSettings.textAlign || 'center') === align
                                                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-250'
                                                : 'text-zinc-500 hover:text-zinc-800'
                                        }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Margin Top (px)</label>
                            <input
                                type="number"
                                value={styleSettings.marginTop !== undefined ? styleSettings.marginTop : 4}
                                onChange={(e) => handleChange('marginTop', parseInt(e.target.value) || 0)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Margin Bottom (px)</label>
                            <input
                                type="number"
                                value={styleSettings.marginBottom !== undefined ? styleSettings.marginBottom : 12}
                                onChange={(e) => handleChange('marginBottom', parseInt(e.target.value) || 0)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Button Styles */}
            {isButton && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Button BG Color</label>
                            <ColorPickerField 
                                value={styleSettings.backgroundColor || '#000000'}
                                onChange={(val) => handleChange('backgroundColor', val)}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Text Color</label>
                            <ColorPickerField 
                                value={styleSettings.textColor || '#ffffff'}
                                onChange={(val) => handleChange('textColor', val)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Hover BG Color</label>
                            <ColorPickerField 
                                value={styleSettings.hoverBgColor || '#22c55e'}
                                onChange={(val) => handleChange('hoverBgColor', val)}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Hover Text Color</label>
                            <ColorPickerField 
                                value={styleSettings.hoverTextColor || '#ffffff'}
                                onChange={(val) => handleChange('hoverTextColor', val)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Border Color</label>
                            <ColorPickerField 
                                value={styleSettings.borderColor || '#000000'}
                                onChange={(val) => handleChange('borderColor', val)}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Border Width</label>
                            <select
                                value={styleSettings.borderWidth || '0px'}
                                onChange={(e) => handleChange('borderWidth', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                            >
                                <option value="0px">None</option>
                                <option value="1px">1px Thin</option>
                                <option value="2px">2px Standard</option>
                                <option value="3px">3px Bold</option>
                                <option value="4px">4px Heavy</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Border Radius (px)</label>
                        <div className="flex gap-2.5 items-center">
                            <input
                                type="range"
                                min="0"
                                max="40"
                                step="2"
                                value={styleSettings.borderRadius !== undefined ? parseInt(styleSettings.borderRadius) : 8}
                                onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
                                className="flex-1 accent-[#008060] cursor-pointer"
                            />
                            <span className="text-xs font-bold text-zinc-500 min-w-[28px] text-right">
                                {styleSettings.borderRadius || '8px'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Padding X (Horizontal)</label>
                            <input
                                type="number"
                                min="4"
                                max="60"
                                value={styleSettings.paddingX !== undefined ? styleSettings.paddingX : 20}
                                onChange={(e) => handleChange('paddingX', parseInt(e.target.value) || 20)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Padding Y (Vertical)</label>
                            <input
                                type="number"
                                min="4"
                                max="30"
                                value={styleSettings.paddingY !== undefined ? styleSettings.paddingY : 10}
                                onChange={(e) => handleChange('paddingY', parseInt(e.target.value) || 10)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Font Size</label>
                            <input
                                type="number"
                                min="8"
                                max="32"
                                value={styleSettings.fontSize !== undefined ? styleSettings.fontSize : 12}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 12)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Button Shadow</label>
                            <select
                                value={styleSettings.shadow || 'none'}
                                onChange={(e) => handleChange('shadow', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                            >
                                <option value="none">No Shadow</option>
                                <option value="sm">Small Shadow</option>
                                <option value="md">Medium Shadow</option>
                                <option value="lg">Large Elevated</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Image Styles */}
            {isImage && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Width (px or %)</label>
                            <input
                                type="text"
                                placeholder="e.g. 100% or 300px"
                                value={styleSettings.width || '100%'}
                                onChange={(e) => handleChange('width', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Height (px or auto)</label>
                            <input
                                type="text"
                                placeholder="e.g. auto or 200px"
                                value={styleSettings.height || 'auto'}
                                onChange={(e) => handleChange('height', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Object Fit</label>
                            <select
                                value={styleSettings.objectFit || 'cover'}
                                onChange={(e) => handleChange('objectFit', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                            >
                                <option value="cover">Cover (Fill & Crop)</option>
                                <option value="contain">Contain (Full Aspect)</option>
                                <option value="fill">Stretch Fill</option>
                                <option value="none">Original Size</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">Border Radius</label>
                            <select
                                value={styleSettings.borderRadius || '0px'}
                                onChange={(e) => handleChange('borderRadius', e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold bg-white"
                            >
                                <option value="0px">Sharp (0px)</option>
                                <option value="4px">Slight Curved (4px)</option>
                                <option value="8px">Standard (8px)</option>
                                <option value="16px">Modern (16px)</option>
                                <option value="9999px">Circular Pill (9999px)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
