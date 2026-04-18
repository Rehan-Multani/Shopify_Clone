import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PickPlan = () => {
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen bg-[#f1f1f1] flex flex-col pt-4 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-gray-400 font-normal mr-1">›</span>
                    <span className="text-base text-black font-bold">Pick your plan</span>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Sub-headline & Benefits */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Everything you need to run your business</h2>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                    {benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <svg className="w-4 h-4 text-shopify" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            {benefit}
                        </div>
                    ))}
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
                {plans.map((plan, i) => (
                    <div 
                        key={i} 
                        className={`bg-white rounded-[20px] shadow-sm border border-gray-200 overflow-hidden flex flex-col relative transition-all hover:shadow-md ${plan.popular ? 'border-t-0' : ''}`}
                    >
                        {plan.popular && (
                            <div className="bg-[#eaf4ff] text-[#005bd3] text-xs font-bold py-2 text-center uppercase tracking-wider">
                                Most popular
                            </div>
                        )}
                        
                        <div className="p-8 flex flex-col h-full">
                            <div className="mb-8">
                                <h3 className="text-3xl font-black text-black mb-1">{plan.name}</h3>
                                <p className="text-sm font-medium text-gray-500 italic">{plan.tagline}</p>
                            </div>

                            <div className="mb-8">
                                {plan.originalPrice && (
                                    <div className="text-4xl text-gray-400/50 line-through font-bold decoration-[3px] decoration-gray-400/40">₹{plan.originalPrice}</div>
                                )}
                                {plan.trialPrice ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-black">₹{plan.trialPrice}</span>
                                        <div className="text-[10px] sm:text-xs text-gray-500 font-bold leading-tight">
                                            INR/month <br />
                                            for first 3 months
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <p className="text-xs font-bold text-gray-500 mb-1 leading-none uppercase">Starting at</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-black">₹{plan.startingAt}</span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">INR/month</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-2.5 bg-[#1a1c23] text-white font-bold rounded-lg text-sm hover:bg-black transition-all mb-8 active:scale-95 shadow-sm">
                                Select {plan.name}
                            </button>

                            <div className="flex-grow">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex gap-2 text-[13px] leading-tight text-gray-700">
                                            <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span className={feature.includes('Fully customizable') || feature.includes('Sell wholesale') || feature.includes('Optimize ads') ? 'text-[#005bd3] font-bold' : ''}>
                                              {feature.includes('Fully customizable') || feature.includes('Sell wholesale') || feature.includes('Optimize ads') ? '+ ' + feature : feature}
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
