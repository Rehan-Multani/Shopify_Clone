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
        <section className="py-16 px-6 md:px-12 bg-gray-50 max-w-7xl mx-auto w-full space-y-10">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t, idx) => (
                    <div 
                        key={idx}
                        className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-600 italic text-sm leading-relaxed">
                            "{t.text}"
                        </p>
                        <div className="pt-2 border-t border-gray-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs uppercase">
                                {t.author ? t.author[0] : 'U'}
                            </div>
                            <span className="text-xs font-bold text-gray-800">{t.author || 'Anonymous'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
