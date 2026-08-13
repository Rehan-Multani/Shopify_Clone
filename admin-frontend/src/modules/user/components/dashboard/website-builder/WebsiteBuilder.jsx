import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ComponentLibrary from './ComponentLibrary';
import SectionTree from './SectionTree';
import BuilderCanvas from './BuilderCanvas';
import SettingsPanel from './SettingsPanel';
import HeaderBuilder from './HeaderBuilder';
import FooterBuilder from './FooterBuilder';
import ThemeSettingsPanel from './ThemeSettingsPanel';
import CompatibilityAssistant from './CompatibilityAssistant';
import useBuilderHistory from './useBuilderHistory';
import SectionRenderer from '../../storefront/SectionRenderer';
import { getSectionSchema, getSchemaDefaults } from '../../storefront/themeEngine/sectionSchemas';
import { FEATURE_FLAGS } from './featureFlags';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;
const AUTOSAVE_ENABLED = FEATURE_FLAGS.THEME_BUILDER_AUTOSAVE;
const AUTOSAVE_MS = 1500;

const formatText = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.split(/<br\s*\/?>/gi).map((part, index, array) => (
        <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && <br />}
        </React.Fragment>
    ));
};

export default function WebsiteBuilder() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('merchantToken');
    const storeId = localStorage.getItem('activeStoreId') || '';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'unsaved' | 'saving'
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // Core Layout States
    const [activeTab, setActiveTab] = useState('sections'); // 'library' | 'sections' | 'header' | 'footer' | 'settings' | 'page-seo'
    const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [pageSlug, setPageSlug] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mobileSheet, setMobileSheet] = useState(null); // null | 'sections' | 'settings'
    const [showCompat, setShowCompat] = useState(true);
    const [autosaveLabel, setAutosaveLabel] = useState(''); // Saving... | Saved | Offline | Retrying...

    // Store Pages and Theme States
    const [pages, setPages] = useState([]);
    const [activePage, setActivePage] = useState({ slug: 'home', title: 'Home Page', sections: [] });
    const [themeSettings, setThemeSettings] = useState({});
    const [schema, setSchema] = useState({ settings: [] });

    // Undo/Redo History Manager
    const {
        state: historyState,
        pushState,
        pushStateImmediate,
        undo,
        redo,
        resetHistory,
        canUndo,
        canRedo
    } = useBuilderHistory({ sections: [], themeSettings: {} });

    // Page Creator Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPageForm, setNewPageForm] = useState({ slug: '', title: '' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // 1. Fetch Pages and Theme on load
    const fetchData = useCallback(async (slugToLoad = pageSlug) => {
        try {
            if (!storeId) {
                showToast('Store ID is missing.', 'error');
                setLoading(false);
                return;
            }

            // Fetch theme settings
            const searchParams = new URLSearchParams(location.search);
            const themeId = searchParams.get('themeId') || '';
            const themeUrl = `${STORE_API_URL}/themes/settings?themeId=${themeId}`;

            const themeRes = await fetch(themeUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                }
            });
            const themeData = await themeRes.json();
            let loadedTheme = {};
            if (themeRes.ok && themeData.success && themeData.theme) {
                loadedTheme = themeData.theme.draftThemeSettings || themeData.theme.publishedThemeSettings || {};
                setThemeSettings(loadedTheme);
                if (themeData.schema) {
                    setSchema(themeData.schema);
                }
            }

            // Fetch page options
            const pagesUrl = themeId 
                ? `${STORE_API_URL}/store-pages?storeId=${storeId}&themeId=${themeId}`
                : `${STORE_API_URL}/store-pages?storeId=${storeId}`;
            const pagesRes = await fetch(pagesUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const pagesData = await pagesRes.json();
            if (pagesRes.ok && pagesData.success && pagesData.pages) {
                setPages(pagesData.pages);
                
                // Find or default current active page
                const current = pagesData.pages.find(p => p.slug === slugToLoad) || pagesData.pages.find(p => p.slug === 'home');
                if (current) {
                    const sortedSections = (current.sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
                    const sortedPage = { ...current, sections: sortedSections };
                    setActivePage(sortedPage);
                    setPageSlug(sortedPage.slug);
                    resetHistory({ sections: sortedSections, themeSettings: loadedTheme });
                }
            }
        } catch (err) {
            console.error('Error fetching builder data:', err);
            showToast('Failed to load builder data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [storeId, token, pageSlug, resetHistory]);

    useEffect(() => {
        fetchData();
    }, [storeId, token]);

    // Handle Undo/Redo keyboards shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    // Redo (Ctrl+Shift+Z)
                    const next = redo();
                    if (next) {
                        setActivePage(prev => ({ ...prev, sections: next.sections }));
                        setThemeSettings(next.themeSettings);
                        showToast('Redo successful', 'success');
                    }
                } else {
                    // Undo (Ctrl+Z)
                    const prev = undo();
                    if (prev) {
                        setActivePage(prevPage => ({ ...prevPage, sections: prev.sections }));
                        setThemeSettings(prev.themeSettings);
                        showToast('Undo successful', 'success');
                    }
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                const next = redo();
                if (next) {
                    setActivePage(prev => ({ ...prev, sections: next.sections }));
                    setThemeSettings(next.themeSettings);
                    showToast('Redo successful', 'success');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Structural edits (add/remove/reorder) commit immediately; setting keystrokes debounce.
    const updateActivePageSections = (newSections, { immediate = true } = {}) => {
        setActivePage(prev => ({ ...prev, sections: newSections }));
        if (immediate) pushStateImmediate(newSections, themeSettings);
        else pushState(newSections, themeSettings);
        setSaveStatus('unsaved');
    };

    // Theme settings: debounce unless structural nested replace wants immediate
    const updateThemeSettings = (newTheme) => {
        setThemeSettings(newTheme);
        pushState(activePage.sections, newTheme);
        setSaveStatus('unsaved');
    };

    // Warn on browser leave with unsaved changes
    useEffect(() => {
        const onBeforeUnload = (e) => {
            if (saveStatus === 'unsaved') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [saveStatus]);

    // Escape closes mobile sheet / selected settings focus trap affordance
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                if (mobileSheet) setMobileSheet(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mobileSheet]);

    // Optional autosave (draft only) — off by default
    useEffect(() => {
        if (!AUTOSAVE_ENABLED || saveStatus !== 'unsaved' || loading) return undefined;
        setAutosaveLabel('Saving...');
        const t = setTimeout(async () => {
            try {
                setSaveStatus('saving');
                const ok = await saveCurrentState();
                if (ok) {
                    setSaveStatus('saved');
                    setAutosaveLabel('Saved');
                } else {
                    setSaveStatus('unsaved');
                    setAutosaveLabel('Retrying...');
                }
            } catch {
                setSaveStatus('unsaved');
                setAutosaveLabel('Offline');
            }
        }, AUTOSAVE_MS);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [AUTOSAVE_ENABLED, saveStatus, activePage.sections, themeSettings, loading]);

    const confirmLeaveIfDirty = () => {
        if (saveStatus !== 'unsaved') return true;
        return window.confirm('You have unsaved changes. Leave without saving?');
    };

    const handleApplyRemap = ({ remapped, originalBackup }) => {
        setActivePage((prev) => {
            const nextSections = prev.sections.map((s) => {
                const id = s.sectionId || s._id;
                if (id === (originalBackup.sectionId || originalBackup._id)) {
                    // Keep original as disabled backup; insert remapped after
                    return { ...s, enabled: false, _preservedBackup: true };
                }
                return s;
            });
            const withRemap = [...nextSections, remapped];
            pushStateImmediate(withRemap, themeSettings);
            return { ...prev, sections: withRemap };
        });
        setSaveStatus('unsaved');
        setShowCompat(true);
        showToast('Remap created — original preserved (hidden). Review then save draft.');
    };

    // 2. Element palette add operations
    const handleAddComponent = (type, label) => {
        const schema = getSectionSchema(type);
        const schemaDefaults = schema ? getSchemaDefaults(schema) : {};
        const legacyDefaults = type === 'hero' ? { backgroundImage: '', textAlignment: 'center', overlayOpacity: 0.45, height: '480px' }
                              : type === 'image-banner' ? { imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', title: 'Summer Collection', subtitle: 'Grab the latest designs at 30% discount', buttonLabel: 'Shop Now', buttonLink: '#' }
                              : type === 'rich-text' ? { title: 'Our Brand Mission', content: 'We make top tier garments for comfort, active lifestyle, and everyday minimal elegance. All products are verified organic.', alignment: 'center' }
                              : type === 'spacer' ? { height: 40 }
                              : type === 'divider' ? { style: 'solid', color: '#e4e4e7', thickness: '1px' }
                              : type === 'countdown' ? { title: 'Season Finale Ends Soon!', targetDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16) }
                              : type === 'newsletter' ? { title: 'Subscribe to newsletter', subtitle: 'Get promotions and announcements', buttonLabel: 'Subscribe' }
                              : type === 'features-grid' ? { title: 'Why Choose Us', subtitle: 'We are committed to delivering premium care and comfort.' }
                              : type === 'lookbook' ? { title: 'Shop the Look', subtitle: 'Tap a hotspot to discover products.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600' }
                              : type === 'shoppable-video' ? { title: 'See it in motion', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-with-a-green-jacket-39875-large.mp4', autoplay: true, loop: true }
                              : type === 'before-after' ? { title: 'See the Transformation', beforeImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400', afterImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400' }
                              : type === 'storytelling' ? { eyebrow: 'Our Story', title: 'Made with intention.', subtitle: 'Follow the journey from first idea to finished product.' }
                              : type === 'heading' ? { text: 'New Heading Element', style: { tag: 'h2', fontSize: 28, color: '#18181b', fontWeight: '700', textAlign: 'center', marginTop: 10, marginBottom: 15 } }
                              : type === 'paragraph' ? { text: 'Write your text details here. This paragraph block is fully customizable with spacing, weight and color systems.', style: { fontSize: 14, color: '#3f3f46', fontWeight: '400', textAlign: 'left', lineHeight: '1.6', marginTop: 5, marginBottom: 10 } }
                              : type === 'button' ? { label: 'Click Me', link: '#', style: { backgroundColor: '#008060', textColor: '#ffffff', hoverBgColor: '#006e52', hoverTextColor: '#ffffff', borderRadius: '8px', paddingX: 20, paddingY: 10, fontSize: 13, shadow: 'sm', textAlign: 'center' } }
                              : type === 'image' ? { imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600', style: { width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px' } }
                              : { title: label };

        const defaultSettings = { ...schemaDefaults, ...legacyDefaults };

        const defaultBlocks = type === 'hero' ? [
            { blockId: Math.random().toString(36).substr(2, 9), type: 'heading', settings: { text: 'Premium Outerwear' } },
            { blockId: Math.random().toString(36).substr(2, 9), type: 'subheading', settings: { text: 'Elevated essentials designed for everyday performance and comfort.' } },
            { blockId: Math.random().toString(36).substr(2, 9), type: 'button', settings: { label: 'Shop Collection', link: '/catalog' } }
        ] : type === 'features-grid' ? [
            { blockId: Math.random().toString(36).substr(2, 9), type: 'feature', settings: { title: 'Free Shipping', text: 'Orders above ₹999 shipped free.', icon: 'truck' } },
            { blockId: Math.random().toString(36).substr(2, 9), type: 'feature', settings: { title: 'Easy Returns', text: '30-day hassle-free returns policy.', icon: 'rotate-ccw' } },
            { blockId: Math.random().toString(36).substr(2, 9), type: 'feature', settings: { title: 'Secure Payments', text: 'Your data is safe with SSL.', icon: 'shield-check' } }
        ] : type === 'lookbook' ? [
            { blockId: Math.random().toString(36).substr(2, 9), type: 'hotspot', settings: { x: 35, y: 35, label: 'Featured Style', price: 'Explore', link: '/catalog' } },
            { blockId: Math.random().toString(36).substr(2, 9), type: 'hotspot', settings: { x: 65, y: 70, label: 'Complete the Look', price: 'Shop now', link: '/catalog' } }
        ] : type === 'storytelling' ? [
            { blockId: Math.random().toString(36).substr(2, 9), type: 'chapter', settings: { eyebrow: '01 — Origin', title: 'How it started', text: 'A simple idea shaped by purpose.' } },
            { blockId: Math.random().toString(36).substr(2, 9), type: 'chapter', settings: { eyebrow: '02 — Process', title: 'How we make it', text: 'Thoughtful materials and trusted makers.' } },
            { blockId: Math.random().toString(36).substr(2, 9), type: 'chapter', settings: { eyebrow: '03 — Promise', title: 'Why it matters', text: 'Quality designed to last.' } }
        ] : type === 'shoppable-video' ? [
            { blockId: Math.random().toString(36).substr(2, 9), type: 'product', settings: { title: 'Shop the featured collection', price: 'Explore now', link: '/catalog' } }
        ] : [];

        const newSec = {
            sectionId: Math.random().toString(36).substr(2, 9),
            type,
            enabled: true,
            locked: false,
            settings: defaultSettings,
            blocks: defaultBlocks,
            order: activePage.sections.length + 1
        };

        updateActivePageSections([...activePage.sections, newSec]);
        setSelectedSectionId(newSec.sectionId);
        showToast(`Added ${label} section`);
    };

    // 3. Section Tree Operations
    const handleReorderSections = (reordered) => {
        const sorted = reordered.map((sec, idx) => ({ ...sec, order: idx + 1 }));
        updateActivePageSections(sorted);
    };

    // Helper to get section ID consistently
    const getSectionId = (s, idx) => s.sectionId || s._id || `sec-${idx}`;

    const handleRemoveSection = (id) => {
        setActivePage(prev => {
            const filtered = prev.sections.filter((s, idx) => getSectionId(s, idx) !== id);
            pushStateImmediate(filtered, themeSettings);
            return { ...prev, sections: filtered };
        });
        if (selectedSectionId === id) setSelectedSectionId(null);
        setSaveStatus('unsaved');
        showToast('Section removed');
    };

    const handleDuplicateSection = (id) => {
        setActivePage(prev => {
            const target = prev.sections.find((s, idx) => getSectionId(s, idx) === id);
            if (!target) return prev;

            const duplicated = {
                ...JSON.parse(JSON.stringify(target)),
                sectionId: Math.random().toString(36).substr(2, 9),
                _id: undefined,
                order: prev.sections.length + 1
            };

            const newSections = [...prev.sections, duplicated];
            pushStateImmediate(newSections, themeSettings);
            return { ...prev, sections: newSections };
        });
        setSaveStatus('unsaved');
        showToast('Section duplicated');
    };

    const handleToggleVisibility = (id) => {
        setActivePage(prev => {
            const updated = prev.sections.map((s, idx) => {
                if (getSectionId(s, idx) === id) {
                    return { ...s, enabled: !s.enabled };
                }
                return s;
            });
            pushStateImmediate(updated, themeSettings);
            return { ...prev, sections: updated };
        });
        setSaveStatus('unsaved');
    };

    const handleToggleLock = (id) => {
        setActivePage(prev => {
            const updated = prev.sections.map((s, idx) => {
                if (getSectionId(s, idx) === id) {
                    return { ...s, locked: !s.locked };
                }
                return s;
            });
            pushState(updated, themeSettings);
            return { ...prev, sections: updated };
        });
    };

    // 4. Element Specific Setting Updates
    const handleUpdateSectionSettings = (key, value) => {
        setActivePage(prev => {
            const updated = prev.sections.map((s, idx) => {
                if (getSectionId(s, idx) === selectedSectionId) {
                    if (s.locked) {
                        showToast('Section is locked. Unlock it to edit settings.', 'error');
                        return s;
                    }
                    return {
                        ...s,
                        settings: { ...s.settings, [key]: value }
                    };
                }
                return s;
            });
            pushState(updated, themeSettings);
            return { ...prev, sections: updated };
        });
        setSaveStatus('unsaved');
    };

    // Block-level updates (inside sections like hero)
    const handleAddBlock = (secId, blockType) => {
        const newBlock = {
            blockId: Math.random().toString(36).substr(2, 9),
            type: blockType,
            settings: blockType === 'testimonial' ? { author: 'Reviewer', text: 'Amazing product fit!' } 
                    : blockType === 'accordion-row' ? { question: 'New Question', answer: 'Answer content details.' }
                    : { text: 'New block item' }
        };

        setActivePage(prev => {
            const target = prev.sections.find((s, idx) => getSectionId(s, idx) === secId);
            if (!target || target.locked) return prev;

            const updated = prev.sections.map((s, idx) => {
                if (getSectionId(s, idx) === secId) {
                    return { ...s, blocks: [...(s.blocks || []), newBlock] };
                }
                return s;
            });
            pushState(updated, themeSettings);
            return { ...prev, sections: updated };
        });
        setSaveStatus('unsaved');
    };

    const handleUpdateBlockSetting = (secId, blockId, key, value) => {
        setActivePage(prev => {
            const updated = prev.sections.map((s, idx) => {
                if (getSectionId(s, idx) === secId) {
                    if (s.locked) return s;
                    return {
                        ...s,
                        blocks: (s.blocks || []).map(b => {
                            if (b.blockId === blockId) {
                                return { ...b, settings: { ...b.settings, [key]: value } };
                            }
                            return b;
                        })
                    };
                }
                return s;
            });
            pushState(updated, themeSettings);
            return { ...prev, sections: updated };
        });
        setSaveStatus('unsaved');
    };

    const handleRemoveBlock = (secId, blockId) => {
        setActivePage(prev => {
            const updated = prev.sections.map((s, idx) => {
                if (getSectionId(s, idx) === secId) {
                    if (s.locked) return s;
                    return {
                        ...s,
                        blocks: (s.blocks || []).filter(b => b.blockId !== blockId)
                    };
                }
                return s;
            });
            pushState(updated, themeSettings);
            return { ...prev, sections: updated };
        });
        setSaveStatus('unsaved');
    };

    // 5. Page Management & Creation
    const handlePageChange = (slug) => {
        if (!confirmLeaveIfDirty()) return;
        setPageSlug(slug);
        setSelectedSectionId(null);
        fetchData(slug);
        setSaveStatus('saved');
    };

    const handleCreatePageSubmit = async (e) => {
        e.preventDefault();
        if (!newPageForm.slug || !newPageForm.title) return;

        try {
            const searchParams = new URLSearchParams(location.search);
            const themeId = searchParams.get('themeId') || '';
            const pageCreateUrl = themeId 
                ? `${STORE_API_URL}/store-pages?themeId=${themeId}`
                : `${STORE_API_URL}/store-pages`;

            const res = await fetch(pageCreateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': storeId
                },
                body: JSON.stringify({
                    slug: newPageForm.slug.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-'),
                    title: newPageForm.title.trim(),
                    sections: [],
                    seo: {
                        metaTitle: newPageForm.title.trim(),
                        metaDescription: `Discover our ${newPageForm.title.trim()} page details.`
                    }
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                showToast('Custom page created successfully!');
                setIsCreateModalOpen(false);
                setNewPageForm({ slug: '', title: '' });
                // Reload pages list and switch to the new page
                handlePageChange(data.page.slug);
            } else {
                showToast(data.message || 'Slug already exists.', 'error');
            }
        } catch (err) {
            console.error('Error creating page:', err);
            showToast('Failed to create page.', 'error');
        }
    };

    const handlePageDetailsChange = (key, value) => {
        setActivePage(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePageSeoChange = (key, value) => {
        setActivePage(prev => ({
            ...prev,
            seo: {
                ...(prev.seo || {}),
                [key]: value
            }
        }));
    };

    const saveCurrentState = async () => {
        const searchParams = new URLSearchParams(location.search);
        const themeId = searchParams.get('themeId') || '';
        const themeSaveUrl = `${STORE_API_URL}/themes/settings?themeId=${themeId}`;

        const themeRes = await fetch(themeSaveUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-store-id': storeId
            },
            body: JSON.stringify(themeSettings)
        });

        const pageSaveUrl = themeId 
            ? `${STORE_API_URL}/store-pages/${activePage.slug}?themeId=${themeId}`
            : `${STORE_API_URL}/store-pages/${activePage.slug}`;

        const pageRes = await fetch(pageSaveUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-store-id': storeId
            },
            body: JSON.stringify({
                title: activePage.title,
                sections: activePage.sections,
                seo: activePage.seo || {},
                visibility: 'draft',
                publishDate: activePage.publishDate || new Date(),
                password: activePage.password || ''
            })
        });

        return themeRes.ok && pageRes.ok;
    };

    // 6. DB Persistence Save Button (Saves to Draft)
    const handleSaveBuilder = async () => {
        setSaving(true);
        setSaveStatus('saving');
        try {
            const success = await saveCurrentState();
            if (success) {
                setSaveStatus('saved');
                showToast('Draft changes saved successfully!', 'success');
            } else {
                setSaveStatus('unsaved');
                showToast('Failed to save builder changes.', 'error');
            }
        } catch (err) {
            console.error('Error saving builder:', err);
            setSaveStatus('unsaved');
            showToast('Connection error. Failed to save.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // 6b. Publish: save drafts then promote theme + page to published
    const handlePublishBuilder = async () => {
        setSaving(true);
        setSaveStatus('saving');
        try {
            const saveSuccess = await saveCurrentState();
            if (!saveSuccess) {
                showToast('Failed to save changes before publishing.', 'error');
                setSaving(false);
                setSaveStatus('unsaved');
                return;
            }

            const searchParams = new URLSearchParams(location.search);
            const themeId = searchParams.get('themeId') || '';
            const publishUrl = `${STORE_API_URL}/themes/publish?themeId=${themeId}`;
            const pagePublishUrl = themeId
                ? `${STORE_API_URL}/store-pages/${activePage.slug}/publish?themeId=${themeId}`
                : `${STORE_API_URL}/store-pages/${activePage.slug}/publish`;

            const [themeRes, pageRes] = await Promise.all([
                fetch(publishUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                }),
                fetch(pagePublishUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                })
            ]);

            if (themeRes.ok && pageRes.ok) {
                setSaveStatus('saved');
                showToast('All customizer changes published to live storefront!', 'success');
            } else {
                setSaveStatus('unsaved');
                showToast('Publish failed.', 'error');
            }
        } catch (err) {
            console.error('Error publishing theme settings:', err);
            setSaveStatus('unsaved');
            showToast('Connection error. Failed to publish.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Viewport section renderer callback helper
    const renderSectionContent = (sec) => {
        return <SectionRenderer section={sec} storeId={storeId} onAddToCart={() => {}} />;
        const alignmentStyles = {
            left: 'text-left items-start',
            center: 'text-center items-center',
            right: 'text-right items-end'
        };

        const align = sec.settings?.textAlignment || sec.settings?.alignment || 'center';        switch (sec.type) {
            case 'heading': {
                const style = sec.settings?.style || {};
                const HeadingTag = style.tag || 'h2';
                return (
                    <div className="py-2.5 px-4 w-full">
                        <HeadingTag
                            className="leading-tight tracking-tight uppercase"
                            style={{
                                fontSize: style.fontSize ? `${style.fontSize}px` : '28px',
                                color: style.color || '#18181b',
                                fontWeight: style.fontWeight || '700',
                                textAlign: style.textAlign || 'center',
                                marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : '10px',
                                marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : '15px',
                                lineHeight: style.lineHeight || '1.3',
                                letterSpacing: style.letterSpacing || 'normal',
                                textTransform: style.textTransform || 'none'
                            }}
                        >
                            {formatText(sec.settings?.text || 'New Heading Element')}
                        </HeadingTag>
                    </div>
                );
            }
            case 'paragraph': {
                const style = sec.settings?.style || {};
                return (
                    <div className="py-2 px-4 w-full">
                        <p
                            className="leading-relaxed"
                            style={{
                                fontSize: style.fontSize ? `${style.fontSize}px` : '14px',
                                color: style.color || '#3f3f46',
                                fontWeight: style.fontWeight || '400',
                                textAlign: style.textAlign || 'left',
                                marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : '5px',
                                marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : '10px',
                                lineHeight: style.lineHeight || '1.6',
                                letterSpacing: style.letterSpacing || 'normal',
                                textTransform: style.textTransform || 'none'
                            }}
                        >
                            {formatText(sec.settings?.text || 'Write your text details here. This paragraph block is fully customizable.')}
                        </p>
                    </div>
                );
            }
            case 'button': {
                const style = sec.settings?.style || {};
                const alignStyles = {
                    left: 'justify-start',
                    center: 'justify-center',
                    right: 'justify-end'
                };
                return (
                    <div className={`py-3 px-4 w-full flex ${alignStyles[style.textAlign || 'center']}`}>
                        <button
                            type="button"
                            className="transition-all hover:opacity-90 font-semibold cursor-default"
                            style={{
                                backgroundColor: style.backgroundColor || '#008060',
                                color: style.textColor || '#ffffff',
                                borderColor: style.borderColor || 'transparent',
                                borderWidth: style.borderWidth || '0px',
                                borderStyle: style.borderWidth ? 'solid' : 'none',
                                borderRadius: style.borderRadius || '8px',
                                padding: `${style.paddingY !== undefined ? style.paddingY : 10}px ${style.paddingX !== undefined ? style.paddingX : 20}px`,
                                fontSize: style.fontSize ? `${style.fontSize}px` : '13px',
                                boxShadow: style.shadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : style.shadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : style.shadow === 'sm' ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none'
                            }}
                        >
                            {sec.settings?.label || 'Click Me'}
                        </button>
                    </div>
                );
            }
            case 'image': {
                const style = sec.settings?.style || {};
                return (
                    <div className="py-3 px-4 w-full flex justify-center">
                        <img
                            src={sec.settings?.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'}
                            alt="Customizable"
                            className="max-w-full"
                            style={{
                                width: style.width || '100%',
                                height: style.height || 'auto',
                                objectFit: style.objectFit || 'cover',
                                borderRadius: style.borderRadius || '8px'
                            }}
                        />
                    </div>
                );
            }
            case 'hero': {
                const isSplit = sec.settings?.layout === 'split';
                const bgType = sec.settings?.backgroundType || 'image';
                
                let heroBg = '';
                if (bgType === 'solid') {
                    heroBg = sec.settings?.backgroundColor || '#008060';
                } else if (bgType === 'gradient') {
                    heroBg = sec.settings?.backgroundGradient || 'linear-gradient(to right, #008060, #047857, #064e3b)';
                } else {
                    heroBg = sec.settings?.backgroundImage && !isSplit
                        ? `url(${sec.settings.backgroundImage})` 
                        : 'linear-gradient(to right, #008060, #047857, #064e3b)';
                }

                let splitBgStyle = {};
                if (bgType === 'solid') {
                    splitBgStyle = { background: sec.settings?.backgroundColor || '#f0fdfa' };
                } else if (bgType === 'gradient') {
                    splitBgStyle = { background: sec.settings?.backgroundGradient || 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)' };
                } else {
                    splitBgStyle = { background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)' };
                }
                
                // Slightly scale down height for editor preview area
                const builderHeight = sec.settings?.height 
                    ? (sec.settings.height.includes('px') 
                        ? `${parseInt(sec.settings.height) * 0.7}px` 
                        : sec.settings.height)
                    : '280px';

                const contentBody = (
                    <div className={`relative z-10 flex flex-col space-y-4 max-w-xl ${isSplit ? 'text-left items-start' : 'text-center items-center'} ${alignmentStyles[align]}`}>
                        {(sec.blocks || []).map((block, bIdx) => {
                            if (block.type === 'heading') {
                                const hStyle = block.settings?.style || {};
                                const Htag = hStyle.tag || 'h2';
                                return (
                                    <Htag 
                                        key={block.blockId || bIdx} 
                                        className="leading-tight tracking-tight font-black"
                                        style={{
                                            fontSize: hStyle.fontSize ? `${hStyle.fontSize}px` : '24px',
                                            color: isSplit ? (themeSettings.primaryColor || '#008060') : (hStyle.color || '#ffffff'),
                                            fontWeight: hStyle.fontWeight || '900',
                                            lineHeight: hStyle.lineHeight || '1.3',
                                            letterSpacing: hStyle.letterSpacing || 'normal',
                                            textTransform: hStyle.textTransform || 'none',
                                            textAlign: isSplit ? 'left' : (hStyle.textAlign || 'center'),
                                            marginTop: hStyle.marginTop !== undefined ? `${hStyle.marginTop}px` : '4px',
                                            marginBottom: hStyle.marginBottom !== undefined ? `${hStyle.marginBottom}px` : '12px'
                                        }}
                                    >
                                        {formatText(block.settings?.text || 'Comfort & Care for <br/>Every Step')}
                                    </Htag>
                                );
                            }
                            if (block.type === 'subheading') {
                                const pStyle = block.settings?.style || {};
                                return (
                                    <p 
                                        key={block.blockId || bIdx} 
                                        className="opacity-90 leading-relaxed max-w-md"
                                        style={{
                                            fontSize: pStyle.fontSize ? `${pStyle.fontSize}px` : '10px',
                                            color: isSplit ? '#4b5563' : (pStyle.color || '#ffffff'),
                                            fontWeight: pStyle.fontWeight || '500',
                                            lineHeight: pStyle.lineHeight || '1.6',
                                            letterSpacing: pStyle.letterSpacing || 'normal',
                                            textTransform: pStyle.textTransform || 'none',
                                            textAlign: isSplit ? 'left' : (pStyle.textAlign || 'center'),
                                            marginTop: pStyle.marginTop !== undefined ? `${pStyle.marginTop}px` : '4px',
                                            marginBottom: pStyle.marginBottom !== undefined ? `${pStyle.marginBottom}px` : '12px'
                                        }}
                                    >
                                        {formatText(block.settings?.text || 'Premium adult diapers, baby care, and hygiene essentials.')}
                                    </p>
                                );
                            }
                            return null;
                        })}

                        {/* Render Buttons side-by-side preview */}
                        {(sec.blocks || []).some(b => b.type === 'button') && (
                            <div className={`flex gap-2.5 pt-1 justify-center flex-wrap ${isSplit ? 'justify-start' : 'justify-center'}`}>
                                {(sec.blocks || []).filter(b => b.type === 'button').map((block, idx) => {
                                    const bStyle = block.settings?.style || {};
                                    return (
                                        <React.Fragment key={block.blockId || idx}>
                                            {block.settings?.startNewRow && <div className="w-full h-0"></div>}
                                            <span 
                                                className={`cursor-default font-black tracking-widest text-[8px] transition-all`}
                                                style={{
                                                    backgroundColor: bStyle.backgroundColor || (isSplit ? (themeSettings.primaryColor || '#008060') : '#ffffff'),
                                                    color: bStyle.textColor || (isSplit ? '#ffffff' : '#18181b'),
                                                    borderColor: bStyle.borderColor || (bStyle.borderWidth && bStyle.borderWidth !== '0px' ? '#18181b' : 'transparent'),
                                                    borderWidth: bStyle.borderWidth || '0px',
                                                    borderStyle: (bStyle.borderWidth && bStyle.borderWidth !== '0px') ? 'solid' : 'none',
                                                    borderRadius: bStyle.borderRadius || '8px',
                                                    padding: `${bStyle.paddingY !== undefined ? bStyle.paddingY : 10}px ${bStyle.paddingX !== undefined ? bStyle.paddingX : 20}px`,
                                                    fontSize: bStyle.fontSize ? `${bStyle.fontSize}px` : '8px',
                                                    boxShadow: bStyle.shadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : bStyle.shadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : bStyle.shadow === 'sm' ? '0 1px 2px 0 rgba(0,0,0,0.05)' : 'none'
                                                }}
                                            >
                                                {block.settings?.label || 'Shop Collection'}
                                            </span>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}

                        {(sec.blocks || []).length === 0 && (
                            <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full">Hero Section (Add blocks on settings panel)</span>
                        )}

                        {/* Trust Badges row preview */}
                        {sec.settings?.showTrustBadges !== false && (
                            <div className={`flex gap-4 pt-4 mt-2 border-t w-full text-[7px] font-black uppercase tracking-widest opacity-95 ${isSplit ? 'border-zinc-200 justify-start' : 'border-white/10 justify-center'}`}>
                                <span className={`flex items-center gap-1 ${isSplit ? 'text-zinc-700' : 'text-white'}`}>🚚 {sec.settings?.badge1Text || 'Free Shipping'}</span>
                                <span className={`flex items-center gap-1 ${isSplit ? 'text-zinc-700' : 'text-white'}`}>🛡️ {sec.settings?.badge2Text || 'Secure Payments'}</span>
                                <span className={`flex items-center gap-1 ${isSplit ? 'text-zinc-700' : 'text-white'}`}>🔄 {sec.settings?.badge3Text || 'Easy Returns'}</span>
                            </div>
                        )}
                    </div>
                );

                if (isSplit) {
                    return (
                        <div 
                            className="py-12 px-6 flex items-center justify-center relative overflow-hidden"
                            style={{ minHeight: builderHeight, ...splitBgStyle }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full max-w-5xl">
                                {contentBody}
                                <div className="flex justify-center items-center">
                                    <div className="relative w-full aspect-[4/3] max-w-sm rounded-3xl overflow-hidden shadow-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center">
                                        {sec.settings?.backgroundImage ? (
                                            <img src={sec.settings.backgroundImage} alt="Hero featured" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-zinc-400 text-xs font-bold">No Image Selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }

                return (
                    <div 
                        className="py-20 px-6 text-white flex flex-col justify-center items-center relative overflow-hidden"
                        style={{
                            background: heroBg,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            minHeight: builderHeight
                        }}
                    >
                        {/* Overlay to darken background image */}
                        {bgType === 'image' && sec.settings?.backgroundImage && <div className="absolute inset-0 bg-black/45 z-0"></div>}
                        {contentBody}
                    </div>
                );
            }
            case 'image-banner': {
                const isOverlay = sec.settings?.layout === 'overlay';
                if (isOverlay) {
                    return (
                        <div 
                            className="relative flex items-center justify-center p-6 text-center text-white overflow-hidden rounded-2xl min-h-[160px] bg-zinc-900"
                            style={{
                                backgroundImage: sec.settings?.imageUrl ? `url(${sec.settings.imageUrl})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="absolute inset-0 bg-black/40 z-0"></div>
                            <div className="relative z-10 space-y-1.5">
                                <span className="text-[8px] bg-white/20 text-white font-black px-2 py-0.5 rounded uppercase">Image Banner (Overlay)</span>
                                <h4 className="text-sm font-black drop-shadow">{sec.settings?.title}</h4>
                                <p className="text-[10px] text-zinc-200 font-semibold drop-shadow">{sec.settings?.subtitle}</p>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex bg-zinc-100 items-center justify-between p-6 gap-4 min-h-[140px]">
                        <div className="space-y-1.5 flex-1">
                            <span className="text-xs bg-[#008060]/10 text-[#008060] font-black px-2 py-0.5 rounded uppercase">Image Banner</span>
                            <h4 className="text-sm font-black">{sec.settings?.title}</h4>
                            <p className="text-[10px] text-zinc-500 font-semibold">{sec.settings?.subtitle}</p>
                        </div>
                        {sec.settings?.imageUrl && (
                            <img src={sec.settings.imageUrl} alt="banner" className="w-24 h-16 object-cover rounded-lg shadow-sm" />
                        )}
                    </div>
                );
            }
            case 'spacer':
                return (
                    <div style={{ height: `${sec.settings?.height || 40}px` }} className="bg-zinc-200/20 border border-dashed border-zinc-300/30 flex items-center justify-center text-[9px] font-bold text-zinc-400">
                        Spacer Gap ({sec.settings?.height || 40}px)
                    </div>
                );
            case 'divider':
                return (
                    <div className="py-2">
                        <hr style={{ borderTopStyle: sec.settings?.style || 'solid', borderTopColor: sec.settings?.color || '#e4e4e7', borderTopWidth: sec.settings?.thickness || '1px' }} />
                    </div>
                );
            case 'featured-products':
            case 'product-slider':
            case 'best-sellers': {
                const sampleProducts = [
                    { name: 'Adult Pull-Up Diapers (M-L)', price: '₹499.00', original: '₹699.00', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=300' },
                    { name: 'Baby Ultra-Soft Diapers', price: '₹349.00', original: '₹449.00', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300' },
                    { name: 'Premium Hygiene Wipes (80s)', price: '₹149.00', original: '₹199.00', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300' },
                    { name: 'Organic Sanitary Pads', price: '₹229.00', original: '₹299.00', image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=300' }
                ];
                const cardShapeClass = sec.settings?.cardShape === 'square' ? 'rounded-none'
                                     : sec.settings?.cardShape === 'circle' ? 'rounded-full'
                                     : sec.settings?.cardShape === 'pill' ? 'rounded-3xl'
                                     : 'rounded-2xl'; // default curved
                const outerCardShapeClass = sec.settings?.cardShape === 'square' ? 'rounded-none'
                                          : sec.settings?.cardShape === 'circle' ? 'rounded-2xl'
                                          : sec.settings?.cardShape === 'pill' ? 'rounded-3xl'
                                          : 'rounded-2xl';
                return (
                    <div className="p-5 space-y-4 bg-white border border-zinc-100 rounded-3xl">
                        <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                                {sec.settings?.title || 'Featured Products'}
                            </h4>
                            <span className="text-[8px] bg-emerald-50 text-[#008060] px-2 py-0.5 rounded font-black uppercase tracking-wider">Grid</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3.5">
                            {sampleProducts.map((p, n) => (
                                <div key={n} className={`bg-white border border-zinc-200/60 p-2.5 text-left space-y-2 group shadow-sm hover:shadow transition-all h-fit ${outerCardShapeClass}`}>
                                    <div className={`aspect-square bg-zinc-50 overflow-hidden relative ${cardShapeClass}`}>
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        <span className="absolute top-1.5 left-1.5 bg-[#008060] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md">Save 20%</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex gap-0.5 text-amber-400 text-[8px]">⭐⭐⭐⭐•</div>
                                        <h5 className="text-[9px] font-black text-zinc-800 truncate leading-tight uppercase tracking-wide">{p.name}</h5>
                                        <div className="flex items-center gap-1.5 pt-0.5">
                                            <span className="text-[9px] font-black text-[#008060]">{p.price}</span>
                                            <span className="text-[7.5px] text-zinc-400 line-through font-semibold">{p.original}</span>
                                        </div>
                                    </div>
                                    <span className="block text-center bg-zinc-950 text-white text-[7px] font-black uppercase py-1.5 rounded-lg cursor-default">Add to Cart</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            case 'categories':
            case 'category-grid': {
                const sampleCategories = [
                    { name: 'Diapers', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150' },
                    { name: 'Adult Diapers', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=150' },
                    { name: 'Wipes', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=150' },
                    { name: 'Sanitary Pads', image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=150' }
                ];
                const catCardShape = sec.settings?.cardShape === 'square' ? 'rounded-none'
                                   : sec.settings?.cardShape === 'circle' ? 'rounded-full'
                                   : sec.settings?.cardShape === 'pill' ? 'rounded-3xl'
                                   : sec.settings?.cardShape === 'curved' ? 'rounded-2xl'
                                   : sec.settings?.designType === 'circle' ? 'rounded-full' : 'rounded-2xl';
                return (
                    <div className="p-5 space-y-4 bg-white border border-zinc-100 rounded-3xl">
                        <div className="border-b border-zinc-100 pb-2">
                            <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                                {sec.settings?.title || 'Shop by Category'}
                            </h4>
                        </div>
                        <div className="grid grid-cols-4 gap-3.5 pt-1">
                            {sampleCategories.map((c, n) => (
                                <div key={n} className="flex flex-col items-center gap-2 group cursor-default h-fit">
                                    <div className={`w-14 h-14 bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200 group-hover:border-[#008060] transition-colors ${catCardShape}`}>
                                        <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[9px] font-black text-zinc-800 uppercase tracking-wider group-hover:text-[#008060] transition-colors">{c.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
            case 'testimonials':
                return (
                    <div className="p-4 bg-zinc-50/50 rounded-2xl text-center space-y-2.5">
                        <h4 className="text-xs font-black uppercase text-zinc-700">{sec.settings?.title}</h4>
                        <div className="space-y-1">
                            <span className="block text-[10px] text-zinc-550 italic">"Love the organic design and layout, fitting is absolutely amazing."</span>
                            <span className="block text-[9px] font-black text-[#008060]">— Sarah K.</span>
                        </div>
                    </div>
                );
            case 'faq':
            case 'accordion':
                return (
                    <div className="p-4 bg-white space-y-2">
                        <h4 className="text-xs font-black uppercase text-zinc-700 border-b pb-1">{sec.settings?.title}</h4>
                        <div className="space-y-1.5">
                            <div className="border border-zinc-150 p-2 rounded-lg text-[10px] font-bold text-zinc-700 flex justify-between bg-zinc-50">
                                <span>How long does shipping take?</span>
                                <span>➕</span>
                            </div>
                        </div>
                    </div>
                );
            case 'countdown':
                return (
                    <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-center space-y-1.5">
                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">{sec.settings?.title}</h4>
                        <div className="flex justify-center gap-2 text-xs font-black text-red-800">
                            <span>01d</span> : <span>04h</span> : <span>59m</span> : <span>30s</span>
                        </div>
                    </div>
                );
            case 'features-grid':
                return (
                    <div className="p-6 bg-white space-y-4 border rounded-3xl">
                        <div className="text-center space-y-1">
                            <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider">{sec.settings?.title || 'Why Choose Us'}</h4>
                            <p className="text-[9px] text-zinc-550 font-semibold leading-relaxed max-w-sm mx-auto">{sec.settings?.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {(sec.blocks || []).map((block, bIdx) => (
                                <div key={block.blockId || bIdx} className="bg-zinc-50 border border-zinc-150 p-3 rounded-xl text-center space-y-1 h-fit">
                                    <div className="text-lg">
                                        {block.settings?.icon === 'truck' ? '🚚' 
                                         : block.settings?.icon === 'rotate-ccw' ? '🔄' 
                                         : block.settings?.icon === 'shield-check' ? '🛡️' 
                                         : block.settings?.icon === 'phone' ? '📞' 
                                         : block.settings?.icon === 'heart-pulse' ? '❤️' 
                                         : block.settings?.icon === 'lightning' ? '⚡' 
                                         : '✨'}
                                    </div>
                                    <span className="block text-[9px] font-black text-zinc-800 uppercase tracking-wide">{block.settings?.title || 'Feature Title'}</span>
                                    <p className="text-[8px] text-zinc-550 font-semibold leading-relaxed">{block.settings?.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'newsletter':
                return (
                    <div className="p-6 bg-zinc-50 text-center rounded-2xl border border-zinc-200/50 space-y-2">
                        <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider">{sec.settings?.title}</h4>
                        <p className="text-[9px] text-zinc-500 font-semibold">{sec.settings?.subtitle}</p>
                        <div className="flex gap-2 max-w-xs mx-auto">
                            <input type="email" disabled placeholder="Your email" className="w-full bg-white text-xs px-2.5 py-1.5 border rounded-lg outline-none" />
                            <button disabled className="bg-zinc-800 text-white text-[9px] px-3.5 py-1.5 rounded-lg font-black uppercase">Join</button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="p-4 bg-white text-center text-xs font-black text-zinc-400 border border-dashed border-zinc-200 rounded-2xl uppercase">
                        {sec.type.replace('-', ' ')} block
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[480px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008060]"></div>
            </div>
        );
    }

    const currentSelectedSection = activePage.sections.find((s, idx) => {
        const sId = s.sectionId || s._id || `sec-${idx}`;
        return sId === selectedSectionId;
    });

    return (
        <div className="h-screen w-screen flex flex-col bg-[#f8fafc] overflow-hidden text-slate-800">
            <style>{`
                /* Modern high-end theme customizer stylesheet */
                .premium-builder-header {
                    background: rgba(15, 17, 23, 0.94);
                    backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
                }
                .premium-builder-sidebar {
                    background: #ffffff;
                    border-left: 1px solid #e2e8f0;
                    box-shadow: -4px 0 30px -10px rgba(0, 0, 0, 0.04);
                }
                .premium-input {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                    padding: 8px 12px;
                    transition: all 0.2s ease;
                }
                .premium-input:focus {
                    background: #ffffff;
                    border-color: #008060;
                    box-shadow: 0 0 0 3px rgba(0, 128, 96, 0.12);
                }
                .premium-select {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 6px 12px;
                    color: #f1f5f9;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .premium-select:hover {
                    background: #334155;
                    border-color: #475569;
                }
                /* Tabs controls */
                .premium-tab-nav {
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                    gap: 3px;
                }
                .premium-tab-btn {
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-radius: 8px;
                    padding: 6px 10px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #64748b;
                }
                .premium-tab-btn.active {
                    background: #ffffff;
                    color: #0f172a;
                    box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04);
                }
                .premium-tab-btn:hover:not(.active) {
                    color: #0f172a;
                    background: rgba(255, 255, 255, 0.4);
                }
                /* Action buttons */
                .premium-btn-primary {
                    background: linear-gradient(135deg, #009670 0%, #008060 100%);
                    color: #ffffff;
                    font-weight: 850;
                    text-transform: uppercase;
                    font-size: 10px;
                    letter-spacing: 0.06em;
                    padding: 8px 16px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0, 128, 96, 0.22);
                    transition: all 0.25s ease;
                }
                .premium-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(0, 128, 96, 0.32);
                    opacity: 0.95;
                }
                .premium-btn-primary:active {
                    transform: translateY(0);
                }
                .premium-btn-secondary {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                    font-weight: 700;
                    font-size: 11px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }
                .premium-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                }
                /* Viewport selector */
                .premium-viewport-nav {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 3px;
                }
                .premium-viewport-btn {
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    transition: all 0.2s ease;
                    color: #94a3b8;
                }
                .premium-viewport-btn.active {
                    background: #ffffff;
                    color: #0f172a;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                }
                .premium-viewport-btn:hover:not(.active) {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.04);
                }
                /* Scrollbar overrides */
                .storefront-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .storefront-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .storefront-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .storefront-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>

            {/* 1. Header Toolbar */}
            <div className="h-14 premium-builder-header text-white flex items-center justify-between px-6 z-30 select-none">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            if (!confirmLeaveIfDirty()) return;
                            navigate('/dashboard/websites');
                        }}
                        className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-zinc-350 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Back to themes"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                        Exit Customizer
                    </button>
                    <div className="h-5 w-[1px] bg-zinc-800/80"></div>
                    <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            saveStatus === 'unsaved'
                                ? 'bg-amber-500/20 text-amber-300'
                                : saveStatus === 'saving'
                                    ? 'bg-sky-500/20 text-sky-300'
                                    : 'bg-emerald-500/15 text-emerald-300'
                        }`}
                    >
                        {AUTOSAVE_ENABLED && autosaveLabel
                            ? autosaveLabel
                            : saveStatus === 'unsaved'
                                ? 'Unsaved Changes'
                                : saveStatus === 'saving'
                                    ? 'Saving...'
                                    : 'Saved'}
                    </span>
                    <div className="h-5 w-[1px] bg-zinc-800/80"></div>
                    <div className="flex items-center gap-2">
                        {/* Page Selector dropdown */}
                        <select 
                            value={pageSlug}
                            onChange={(e) => handlePageChange(e.target.value)}
                            className="premium-select"
                        >
                            {pages.map(p => (
                                <option key={p.slug} value={p.slug}>{p.title} ({p.slug})</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-[10px] text-teal-400 hover:text-teal-300 font-black uppercase tracking-wider px-2.5 py-1.5 hover:bg-teal-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            Add Page
                        </button>
                    </div>
                </div>

                {/* Viewport frames toggle */}
                <div className="flex items-center gap-1 premium-viewport-nav">
                    <button 
                        onClick={() => setViewport('desktop')}
                        className={`premium-viewport-btn flex items-center gap-1.5 cursor-pointer ${viewport === 'desktop' ? 'active' : ''}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /></svg>
                        Desktop
                    </button>
                    <button 
                        onClick={() => setViewport('tablet')}
                        className={`premium-viewport-btn flex items-center gap-1.5 cursor-pointer ${viewport === 'tablet' ? 'active' : ''}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" /></svg>
                        Tablet
                    </button>
                    <button 
                        onClick={() => setViewport('mobile')}
                        className={`premium-viewport-btn flex items-center gap-1.5 cursor-pointer ${viewport === 'mobile' ? 'active' : ''}`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" /></svg>
                        Mobile
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Undo/Redo Buttons */}
                    <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                        <button 
                            disabled={!canUndo}
                            onClick={() => {
                                const prev = undo();
                                if (prev) {
                                    setActivePage(p => ({ ...p, sections: prev.sections }));
                                    setThemeSettings(prev.themeSettings);
                                    showToast('Undo action');
                                }
                            }}
                            className={`p-1.5 rounded-lg text-xs disabled:opacity-20 flex items-center gap-1 cursor-pointer transition-all ${canUndo ? 'hover:bg-zinc-800 text-white' : 'text-zinc-550'}`}
                            title="Undo (Ctrl+Z)"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                            Undo
                        </button>
                        <button 
                            disabled={!canRedo}
                            onClick={() => {
                                const next = redo();
                                if (next) {
                                    setActivePage(p => ({ ...p, sections: next.sections }));
                                    setThemeSettings(next.themeSettings);
                                    showToast('Redo action');
                                }
                            }}
                            className={`p-1.5 rounded-lg text-xs disabled:opacity-20 flex items-center gap-1 cursor-pointer transition-all ${canRedo ? 'hover:bg-zinc-800 text-white' : 'text-zinc-550'}`}
                            title="Redo (Ctrl+Shift+Z)"
                        >
                            Redo
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSaveBuilder}
                            disabled={saving}
                            className="premium-btn-secondary"
                        >
                            {saving || saveStatus === 'saving' ? 'Saving...' : saveStatus === 'unsaved' ? 'Save Draft' : 'Saved'}
                        </button>
                        <button
                            onClick={handlePublishBuilder}
                            disabled={saving}
                            className="premium-btn-primary flex items-center gap-1.5 cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                            {saving ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Main Builder Workspace Layout */}
            <div className="flex-1 flex overflow-hidden relative flex-col md:flex-row">
                {/* A. Live Preview Canvas — primary on mobile */}
                <div className="flex-1 overflow-hidden h-full flex flex-col min-h-0 order-1">
                    <BuilderCanvas 
                        sections={activePage.sections}
                        selectedId={selectedSectionId}
                        onSelectSection={(id) => {
                            if (id === 'header') {
                                setActiveTab('header');
                                setSelectedSectionId(null);
                                setMobileSheet('settings');
                            } else if (id === 'footer') {
                                setActiveTab('footer');
                                setSelectedSectionId(null);
                                setMobileSheet('settings');
                            } else {
                                setSelectedSectionId(id);
                                setMobileSheet('settings');
                            }
                        }}
                        viewport={viewport}
                        themeSettings={themeSettings}
                        renderSectionContent={renderSectionContent}
                    />
                </div>

                {/* B. Right Sidebar — desktop; drawers on mobile */}
                <div className={`relative flex-col premium-builder-sidebar transition-all duration-300 hidden md:flex ${isSidebarOpen ? 'w-80' : 'w-0 border-l-0'}`}>
                    {/* Toggle Button on the vertical border edge */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`absolute top-1/2 -translate-y-1/2 z-40 w-7 h-7 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-full flex items-center justify-center shadow-md cursor-pointer text-zinc-500 hover:text-zinc-800 transition-all hover:scale-105 active:scale-95 ${
                            isSidebarOpen ? '-left-3.5' : '-left-7 shadow-[2px_0_8px_rgba(0,0,0,0.05)]'
                        }`}
                        title={isSidebarOpen ? "Collapse Editor" : "Expand Editor"}
                    >
                        {isSidebarOpen ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        )}
                    </button>

                    {/* Hide sidebar content when collapsed */}
                    <div className={`flex-grow flex flex-col overflow-hidden h-full ${isSidebarOpen ? 'opacity-100 w-80' : 'opacity-0 w-0 pointer-events-none'}`}>
                        {selectedSectionId ? (
                            // If section selected, show section editor settings directly
                            <div className="flex-grow flex flex-col overflow-hidden h-full">
                                <div className="p-3 bg-zinc-50 border-b border-zinc-150 flex items-center">
                                    <button 
                                        onClick={() => setSelectedSectionId(null)}
                                        className="text-xs font-black uppercase text-zinc-650 hover:text-zinc-950 flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                        Back to components
                                    </button>
                                </div>
                                <div className="flex-grow overflow-y-auto">
                                    <SettingsPanel 
                                        section={currentSelectedSection || {}}
                                        onChangeSettings={handleUpdateSectionSettings}
                                        onAddBlock={handleAddBlock}
                                        onUpdateBlock={handleUpdateBlockSetting}
                                        onRemoveBlock={handleRemoveBlock}
                                    />
                                </div>
                            </div>
                        ) : (
                            // Normal tabs
                            <>
                                {/* Sidebar sub navigation */}
                                <div className="flex premium-tab-nav p-1 select-none">
                                    <button 
                                        onClick={() => { setActiveTab('library'); setSelectedSectionId(null); }}
                                        className={`flex-grow premium-tab-btn cursor-pointer ${activeTab === 'library' ? 'active' : ''}`}
                                    >
                                        Palette
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('sections'); setSelectedSectionId(null); }}
                                        className={`flex-grow premium-tab-btn cursor-pointer ${activeTab === 'sections' ? 'active' : ''}`}
                                    >
                                        Layers
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('header'); setSelectedSectionId(null); }}
                                        className={`flex-grow premium-tab-btn cursor-pointer ${activeTab === 'header' ? 'active' : ''}`}
                                    >
                                        Header
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('footer'); setSelectedSectionId(null); }}
                                        className={`flex-grow premium-tab-btn cursor-pointer ${activeTab === 'footer' ? 'active' : ''}`}
                                    >
                                        Footer
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('settings'); setSelectedSectionId(null); }}
                                        className={`flex-grow premium-tab-btn cursor-pointer ${activeTab === 'settings' ? 'active' : ''}`}
                                    >
                                        Theme
                                    </button>
                                    <button 
                                        onClick={() => { setActiveTab('page-seo'); setSelectedSectionId(null); }}
                                        className={`flex-grow premium-tab-btn cursor-pointer ${activeTab === 'page-seo' ? 'active' : ''}`}
                                    >
                                        SEO
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    {activeTab === 'library' && (
                                        <ComponentLibrary onAddComponent={handleAddComponent} />
                                    )}
                                    {activeTab === 'sections' && (
                                        <div className="h-full flex flex-col overflow-hidden">
                                            {showCompat && (
                                                <div className="overflow-y-auto max-h-[40%] shrink-0">
                                                    <CompatibilityAssistant
                                                        sections={activePage.sections}
                                                        supportedSections={themeSettings.supportedSections}
                                                        onApplyRemap={handleApplyRemap}
                                                        onDismiss={() => setShowCompat(false)}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 overflow-hidden">
                                                <SectionTree
                                                    sections={activePage.sections}
                                                    selectedId={selectedSectionId}
                                                    onSelect={(id) => {
                                                        setSelectedSectionId(id);
                                                        setMobileSheet('settings');
                                                    }}
                                                    onReorder={handleReorderSections}
                                                    onRemove={handleRemoveSection}
                                                    onDuplicate={handleDuplicateSection}
                                                    onToggleVisibility={handleToggleVisibility}
                                                    onToggleLock={handleToggleLock}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'header' && (
                                        <div className="h-full overflow-y-auto p-4 storefront-scrollbar bg-white">
                                            <HeaderBuilder headerConfig={themeSettings.headerConfig || {}} onChange={(newConf) => updateThemeSettings({ ...themeSettings, headerConfig: newConf })} />
                                        </div>
                                    )}
                                    {activeTab === 'footer' && (
                                        <div className="h-full overflow-y-auto p-4 storefront-scrollbar bg-white">
                                            <FooterBuilder footerConfig={themeSettings.footerConfig || {}} onChange={(newConf) => updateThemeSettings({ ...themeSettings, footerConfig: newConf })} />
                                        </div>
                                    )}
                                    {activeTab === 'settings' && (
                                        <div className="h-full overflow-y-auto p-4 storefront-scrollbar bg-white">
                                            <ThemeSettingsPanel themeSettings={themeSettings} onChange={updateThemeSettings} schema={schema} />
                                        </div>
                                    )}
                                    {activeTab === 'page-seo' && (
                                        <div className="h-full overflow-y-auto p-4 space-y-5 storefront-scrollbar bg-white">
                                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-1.5">
                                                SEO & Meta settings
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Page Title</label>
                                                    <input 
                                                        type="text"
                                                        value={activePage.title || ''}
                                                        onChange={(e) => handlePageDetailsChange('title', e.target.value)}
                                                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Meta Title</label>
                                                    <input 
                                                        type="text"
                                                        value={activePage.seo?.metaTitle || ''}
                                                        onChange={(e) => handlePageSeoChange('metaTitle', e.target.value)}
                                                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Meta Description</label>
                                                    <textarea 
                                                        value={activePage.seo?.metaDescription || ''}
                                                        onChange={(e) => handlePageSeoChange('metaDescription', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">OG Image URL</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="https://example.com/banner-og.jpg"
                                                        value={activePage.seo?.ogImage || ''}
                                                        onChange={(e) => handlePageSeoChange('ogImage', e.target.value)}
                                                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Visibility Status</label>
                                                    <select 
                                                        value={activePage.visibility || 'published'}
                                                        onChange={(e) => handlePageDetailsChange('visibility', e.target.value)}
                                                        className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold bg-white"
                                                    >
                                                        <option value="published">Published Live</option>
                                                        <option value="draft">Draft (Hidden)</option>
                                                        <option value="scheduled">Scheduled Publish</option>
                                                    </select>
                                                </div>
                                                {activePage.visibility === 'scheduled' && (
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Publish Date</label>
                                                        <input 
                                                            type="datetime-local"
                                                            value={activePage.publishDate ? new Date(activePage.publishDate).toISOString().slice(0, 16) : ''}
                                                            onChange={(e) => handlePageDetailsChange('publishDate', e.target.value)}
                                                            className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. New Page Creator Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-zinc-150 flex justify-between items-center">
                            <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Create Custom Page</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-650 text-xs">✕</button>
                        </div>
                        <form onSubmit={handleCreatePageSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Page Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. Terms of Service"
                                    value={newPageForm.title}
                                    onChange={(e) => setNewPageForm({ ...newPageForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">URL Path Slug</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="e.g. terms-of-service"
                                    value={newPageForm.slug}
                                    onChange={(e) => setNewPageForm({ ...newPageForm, slug: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none font-mono"
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2 bg-[#008060] hover:bg-[#006e52] text-white rounded-xl text-xs font-black uppercase tracking-wider"
                                >
                                    Create Page
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mobile builder chrome */}
            <div className="md:hidden shrink-0 border-t border-zinc-200 bg-white flex" role="toolbar" aria-label="Builder panels">
                <button type="button" onClick={() => { setActiveTab('sections'); setMobileSheet('sections'); setIsSidebarOpen(true); }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] ${mobileSheet === 'sections' ? 'text-[#008060]' : 'text-zinc-500'}`}>
                    Sections
                </button>
                <button type="button" onClick={() => { setActiveTab(selectedSectionId ? 'sections' : 'settings'); setMobileSheet('settings'); }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] ${mobileSheet === 'settings' ? 'text-[#008060]' : 'text-zinc-500'}`}>
                    Settings
                </button>
                <button type="button" onClick={() => setMobileSheet(null)}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-wide text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060]">
                    Preview
                </button>
            </div>

            {mobileSheet && (
                <div className="md:hidden fixed inset-0 z-[180] flex flex-col justify-end bg-black/40" role="dialog" aria-modal="true"
                    onClick={(e) => { if (e.target === e.currentTarget) setMobileSheet(null); }}>
                    <div className="bg-white rounded-t-3xl max-h-[75vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                            <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                                {mobileSheet === 'sections' ? 'Sections' : 'Settings'}
                            </p>
                            <button type="button" onClick={() => setMobileSheet(null)}
                                className="text-xs font-bold text-zinc-600 px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] rounded"
                                aria-label="Close panel">Close</button>
                        </div>
                        <div className="overflow-y-auto flex-1 min-h-[40vh]">
                            {mobileSheet === 'sections' && (
                                <SectionTree
                                    sections={activePage.sections}
                                    selectedId={selectedSectionId}
                                    onSelect={(id) => { setSelectedSectionId(id); setMobileSheet('settings'); }}
                                    onReorder={handleReorderSections}
                                    onRemove={handleRemoveSection}
                                    onDuplicate={handleDuplicateSection}
                                    onToggleVisibility={handleToggleVisibility}
                                    onToggleLock={handleToggleLock}
                                />
                            )}
                            {mobileSheet === 'settings' && (
                                <div className="p-4">
                                    {selectedSectionId ? (
                                        <SettingsPanel
                                            section={activePage.sections.find((s, i) => (s.sectionId || s._id || `sec-${i}`) === selectedSectionId) || {}}
                                            onChangeSettings={handleUpdateSectionSettings}
                                            onAddBlock={handleAddBlock}
                                            onUpdateBlock={handleUpdateBlockSetting}
                                            onRemoveBlock={handleRemoveBlock}
                                        />
                                    ) : (
                                        <ThemeSettingsPanel themeSettings={themeSettings} onChange={updateThemeSettings} schema={schema} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Global Toast notifications */}
            {toast.show && (
                <div className={`fixed bottom-20 md:bottom-6 right-6 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold z-50 flex items-center gap-2 border animate-toast-in ${
                    toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-zinc-900 text-white border-zinc-800'
                }`} role="status">
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}
