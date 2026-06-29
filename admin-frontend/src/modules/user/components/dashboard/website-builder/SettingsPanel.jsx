import React from 'react';

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
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Background Image URL</label>
                    <input 
                        type="text"
                        placeholder="https://example.com/hero.jpg"
                        value={settings.backgroundImage || ''}
                        onChange={(e) => handleSettingChange('backgroundImage', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                    />
                </div>
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
            </div>
        );
    };

    const renderImageBannerSettings = () => {
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Banner Image URL</label>
                    <input 
                        type="text"
                        placeholder="https://example.com/banner.jpg"
                        value={settings.imageUrl || ''}
                        onChange={(e) => handleSettingChange('imageUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
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
                                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded text-xs"
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
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDynamicForm = () => {
        switch (type) {
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
