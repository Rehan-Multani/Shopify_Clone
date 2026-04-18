import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(true);

  const plans = [
    {
      name: 'Basic',
      description: 'Everything you need to create your store, ship products, and process payments',
      monthlyPrice: 1994,
      yearlyPrice: 1499,
      features: [
        'Basic reports',
        'Up to 1,000 inventory locations',
        '2 staff accounts',
        'Unlimited products',
        '24/7 support'
      ]
    },
    {
      name: 'Storify',
      description: 'Level up your business with professional reporting and more staff accounts',
      monthlyPrice: 7447,
      yearlyPrice: 5599,
      features: [
        'Professional reports',
        'Up to 1,000 inventory locations',
        '5 staff accounts',
        'Standard transaction fees',
        'Everything in Basic'
      ],
      popular: true
    },
    {
      name: 'Advanced',
      description: 'Get the best of Storify with custom reporting and our lowest transaction fees',
      monthlyPrice: 30140,
      yearlyPrice: 22680,
      features: [
        'Custom report builder',
        'Up to 1,000 inventory locations',
        '15 staff accounts',
        'Lowest transaction fees',
        'Everything in Storify'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <Header />
      
      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Set up your store, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-storify-glow to-storify">pick a plan later</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12">
            Try Storify free for 3 days, no credit card required.
          </p>
 
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-bold transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="w-14 h-8 bg-white/10 rounded-full p-1 relative transition-colors duration-300 hover:bg-white/20"
            >
              <div className={`w-6 h-6 bg-storify rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-sm font-bold transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
              Yearly <span className="text-storify text-xs ml-1">(Save 25%)</span>
            </span>
          </div>
 
          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`text-left p-10 rounded-[32px] border transition-all duration-300 relative flex flex-col group ${
                  plan.popular 
                    ? 'border-storify/50 bg-[#111827] teal-glow' 
                    : 'border-white/5 bg-[#111827] hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-10 -translate-y-1/2 teal-gradient text-white text-[10px] font-black tracking-widest px-4 py-2 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-storify-glow transition-colors">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-8 min-h-[3rem] leading-relaxed">{plan.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-bold text-white">₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                  <span className="text-gray-400 text-sm ml-2">INR / mo</span>
                </div>
 
                <div className="flex-grow">
                  <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-storify mb-6">WHAT'S INCLUDED</h4>
                  <ul className="space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-sm text-gray-300">
                        <svg className="w-5 h-5 text-storify flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
 
                <Link 
                  to="/login"
                  className={`mt-10 w-full py-4 rounded-full font-bold transition-all active:scale-95 flex items-center justify-center shadow-lg ${
                    plan.popular 
                      ? 'teal-gradient text-white hover:opacity-90' 
                      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  Choose {plan.name}
                </Link>
              </div>
            ))}
          </div>
 
          {/* Comparison Link */}
          <div className="text-center">
            <button className="text-storify font-bold hover:text-storify-glow transition-colors hover:underline">Compare all features →</button>
          </div>
        </section>
 
        {/* FAQ Section */}
        <section className="bg-black/40 py-24 border-y border-white/5">
           <div className="container mx-auto px-6 max-w-4xl">
              <h2 className="text-3xl font-extrabold text-center mb-16 text-white tracking-tight leading-tight">Frequently Asked Questions</h2>
              <div className="space-y-8">
                 {[1, 2, 3].map((item) => (
                    <div key={item} className="border-b border-white/5 pb-8 group cursor-pointer">
                       <h3 className="text-xl font-bold mb-4 text-white group-hover:text-storify-glow transition-colors">Can I change my plan later?</h3>
                       <p className="text-gray-400 group-hover:text-gray-300 transition-colors">Yes, you can upgrade or downgrade your plan at any time directly from your Storify admin panel.</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      </main>
 
      <Footer />
    </div>
  );
};

export default Pricing;
