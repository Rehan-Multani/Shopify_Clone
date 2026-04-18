import React from 'react';
import FeatureCard from '../components/FeatureCard';

const CardSection = () => {
  const cards = [
    {
      icon: '🛒',
      title: 'Online Store',
      description: 'Build a high-converting storefront with AI-powered design tools and customizable themes.',
      accentColor: '#3B82F6',
    },
    {
      icon: '🏪',
      title: 'Point of Sale',
      description: 'Sell in-person across multiple locations with hardware that syncs everything automatically.',
      accentColor: '#2dd4bf',
    },
    {
      icon: '💳',
      title: 'Payments',
      description: 'Accept every major payment method globally with secure, built-in checkout experiences.',
      accentColor: '#8B5CF6',
    },
    {
      icon: '📈',
      title: 'Marketing',
      description: 'Reach new audiences and drive growth with integrated SEO and social marketing tools.',
      accentColor: '#F59E0B',
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Gain deep insights into your sales performance with real-time data and custom reports.',
      accentColor: '#EC4899',
    },
    {
      icon: '🚚',
      title: 'Shipping',
      description: 'Simplified fulfillment with discounted carrier rates and automated tracking for every order.',
      accentColor: '#06B6D4',
    },
  ];

  return (
    <section className="py-24 bg-[#0a0f1a]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">start and grow</span>
          </h2>
          <p className="text-lg text-[#9CA3AF] max-w-2xl mx-auto leading-relaxed">
            From first sale to full scale, Shopify handles every aspect of your business—so you can focus on building what you love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <FeatureCard 
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              accentColor={card.accentColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CardSection;
