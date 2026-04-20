import React from 'react';
import { Link } from 'react-router-dom';
import entrepreneurImg from '../../../assets/entrepreneur_candles_1776676092076.png';
import gymsharkImg from '../../../assets/gymshark_team_1776676112105.png';
import enterpriseImg from '../../../assets/shopify1.avif';

const EnterpriseSection = () => {
  const cards = [
    {
      image: entrepreneurImg,
      title: 'Get started fast',
      description: 'Solo seller Megan Bre Camp started Summer Solace Tallow to sell her organic candles and skincare online and at local farmers markets.'
    },
    {
      image: gymsharkImg,
      title: 'Grow as big as you want',
      description: 'Athleisure brand Gymshark grew from working out of a garage to the global juggernaut it is today, with $500M+ sales annually.'
    },
    {
      image: enterpriseImg,
      title: 'Raise the bar',
      description: 'With the help of Storify for enterprise, Mattel sells their iconic toys direct to customers around the world.'
    }
  ];

  return (
    <section className="bg-[#0B0F14] py-24 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-8">
          <h2 className="text-4xl lg:text-6xl font-medium text-white max-w-2xl leading-tight tracking-tight">
            For everyone from entrepreneurs to enterprise
          </h2>
          <p className="text-gray-400 text-lg lg:text-xl max-w-md leading-relaxed font-normal mb-2">
            Millions of merchants of every size have collectively made over $1,000,000,000,000 in sales on Storify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {cards.map((card, index) => (
            <div key={index} className="group">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 bg-[#111827]">
                <img 
                  src={card.image} 
                  alt={card.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm lg:text-base">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link 
            to="/signup" 
            className="px-10 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white/5 transition-all hover:border-white/40 active:scale-95"
          >
            Pick a plan that fits
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseSection;
