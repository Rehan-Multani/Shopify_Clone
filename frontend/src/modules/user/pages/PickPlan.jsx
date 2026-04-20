import React from 'react';
import logo from '../../../assets/storify-logo.png';
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
        <div className="min-h-screen bg-[#0B0F14] flex flex-col pt-4 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Header */}
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Storify" className="h-4 w-auto" />
                    <span className="ml-1 text-base font-black italic text-storify tracking-tighter">Storify</span>
                    <span className="text-gray-600 font-normal mx-1">›</span>
                    <span className="text-base text-white font-black uppercase tracking-widest">Pick your plan</span>
                </div>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Sub-headline & Benefits */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-8 tracking-tight">Everything you need to run your business</h2>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
                    {benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <svg className="w-4 h-4 text-storify-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
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
                        className={`bg-[#111827] rounded-[32px] overflow-hidden flex flex-col relative transition-all duration-500 hover:shadow-[0_20px_60px_rgba(20,184,166,0.1)] border border-white/5 hover:border-storify/20 ${plan.popular ? 'teal-glow' : ''}`}
                    >
                        {plan.popular && (
                            <div className="teal-gradient text-white text-[10px] font-black py-2 text-center uppercase tracking-[0.2em] shadow-lg">
                                Most popular
                            </div>
                        )}
                        
                        <div className="p-10 flex flex-col h-full">
                            <div className="mb-10 text-center">
                                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">{plan.name}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{plan.tagline}</p>
                            </div>

                            <div className="mb-10 text-center">
                                {plan.originalPrice && (
                                    <div className="text-3xl text-gray-600 line-through font-bold decoration-[3px] opacity-50 mb-1">₹{plan.originalPrice}</div>
                                )}
                                {plan.trialPrice ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-white">₹{plan.trialPrice}</span>
                                            <span className="text-[10px] text-storify-glow font-black uppercase tracking-widest">INR/mo</span>
                                        </div>
                                        <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.1em] mt-2 leading-relaxed">
                                            For first 3 months
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        <p className="text-[10px] font-black text-gray-600 mb-2 leading-none uppercase tracking-widest">Starting at</p>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-4xl font-black text-white">₹{plan.startingAt}</span>
                                            <span className="text-[10px] text-gray-600 font-bold uppercase">/mo</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all mb-10 active:scale-95 shadow-xl ${plan.popular ? 'teal-gradient text-white' : 'bg-white/5 text-white hover:bg-white/10 border border-white/5'}`}>
                                Select {plan.name}
                            </button>

                            <div className="flex-grow">
                                <ul className="space-y-4">
                                    {plan.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex gap-3 text-xs leading-relaxed text-gray-400 font-medium">
                                            <svg className="w-4 h-4 text-storify flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <span className={feature.includes('Fully customizable') || feature.includes('Sell wholesale') || feature.includes('Optimize ads') ? 'text-storify-glow font-black' : ''}>
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
