import React from 'react';

// Hex parser helper for alpha transparency
const hexToRgba = (hex, alpha) => {
    try {
        const cleanHex = hex.replace('#', '');
        let r, g, b;
        if (cleanHex.length === 3) {
            r = parseInt(cleanHex[0] + cleanHex[0], 16);
            g = parseInt(cleanHex[1] + cleanHex[1], 16);
            b = parseInt(cleanHex[2] + cleanHex[2], 16);
        } else {
            r = parseInt(cleanHex.substring(0, 2), 16);
            g = parseInt(cleanHex.substring(2, 4), 16);
            b = parseInt(cleanHex.substring(4, 6), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
        return `rgba(37, 99, 235, ${alpha})`;
    }
};

// Adjust hex brightness helper (negative for darker, positive for lighter)
const adjustBrightness = (hex, percent) => {
    try {
        let cleanHex = hex.replace('#', '');
        if (cleanHex.length === 3) {
            cleanHex = cleanHex.split('').map(c => c + c).join('');
        }
        let r = parseInt(cleanHex.substring(0, 2), 16);
        let g = parseInt(cleanHex.substring(2, 4), 16);
        let b = parseInt(cleanHex.substring(4, 6), 16);

        r = Math.min(255, Math.max(0, r + percent));
        g = Math.min(255, Math.max(0, g + percent));
        b = Math.min(255, Math.max(0, b + percent));

        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } catch (e) {
        return hex;
    }
};

const ThemeRenderer = ({ themeSettings = {}, children }) => {
    const {
        primaryColor = '#2563eb',
        secondaryColor = '#ffffff',
        accentColor = '#14B8A6',
        fontFamily = 'Inter',
        borderRadius = '8px',
        themeName = 'Dawn'
    } = themeSettings;

    // Map font family names to actual font stacks
    const fontStacks = {
        'Inter': 'Inter, sans-serif',
        'Roboto': 'Roboto, sans-serif',
        'Outfit': 'Outfit, sans-serif',
        'Poppins': 'Poppins, sans-serif',
        'Playfair Display': "'Playfair Display', serif",
        'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif"
    };

    const fontStyle = fontStacks[fontFamily] || 'sans-serif';

    // Inject fonts link and dynamic keyframes/utility classes
    React.useEffect(() => {
        const fontId = 'dynamic-theme-fonts';
        let link = document.getElementById(fontId);
        if (!link) {
            link = document.createElement('link');
            link.id = fontId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        
        const formattedFont = fontFamily.replace(/ /g, '+');
        link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;600;700;800;900&display=swap`;

        // Inject keyframes stylesheet
        const stylesId = 'dynamic-theme-styles';
        let styleTag = document.getElementById(stylesId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = stylesId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(16px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.97);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            @keyframes checkmark {
                0% { stroke-dashoffset: 50; }
                100% { stroke-dashoffset: 0; }
            }
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-8px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes pulse-ring {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${hexToRgba(primaryColor, 0.4)}; }
                70% { transform: scale(1); box-shadow: 0 0 0 6px ${hexToRgba(primaryColor, 0)}; }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 ${hexToRgba(primaryColor, 0)}; }
            }
            @keyframes ken-burns {
                0% { transform: scale(1); }
                50% { transform: scale(1.04); }
                100% { transform: scale(1); }
            }
            @keyframes toast-in {
                0% { transform: translateY(100%) scale(0.9); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            
            /* Premium Utilities */
            .animate-fade-in-up {
                animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out forwards;
            }
            .animate-scale-in {
                animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-shimmer {
                background: linear-gradient(90deg, #f9fafb 25%, #f3f4f6 50%, #f9fafb 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite linear;
            }
            .animate-slide-down {
                animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-toast-in {
                animation: toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            
            /* Custom styled elements */
            .storefront-scrollbar::-webkit-scrollbar {
                width: 5px;
                height: 5px;
            }
            .storefront-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .storefront-scrollbar::-webkit-scrollbar-thumb {
                background: #e4e4e7;
                border-radius: 99px;
            }
            .storefront-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #d4d4d8;
            }
            
            /* Premium Button Transitions */
            .btn-premium {
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 4px 12px ${hexToRgba(primaryColor, 0.15)};
            }
            .btn-premium:hover {
                transform: translateY(-1.5px);
                box-shadow: 0 6px 16px ${hexToRgba(primaryColor, 0.25)};
                filter: brightness(1.05);
            }
            .btn-premium:active {
                transform: translateY(0.5px) scale(0.98);
                box-shadow: 0 2px 6px ${hexToRgba(primaryColor, 0.15)};
            }
            
            /* Premium Card Transition */
            .card-premium {
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 4px 12px rgba(0, 0, 0, 0.03);
            }
            .card-premium:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.02);
            }

            /* Input premium style */
            .input-premium {
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .input-premium:focus {
                border-color: ${primaryColor};
                box-shadow: 0 0 0 4px ${hexToRgba(primaryColor, 0.1)};
            }
        `;
    }, [fontFamily, primaryColor]);

    // Helper to determine if a color is dark
    const isDarkColor = (hex) => {
        try {
            const cleanHex = hex.replace('#', '');
            let r, g, b;
            if (cleanHex.length === 3) {
                r = parseInt(cleanHex[0] + cleanHex[0], 16);
                g = parseInt(cleanHex[1] + cleanHex[1], 16);
                b = parseInt(cleanHex[2] + cleanHex[2], 16);
            } else {
                r = parseInt(cleanHex.substring(0, 2), 16);
                g = parseInt(cleanHex.substring(2, 4), 16);
                b = parseInt(cleanHex.substring(4, 6), 16);
            }
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            return brightness < 128;
        } catch (e) {
            return false;
        }
    };

    const isSecondaryDark = isDarkColor(secondaryColor);
    const textColor = isSecondaryDark ? '#f4f4f5' : '#09090b';
    const textColorMuted = isSecondaryDark ? '#a1a1aa' : '#52525b';

    // Create variables to make custom styling extremely dynamic and unified
    const themeStyles = {
        '--color-primary': primaryColor,
        '--color-primary-light': hexToRgba(primaryColor, 0.06),
        '--color-primary-semi': hexToRgba(primaryColor, 0.12),
        '--color-primary-dark': adjustBrightness(primaryColor, -20),
        '--color-secondary': secondaryColor,
        '--color-accent': accentColor,
        '--color-text': textColor,
        '--color-text-muted': textColorMuted,
        '--border-radius': borderRadius,
        '--shadow-premium-sm': '0 2px 8px rgba(0, 0, 0, 0.02)',
        '--shadow-premium-md': '0 8px 24px rgba(0, 0, 0, 0.05)',
        '--shadow-premium-lg': '0 16px 40px rgba(0, 0, 0, 0.08)',
        '--transition-premium': 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: fontStyle,
        minHeight: '100%'
    };

    return (
        <div style={themeStyles} className={`theme-container theme-${themeName.toLowerCase()} min-h-screen bg-[var(--color-secondary)] text-[var(--color-text)]`}>
            {children}
        </div>
    );
};

export default ThemeRenderer;
