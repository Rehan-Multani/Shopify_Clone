import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateMetaobjectDefinition = () => {
    const navigate = useNavigate();
    const [isOptionsExpanded, setIsOptionsExpanded] = useState(true);
    const [isFieldOptionsExpanded, setIsFieldOptionsExpanded] = useState(false);

    // Toggle component local to this file
    const Toggle = ({ active, onChange }) => (
        <button 
            onClick={onChange}
            className={`w-10 h-5 flex items-center rounded-full transition-colors duration-200 outline-none ${active ? 'bg-black' : 'bg-gray-300'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
    );

    const [options, setOptions] = useState({
        activeDraft: true,
        translations: true,
        publishWebPages: false,
        storefrontApi: true,
        customerAccountApi: false
    });

    const toggleOption = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const sidebarItems = [
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>, label: 'General' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>, label: 'Plan' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>, label: 'Billing' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>, label: 'Users' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 7H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2zM6 13h2a1 1 0 100-2H6a1 1 0 100 2zm10-2a1 1 0 110 2h-1a1 1 0 110-2h1z" clipRule="evenodd"/></svg>, label: 'Payments' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>, label: 'Checkout' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>, label: 'Customer accounts' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10V8a1 1 0 011-1h5.086l1.293-1.293A1 1 0 0016.586 5H8V4a1 1 0 00-1-1H3z"/><path d="M15.414 9l-2.707 2.707a1 1 0 01-1.414 0L10 10.414V15h2.05a2.5 2.5 0 014.9 0H18v-4.586l-2.586-2.414z"/></svg>, label: 'Shipping and delivery' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm3 1a1 1 0 011 1v1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h1V8a1 1 0 011-1zm6 1a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V9a1 1 0 011-1z" clipRule="evenodd"/></svg>, label: 'Taxes and duties' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>, label: 'Locations' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/></svg>, label: 'Markets' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>, label: 'Apps' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 100-2h-1a1 1 0 100 2h1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 11-2 0 1 1 0 012 0zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z"/></svg>, label: 'Sales channels' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"/></svg>, label: 'Domains' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>, label: 'Customer events' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>, label: 'Notifications' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>, label: 'Metafields and metaobjects', active: true },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a5.982 5.982 0 01.71 3.584l1.481 1.481A1 1 0 0110.343 12H9a1 1 0 110-2H7.414l-2-2H9v1a1 1 0 102 0v-1h3a1 1 0 110 2h-1.578a5.982 5.982 0 01-.71-3.584l-1.481-1.481A1 1 0 018.657 5H10a1 1 0 110 2H8v1a1 1 0 10-2 0V7H3a1 1 0 110-2h3V3a1 1 0 011-1z" clipRule="evenodd"/></svg>, label: 'Languages' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.9L10 .155 17.834 4.9a2 2 0 011.166 1.812V11c0 5.839-4.517 10.605-9 11.622-4.483-1.017-9-5.783-9-11.622V6.712a2 2 0 011.166-1.812zM10 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>, label: 'Customer privacy' },
        { icon: <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6h8v2H6v-2zm0 4h5v2H6v-2z" clipRule="evenodd"/></svg>, label: 'Policies' },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#f1f1f1] min-h-screen">
            {/* Custom Private Header for Creation Flow */}
            <div className="bg-white border-b border-gray-100 -mx-8 -mt-8 mb-8 px-8 py-3 flex items-center justify-between shadow-sm sticky top-14 z-[60]">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/dashboard/content/metaobjects')}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#5c5f62]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h1 className="text-base font-bold text-[#202223]">Add metaobject definition</h1>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/dashboard/content/metaobjects')}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all text-[#5c5f62]"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex gap-8 max-w-[1400px] mx-auto px-4">
                {/* Settings Sidebar */}
                <aside className="w-64 flex-shrink-0 sticky top-32 h-fit mb-10">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        {/* Profile Header */}
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#00D166] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    PS
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-[#202223] truncate">palak store</h3>
                                    <p className="text-[10px] text-[#5c5f62] truncate">gmsp0q-sb.myshopify.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="p-3 border-b border-gray-100 flex-shrink-0">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input 
                                    type="text" 
                                    placeholder="Search"
                                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black/20"
                                />
                            </div>
                        </div>

                        {/* Menu List - Full length, no scroll */}
                        <nav className="p-1 space-y-0.5">
                            {sidebarItems.map((item, idx) => (
                                <button 
                                    key={idx}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left ${item.active 
                                        ? 'bg-gray-100 text-black font-bold' 
                                        : 'text-[#5c5f62] hover:bg-black/5 hover:text-black font-semibold'
                                    }`}
                                >
                                    <span className={`text-base flex-shrink-0 ${item.active ? 'text-black' : 'text-gray-400'}`}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* User Footer - Pushed to the bottom of the long list */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#D936C5] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    PP
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-[#202223] truncate">Palak Patel</h3>
                                    <p className="text-[10px] text-[#5c5f62] truncate">palakpatel0342@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Definition Cards */}
                <div className="flex-grow space-y-4 pb-20 max-w-4xl">
                    {/* General Info Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#202223]">Name</label>
                                <input 
                                    type="text"
                                    placeholder="Examples: Cart upsell, Fabric colors, Product bundle"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005bd3] transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="text-sm">
                                <p className="text-[#5c5f62]">Type:</p>
                            </div>
                            <button className="text-xs font-bold text-[#202223] hover:underline">
                                Add description
                            </button>
                        </div>
                    </div>

                    {/* Fields Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 space-y-5">
                            <h2 className="text-sm font-bold text-[#202223]">Fields</h2>
                            
                            <div className="flex items-center gap-3 group">
                                <div className="cursor-grab text-gray-400 group-hover:text-[#202223]">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M7 2a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 11-2 0 1 1 0 012 0zM7 5a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 11-2 0 1 1 0 012 0zM7 8a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 11-2 0 1 1 0 012 0zm-3 3a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 11-2 0 1 1 0 012 0zm-3 3a1 1 0 11-2 0 1 1 0 012 0zm3 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
                                </div>
                                <div className="flex-grow grid grid-cols-2 gap-3 items-center">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Field label"
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#005bd3]"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">*</span>
                                    </div>
                                    <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-lg p-1.5 cursor-pointer">
                                        <span className="bg-white border px-1.5 py-0.5 rounded text-[10px] text-[#5c5f62] mr-2">One</span>
                                        <span className="text-xs text-gray-400 font-medium">Select field type</span>
                                        <svg className="ml-auto w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 20 20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3-3 3 3m0 6l-3 3-3-3" /></svg>
                                    </div>
                                </div>
                                <button className="p-1.5 text-gray-400 hover:text-black">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                            </div>

                            <button className="flex items-center gap-2 text-xs font-bold text-[#202223] pt-2 active:scale-95 transition-transform">
                                <div className="w-5 h-5 rounded-full border-2 border-dashed border-[#202223] flex items-center justify-center">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                                </div>
                                Add field
                            </button>
                        </div>
                    </div>

                    {/* Metaobject Options Accordion */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all border-b border-white"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#202223]">Metaobject options</span>
                                <svg className="w-3.5 h-3.5 text-[#5c5f62]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <svg className={`w-4 h-4 text-[#5c5f62] transition-transform duration-200 ${isOptionsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        </button>
                        
                        {isOptionsExpanded && (
                            <div className="p-6 pt-0 space-y-6 animate-in fade-in duration-300">
                                <hr className="mb-6 -mx-6 border-gray-100" />
                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[#202223] font-medium">Active-draft status</span>
                                    <Toggle active={options.activeDraft} onChange={() => toggleOption('activeDraft')} />
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[#202223] font-medium">Translations</span>
                                    <Toggle active={options.translations} onChange={() => toggleOption('translations')} />
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[#202223] font-medium">Publish entries as web pages</span>
                                    <Toggle active={options.publishWebPages} onChange={() => toggleOption('publishWebPages')} />
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[#202223] font-medium">Storefronts API access</span>
                                    <Toggle active={options.storefrontApi} onChange={() => toggleOption('storefrontApi')} />
                                </div>
                                <hr className="border-gray-100" />
                                <div className="flex items-center justify-between group">
                                    <span className="text-sm text-[#202223] font-medium">Customer Account API access</span>
                                    <Toggle active={options.customerAccountApi} onChange={() => toggleOption('customerAccountApi')} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Field Options Accordion */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setIsFieldOptionsExpanded(!isFieldOptionsExpanded)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all"
                        >
                            <span className="text-sm font-bold text-[#202223]">Field options</span>
                            <svg className={`w-4 h-4 text-[#5c5f62] transition-transform duration-200 ${isFieldOptionsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {isFieldOptionsExpanded && (
                            <div className="p-6 pt-0 animate-in fade-in duration-300">
                                <hr className="mb-6 -mx-6 border-gray-100" />
                                 <p className="text-sm text-gray-500 font-medium">Select a field to view options</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center pt-8">
                         <button className="text-xs font-bold text-gray-500 hover:text-[#202223] hover:underline flex items-center gap-1 transition-colors underline-offset-4">
                            Learn more about metaobjects
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMetaobjectDefinition;
