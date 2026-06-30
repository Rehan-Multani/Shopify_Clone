import React from 'react';

export default function FooterBuilder({ footerConfig = {}, onChange }) {
    const handleFieldChange = (field, value) => {
        onChange({
            ...footerConfig,
            [field]: value
        });
    };

    const handleColumnChange = (index, field, value) => {
        const cols = [...(footerConfig.columns || [])];
        cols[index] = {
            ...cols[index],
            [field]: value
        };
        handleFieldChange('columns', cols);
    };

    const handleColumnLinkChange = (colIdx, linkIdx, field, value) => {
        const cols = [...(footerConfig.columns || [])];
        const links = [...(cols[colIdx].links || [])];
        links[linkIdx] = {
            ...links[linkIdx],
            [field]: value
        };
        cols[colIdx] = {
            ...cols[colIdx],
            links
        };
        handleFieldChange('columns', cols);
    };

    const addColumnLink = (colIdx) => {
        const cols = [...(footerConfig.columns || [])];
        const links = [...(cols[colIdx].links || [])];
        links.push({ label: 'New Footer Link', link: '#' });
        cols[colIdx] = {
            ...cols[colIdx],
            links
        };
        handleFieldChange('columns', cols);
    };

    const removeColumnLink = (colIdx, linkIdx) => {
        const cols = [...(footerConfig.columns || [])];
        const links = (cols[colIdx].links || []).filter((_, i) => i !== linkIdx);
        cols[colIdx] = {
            ...cols[colIdx],
            links
        };
        handleFieldChange('columns', cols);
    };

    const addColumn = () => {
        const cols = [...(footerConfig.columns || [])];
        cols.push({
            title: 'New Column',
            type: 'links',
            links: [{ label: 'Example Link', link: '#' }]
        });
        handleFieldChange('columns', cols);
    };

    const removeColumn = (index) => {
        const cols = (footerConfig.columns || []).filter((_, i) => i !== index);
        handleFieldChange('columns', cols);
    };

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5 mb-4">
                    General Footer Settings
                </h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-2">
                        <label className="text-xs font-bold text-zinc-700">Show Footer</label>
                        <input 
                            type="checkbox"
                            checked={footerConfig.enabled !== false}
                            onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                            className="w-4 h-4 text-[#008060] rounded focus:ring-0 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Copyright Text</label>
                        <input 
                            type="text"
                            value={footerConfig.copyrightText || ''}
                            onChange={(e) => handleFieldChange('copyrightText', e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={!!footerConfig.showPaymentIcons}
                                onChange={(e) => handleFieldChange('showPaymentIcons', e.target.checked)}
                                className="w-4 h-4 text-[#008060] rounded focus:ring-0"
                            />
                            Show Payment Provider Icons
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={!!footerConfig.showSocialIcons}
                                onChange={(e) => handleFieldChange('showSocialIcons', e.target.checked)}
                                className="w-4 h-4 text-[#008060] rounded focus:ring-0"
                            />
                            Show Social Network Icons
                        </label>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center border-b pb-1.5 mb-3">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                        Footer Columns
                    </h4>
                    <button
                        onClick={addColumn}
                        className="text-[9px] bg-[#008060] hover:bg-[#006e52] text-white px-2 py-0.5 rounded font-black uppercase tracking-wider"
                    >
                        + Add Column
                    </button>
                </div>

                <div className="space-y-4">
                    {(footerConfig.columns || []).map((col, cIdx) => (
                        <div key={cIdx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl relative space-y-3">
                            <button
                                onClick={() => removeColumn(cIdx)}
                                className="absolute top-2 right-2 text-xs text-zinc-400 hover:text-red-500 font-bold"
                                title="Remove Column"
                            >
                                ✕
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-450 uppercase mb-0.5">Column Header</label>
                                    <input 
                                        type="text"
                                        value={col.title || ''}
                                        onChange={(e) => handleColumnChange(cIdx, 'title', e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-zinc-450 uppercase mb-0.5">Content Type</label>
                                    <select 
                                        value={col.type || 'links'}
                                        onChange={(e) => handleColumnChange(cIdx, 'type', e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none bg-white"
                                    >
                                        <option value="links">Links Group</option>
                                        <option value="newsletter">Newsletter Form</option>
                                    </select>
                                </div>
                            </div>

                            {col.type === 'links' ? (
                                <div className="space-y-2 border-t border-zinc-200/60 pt-2.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black text-zinc-450 uppercase">Links List</label>
                                        <button
                                            onClick={() => addColumnLink(cIdx)}
                                            className="text-[8px] text-[#008060] font-black hover:underline"
                                        >
                                            + Add Link item
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(col.links || []).map((link, lIdx) => (
                                            <div key={lIdx} className="flex gap-2 items-center relative">
                                                <input 
                                                    type="text"
                                                    value={link.label || ''}
                                                    onChange={(e) => handleColumnLinkChange(cIdx, lIdx, 'label', e.target.value)}
                                                    placeholder="Label"
                                                    className="flex-1 px-2.5 py-1 border border-zinc-200 rounded text-xs font-semibold"
                                                />
                                                <input 
                                                    type="text"
                                                    value={link.link || ''}
                                                    onChange={(e) => handleColumnLinkChange(cIdx, lIdx, 'link', e.target.value)}
                                                    placeholder="URL"
                                                    className="flex-1 px-2.5 py-1 border border-zinc-200 rounded text-xs font-semibold"
                                                />
                                                <button
                                                    onClick={() => removeColumnLink(cIdx, lIdx)}
                                                    className="text-[10px] text-zinc-400 hover:text-red-500 font-bold px-1"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 border-t border-zinc-200/60 pt-2.5">
                                    <label className="block text-[9px] font-bold text-zinc-450 uppercase">Newsletter Subtitle Text</label>
                                    <textarea 
                                        value={col.text || ''}
                                        onChange={(e) => handleColumnChange(cIdx, 'text', e.target.value)}
                                        rows={2}
                                        className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
