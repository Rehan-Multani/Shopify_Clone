import React, { useState, useEffect } from 'react';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';

const CategorySection = ({ settings = {} }) => {
    const { title = 'Shop by Category', columns = 4 } = settings;
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const storeId = localStorage.getItem('activeStoreId') || '';
    const token = localStorage.getItem('merchantToken') || '';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (!storeId) return;
                const res = await fetch(`${CATALOG_API_URL}/categories`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'x-store-id': storeId
                    }
                });
                const data = await res.json();
                if (res.ok && data.categories) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error('Error fetching categories for storefront category section:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [storeId, token]);

    const getGridColsClass = () => {
        switch (parseInt(columns)) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
            case 6: return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6';
            case 4:
            default:
                return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
        }
    };

    if (loading) {
        return (
            <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="py-16 text-center text-gray-400 font-semibold">
                No categories found. Add categories to display them here.
            </div>
        );
    }

    return (
        <section className="py-16 px-6 md:px-12 bg-white max-w-7xl mx-auto w-full space-y-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className={`grid ${getGridColsClass()} gap-6`}>
                {categories.map((category) => (
                    <div 
                        key={category._id}
                        className="group relative h-64 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                        {category.image ? (
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                                <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <h3 className="text-white font-bold text-lg leading-tight uppercase tracking-wide">
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-gray-200 text-xs mt-1 line-clamp-2">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
