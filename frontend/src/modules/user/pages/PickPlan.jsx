import React, { useState } from 'react';
import logo from '../../../assets/storify-logo.png';
import { Link, useNavigate } from 'react-router-dom';

const PickPlan = () => {
    const navigate = useNavigate();
    const [selectedPlanName, setSelectedPlanName] = useState('Basic');

    const benefits = [
        "World's best checkout",
        "Sell online and in person",
        "24/7 chat support",
        "Over 13,000 apps"
    ];

    const plans = [
        {
            name: 'Basic',
            tagline: 'For solo entrepreneurs',
            originalPrice: '1,994',
            trialPrice: '20',
            popular: true,
            features: [
                'Earn ₹110,000 in credits as you sell',
                'Full online store',
                'Sell in person with a phone or card reader',
                '10 inventory locations',
                'Easy shipping labels'
            ]
        },
        {
            name: 'Grow',
            tagline: 'For small teams',
            originalPrice: '7,447',
            trialPrice: '20',
            features: [
                'Earn ₹170,000 in credits as you sell',
                'Full online store',
                'Sell in person with a phone or card reader',
                '10 inventory locations',
                'Shipping discounts + insurance',
                '5 staff accounts'
            ]
        },
        {
            name: 'Advanced',
            tagline: 'For global reach',
            originalPrice: '30,164',
            trialPrice: '20',
            features: [
                'Earn ₹230,000 in credits as you sell',
                'Full online store',
                'Sell in person with a phone or card reader',
                '10 inventory locations',
                'Fully integrated shipping',
                '15 staff accounts',
                'Local storefronts by market',
                'Enhanced 24/7 chat support'
            ]
        },
        {
            name: 'Plus',
            tagline: 'For complex businesses',
            startingAt: '175,000',
            features: [
                'Full online store',
                'Sell in person with POS Pro for up to 200 locations',
                '200 inventory locations',
                'Local storefronts by market',
                'Fully integrated shipping',
                'Unlimited staff accounts',
                'Priority 24/7 phone support',
                'Fully customizable checkout',
                'Sell wholesale/B2B',
                'Optimize ads with Audiences'
            ]
        }
    ];

    const handleSelectPlan = (plan) => {
        navigate('/dashboard/plan/subscribe', { 
            state: { 
                plan: {
                    name: plan.name,
                    price: plan.trialPrice ? plan.trialPrice : plan.startingAt
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
            
            {/* ... benefits section remains the same ... */}
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
            <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {plans.map((plan, i) => (
                    <div 
                        key={i} 
                        onClick={() => setSelectedPlanName(plan.name)}
                        className={`bg-white rounded-[24px] overflow-hidden flex flex-col relative transition-all duration-500 cursor-pointer ${
                            selectedPlanName === plan.name 
                                ? 'ring-[3px] ring-black shadow-2xl scale-[1.02] z-10' 
                                : 'hover:shadow-xl border border-gray-200'
                        }`}
                    >
                        {(plan.popular || selectedPlanName === plan.name) && (
                            <div className={`text-[10px] font-black py-2 text-center uppercase tracking-[0.2em] ${
                                selectedPlanName === plan.name ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {plan.popular ? 'Most popular' : '\u00A0'}
                            </div>
                        )}
                        
                        <div className="p-8 flex flex-col h-full">
                            <div className="mb-8 text-center text-[#202223]">
                                <h3 className="text-2xl font-black mb-1 tracking-tight">{plan.name}</h3>
                                <p className="text-[10px] font-bold text-[#5c5f62] uppercase tracking-[0.15em]">{plan.tagline}</p>
                            </div>

                            <div className="mb-8 text-center">
                                {plan.originalPrice && (
                                    <div className="text-2xl text-gray-300 line-through font-bold decoration-[2px] mb-1">₹{plan.originalPrice}</div>
                                )}
                                {plan.trialPrice ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-[#202223]">₹{plan.trialPrice}</span>
                                            <span className="text-[10px] text-[#202223] font-black uppercase tracking-widest">INR/mo</span>
                                        </div>
                                        <div className="text-[9px] text-[#5c5f62] font-black uppercase tracking-[0.1em] mt-1">
                                            For first 3 months
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <p className="text-[10px] font-black text-[#5c5f62] mb-1 leading-none uppercase tracking-widest">Starting at</p>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-3xl font-black text-[#202223]">₹{plan.startingAt}</span>
                                            <span className="text-[10px] text-[#5c5f62] font-bold uppercase">/mo</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectPlan(plan);
                                }}
                                className={`w-full py-3.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all mb-8 active:scale-95 ${
                                    selectedPlanName === plan.name 
                                        ? 'bg-black text-white hover:opacity-90 shadow-lg shadow-black/10' 
                                        : 'bg-white text-black border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                                }`}
                            >
                                Select {plan.name}
                            </button>

                            <div className="flex-grow">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex gap-3 text-[11px] leading-relaxed text-[#5c5f62] font-semibold">
                                            <svg className="w-3.5 h-3.5 text-black flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span className={feature.includes('Fully customizable') || feature.includes('Sell wholesale') || feature.includes('Optimize ads') ? 'text-black font-black' : ''}>
                                              {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PickPlan;
