import React from 'react';

const HeroSection = ({ settings = {} }) => {
    const {
        title = 'Welcome to Our Store',
        subtitle = 'Discover our latest arrivals and premium products curated just for you.',
        buttonText = 'Shop Now',
        backgroundImage = '',
        alignment = 'left',
        textColor = '#ffffff',
        buttonBgColor = '#2563eb',
        buttonTextColor = '#ffffff',
        overlayOpacity = '0.4'
    } = settings;

    const alignClass = alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start text-left';

    return (
        <section className="relative min-h-[500px] flex items-center justify-center bg-zinc-950 overflow-hidden py-24 px-6 md:px-12 animate-fade-in rounded-3xl">
            {/* Background Image with Ken-burns zoom animation */}
            {backgroundImage && (
                <div 
                    className="absolute inset-0 bg-cover bg-center animate-ken-burns scale-100 opacity-95 transition-transform duration-[8000ms]"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                    }}
                />
            )}
            
            {/* Bottom-up dark gradient overlay */}
            <div 
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30 z-0"
                style={{ opacity: Math.min(1.0, parseFloat(overlayOpacity) + 0.1) }}
            ></div>

            <div className={`relative z-10 max-w-3xl w-full flex flex-col ${alignClass} space-y-5.5`}>
                <h1 
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md animate-fade-in-up"
                    style={{ color: textColor, animationDelay: '0ms' }}
                >
                    {title}
                </h1>
                <p 
                    className="text-xs sm:text-sm md:text-md max-w-xl leading-relaxed font-semibold opacity-90 drop-shadow animate-fade-in-up"
                    style={{ color: textColor, animationDelay: '100ms' }}
                >
                    {subtitle}
                </p>
                {buttonText && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <button 
                            className="px-7 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer hover:shadow-xl btn-premium"
                            style={{
                                backgroundColor: buttonBgColor,
                                color: buttonTextColor,
                                borderRadius: 'var(--border-radius)'
                            }}
                        >
                            {buttonText}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroSection;
