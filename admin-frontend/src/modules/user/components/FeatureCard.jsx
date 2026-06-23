const FeatureCard = ({ icon, title, description, accentColor, className = "" }) => {
  return (
    <div 
      className={`relative p-8 bg-[#111827] border border-white/5 rounded-[32px] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(20,184,166,0.15)] hover:-translate-y-2 hover:scale-[1.02] hover:border-storify/20 group cursor-default overflow-hidden flex flex-col h-full ${className}`}
    >
      {/* Background Accent Glow */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-storify"
      ></div>

      {/* Icon Styling */}
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-3xl transition-all duration-500 relative"
      >
        <div 
          className="absolute inset-0 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-storify"
        ></div>
        <div 
          className="absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-30 transition-opacity bg-storify"
        ></div>
        <span className="relative z-10 group-hover:scale-110 transition-transform">{icon}</span>
      </div>

      {/* Text Content */}
      <div className="flex-grow">
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-storify-glow transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed text-[16px] font-normal">
          {description}
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-8 pt-4">
        <button 
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border border-white/5 text-gray-400 hover:bg-storify hover:text-white hover:border-storify group-hover:shadow-lg active:scale-95"
        >
          Explore
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Subtle Bottom Accent Line */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 bg-storify"
      ></div>
    </div>
  );
};

export default FeatureCard;
