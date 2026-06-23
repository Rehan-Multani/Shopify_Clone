import React, { useState, useEffect } from 'react';
import logo from '../../../assets/storify-logo.png';
import { Link, useNavigate } from 'react-router-dom';

const MERCHANT_ADMIN_API_URL = import.meta.env.VITE_MERCHANT_ADMIN_API_URL || 'http://localhost:5002/api/admin';
const API_URL = MERCHANT_ADMIN_API_URL;

const PickPlan = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    // Get merchant's current plan type from localStorage
    const merchantInfo = JSON.parse(localStorage.getItem('merchantInfo') || '{}');
    const currentPlanType = merchantInfo?.plan?.planType || 'Single Vendor';

    const benefits = [
        "World's best checkout",
        "Sell online and in person",
        "24/7 chat support",
        "Over 13,000 apps"
    ];

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${API_URL}/plans`);
                const data = await res.json();
                if (res.ok) {
                    // Filter plans by the merchant's plan type
                    const filteredPlans = data.filter(p => p.planType === currentPlanType);
                    setPlans(filteredPlans);
                    // Auto-select first plan or popular one
                    const popular = filteredPlans.find(p => p.isPopular);
                    if (popular) setSelectedPlanId(popular._id);
                    else if (filteredPlans.length > 0) setSelectedPlanId(filteredPlans[0]._id);
                }
            } catch (err) {
                console.error('Failed to fetch plans', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = (plan) => {
        navigate('/dashboard/plan/subscribe', {
            state: {
                plan: {
                    _id: plan._id,
                    name: plan.planName,
                    price: plan.planPrice,
                    features: plan.features,
                    planType: plan.planType
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#f6f6f7] flex flex-col pt-4 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
            {/* Header */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <img src={logo} alt="Storify" className="h-4 w-auto grayscale contrast-125 group-hover:grayscale-0 transition-all" />
                    <span className="text-gray-400 font-normal mr-1">›</span>
                    <span className="text-base text-[#202223] font-black uppercase tracking-widest group-hover:text-black">Pick your plan</span>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-white rounded-lg transition-all text-gray-500 hover:text-black border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Benefits */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-xl sm:text-2xl font-black text-[#202223] mb-8 tracking-tight">Everything you need to run your business</h2>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                    {benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-[#5c5f62] uppercase tracking-widest">
                            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            {benefit}
                        </div>
                    ))}
                </div>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
                <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[24px] p-8 animate-pulse h-96">
                            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded w-32 mb-6"></div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map(j => <div key={j} className="h-4 bg-gray-100 rounded w-full"></div>)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : plans.length === 0 ? (
                <div className="max-w-md mx-auto text-center bg-white rounded-2xl p-12 shadow-sm border border-gray-200">
                    <p className="text-[#5c5f62] text-sm font-medium mb-4">No plans available for {currentPlanType} yet.</p>
                    <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-black underline">Go back to dashboard</button>
                </div>
            ) : (
                <div className={`max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 ${plans.length >= 3 ? 'lg:grid-cols-3' : ''} ${plans.length >= 4 ? 'lg:grid-cols-4' : ''} gap-6 px-4`}>
                    {plans.map((plan) => (
                        <div
                            key={plan._id}
                            onClick={() => setSelectedPlanId(plan._id)}
                            className={`bg-white rounded-[24px] overflow-hidden flex flex-col relative transition-all duration-500 cursor-pointer ${selectedPlanId === plan._id
                                    ? 'ring-[3px] ring-black shadow-2xl scale-[1.02] z-10'
                                    : 'hover:shadow-xl border border-gray-200'
                                }`}
                        >
                            {(plan.isPopular || selectedPlanId === plan._id) && (
                                <div className={`text-[10px] font-black py-2 text-center uppercase tracking-[0.2em] ${selectedPlanId === plan._id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {plan.isPopular ? 'Most popular' : plan.isRecommended ? 'Recommended' : '\u00A0'}
                                </div>
                            )}

                            <div className="p-8 flex flex-col h-full">
                                <div className="mb-8 text-center text-[#202223]">
                                    <h3 className="text-2xl font-black mb-1 tracking-tight">{plan.planName}</h3>
                                    <p className="text-[10px] font-bold text-[#5c5f62] uppercase tracking-[0.15em]">{plan.description || plan.planType}</p>
                                </div>

                                <div className="mb-8 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-[#202223]">₹{plan.planPrice.toLocaleString()}</span>
                                            <span className="text-[10px] text-[#202223] font-black uppercase tracking-widest">INR/mo</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectPlan(plan);
                                    }}
                                    className={`w-full py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all mb-8 active:scale-95 ${selectedPlanId === plan._id
                                            ? 'bg-black text-white hover:opacity-90 shadow-lg shadow-black/10'
                                            : 'bg-white text-black border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                                        }`}
                                >
                                    Select {plan.planName}
                                </button>

                                <div className="flex-grow">
                                    <ul className="space-y-3">
                                        {(plan.features || []).map((feature, fIdx) => (
                                            <li key={fIdx} className="flex gap-3 text-[11px] leading-relaxed text-[#5c5f62] font-semibold">
                                                <svg className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PickPlan;
