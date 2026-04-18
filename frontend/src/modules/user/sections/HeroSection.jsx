import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Video assets
import video1 from '../../../assets/5981901-uhd_4096_2160_25fps.mp4';
import video2 from '../../../assets/7687926-uhd_3840_2160_30fps.mp4';
import video3 from '../../../assets/8524037-hd_1920_1080_25fps.mp4';
import video4 from '../../../assets/11995591_2320_1080_30fps (2).mp4';
import video5 from '../../../assets/13053713_3840_2160_50fps.mp4';
import bgImg from '../../../assets/atmospheric-hero-bg.png';

const videos = [video2, video3, video4, video5, video1];

const HeroSection = () => {
  const [activeBuffer, setActiveBuffer] = useState('A');
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const videoRefA = useRef(null);
  const videoRefB = useRef(null);

  const speed = 2.5;

  const swapVideos = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Switch buffers
    if (activeBuffer === 'A') {
      // Switch from A to B
      if (videoRefB.current) {
        videoRefB.current.playbackRate = speed;
        videoRefB.current.play().then(() => {
          setActiveBuffer('B');
          // Prepare next video for A buffer after a short delay
          setTimeout(() => {
            setIndexA((prev) => (indexB + 1) % videos.length);
            setIsTransitioning(false);
          }, 400);
        }).catch(e => console.error("B play failed", e));
      }
    } else {
      // Switch from B to A
      if (videoRefA.current) {
        videoRefA.current.playbackRate = speed;
        videoRefA.current.play().then(() => {
          setActiveBuffer('A');
          // Prepare next video for B buffer
          setTimeout(() => {
            setIndexB((prev) => (indexA + 1) % videos.length);
            setIsTransitioning(false);
          }, 400);
        }).catch(e => console.error("A play failed", e));
      }
    }
  };

  useEffect(() => {
    // Initial play
    const activeRef = activeBuffer === 'A' ? videoRefA : videoRefB;
    if (activeRef.current) {
      activeRef.current.playbackRate = speed;
      activeRef.current.play().catch(e => console.log("Init play failed", e));
    }
  }, []);

  return (
    <section className="relative h-screen min-h-[850px] flex items-end overflow-hidden bg-black">
      {/* Dual Video Background Buffers */}
      <div className="absolute inset-0 z-0">
        {/* Buffer A */}
        <video
          ref={videoRefA}
          src={videos[indexA]}
          muted
          playsInline
          onEnded={swapVideos}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            activeBuffer === 'A' ? 'opacity-100 z-1' : 'opacity-0 z-0'
          }`}
        />
        
        {/* Buffer B */}
        <video
          ref={videoRefB}
          src={videos[indexB]}
          muted
          playsInline
          onEnded={swapVideos}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            activeBuffer === 'B' ? 'opacity-100 z-1' : 'opacity-0 z-0'
          }`}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
      </div>

      <div className="container mx-auto px-6 relative z-20 pb-28">
        <div className="max-w-4xl">
          <h1 className="text-5xl lg:text-[80px] font-extrabold text-white mb-8 tracking-[-0.03em] leading-tight drop-shadow-2xl">
            Be the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">next store</span><br />
            they line up for
          </h1>

          <p className="text-lg lg:text-xl text-white/90 mb-12 max-w-2xl leading-relaxed font-normal">
            Dream big, build fast, and grow far on Shopify.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link
              to="/login"
              className="h-16 px-10 bg-white hover:bg-white/90 text-black rounded-full text-lg font-bold transition-all shadow-md active:scale-95 flex items-center justify-center"
            >
              Start for free
            </Link>
            <button 
              onClick={swapVideos}
              className="h-16 px-8 bg-transparent hover:bg-white/10 text-white rounded-full text-lg font-bold transition-all border-2 border-white/40 flex items-center gap-3 active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <svg className="w-4 h-4 text-black fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M5 4l14 8-14 8z" />
                </svg>
              </div>
              <span className="group-hover:text-white transition-colors">Next Showcase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtle bottom fade - Changed to Black */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent opacity-100 z-30"></div>
    </section>
  );
};

export default HeroSection;
