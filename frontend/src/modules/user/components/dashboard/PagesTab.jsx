import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORE_API_URL = import.meta.env.VITE_STORE_API_URL || 'http://localhost:5004/api';
const API_URL = STORE_API_URL;

const PagesTab = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('merchantToken');

    const fetchPages = async () => {
        try {
            const res = await fetch(`${API_URL}/store-pages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setPages(data.pages);
            }
        } catch (err) {
            console.error('Failed to fetch pages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPages(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Store Pages</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">Manage standard pages for your store</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Page Title</th>
                                <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3 hidden md:table-cell">Status</th>
                                <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page, idx) => (
                                <tr key={page.slug} className={`group hover:bg-gray-50/80 transition-colors ${idx !== pages.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-sm text-[#202223]">{page.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        {!page.isNew ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                Customized
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                Not Customized
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end">
                                            <Link
                                                to={`/dashboard/pages/edit/${page.slug}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1c23] text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow-sm active:scale-95"
                                            >
                                                Edit Page
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PagesTab;
