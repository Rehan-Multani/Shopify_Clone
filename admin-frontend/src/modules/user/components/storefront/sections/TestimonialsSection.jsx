import React from 'react';

const TestimonialsSection = ({ settings = {} }) => {
    const {
        title = 'What Our Customers Say',
        testimonials = [
            { author: 'Jane D.', text: 'Amazing quality! Highly recommend shopping here.' },
            { author: 'John S.', text: 'Fast shipping and beautiful products.' },
            { author: 'Emily R.', text: 'Outstanding customer service and premium quality items.' }
        ]
    } = settings;

    return (
        <section className="py-20 px-4 sm:px-6 md:px-8 bg-transparent max-w-7xl mx-auto w-full space-y-10">
            <div className="space-y-1 border-b border-zinc-200/65 pb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black tracking-widest text-zinc-900 uppercase">{title}</h2>
                    <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Rating 4.9/5.0
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {testimonials.map((t, idx) => (
                    <div 
                        key={idx}
                        className="bg-white p-7 rounded-2xl border border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-5 card-premium relative overflow-hidden"
                        style={{ borderRadius: 'var(--border-radius, 16px)' }}
                    >
                        <span className="absolute -top-3 -right-1 text-7xl text-[var(--color-primary)] opacity-5 select-none font-serif leading-none">“</span>
                        
                        <div className="flex gap-1 text-amber-400 relative z-10">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-3.5 h-3.5 fill-current animate-scale-in" viewBox="0 0 20 20" style={{ animationDelay: `${star * 50}ms` }}>
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        
                        <p className="text-zinc-650 italic text-xs font-semibold leading-relaxed relative z-10">
                            "{t.text}"
                        </p>
                        
                        <div className="pt-3 border-t border-zinc-100 flex items-center gap-3 relative z-10">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[9px] uppercase shadow-inner" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                {t.author ? t.author[0] : 'U'}
                            </div>
                            <span className="text-[10px] font-black text-zinc-700 tracking-wider uppercase">{t.author || 'Anonymous'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
