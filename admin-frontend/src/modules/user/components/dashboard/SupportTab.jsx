import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORE_API_URL = import.meta.env.VITE_STORE_API_URL;

const Modal = ({ title, onClose, children }) => {
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10 sm:pt-16 bg-black/60 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transition-all duration-300 transform scale-100 flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50/20 to-transparent flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-50 text-[#1a1c23] rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">{title}</h3>
                            <p className="text-xs text-gray-500">Raise a support ticket directly with our admin team.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>,
        document.body
    );
};



const SupportTab = () => {
    const [tickets, setTickets] = useState([]);
    const [stores, setStores] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', storeId: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedStoreFilter, setSelectedStoreFilter] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('');

    const token = localStorage.getItem('merchantToken');

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTickets(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching support tickets:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await fetch(`${STORE_API_URL}/stores/my-stores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStores(data || []);
            }
        } catch (err) {
            console.error('Error fetching stores for dropdown:', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTickets();
            fetchStores();
        }
    }, [token]);

    const fetchTicketDetails = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedTicket(data.data);
                setTickets(prev => prev.map(t => t._id === id ? data.data : t));
            }
        } catch (err) {
            console.error('Error fetching ticket details:', err);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (!form.title.trim() || !form.description.trim()) {
            setErrorMsg('Title and Description are required');
            return;
        }

        try {
            const activeStoreId = localStorage.getItem('activeStoreId') || '';
            const payload = {
                ...form,
                storeId: form.storeId || activeStoreId || undefined
            };

            const res = await fetch(`${API_BASE_URL}/support-tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-store-id': activeStoreId
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccessMsg('Support ticket created successfully!');
                setForm({ title: '', description: '', priority: 'medium', storeId: '' });
                setIsCreating(false);
                fetchTickets();
                setSelectedTicket(data.data);
                setTimeout(() => setSuccessMsg(''), 4000);
            } else {
                setErrorMsg(data.message || 'Failed to create support ticket');
            }
        } catch (err) {
            setErrorMsg('Network error. Please try again.');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets/${selectedTicket._id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: messageInput.trim() })
            });
            if (res.ok) {
                setMessageInput('');
                fetchTicketDetails(selectedTicket._id);
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleCloseTicket = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/support-tickets/${selectedTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'closed' })
            });
            if (res.ok) {
                fetchTicketDetails(selectedTicket._id);
            }
        } catch (err) {
            console.error('Error closing ticket:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                    <h1 className="text-xl font-bold text-[#202223]">Support Center</h1>
                    <p className="text-xs text-[#5c5f62] mt-0.5">Need help? Raise a support request or contact the administration team.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
                        className="bg-[#1a1c23] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md shadow-black/10"
                    >
                        Create Support Ticket
                    </button>
                )}
            </div>

            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">✓</span>
                    {successMsg}
                </div>
            )}

            {isCreating && (
                <Modal title="New Support Ticket" onClose={() => setIsCreating(false)}>
                    {errorMsg && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleCreateTicket} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Select Store (Optional)</label>
                            <div className="relative">
                                <select
                                    value={form.storeId}
                                    onChange={e => setForm({ ...form, storeId: e.target.value })}
                                    className="w-full pl-3 pr-10 py-2.5 border border-[#d3d3d3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1c23]/10 bg-white cursor-pointer appearance-none"
                                >
                                    <option value="">-- Choose Store (General account issue) --</option>
                                    {stores.map(store => (
                                        <option key={store._id} value={store._id}>{store.storeName}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Subject / Title *</label>
                            <input
                                type="text"
                                placeholder="Brief summary of the issue"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                className="w-full px-3.5 py-2.5 border border-[#d3d3d3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1c23]/10 bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Priority</label>
                            <div className="relative">
                                <select
                                    value={form.priority}
                                    onChange={e => setForm({ ...form, priority: e.target.value })}
                                    className="w-full pl-3 pr-10 py-2.5 border border-[#d3d3d3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1c23]/10 bg-white cursor-pointer appearance-none"
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#5c5f62] block mb-1.5">Detailed Description *</label>
                            <textarea
                                rows="3"
                                placeholder="Describe your query or issue in detail..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full px-3.5 py-3 border border-[#d3d3d3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1c23]/10 bg-white"
                                required
                            />
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 text-white text-sm font-bold py-3 rounded-xl hover:opacity-95 shadow-md shadow-black/10 transition-all active:scale-95 text-center"
                                style={{ background: '#1a1c23' }}
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Tickets List */}
                <div className="md:col-span-1 bg-white border border-[#e3e3e3] rounded-xl shadow-sm overflow-hidden flex flex-col h-[550px]">
                    <div className="p-4 border-b space-y-3">
                        <h3 className="text-sm font-bold text-[#202223]">My Requests</h3>
                        
                        {/* Filters */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <select
                                    value={selectedStoreFilter}
                                    onChange={e => setSelectedStoreFilter(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-700 cursor-pointer focus:outline-none"
                                >
                                    <option value="">All Stores</option>
                                    <option value="general">General Issues</option>
                                    {stores.map(store => (
                                        <option key={store._id} value={store._id}>{store.storeName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    value={selectedStatusFilter}
                                    onChange={e => setSelectedStatusFilter(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-700 cursor-pointer focus:outline-none"
                                >
                                    <option value="">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto divide-y">
                        {isLoading ? (
                            <div className="p-8 text-center text-xs text-gray-400">Loading tickets...</div>
                        ) : tickets.filter(ticket => {
                            // Filter by store
                            if (selectedStoreFilter === 'general') {
                                if (ticket.storeId) return false;
                            } else if (selectedStoreFilter) {
                                if (ticket.storeId?._id !== selectedStoreFilter) return false;
                            }
                            // Filter by status
                            if (selectedStatusFilter && ticket.status !== selectedStatusFilter) {
                                return false;
                            }
                            return true;
                        }).length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-400">No support requests found.</div>
                        ) : (
                            tickets.filter(ticket => {
                                if (selectedStoreFilter === 'general') {
                                    if (ticket.storeId) return false;
                                } else if (selectedStoreFilter) {
                                    if (ticket.storeId?._id !== selectedStoreFilter) return false;
                                }
                                if (selectedStatusFilter && ticket.status !== selectedStatusFilter) {
                                    return false;
                                }
                                return true;
                            }).map(ticket => (
                                <div
                                    key={ticket._id}
                                    onClick={() => { setSelectedTicket(ticket); setIsCreating(false); }}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors text-left ${selectedTicket?._id === ticket._id ? 'bg-gray-50 border-l-4 border-[#1a1c23]' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-bold text-xs text-[#202223] truncate flex-1">{ticket.title}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            ticket.status === 'open' ? 'bg-blue-50 text-blue-700' :
                                            ticket.status === 'in-progress' ? 'bg-amber-50 text-amber-700' :
                                            ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>{ticket.status}</span>
                                    </div>
                                    <div className="mt-1">
                                        {ticket.storeId?.storeName ? (
                                            <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100/50 inline-flex items-center gap-1 shadow-sm">
                                                🏬 {ticket.storeId.storeName}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 inline-flex items-center gap-1">
                                                👤 General Issue
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 truncate mt-1.5">{ticket.description}</p>
                                    <div className="flex justify-between items-center mt-3 text-[10px] text-gray-400">
                                        <span>Priority: <strong className="capitalize">{ticket.priority}</strong></span>
                                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className="md:col-span-2 bg-white border border-[#e3e3e3] rounded-xl shadow-sm flex flex-col h-[550px] overflow-hidden">
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-[#202223]">{selectedTicket.title}</h3>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        Created: {new Date(selectedTicket.createdAt).toLocaleString()} | Priority: <span className="font-bold capitalize">{selectedTicket.priority}</span>
                                        {selectedTicket.storeId?.storeName && <span> | Store: <span className="font-bold text-[#1a1c23]">{selectedTicket.storeId.storeName}</span></span>}
                                    </p>
                                </div>
                                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                    <button
                                        onClick={handleCloseTicket}
                                        className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold transition-all"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {selectedTicket.messages.map((msg, i) => {
                                    const isMerchant = msg.sender === 'merchant';
                                    return (
                                        <div
                                            key={i}
                                            className={`flex flex-col max-w-[80%] ${isMerchant ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                                        >
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                                                {isMerchant ? 'You' : 'Storify Admin'}
                                            </span>
                                            <div className={`p-3 rounded-xl text-xs shadow-sm leading-relaxed ${isMerchant ? 'bg-[#1a1c23] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[9px] text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reply Input */}
                            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                                <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-3 items-center">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={e => setMessageInput(e.target.value)}
                                        placeholder="Type your response here..."
                                        className="flex-grow px-3.5 py-2 border border-[#d3d3d3] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-[#1a1c23] bg-white transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#1a1c23] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-md shadow-black/10"
                                    >
                                        Send
                                    </button>
                                </form>
                            ) : (
                                <div className="p-4 bg-gray-100 text-center text-xs font-semibold text-gray-500">
                                    This support ticket is marked as {selectedTicket.status} and cannot receive new replies.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-gray-400 p-8">
                            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs font-semibold">Select a ticket from the sidebar to view details or replies</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportTab;
