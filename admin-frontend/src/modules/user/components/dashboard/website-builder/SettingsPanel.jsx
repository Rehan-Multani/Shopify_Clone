import React, { useState } from 'react';
import BlockStyleEditor from './BlockStyleEditor';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL?.replace('/api', '') || 'http://localhost:5000';

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

const ImageUploadField = ({ value, onChange, label = 'Select Image' }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`${GATEWAY_URL}/banners/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
            } else {
                setError(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Connection error. Failed to upload.');
        } finally {
            setUploading(false);
        }
    };

    const imageUrl = value ? (value.startsWith('http') ? value : `${ASSETS_BASE_URL}${value}`) : null;

    return (
        <div className="space-y-2 border border-zinc-200 p-3 rounded-xl bg-zinc-50/50">
            {imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 bg-white">
                    <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button 
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 hover:bg-red-650 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold"
                        title="Remove Image"
                    >
                        ✕
                    </button>
                </div>
            )}
            <div className="flex items-center gap-3">
                <label className="flex-1 flex flex-col items-center justify-center px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer transition-all">
                    <span className="text-[10px] font-bold text-zinc-650 tracking-wide text-center">
                        {uploading ? '⌛ Uploading...' : label}
                    </span>
                    <input 
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
                <input 
                    type="text"
                    value={value || ''}
                    placeholder="Or paste image URL"
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-[1.5] w-full px-2.5 py-2 border border-zinc-200 rounded-xl text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white shadow-sm"
                />
            </div>
            {error && <p className="text-[9px] font-bold text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default function SettingsPanel({
    section = {},
    onChangeSettings,
    onAddBlock,
    onUpdateBlock,
    onRemoveBlock
}) {
    const { type, settings = {}, blocks = [] } = section;

    const handleSettingChange = (key, val) => {
        onChangeSettings(key, val);
    };

    const renderFeaturesGridSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Section Title Header</label>
                    <input 
                        type="text"
                        value={settings.title || 'Why Choose Us'}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Subtitle Description</label>
                    <textarea 
                        value={settings.subtitle || ''}
                        onChange={(e) => handleSettingChange('subtitle', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>

                <div className="border-t border-zinc-200/60 pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">Feature Cards</label>
                        <button
                            onClick={() => onAddBlock(section.sectionId || section._id, 'feature')}
                            className="text-[8px] bg-[#008060] text-white px-2 py-0.5 rounded font-black uppercase"
                        >
                            + Add Feature
                        </button>
                    </div>

                    <div className="space-y-3">
                        {(blocks || []).map((block, idx) => (
                            <div key={block.blockId || idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl relative space-y-2">
                                <button
                                    onClick={() => onRemoveBlock(section.sectionId || section._id, block.blockId)}
                                    className="absolute top-2 right-2 text-xs text-zinc-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Feature Title</label>
                                    <input 
                                        type="text"
                                        value={block.settings?.title || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'title', e.target.value)}
                                        className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Description Text</label>
                                    <textarea 
                                        value={block.settings?.text || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'text', e.target.value)}
                                        rows={2}
                                        className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Icon Shape</label>
                                    <select 
                                        value={block.settings?.icon || 'truck'}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'icon', e.target.value)}
                                        className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold bg-white"
                                    >
                                        <option value="truck">Truck / Shipping</option>
                                        <option value="rotate-ccw">Rotate / Returns</option>
                                        <option value="shield-check">Shield / Secure Payment</option>
                                        <option value="phone">Phone / Support</option>
                                        <option value="heart-pulse">Heart-Pulse / Health</option>
                                        <option value="lightning">Lightning / Express Delivery</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderHeroSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Layout Style</label>
                    <select 
                        value={settings.layout || 'overlay'}
                        onChange={(e) => handleSettingChange('layout', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                    >
                        <option value="overlay">Full-Width Overlay</option>
                        <option value="split">Split Screen (2 Columns)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Background Type</label>
                    <select 
                        value={settings.backgroundType || 'image'}
                        onChange={(e) => handleSettingChange('backgroundType', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                    >
                        <option value="image">Background Image</option>
                        <option value="solid">Solid Color</option>
                        <option value="gradient">Gradient Color</option>
                    </select>
                </div>

                {settings.backgroundType === 'solid' && (
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Background Color</label>
                        <ColorPickerField 
                            value={settings.backgroundColor || '#008060'}
                            onChange={(val) => handleSettingChange('backgroundColor', val)}
                        />
                    </div>
                )}

                {settings.backgroundType === 'gradient' && (
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Gradient CSS</label>
                        <input 
                            type="text"
                            placeholder="e.g. linear-gradient(to right, #008060, #047857)"
                            value={settings.backgroundGradient || ''}
                            onChange={(e) => handleSettingChange('backgroundGradient', e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                        />
                        <div className="flex gap-1.5 flex-wrap pt-2">
                            <span 
                                onClick={() => handleSettingChange('backgroundGradient', 'linear-gradient(to right, #008060, #047857, #064e3b)')}
                                className="text-[8px] bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded cursor-pointer font-bold border"
                            >Care & Comfort</span>
                            <span 
                                onClick={() => handleSettingChange('backgroundGradient', 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)')}
                                className="text-[8px] bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded cursor-pointer font-bold border"
                            >Modern Purple</span>
                            <span 
                                onClick={() => handleSettingChange('backgroundGradient', 'linear-gradient(to right, #243B55, #141E30)')}
                                className="text-[8px] bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded cursor-pointer font-bold border"
                            >Dark Slate</span>
                            <span 
                                onClick={() => handleSettingChange('backgroundGradient', 'linear-gradient(to right, #ff7e5f, #feb47b)')}
                                className="text-[8px] bg-zinc-100 hover:bg-zinc-200 px-1.5 py-0.5 rounded cursor-pointer font-bold border"
                            >Sunset</span>
                        </div>
                    </div>
                )}

                {(settings.backgroundType === 'image' || settings.layout === 'split') && (
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{settings.layout === 'split' ? 'Featured Image' : 'Background Image'}</label>
                        <ImageUploadField 
                            value={settings.backgroundImage || ''}
                            onChange={(val) => handleSettingChange('backgroundImage', val)}
                            label={settings.layout === 'split' ? 'Upload Featured Image' : 'Upload Background Image'}
                        />
                    </div>
                )}
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Text Alignment</label>
                    <select 
                        value={settings.textAlignment || 'center'}
                        onChange={(e) => handleSettingChange('textAlignment', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                    >
                        <option value="left">Left Align</option>
                        <option value="center">Center Align</option>
                        <option value="right">Right Align</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Banner Height</label>
                    <input 
                        type="text"
                        placeholder="480px"
                        value={settings.height || '480px'}
                        onChange={(e) => handleSettingChange('height', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Dark Overlay Opacity</label>
                    <div className="flex gap-3 items-center">
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={settings.overlayOpacity !== undefined ? settings.overlayOpacity : 0.45}
                            onChange={(e) => handleSettingChange('overlayOpacity', parseFloat(e.target.value))}
                            className="flex-1 accent-[#008060] cursor-pointer"
                        />
                        <span className="text-xs font-black text-zinc-500">
                            {Math.round((settings.overlayOpacity !== undefined ? settings.overlayOpacity : 0.45) * 100)}%
                        </span>
                    </div>
                </div>

                <div className="border-t border-zinc-200/60 pt-4">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase mb-2 cursor-pointer select-none">
                        <input 
                            type="checkbox"
                            checked={settings.showTrustBadges !== false}
                            onChange={(e) => handleSettingChange('showTrustBadges', e.target.checked)}
                            className="w-3.5 h-3.5 text-[#008060] rounded focus:ring-0"
                        />
                        Show Trust Badges
                    </label>

                    {settings.showTrustBadges !== false && (
                        <div className="space-y-3 pl-4">
                            <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Badge 1 Text</label>
                                <input 
                                    type="text"
                                    placeholder="Free Shipping"
                                    value={settings.badge1Text || ''}
                                    onChange={(e) => handleSettingChange('badge1Text', e.target.value)}
                                    className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Badge 2 Text</label>
                                <input 
                                    type="text"
                                    placeholder="Secure Payments"
                                    value={settings.badge2Text || ''}
                                    onChange={(e) => handleSettingChange('badge2Text', e.target.value)}
                                    className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Badge 3 Text</label>
                                <input 
                                    type="text"
                                    placeholder="Easy Returns"
                                    value={settings.badge3Text || ''}
                                    onChange={(e) => handleSettingChange('badge3Text', e.target.value)}
                                    className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-zinc-200/60 pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">Hero Blocks</label>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => onAddBlock(section.sectionId || section._id, 'button')}
                                className="text-[8px] bg-[#008060] text-white px-2 py-0.5 rounded font-black uppercase hover:bg-[#006e52]"
                            >
                                + Add Button
                            </button>
                            <button
                                onClick={() => onAddBlock(section.sectionId || section._id, 'heading')}
                                className="text-[8px] bg-zinc-650 text-white px-2 py-0.5 rounded font-black uppercase hover:bg-zinc-800"
                            >
                                + Add Heading
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {(blocks || []).map((block, idx) => (
                            <div key={block.blockId || idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl relative space-y-2">
                                <div className="flex justify-between items-center pr-6">
                                    <span className="text-[9px] font-black uppercase bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">
                                        {block.type}
                                    </span>
                                    <button
                                        onClick={() => onRemoveBlock(section.sectionId || section._id, block.blockId)}
                                        className="absolute top-2.5 right-2 text-xs text-zinc-400 hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {block.type === 'heading' && (
                                    <div>
                                        <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Heading Text</label>
                                        <input 
                                            type="text"
                                            value={block.settings?.text || ''}
                                            onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'text', e.target.value)}
                                            className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                        />
                                    </div>
                                )}

                                {block.type === 'subheading' && (
                                    <div>
                                        <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Subheading Text</label>
                                        <textarea 
                                            value={block.settings?.text || ''}
                                            onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'text', e.target.value)}
                                            rows={2}
                                            className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                        />
                                    </div>
                                )}

                                {block.type === 'button' && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Label</label>
                                                <input 
                                                    type="text"
                                                    value={block.settings?.label || ''}
                                                    onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'label', e.target.value)}
                                                    className="w-full px-2 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Link URL</label>
                                                <input 
                                                    type="text"
                                                    value={block.settings?.link || ''}
                                                    onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'link', e.target.value)}
                                                    className="w-full px-2 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-500 uppercase cursor-pointer select-none">
                                                <input 
                                                    type="checkbox"
                                                    checked={block.settings?.startNewRow === true}
                                                    onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'startNewRow', e.target.checked)}
                                                    className="w-3.5 h-3.5 text-[#008060] rounded focus:ring-0"
                                                />
                                                Start on New Line (Below)
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Block style controls */}
                                <BlockStyleEditor 
                                    blockType={block.type}
                                    styleSettings={block.settings?.style || {}}
                                    onChangeStyle={(styleKey, styleVal) => {
                                        const updatedStyle = {
                                            ...(block.settings?.style || {}),
                                            [styleKey]: styleVal
                                        };
                                        onUpdateBlock(section.sectionId || section._id, block.blockId, 'style', updatedStyle);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderImageBannerSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Banner Image</label>
                    <ImageUploadField 
                        value={settings.imageUrl || ''}
                        onChange={(val) => handleSettingChange('imageUrl', val)}
                        label="Upload Banner Image"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Banner Height</label>
                    <input 
                        type="text"
                        placeholder="400px"
                        value={settings.height || '400px'}
                        onChange={(e) => handleSettingChange('height', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Headline Text</label>
                    <input 
                        type="text"
                        value={settings.title || 'Special Promotion'}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Subtitle Description</label>
                    <textarea 
                        value={settings.subtitle || ''}
                        onChange={(e) => handleSettingChange('subtitle', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Btn Label</label>
                        <input 
                            type="text"
                            value={settings.buttonLabel || ''}
                            onChange={(e) => handleSettingChange('buttonLabel', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Btn Link</label>
                        <input 
                            type="text"
                            value={settings.buttonLink || ''}
                            onChange={(e) => handleSettingChange('buttonLink', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Layout Style</label>
                    <select 
                        value={settings.layout || 'side'}
                        onChange={(e) => handleSettingChange('layout', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold bg-white"
                    >
                        <option value="side">Side by Side (Split)</option>
                        <option value="overlay">Overlay Text on Image</option>
                    </select>
                </div>
            </div>
        );
    };

     const renderCatalogGridSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Section Title Header</label>
                    <input 
                        type="text"
                        value={settings.title || ''}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Item Limit</label>
                        <input 
                            type="number"
                            min="2"
                            max="24"
                            value={settings.limit || 4}
                            onChange={(e) => handleSettingChange('limit', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Grid Columns</label>
                        <select 
                            value={settings.columns || 4}
                            onChange={(e) => handleSettingChange('columns', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold bg-white"
                        >
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                            <option value={6}>6 Columns</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Card Corners (Border Radius)</label>
                    <select 
                        value={settings.cardShape || 'curved'}
                        onChange={(e) => handleSettingChange('cardShape', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold bg-white"
                    >
                        <option value="square">Square (Sharp 0px)</option>
                        <option value="curved">Curved (Standard 12px)</option>
                        <option value="circle">Circular Round (Category icons)</option>
                        <option value="pill">Pill Shape (Rounded 24px)</option>
                    </select>
                </div>
                {type === 'category-grid' && (
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Category Card Shape</label>
                        <select 
                            value={settings.designType || 'circle'}
                            onChange={(e) => handleSettingChange('designType', e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold bg-white"
                        >
                            <option value="circle">Circle Card</option>
                            <option value="square">Square Image</option>
                            <option value="card">Modern Bordered Card</option>
                        </select>
                    </div>
                )}
            </div>
        );
    };

    const renderTextSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Header Section Title</label>
                    <input 
                        type="text"
                        value={settings.title || ''}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Body Text Content</label>
                    <textarea 
                        value={settings.content || ''}
                        onChange={(e) => handleSettingChange('content', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Text Alignment</label>
                    <select 
                        value={settings.alignment || 'center'}
                        onChange={(e) => handleSettingChange('alignment', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold bg-white"
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>
            </div>
        );
    };

    const renderAccordionFaqSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Section Header Title</label>
                    <input 
                        type="text"
                        value={settings.title || 'Frequently Asked Questions'}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                    />
                </div>

                <div className="border-t border-zinc-200/60 pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">Accordion Rows</label>
                        <button
                            onClick={() => onAddBlock(section.sectionId || section._id, 'accordion-row')}
                            className="text-[8px] bg-[#008060] text-white px-2 py-0.5 rounded font-black uppercase"
                        >
                            + Add Row
                        </button>
                    </div>

                    <div className="space-y-3">
                        {blocks.map((block, idx) => (
                            <div key={block.blockId || idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl relative space-y-2">
                                <button
                                    onClick={() => onRemoveBlock(section.sectionId || section._id, block.blockId)}
                                    className="absolute top-2 right-2 text-xs text-zinc-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Question / Title</label>
                                    <input 
                                        type="text"
                                        value={block.settings?.title || block.settings?.question || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'title', e.target.value)}
                                        className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Answer / Content Details</label>
                                    <textarea 
                                        value={block.settings?.content || block.settings?.answer || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'content', e.target.value)}
                                        rows={2}
                                        className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTestimonialsSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Section Header Title</label>
                    <input 
                        type="text"
                        value={settings.title || 'What Our Customers Say'}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                    />
                </div>

                <div className="border-t border-zinc-200/60 pt-3">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase">Testimonials</label>
                        <button
                            onClick={() => onAddBlock(section.sectionId || section._id, 'testimonial')}
                            className="text-[8px] bg-[#008060] text-white px-2 py-0.5 rounded font-black uppercase"
                        >
                            + Add Review
                        </button>
                    </div>

                    <div className="space-y-3">
                        {blocks.map((block, idx) => (
                            <div key={block.blockId || idx} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl relative space-y-2">
                                <button
                                    onClick={() => onRemoveBlock(section.sectionId || section._id, block.blockId)}
                                    className="absolute top-2 right-2 text-xs text-zinc-400 hover:text-red-500"
                                >
                                    ✕
                                </button>
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Author Name</label>
                                    <input 
                                        type="text"
                                        value={block.settings?.author || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'author', e.target.value)}
                                        className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-500 uppercase mb-0.5">Testimonial Review text</label>
                                    <textarea 
                                        value={block.settings?.text || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'text', e.target.value)}
                                        rows={2}
                                        className="w-full px-2.5 py-1 border border-zinc-250 rounded text-xs font-semibold"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderCountdownSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Headline Title</label>
                    <input 
                        type="text"
                        value={settings.title || 'Flash Sale Ends In!'}
                        onChange={(e) => handleSettingChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Target End Date-Time</label>
                    <input 
                        type="datetime-local"
                        value={settings.targetDate || ''}
                        onChange={(e) => handleSettingChange('targetDate', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                    />
                </div>
            </div>
        );
    };

    const renderSpacerSettings = () => {
        return (
            <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Spacer Height (px)</label>
                <div className="flex gap-3 items-center">
                    <input 
                        type="range"
                        min="10"
                        max="160"
                        step="5"
                        value={settings.height || 40}
                        onChange={(e) => handleSettingChange('height', parseInt(e.target.value))}
                        className="flex-1 accent-[#008060]"
                    />
                    <span className="text-xs font-black text-zinc-500">{settings.height || 40}px</span>
                </div>
            </div>
        );
    };

    const renderAdvancedCommerceSettings = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Section title</label>
                <input
                    type="text"
                    value={settings.title || ''}
                    onChange={(event) => handleSettingChange('title', event.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
            </div>
            <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Supporting text</label>
                <textarea
                    value={settings.subtitle || ''}
                    onChange={(event) => handleSettingChange('subtitle', event.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none resize-none"
                />
            </div>
            {type === 'lookbook' && (
                <ImageUploadField value={settings.imageUrl || ''} onChange={(value) => handleSettingChange('imageUrl', value)} label="Lookbook Image" />
            )}
            {type === 'before-after' && (
                <>
                    <ImageUploadField value={settings.beforeImage || ''} onChange={(value) => handleSettingChange('beforeImage', value)} label="Before Image" />
                    <ImageUploadField value={settings.afterImage || ''} onChange={(value) => handleSettingChange('afterImage', value)} label="After Image" />
                </>
            )}
            {type === 'shoppable-video' && (
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">MP4 video URL</label>
                    <input
                        type="url"
                        value={settings.videoUrl || ''}
                        onChange={(event) => handleSettingChange('videoUrl', event.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                </div>
            )}
            <p className="text-[10px] leading-relaxed text-zinc-400">
                Product hotspots, chapters and attached products can be reordered as section blocks.
            </p>
        </div>
    );

    const renderBlockSubSettings = () => {
        if (blocks.length === 0) return null;
        return (
            <div className="border-t border-zinc-200 pt-4 mt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Blocks List</h5>
                    <button
                        onClick={() => onAddBlock(section.sectionId || section._id, 'button')}
                        className="text-[8px] text-[#008060] font-black hover:underline"
                    >
                        + Add Block Item
                    </button>
                </div>
                <div className="space-y-3">
                    {blocks.map((block, index) => (
                        <div key={block.blockId || index} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl relative space-y-2">
                            <div className="flex justify-between">
                                <span className="text-[9px] font-black text-[#008060] uppercase">{block.type}</span>
                                <button
                                    onClick={() => onRemoveBlock(section.sectionId || section._id, block.blockId)}
                                    className="text-[9px] text-red-500 font-bold hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                            {block.type === 'heading' || block.type === 'subheading' ? (
                                <input 
                                    type="text"
                                    value={block.settings?.text || ''}
                                    onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'text', e.target.value)}
                                    placeholder="Enter content text..."
                                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs animate-none"
                                />
                            ) : block.type === 'button' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <input 
                                        type="text"
                                        value={block.settings?.label || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'label', e.target.value)}
                                        placeholder="Label"
                                        className="px-2.5 py-1.5 border border-zinc-200 rounded text-xs"
                                    />
                                    <input 
                                        type="text"
                                        value={block.settings?.link || ''}
                                        onChange={(e) => onUpdateBlock(section.sectionId || section._id, block.blockId, 'link', e.target.value)}
                                        placeholder="Link"
                                        className="px-2.5 py-1.5 border border-zinc-200 rounded text-xs"
                                    />
                                </div>
                            ) : null}

                            {/* Block style controls */}
                            <BlockStyleEditor 
                                blockType={block.type}
                                styleSettings={block.settings?.style || {}}
                                onChangeStyle={(styleKey, styleVal) => {
                                    const updatedStyle = {
                                        ...(block.settings?.style || {}),
                                        [styleKey]: styleVal
                                    };
                                    onUpdateBlock(section.sectionId || section._id, block.blockId, 'style', updatedStyle);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDynamicForm = () => {
        switch (type) {
            case 'heading':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Heading Text</label>
                            <input 
                                type="text"
                                value={settings.text || ''}
                                onChange={(e) => handleSettingChange('text', e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                        </div>
                        <BlockStyleEditor 
                            blockType="heading"
                            styleSettings={settings.style || {}}
                            onChangeStyle={(styleKey, styleVal) => {
                                handleSettingChange('style', {
                                    ...(settings.style || {}),
                                    [styleKey]: styleVal
                                });
                            }}
                        />
                    </div>
                );
            case 'paragraph':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Paragraph text</label>
                            <textarea 
                                value={settings.text || ''}
                                onChange={(e) => handleSettingChange('text', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                            />
                        </div>
                        <BlockStyleEditor 
                            blockType="paragraph"
                            styleSettings={settings.style || {}}
                            onChangeStyle={(styleKey, styleVal) => {
                                handleSettingChange('style', {
                                    ...(settings.style || {}),
                                    [styleKey]: styleVal
                                });
                            }}
                        />
                    </div>
                );
            case 'button':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Label Text</label>
                                <input 
                                    type="text"
                                    value={settings.label || ''}
                                    onChange={(e) => handleSettingChange('label', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-250 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Button Link</label>
                                <input 
                                    type="text"
                                    value={settings.link || ''}
                                    onChange={(e) => handleSettingChange('link', e.target.value)}
                                    className="w-full px-3 py-2 border border-zinc-250 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                            </div>
                        </div>
                        <BlockStyleEditor 
                            blockType="button"
                            styleSettings={settings.style || {}}
                            onChangeStyle={(styleKey, styleVal) => {
                                handleSettingChange('style', {
                                    ...(settings.style || {}),
                                    [styleKey]: styleVal
                                });
                            }}
                        />
                    </div>
                );
            case 'image':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Image</label>
                            <ImageUploadField 
                                value={settings.imageUrl || ''}
                                onChange={(val) => handleSettingChange('imageUrl', val)}
                                label="Upload Image"
                            />
                        </div>
                        <BlockStyleEditor 
                            blockType="image"
                            styleSettings={settings.style || {}}
                            onChangeStyle={(styleKey, styleVal) => {
                                handleSettingChange('style', {
                                    ...(settings.style || {}),
                                    [styleKey]: styleVal
                                });
                            }}
                        />
                    </div>
                );
            case 'hero':
                return (
                    <>
                        {renderHeroSettings()}
                        {renderBlockSubSettings()}
                    </>
                );
            case 'features-grid':
                return renderFeaturesGridSettings();
            case 'image-banner':
            case 'video-banner':
                return renderImageBannerSettings();
            case 'featured-products':
            case 'product-slider':
            case 'best-sellers':
            case 'category-grid':
                return renderCatalogGridSettings();
            case 'rich-text':
                return renderTextSettings();
            case 'accordion':
            case 'faq':
                return renderAccordionFaqSettings();
            case 'testimonials':
                return renderTestimonialsSettings();
            case 'countdown':
                return renderCountdownSettings();
            case 'lookbook':
            case 'before-after':
            case 'storytelling':
            case 'shoppable-video':
                return renderAdvancedCommerceSettings();
            case 'spacer':
                return renderSpacerSettings();
            default:
                return (
                    <div className="text-zinc-500 text-xs py-4 text-center">
                        Simple configurable element. Customize inside theme editor layout.
                    </div>
                );
        }
    };

    if (!section.type) {
        return (
            <div className="h-full flex items-center justify-center p-6 text-center text-zinc-500">
                <div>
                    <span className="text-2xl">⚙️</span>
                    <p className="text-xs font-black uppercase text-zinc-400 mt-2">No Section Selected</p>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                        Click any section in the center canvas to customize its layout and settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border-l border-zinc-200">
            <div className="p-4 border-b border-zinc-150">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest capitalize">
                    {type.replace('-', ' ')} settings
                </h3>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">Configure layout, colors, and blocks for this element</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 storefront-scrollbar">
                {renderDynamicForm()}
            </div>
        </div>
    );
}
