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

const phrases = [
  "store they line up for",
  "brand humans love",
  "empire you envisioned",
  "global success story",
  "business that dominates"
];

const HeroSection = React.forwardRef(({ onVideoChange }, ref) => {
  const [activeBuffer, setActiveBuffer] = useState('A');
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const videoRefA = useRef(null);
  const videoRefB = useRef(null);

  const speed = 2.5;

  // Report video source to parent for sticky player
  useEffect(() => {
    onVideoChange?.(videos[activeBuffer === 'A' ? indexA : indexB], speed);
  }, [activeBuffer, indexA, indexB, speed, onVideoChange]);

  // Cycle phrases every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setFade(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    <section ref={ref} className="relative h-screen min-h-[850px] flex items-end overflow-hidden bg-black">
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
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
      </div>

      <div className="container mx-auto px-6 relative z-20 pb-52">
        <div className="max-w-4xl">
          <h1 
            className="text-5xl lg:text-[100px] font-thin text-white mb-8 tracking-[-0.03em] leading-[1.05] drop-shadow-2xl"
            style={{ wordSpacing: '-0.14em' }}
          >
            Be the next <br />
            <span 
              className={`transition-all duration-500 block lg:text-[70px] text-[#14B8A6] font-semibold ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ wordSpacing: '0.1em' }}
            >
              {phrases[phraseIndex]}
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed font-normal">
            Dream big, build fast, and grow far on Storify.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link
              to="/signup"
              className="h-13 px-10 teal-gradient text-white rounded-full text-lg font-bold transition-all teal-glow active:scale-95 flex items-center justify-center hover:opacity-90"
            >
              Start for free
            </Link>
            <button 
              onClick={swapVideos}
              className="h-13 px-8 bg-white/5 hover:bg-white/10 text-white rounded-full text-lg font-bold transition-all border border-white/20 backdrop-blur-sm flex items-center gap-3 active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-110">
                <svg className="w-4 h-4 text-black fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M5 4l14 8-14 8z" />
                </svg>
              </div>
              <span className="transition-colors group-hover:text-storify-glow">Next Showcase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtle bottom fade - Changed to Black */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent opacity-100 z-30"></div>
    </section>
  );
});

export default HeroSection;
