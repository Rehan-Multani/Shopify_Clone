import React from 'react';

const ThemeRenderer = ({ themeSettings = {}, children }) => {
    const {
        primaryColor = '#2563eb',
        secondaryColor = '#0f172a',
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

    // Inject fonts link
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
        link.href = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@300;400;500;700;900&display=swap`;
    }, [fontFamily]);

    // Create variables to make custom styling extremely dynamic and unified
    const themeStyles = {
        '--color-primary': primaryColor,
        '--color-secondary': secondaryColor,
        '--color-accent': accentColor,
        '--border-radius': borderRadius,
        fontFamily: fontStyle,
        minHeight: '100%'
    };

    return (
        <div style={themeStyles} className={`theme-container theme-${themeName.toLowerCase()} min-h-screen bg-white text-gray-900`}>
            {children}
        </div>
    );
};

export default ThemeRenderer;
