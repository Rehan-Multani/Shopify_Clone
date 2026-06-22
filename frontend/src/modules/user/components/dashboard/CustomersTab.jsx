import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CSVImportModal from './CSVImportModal';

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || 'http://localhost:5003/api';
const API_URL = CATALOG_API_URL;

const CustomersTab = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const token = localStorage.getItem('merchantToken');

    const fetchCustomers = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/customers`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
            });
            const data = await res.json();
            if (res.ok) setCustomers(data);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleDelete = async () => {
        try {
            const storeId = localStorage.getItem('activeStoreId') || '';
            const res = await fetch(`${API_URL}/customers/${deleteModal.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'x-store-id': storeId }
            });
            if (res.ok) {
                setCustomers(prev => prev.filter(c => c._id !== deleteModal.id));
                showToast('Customer deleted successfully');
            } else {
                showToast('Failed to delete customer', 'error');
            }
        } catch (err) {
            showToast('Failed to delete customer', 'error');
        }
        setDeleteModal({ open: false, id: null, name: '' });
    };

    const filtered = customers.filter(c => {
        return c.name.toLowerCase().includes(search.toLowerCase()) || 
               c.email.toLowerCase().includes(search.toLowerCase()) ||
               c.number.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {toast.type === 'success'
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        }
                    </svg>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-[#202223] tracking-tight">Customers</h1>
                    <p className="text-sm text-[#5c5f62] mt-1">{customers.length} customers total</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="bg-white text-[#202223] border border-gray-200 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import CSV
                    </button>
                    <Link
                        to="/dashboard/customers/new"
                        className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Customer
                    </Link>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email or phone number..."
                    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-transparent transition-all"
                />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-[#202223] mb-1">No customers found</h3>
                    <p className="text-sm text-[#5c5f62] mb-4">Add your first customer to start managing details</p>
                    <Link to="/dashboard/customers/new" className="inline-flex items-center gap-2 bg-[#1a1c23] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Customer
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Customer</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Email</th>
                                    <th className="text-left text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Phone</th>
                                    <th className="text-right text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((customer, idx) => (
                                    <tr key={customer._id} className={`group hover:bg-gray-50/80 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {customer.image ? (
                                                        <img src={`${API_URL.replace('/api', '')}${customer.image}`} alt={customer.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-bold text-sm text-[#202223]">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-[#5c5f62]">{customer.email}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-sm text-[#5c5f62]">{customer.number}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    to={`/dashboard/customers/view/${customer._id}`}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                    title="View Profile"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </Link>
                                                <Link
                                                    to={`/dashboard/customers/edit/${customer._id}`}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-black"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, id: customer._id, name: customer.name })}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100 text-xs text-[#5c5f62] font-medium">
                        Showing {filtered.length} of {customers.length} customers
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg text-[#202223]">Delete Customer</h3>
                            <p className="text-sm text-[#5c5f62] mt-1">Are you sure you want to delete customer <strong>{deleteModal.name}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ open: false, id: null, name: '' })} className="flex-1 px-4 py-2.5 bg-gray-100 text-[#202223] rounded-lg font-bold text-sm hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CSVImportModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)}
                title="Import customers by CSV"
                buttonText="Import customers"
                type="customers"
                onImportSuccess={fetchCustomers}
            />
        </div>
    );
};

export default CustomersTab;
