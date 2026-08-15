import React from 'react';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || '';
const ASSETS_BASE_URL = GATEWAY_URL.replace(/\/api\/?$/, '') || '';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${ASSETS_BASE_URL}${cleanPath}`;
};

/**
 * Editorial image + text split section used by Luxury Commerce and page builder.
 */
const ImageTextSection = ({ settings = {} }) => {
    const {
        eyebrow = '',
        title = 'Crafted with intention',
        subtitle = '',
        content = 'Discover pieces designed to last — refined materials, quiet luxury, and timeless silhouettes.',
        imageUrl = '',
        imagePosition = 'right',
        buttonLabel = 'Explore Collection',
        buttonLink = '/catalog',
    } = settings;

    const imageFirst = imagePosition === 'left';

    return (
        <section className="theme-image-text py-20 md:py-28 px-6 sm:px-10 lg:px-14 w-full">
            <div
                className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                style={{ maxWidth: 'var(--container-width, 1280px)' }}
            >
                <div className={`space-y-6 ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
                    {eyebrow && (
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                            {eyebrow}
                        </p>
                    )}
                    <h2
                        className="text-3xl md:text-5xl font-medium tracking-tight leading-[1.1]"
                        style={{ fontFamily: 'var(--heading-font)', letterSpacing: 'var(--heading-letter-spacing, -0.025em)' }}
                    >
                        {title}
                    </h2>
                    <div className="h-[2px] w-14" style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }} />
                    {subtitle && (
                        <p className="text-sm uppercase tracking-[0.16em] text-zinc-500 font-medium">{subtitle}</p>
                    )}
                    <p
                        className="text-[15px] text-zinc-600 leading-relaxed max-w-lg"
                        style={{ lineHeight: 'var(--body-line-height, 1.65)' }}
                    >
                        {content}
                    </p>
                    {buttonLabel && (
                        <a
                            href={buttonLink || '/catalog'}
                            className="inline-flex items-center gap-2 mt-2 px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest btn-premium transition-transform hover:-translate-y-0.5"
                            style={{
                                backgroundColor: 'var(--color-accent, var(--color-primary))',
                                color: 'var(--color-on-accent, #fff)',
                                borderRadius: 'var(--radius-button, var(--border-radius, 0px))',
                            }}
                        >
                            {buttonLabel}
                            <span aria-hidden="true">→</span>
                        </a>
                    )}
                </div>
                <div className={`w-full ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div
                        className="relative aspect-[4/5] overflow-hidden bg-zinc-100"
                        style={{ borderRadius: 'var(--radius-lg, var(--border-radius, 0px))' }}
                    >
                        {imageUrl ? (
                            <img
                                src={getImageUrl(imageUrl)}
                                alt={title || 'Editorial'}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-medium">
                                Add an image
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImageTextSection;
