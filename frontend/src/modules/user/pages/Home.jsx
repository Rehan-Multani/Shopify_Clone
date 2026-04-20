import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../sections/HeroSection';
import PlatformSection from '../sections/PlatformSection';

import ImageShowcaseSection from '../sections/ImageShowcaseSection';
import SellEverywhereSection from '../sections/SellEverywhereSection';
import StartSellingSection from '../sections/StartSellingSection';
import CardSection from '../sections/CardSection';
import StickyVideo from '../components/StickyVideo';

const Home = () => {
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [currentVideo, setCurrentVideo] = useState({ src: null, speed: 1.0 });
  const [showExternalModal, setShowExternalModal] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.05 } // Trigger when only 5% visible
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const handleVideoChange = React.useCallback((src, speed) => {
    setCurrentVideo({ src, speed });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection 
          ref={heroRef} 
          onVideoChange={handleVideoChange} 
          onWatchClick={() => setShowExternalModal(true)}
        />
        <PlatformSection />
        <ImageShowcaseSection />
        <SellEverywhereSection />
        <StartSellingSection />
        <CardSection />
      </main>
      <StickyVideo 
        src={currentVideo.src} 
        speed={currentVideo.speed} 
        isVisible={!isHeroVisible && currentVideo.src} 
        showExternalModal={showExternalModal}
        onClose={() => setShowExternalModal(false)}
      />
      <Footer />
    </div>
  );
};

export default Home;
