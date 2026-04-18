import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const Subscribe = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedPlan = location.state?.plan || { name: 'Grow', price: '7,447' };
    
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [paymentMethod, setPaymentMethod] = useState('upi');

    return (
        <div className="min-h-screen bg-[#f1f2f4] flex flex-col font-sans text-[#202223] animate-in fade-in duration-700">
            {/* Header */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h1 className="text-base font-bold text-[#202223]">Subscribe</h1>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 space-y-6">
                {/* Info Banner */}
                <div className="bg-[#b4e1fa] rounded-xl p-4 flex gap-4 items-start shadow-sm border border-[#a0d6f5] transition-all hover:shadow-md animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-[#005bd3] text-white rounded-full p-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold mb-1">Enable international transactions</h3>
                        <p className="text-xs text-gray-700 leading-relaxed">
                            You may need to contact your bank and ask them to enable international transactions to make sure your payment goes through. 
                            <a href="#" className="underline ml-1 font-semibold hover:text-black">Learn more</a>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Billing and Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Yearly Billing Card */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold">Save with yearly billing</h3>
                                    <span className="bg-[#b4e1fa] text-[#005bd3] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        ₹22,176 off (₹5,599/mo)
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                                className={`w-12 h-6 rounded-full transition-colors relative ${billingCycle === 'yearly' ? 'bg-[#005bd3]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${billingCycle === 'yearly' ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-sm font-bold">Payment method</h3>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Shop Pay Branding */}
                                <div className="text-center space-y-4">
                                    <button className="w-full bg-[#5a31f4] hover:bg-[#4a21e4] py-3 rounded-lg flex items-center justify-center transition-all group active:scale-[0.98]">
                                        <div className="flex items-center gap-1.5 text-white font-black italic text-lg">
                                            <span>shop</span>
                                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs not-italic font-bold">Pay</span>
                                        </div>
                                    </button>
                                    <div className="relative flex items-center">
                                        <div className="flex-grow border-t border-gray-100"></div>
                                        <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">or</span>
                                        <div className="flex-grow border-t border-gray-100"></div>
                                    </div>
                                </div>

                                {/* UPI Form */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded-full border-4 border-[#005bd3] bg-white"></div>
                                            <span className="text-sm font-bold uppercase tracking-widest">UPI</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
                                                <div className="w-6 h-3 bg-gradient-to-r from-orange-500 to-green-500 opacity-80"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <p className="text-xs font-semibold text-gray-500">Accepted apps include Google Pay, PhonePe & more. Send your UPI ID verification</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-700">Enter a UPI ID</label>
                                                <input type="text" placeholder="Example: username@razorpay" className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-700">Phone number</label>
                                                <input type="text" placeholder="Phone number" className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm focus:border-[#005bd3] focus:ring-1 focus:ring-[#005bd3] outline-none transition-all" />
                                            </div>
                                        </div>

                                        <p className="text-xs font-bold text-gray-500 pt-2 uppercase tracking-widest">For accurate tax calculation, provide the location of your business:</p>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-1.5 group">
                                                <label className="text-xs font-bold text-[#202223]">PIN code</label>
                                                <input type="text" className="w-full bg-[#fff4f4] border border-[#d21c1c] rounded-lg py-2.5 px-3 text-sm focus:ring-0 outline-none transition-all" />
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-[#d21c1c]">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Enter a valid zip/postal code
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#202223]">City</label>
                                                <input type="text" className="w-full bg-[#fff4f4] border border-[#d21c1c] rounded-lg py-2.5 px-3 text-sm outline-none transition-all" />
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-[#d21c1c]">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Enter your city
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#202223]">State</label>
                                                <div className="relative">
                                                    <select className="w-full bg-[#fff4f4] border border-[#d21c1c] rounded-lg py-2.5 pl-3 pr-8 text-sm outline-none appearance-none font-medium">
                                                        <option>Andaman and Ni...</option>
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" /></svg>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-[#d21c1c]">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Select a state/province
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 opacity-40">
                                                <label className="text-xs font-bold text-gray-500">Country/region</label>
                                                <div className="relative">
                                                    <select disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2.5 pl-3 pr-8 text-sm outline-none appearance-none font-medium">
                                                        <option>India</option>
                                                    </select>
                                                     <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4 4 4-4" /></svg>
                                                    </div>
                                                </div>
                                                <button className="text-[10px] font-bold text-gray-400 underline uppercase tracking-tight">Change country/region</button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button className="bg-[#2a2a2e] text-white px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-black transition-all shadow-md active:scale-95">
                                                Setup UPI
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Payment Option */}
                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white"></div>
                                            <span className="text-sm font-bold text-gray-700">Credit or debit card</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-8 h-5 bg-white border border-gray-100 rounded flex items-center justify-center shadow-sm">
                                                <span className="text-[8px] font-black text-blue-800">VISA</span>
                                            </div>
                                            <div className="w-8 h-5 bg-white border border-gray-100 rounded flex items-center justify-center shadow-sm overflow-hidden">
                                                <div className="flex gap-[-2px]">
                                                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
                                                    <div className="w-3 h-3 rounded-full bg-orange-500 opacity-80 -ml-1.5"></div>
                                                </div>
                                            </div>
                                            <div className="w-8 h-5 bg-[#016fd0] rounded flex items-center justify-center shadow-sm">
                                                <span className="text-[6px] font-black text-white italic">AMEX</span>
                                            </div>
                                            <div className="w-8 h-5 bg-black border border-gray-100 rounded flex items-center justify-center shadow-sm overflow-hidden">
                                                <div className="w-full h-full bg-[#f6821f] flex items-center justify-center scale-75 rounded-sm">
                                                    <span className="text-[5px] font-black text-white uppercase italic">Discover</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary Card */}
                    <div className="lg:col-span-1 border border-gray-200 bg-white rounded-2xl shadow-sm overflow-hidden p-6 space-y-8 sticky top-20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                                     <svg className="w-6 h-6 text-[#008060]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest">{selectedPlan.name} plan</h3>
                                    <p className="text-xs font-medium text-gray-500 tracking-wide capitalize">{billingCycle}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black">₹{selectedPlan.price}.00</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">₹20 × 3 months</div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-1.5 top-1 bottom-1 w-[1.2px] bg-gray-200"></div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-3 h-3 rounded-full bg-black border-2 border-white mt-1 shadow-sm"></div>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold">Today</p>
                                        <p className="text-[11px] font-medium text-gray-500">Trial</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-400">Free</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white mt-1"></div>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold">Apr 21, 2026</p>
                                        <p className="text-[11px] font-medium text-gray-500">₹20 × 3 months</p>
                                    </div>
                                    <p className="text-sm font-bold">₹20.00/mo</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-white mt-1"></div>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <p className="text-sm font-bold">Jul 20, 2026</p>
                                    </div>
                                    <p className="text-sm font-bold">₹{selectedPlan.price}/mo</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-[#008060] rounded-full flex items-center justify-center p-1">
                                    <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-xs font-bold text-[#008060]">2 offers included</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-bold">Amount due</span>
                                <span className="text-base font-black uppercase">₹20.00 INR</span>
                            </div>
                            <div className="flex items-baseline justify-between text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                <span>Apr 21, 2026</span>
                                <span>plus applicable taxes</span>
                            </div>
                        </div>

                        <button className="w-full bg-[#1a1c23] hover:bg-black text-white py-3.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 group relative overflow-hidden">
                            <span className="relative z-10">Subscribe</span>
                            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>

                        <div className="text-center space-y-4">
                            <p className="text-xs font-semibold text-gray-400 leading-relaxed px-4">
                                You need to select a payment method before you can start this plan.
                            </p>
                            <p className="text-xs font-bold text-gray-500 hover:text-black cursor-pointer transition-colors underline underline-offset-2">
                                Change or cancel your plan anytime
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Subscribe;
