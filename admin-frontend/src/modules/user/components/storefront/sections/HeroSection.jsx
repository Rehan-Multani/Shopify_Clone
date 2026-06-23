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
        <section 
            className="relative min-h-[500px] flex items-center justify-center bg-gray-900 overflow-hidden py-16 px-6 md:px-12"
            style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Dark Overlay */}
            <div 
                className="absolute inset-0 bg-black"
                style={{ opacity: parseFloat(overlayOpacity) }}
            ></div>

            <div className={`relative z-10 max-w-4xl w-full flex flex-col ${alignClass} space-y-6`}>
                <h1 
                    className="text-4xl md:text-6xl font-black tracking-tight leading-none"
                    style={{ color: textColor }}
                >
                    {title}
                </h1>
                <p 
                    className="text-base md:text-lg max-w-2xl leading-relaxed font-medium opacity-90"
                    style={{ color: textColor }}
                >
                    {subtitle}
                </p>
                {buttonText && (
                    <button 
                        className="px-8 py-3.5 rounded-xl font-bold text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                        style={{
                            backgroundColor: buttonBgColor,
                            color: buttonTextColor
                        }}
                    >
                        {buttonText}
                    </button>
                )}
            </div>
        </section>
    );
};

export default HeroSection;
