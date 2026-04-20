import React, { useState, useRef, useEffect } from 'react';

const StickyVideo = ({ src, isVisible, onClose, speed = 1.0 }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);

  // If the user dismisses it once, don't show it again during this session/mount
  if (isDismissed) return null;

  useEffect(() => {
    if (isVisible && videoRef.current && !isModalOpen) {
        videoRef.current.playbackRate = speed;
        videoRef.current.play().catch(e => console.log("Sticky play interrupted", e));
    } else if (videoRef.current) {
        videoRef.current.pause();
    }
  }, [isVisible, src, speed, isModalOpen]);

  useEffect(() => {
    if (isModalOpen && modalVideoRef.current) {
        modalVideoRef.current.playbackRate = speed;
        modalVideoRef.current.play().catch(e => console.log("Modal play failed", e));
    }
  }, [isModalOpen, src, speed]);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    onClose?.();
  };

  const openModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = (e) => {
    e?.stopPropagation();
    setIsModalOpen(false);
  };

  // Close modal on scroll
  useEffect(() => {
    if (isModalOpen) {
      const handleScroll = () => {
        closeModal();
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isModalOpen]);

  return (
    <>
    <div 
      onClick={openModal}
      className={`fixed bottom-8 right-8 z-[100] w-64 aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl transition-all duration-700 transform cursor-pointer group ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'
      }`}
    >
      {/* Video Content */}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
      
      {/* Label - Bottom Left (Hides on hover) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
        <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
                <path d="M5 4l14 8-14 8z" />
            </svg>
        </div>
        <span className="text-sm font-bold text-white tracking-tight">Why we build Storify</span>
      </div>

      {/* Controls Overlay (Close button and Center Icon) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black/20">
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-colors"
        >
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Center Expand Icon */}
        <div className="p-2 rounded-lg bg-black/20 backdrop-blur-sm border border-white/20 transform transition-transform group-hover:scale-110">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
        </div>
      </div>
    </div>

    {/* Video Modal */}
    {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 animate-in fade-in duration-300 pointer-events-none">
            {/* Modal Video Card */}
            <div className="w-full max-w-6xl aspect-video rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(20,184,166,0.15)] border border-white/5 relative bg-black pointer-events-auto">
                <video
                    ref={modalVideoRef}
                    src={src}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                />
                
                {/* Close Button - Now inside card */}
                <button 
                    onClick={closeModal}
                    className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors z-20"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="absolute top-6 left-8 pointer-events-none">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-1">Showcase</p>
                    <h2 className="text-xl font-bold text-white">Why we build Storify</h2>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default StickyVideo;
