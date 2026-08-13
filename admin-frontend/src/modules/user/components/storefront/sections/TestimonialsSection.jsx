import React from 'react';

const TestimonialsSection = ({ settings = {}, blocks = [] }) => {
    const {
        title = 'What Our Customers Say',
        testimonials = [
            { author: 'Jane D.', text: 'Amazing quality! Highly recommend shopping here.' },
            { author: 'John S.', text: 'Fast shipping and beautiful products.' },
            { author: 'Emily R.', text: 'Outstanding customer service and premium quality items.' }
        ]
    } = settings;

    const list = blocks.length > 0
        ? blocks.map((b) => ({
            author: b.settings?.author || b.author || 'Happy Customer',
            text: b.settings?.text || b.text || '',
        }))
        : testimonials;

    return (
        <section className="py-20 md:py-28 px-4 sm:px-6 md:px-10 lg:px-14 w-full space-y-14">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <h2
                    className="text-2xl md:text-4xl font-medium tracking-tight text-zinc-900"
                    style={{ fontFamily: 'var(--heading-font)' }}
                >
                    {title}
                </h2>
                <div
                    className="h-[2px] w-14 mx-auto"
                    style={{ backgroundColor: 'var(--color-accent, var(--color-primary))' }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 max-w-6xl mx-auto">
                {list.map((t, idx) => (
                    <article
                        key={idx}
                        className="store-card relative bg-white p-8 md:p-9 flex flex-col justify-between gap-8 overflow-hidden"
                        style={{ borderRadius: 'var(--border-radius, 16px)' }}
                    >
                        <span
                            className="absolute top-4 right-5 text-7xl leading-none select-none opacity-[0.07] pointer-events-none"
                            style={{ fontFamily: 'var(--heading-font)', color: 'var(--color-primary)' }}
                            aria-hidden="true"
                        >
                            ”
                        </span>

                        <div className="space-y-5 relative z-10">
                            <div className="flex gap-0.5" style={{ color: 'var(--color-accent, #b8860b)' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p
                                className="text-zinc-700 text-base md:text-lg leading-relaxed italic"
                                style={{ fontFamily: 'var(--heading-font)' }}
                            >
                                “{t.text}”
                            </p>
                        </div>

                        <div className="pt-5 border-t border-zinc-100 flex items-center gap-3 relative z-10">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                                style={{
                                    backgroundColor: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                    fontFamily: 'var(--heading-font)',
                                }}
                            >
                                {t.author ? t.author[0] : 'U'}
                            </div>
                            <div>
                                <span className="block text-sm font-medium text-zinc-800 tracking-tight">
                                    {t.author || 'Anonymous'}
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-400 font-semibold">
                                    Verified buyer
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
