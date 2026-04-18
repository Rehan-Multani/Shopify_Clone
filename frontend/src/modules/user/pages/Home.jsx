import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../sections/HeroSection';
import PlatformSection from '../sections/PlatformSection';

import ImageShowcaseSection from '../sections/ImageShowcaseSection';
import SellEverywhereSection from '../sections/SellEverywhereSection';
import StartSellingSection from '../sections/StartSellingSection';
import CardSection from '../sections/CardSection';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <PlatformSection />
        <ImageShowcaseSection />
        <SellEverywhereSection />
        <StartSellingSection />
        <CardSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
