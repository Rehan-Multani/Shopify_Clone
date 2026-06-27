import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeRenderer from '../storefront/ThemeRenderer';
import SectionRenderer from '../storefront/SectionRenderer';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const FONTS = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Outfit', value: 'Outfit, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" }
];

const BORDERS = [
    { name: 'None', value: '0px' },
    { name: 'Small', value: '4px' },
    { name: 'Medium', value: '8px' },
    { name: 'Large', value: '12px' },
    { name: 'Extra Large', value: '20px' }
];

const SECTION_TEMPLATES = [
    {
        type: 'hero',
        label: 'Hero Banner',
        settings: { backgroundImage: '' },
        blocks: [
            { type: 'heading', settings: { text: 'Premium Summer Drop' } },
            { type: 'subheading', settings: { text: 'Explore our hand-crafted, high-comfort essential pieces.' } },
            { type: 'button', settings: { label: 'Shop Drop', link: '/products' } }
        ]
    },
    {
        type: 'categories',
        label: 'Category Grid',
        settings: { title: 'Discover Collections', columns: 4 },
        blocks: []
    },
    {
        type: 'featured-products',
        label: 'Featured Products',
        settings: { title: 'Must Haves', limit: 4 },
        blocks: []
    },
    {
        type: 'testimonials',
        label: 'Testimonials',
        settings: { title: 'What They Say' },
        blocks: [
            { type: 'testimonial', settings: { author: 'Sarah K.', text: 'Best customer service and quality.' } }
        ]
    },
    {
        type: 'banners',
        label: 'Promotional Banners',
        settings: { title: 'Promotional Banners', height: '300px' },
        blocks: []
    },
    {
        type: 'newsletter',
        label: 'Newsletter Sign Up',
        settings: { title: 'Join the Club', subtitle: 'Receive exclusive launch details and promotions.' },
        blocks: []
    }
];

const SortableSectionItem = ({
    sec,
    idx,
    selectedSectionId,
    setSelectedSectionId,
    moveSection,
    toggleSectionVisibility,
    removeSection,
    pageSectionsLength
}) => {
    const uniqueId = sec.sectionId || sec._id || `section-${idx}`;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: uniqueId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div 
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group cursor-pointer select-none
                ${isDragging ? 'opacity-40 border-dashed border-gray-300 bg-gray-50 scale-95 z-50 shadow-lg' : 'bg-gray-50 hover:bg-gray-100/80 border-gray-150'}
            `}
            onClick={() => setSelectedSectionId(sec.sectionId || sec._id)}
        >
            <div className="flex items-center gap-3">
                <span 
                    className="text-[14px] font-black text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-700 select-none px-1"
                    title="Drag to reorder"
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                >
                    ☰
                </span>
                <span className="text-xs font-bold text-gray-700 capitalize">{sec.type}</span>
                {!sec.enabled && (
                    <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Hidden</span>
                )}
            </div>
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                <button 
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(idx, -1)}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="Move Up"
                >
                    ▲
                </button>
                <button 
                    type="button"
                    disabled={idx === pageSectionsLength - 1}
                    onClick={() => moveSection(idx, 1)}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="Move Down"
                >
                    ▼
                </button>
                <button 
                    type="button"
                    onClick={() => toggleSectionVisibility(sec.sectionId || sec._id)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                    title="Toggle Visibility"
                >
                    👁️
                </button>
                <button 
                    type="button"
                    onClick={() => removeSection(sec.sectionId || sec._id)}
                    className="p-1 hover:bg-red-50 rounded text-red-500"
                    title="Delete Section"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

const ThemeCustomizer = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'settings'
    
    // Theme-wide settings
    const [themeSettings, setThemeSettings] = useState({
        themeName: 'Dawn',
        primaryColor: '#121212',
        secondaryColor: '#ffffff',
        accentColor: '#334155',
        fontFamily: 'Inter',
        borderRadius: '8px',
        headerStyle: 'style1',
        footerStyle: 'style1',
        productCardStyle: 'style1',
        logo: '',
        favicon: ''
    });

    // Home Page sections (from store-pages/home)
    const [pageSections, setPageSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        
        if (active.id !== over.id) {
            setPageSections((items) => {
                const oldIndex = items.findIndex((item) => (item.sectionId || item._id) === active.id);
                const newIndex = items.findIndex((item) => (item.sectionId || item._id) === over.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                    return arrayMove(items, oldIndex, newIndex);
                }
                return items;
            });
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!storeId) {
                    showToast('Store ID is missing.', 'error');
                    setLoading(false);
                    return;
                }
                
                // Fetch Theme settings
                const themeRes = await fetch(`${STORE_API_URL}/themes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                });
                const themeData = await themeRes.json();
                if (themeRes.ok && themeData.success && themeData.theme) {
                    setThemeSettings(themeData.theme);
                }

                // Fetch Home page sections
                const pageRes = await fetch(`${STORE_API_URL}/store-pages/home`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                });
                const pageData = await pageRes.json();
                if (pageRes.ok && pageData.success && pageData.page) {
                    // Sort by order field
                    const sorted = (pageData.page.sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
                    setPageSections(sorted);
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
                showToast('Failed to load customizer data.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [storeId, token]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save Theme
            const themeRes = await fetch(`${STORE_API_URL}/themes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify(themeSettings)
            });

            // Save Page sections
            const pageRes = await fetch(`${STORE_API_URL}/store-pages/home/sections`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({
                    sections: pageSections.map((sec, idx) => ({ ...sec, order: idx + 1 }))
                })
            });

            if (themeRes.ok && pageRes.ok) {
                showToast('All customizer changes saved successfully!', 'success');
            } else {
                showToast('Failed to save some configurations.', 'error');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            showToast('Failed to save configurations.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Reorder sections
    const moveSection = (index, direction) => {
        const newSections = [...pageSections];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        
        // Swap
        const temp = newSections[index];
        newSections[index] = newSections[targetIndex];
        newSections[targetIndex] = temp;
        setPageSections(newSections);
    };

    // Add Section
    const addSection = (template) => {
        const newSec = {
            sectionId: Math.random().toString(36).substr(2, 9),
            type: template.type,
            enabled: true,
            settings: { ...template.settings },
            blocks: template.blocks ? template.blocks.map(b => ({ ...b, blockId: Math.random().toString(36).substr(2, 9) })) : [],
            order: pageSections.length + 1
        };
        setPageSections([...pageSections, newSec]);
        setSelectedSectionId(newSec.sectionId);
    };

    // Remove Section
    const removeSection = (id) => {
        setPageSections(pageSections.filter(s => s.sectionId !== id && s._id !== id));
        if (selectedSectionId === id) setSelectedSectionId(null);
    };

    // Edit settings helper
    const handleThemeSettingChange = (key, val) => {
        setThemeSettings(prev => ({ ...prev, [key]: val }));
    };

    const updateSectionSetting = (secId, key, val) => {
        setPageSections(prev => prev.map(sec => {
            if (sec.sectionId === secId || sec._id === secId) {
                return {
                    ...sec,
                    settings: { ...sec.settings, [key]: val }
                };
            }
            return sec;
        }));
    };

    const toggleSectionVisibility = (secId) => {
        setPageSections(prev => prev.map(sec => {
            if (sec.sectionId === secId || sec._id === secId) {
                return { ...sec, enabled: !sec.enabled };
            }
            return sec;
        }));
    };

    // Add Block
    const addBlock = (secId, type) => {
        const defaultSettings = type === 'heading' ? { text: 'New Heading' } 
                             : type === 'subheading' ? { text: 'New Subheading details' }
                             : type === 'button' ? { label: 'Click Here', link: '#' }
                             : type === 'testimonial' ? { author: 'Customer', text: 'Love this store!' } : {};
        const newBlock = {
            blockId: Math.random().toString(36).substr(2, 9),
            type,
            settings: defaultSettings
        };
        setPageSections(prev => prev.map(sec => {
            if (sec.sectionId === secId || sec._id === secId) {
                return {
                    ...sec,
                    blocks: [...(sec.blocks || []), newBlock]
                };
            }
            return sec;
        }));
    };

    // Edit Block settings
    const updateBlockSetting = (secId, blockId, key, val) => {
        setPageSections(prev => prev.map(sec => {
            if (sec.sectionId === secId || sec._id === secId) {
                return {
                    ...sec,
                    blocks: sec.blocks.map(b => b.blockId === blockId ? { ...b, settings: { ...b.settings, [key]: val } } : b)
                };
            }
            return sec;
        }));
    };

    // Remove Block
    const removeBlock = (secId, blockId) => {
        setPageSections(prev => prev.map(sec => {
            if (sec.sectionId === secId || sec._id === secId) {
                return {
                    ...sec,
                    blocks: sec.blocks.filter(b => b.blockId !== blockId)
                };
            }
            return sec;
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const currentSelectedSection = pageSections.find(s => s.sectionId === selectedSectionId || s._id === selectedSectionId);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/dashboard/online-store')}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-[#202223] shadow-sm"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-[#202223] tracking-tight">Theme Editor</h1>
                        <p className="text-xs text-gray-500 font-medium">Customizing <strong className="text-emerald-700">{themeSettings.themeName}</strong> theme layout</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#008060] hover:bg-[#006e52] text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Save Theme'}
                    </button>
                </div>
            </div>

            {/* Customizer Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Control Panel (Left Side) */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Navigation tabs */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-1.5 flex gap-2 shadow-sm">
                        <button
                            onClick={() => { setActiveTab('sections'); setSelectedSectionId(null); }}
                            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'sections' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Sections
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                activeTab === 'settings' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Theme Settings
                        </button>
                    </div>

                    {activeTab === 'sections' && !currentSelectedSection && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
                            <div className="flex justify-between items-center border-b pb-3">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Page Sections</h3>
                            </div>
                            
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={pageSections.map(sec => sec.sectionId || sec._id || '')}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {pageSections.map((sec, idx) => (
                                            <SortableSectionItem
                                                key={sec.sectionId || sec._id || idx}
                                                sec={sec}
                                                idx={idx}
                                                selectedSectionId={selectedSectionId}
                                                setSelectedSectionId={setSelectedSectionId}
                                                moveSection={moveSection}
                                                toggleSectionVisibility={toggleSectionVisibility}
                                                removeSection={removeSection}
                                                pageSectionsLength={pageSections.length}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            <div className="border-t pt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Add Section</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SECTION_TEMPLATES.map(template => (
                                        <button
                                            key={template.type}
                                            onClick={() => addSection(template)}
                                            className="p-2.5 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-gray-200 rounded-xl text-[10px] font-black text-gray-700 uppercase tracking-wider text-center transition-all"
                                        >
                                            + {template.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sections' && currentSelectedSection && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm animate-in slide-in-from-right duration-200">
                            {/* Back to section list */}
                            <div className="flex items-center justify-between border-b pb-3">
                                <button 
                                    onClick={() => setSelectedSectionId(null)}
                                    className="text-xs font-black text-emerald-700 hover:underline flex items-center gap-1"
                                >
                                    ← Back to sections
                                </button>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{currentSelectedSection.type} Settings</span>
                            </div>

                            {/* Section Settings editing */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Section configuration</h4>
                                {currentSelectedSection.type === 'hero' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Background Image URL</label>
                                        <input 
                                            type="text" 
                                            placeholder="https://example.com/banner.jpg"
                                            value={currentSelectedSection.settings.backgroundImage || ''}
                                            onChange={(e) => updateSectionSetting(currentSelectedSection.sectionId || currentSelectedSection._id, 'backgroundImage', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                )}
                                {currentSelectedSection.type === 'categories' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Section Title</label>
                                            <input 
                                                type="text" 
                                                value={currentSelectedSection.settings.title || ''}
                                                onChange={(e) => updateSectionSetting(currentSelectedSection.sectionId || currentSelectedSection._id, 'title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Grid Columns</label>
                                            <select 
                                                value={currentSelectedSection.settings.columns || 4}
                                                onChange={(e) => updateSectionSetting(currentSelectedSection.sectionId || currentSelectedSection._id, 'columns', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <option value={2}>2 Columns</option>
                                                <option value={3}>3 Columns</option>
                                                <option value={4}>4 Columns</option>
                                                <option value={6}>6 Columns</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {currentSelectedSection.type === 'featured-products' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Section Title</label>
                                            <input 
                                                type="text" 
                                                value={currentSelectedSection.settings.title || ''}
                                                onChange={(e) => updateSectionSetting(currentSelectedSection.sectionId || currentSelectedSection._id, 'title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Products Limit</label>
                                            <input 
                                                type="number" 
                                                value={currentSelectedSection.settings.limit || 8}
                                                onChange={(e) => updateSectionSetting(currentSelectedSection.sectionId || currentSelectedSection._id, 'limit', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </>
                                )}
                                {currentSelectedSection.type === 'testimonials' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Section Title</label>
                                        <input 
                                            type="text" 
                                            value={currentSelectedSection.settings.title || ''}
                                            onChange={(e) => updateSectionSetting(currentSelectedSection.sectionId || currentSelectedSection._id, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Section Blocks editing */}
                            <div className="border-t pt-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Blocks</h4>
                                    {currentSelectedSection.type === 'hero' && (
                                        <div className="flex gap-1.5">
                                            <button 
                                                onClick={() => addBlock(currentSelectedSection.sectionId || currentSelectedSection._id, 'heading')}
                                                className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-black uppercase"
                                            >
                                                + Heading
                                            </button>
                                            <button 
                                                onClick={() => addBlock(currentSelectedSection.sectionId || currentSelectedSection._id, 'subheading')}
                                                className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-black uppercase"
                                            >
                                                + Text
                                            </button>
                                            <button 
                                                onClick={() => addBlock(currentSelectedSection.sectionId || currentSelectedSection._id, 'button')}
                                                className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-black uppercase"
                                            >
                                                + Button
                                            </button>
                                        </div>
                                    )}
                                    {currentSelectedSection.type === 'testimonials' && (
                                        <button 
                                            onClick={() => addBlock(currentSelectedSection.sectionId || currentSelectedSection._id, 'testimonial')}
                                            className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-black uppercase"
                                        >
                                            + Add Testimonial
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {(currentSelectedSection.blocks || []).map((block, bIdx) => (
                                        <div key={block.blockId || bIdx} className="p-3 bg-gray-50 rounded-xl border border-gray-150 space-y-2 relative group/block">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-black uppercase tracking-wider">{block.type}</span>
                                                <button
                                                    onClick={() => removeBlock(currentSelectedSection.sectionId || currentSelectedSection._id, block.blockId)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-black"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {block.type === 'heading' && (
                                                <input 
                                                    type="text" 
                                                    value={block.settings?.text || ''}
                                                    placeholder="Heading text"
                                                    onChange={(e) => updateBlockSetting(currentSelectedSection.sectionId || currentSelectedSection._id, block.blockId, 'text', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            )}

                                            {block.type === 'subheading' && (
                                                <textarea 
                                                    value={block.settings?.text || ''}
                                                    placeholder="Subheading details"
                                                    rows={2}
                                                    onChange={(e) => updateBlockSetting(currentSelectedSection.sectionId || currentSelectedSection._id, block.blockId, 'text', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                            )}

                                            {block.type === 'button' && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={block.settings?.label || ''}
                                                        placeholder="Button label"
                                                        onChange={(e) => updateBlockSetting(currentSelectedSection.sectionId || currentSelectedSection._id, block.blockId, 'label', e.target.value)}
                                                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={block.settings?.link || ''}
                                                        placeholder="Button link"
                                                        onChange={(e) => updateBlockSetting(currentSelectedSection.sectionId || currentSelectedSection._id, block.blockId, 'link', e.target.value)}
                                                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                </div>
                                            )}

                                            {block.type === 'testimonial' && (
                                                <div className="space-y-2">
                                                    <textarea 
                                                        value={block.settings?.text || ''}
                                                        placeholder="Testimonial text"
                                                        rows={2}
                                                        onChange={(e) => updateBlockSetting(currentSelectedSection.sectionId || currentSelectedSection._id, block.blockId, 'text', e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={block.settings?.author || ''}
                                                        placeholder="Author name"
                                                        onChange={(e) => updateBlockSetting(currentSelectedSection.sectionId || currentSelectedSection._id, block.blockId, 'author', e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            {/* Color Palette */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Color Palette</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Primary Color</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-10 rounded-xl overflow-hidden border border-gray-300">
                                                <input 
                                                    type="color" 
                                                    value={themeSettings.primaryColor} 
                                                    onChange={(e) => handleThemeSettingChange('primaryColor', e.target.value)}
                                                    className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer"
                                                />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={themeSettings.primaryColor} 
                                                onChange={(e) => handleThemeSettingChange('primaryColor', e.target.value)}
                                                className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Secondary Color</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-10 rounded-xl overflow-hidden border border-gray-300">
                                                <input 
                                                    type="color" 
                                                    value={themeSettings.secondaryColor} 
                                                    onChange={(e) => handleThemeSettingChange('secondaryColor', e.target.value)}
                                                    className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer"
                                                />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={themeSettings.secondaryColor} 
                                                onChange={(e) => handleThemeSettingChange('secondaryColor', e.target.value)}
                                                className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Accent Color</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-10 rounded-xl overflow-hidden border border-gray-300">
                                                <input 
                                                    type="color" 
                                                    value={themeSettings.accentColor} 
                                                    onChange={(e) => handleThemeSettingChange('accentColor', e.target.value)}
                                                    className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer"
                                                />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={themeSettings.accentColor} 
                                                onChange={(e) => handleThemeSettingChange('accentColor', e.target.value)}
                                                className="flex-grow px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo Customization */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Logo Customization</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Logo Shape</label>
                                        <select 
                                            value={themeSettings.logoShape || 'rounded'} 
                                            onChange={(e) => handleThemeSettingChange('logoShape', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        >
                                            <option value="rounded">Rounded Corners (Default)</option>
                                            <option value="circle">Circular / Round Logo</option>
                                            <option value="square">Square / Sharp Logo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Logo Size</label>
                                        <select 
                                            value={themeSettings.logoSize || 'medium'} 
                                            onChange={(e) => handleThemeSettingChange('logoSize', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        >
                                            <option value="small">Small (36px)</option>
                                            <option value="medium">Medium (56px)</option>
                                            <option value="large">Large (76px)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Typography & Layout */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Typography & Borders</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Font Family</label>
                                        <select 
                                            value={themeSettings.fontFamily} 
                                            onChange={(e) => handleThemeSettingChange('fontFamily', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {FONTS.map(f => (
                                                <option key={f.name} value={f.name}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Border Radius</label>
                                        <select 
                                            value={themeSettings.borderRadius} 
                                            onChange={(e) => handleThemeSettingChange('borderRadius', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {BORDERS.map(b => (
                                                <option key={b.value} value={b.value}>{b.name} ({b.value})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Templates Layout selection */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Template Layouts</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Header Layout</label>
                                        <select 
                                            value={themeSettings.headerStyle || 'style1'} 
                                            onChange={(e) => handleThemeSettingChange('headerStyle', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="style1">Dawn Default Header</option>
                                            <option value="style2">Centered Logo Minimal</option>
                                            <option value="style3">Full Width Large Search</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Footer Layout</label>
                                        <select 
                                            value={themeSettings.footerStyle || 'style1'} 
                                            onChange={(e) => handleThemeSettingChange('footerStyle', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="style1">Classic 3-Column</option>
                                            <option value="style2">Minimal Bar Footer</option>
                                            <option value="style3">Newsletter Form Dark Footer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Preview Panel (Right Side) */}
                <div className="xl:col-span-8 flex flex-col">
                    <div className="sticky top-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
                        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-600">Storefront Live Preview ({themeSettings.themeName})</span>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                        </div>
                        
                        {/* Interactive simulation viewport rendering dynamic sections */}
                        <div className="flex-grow overflow-y-auto bg-gray-50 p-6">
                            <ThemeRenderer themeSettings={themeSettings}>
                                <div className="bg-white min-h-full border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                                    {/* HEADER PREVIEW */}
                                    {themeSettings.headerStyle === 'style3' ? (
                                        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                                            <span className="font-black tracking-widest text-sm uppercase">MY STORE</span>
                                            <div className="flex gap-4 text-xs font-semibold">
                                                <span>Catalog</span>
                                                <span>Search</span>
                                            </div>
                                        </div>
                                    ) : themeSettings.headerStyle === 'style2' ? (
                                        <div className="border-b border-gray-100 px-6 py-3 flex flex-col items-center gap-1 bg-white">
                                            <span className="font-black text-md tracking-wider">MY STORE</span>
                                            <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase">
                                                <span>Home</span>
                                                <span>Catalog</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
                                            <span className="font-black text-md tracking-wide" style={{ color: 'var(--color-primary)' }}>MY STORE</span>
                                            <div className="flex gap-4 text-xs font-bold text-gray-500 uppercase">
                                                <span>Home</span>
                                                <span>Catalog</span>
                                                <span>About</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* MAIN CONTENT PREVIEW USING SectionRenderer */}
                                    <div className="flex-grow">
                                        {pageSections.map((sec, idx) => (
                                            <div 
                                                key={sec.sectionId || sec._id || idx}
                                                className={`relative group/preview ${
                                                    selectedSectionId === (sec.sectionId || sec._id) 
                                                    ? 'ring-2 ring-emerald-500 ring-offset-2' 
                                                    : 'hover:outline hover:outline-2 hover:outline-emerald-300 hover:outline-offset-1'
                                                }`}
                                                onClick={() => setSelectedSectionId(sec.sectionId || sec._id)}
                                            >
                                                <div className="absolute top-2 right-2 z-20 opacity-0 group-hover/preview:opacity-100 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider select-none cursor-pointer">
                                                    Edit Section
                                                </div>
                                                <SectionRenderer section={sec} />
                                            </div>
                                        ))}
                                        
                                        {pageSections.length === 0 && (
                                            <div className="p-16 text-center text-gray-400 font-bold text-sm">
                                                No sections on page. Click "+ Section" on the left to add one!
                                            </div>
                                        )}
                                    </div>

                                    {/* FOOTER PREVIEW */}
                                    {themeSettings.footerStyle === 'style3' ? (
                                        <div className="bg-gray-950 text-white p-6 text-center space-y-4 mt-auto">
                                            <h4 className="text-xs font-bold">JOIN THE CLUB</h4>
                                            <div className="flex max-w-xs mx-auto gap-2">
                                                <input type="text" placeholder="email" className="bg-white/10 text-white border-0 text-[10px] px-3 py-1 rounded w-full" disabled />
                                                <button className="bg-white text-black px-3 py-1 rounded text-[10px] font-bold">Join</button>
                                            </div>
                                        </div>
                                    ) : themeSettings.footerStyle === 'style2' ? (
                                        <div className="bg-white border-t border-gray-100 p-4 flex justify-between items-center text-[10px] text-gray-400 mt-auto">
                                            <span>© 2026 My Store.</span>
                                            <span>Privacy Policy</span>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border-t border-gray-100 p-6 grid grid-cols-2 gap-4 text-[10px] text-gray-500 mt-auto">
                                            <div className="space-y-1">
                                                <h5 className="font-bold text-gray-800">Store About</h5>
                                                <p>Premium online vendor.</p>
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="font-bold text-gray-800">Support</h5>
                                                <p>help@mystore.com</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ThemeRenderer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white font-bold text-sm
                        ${toast.type === 'success' ? 'bg-[#008060]' : 'bg-red-600'}`}
                    >
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        )}
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeCustomizer;
