import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background soft gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-50/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        {/* Animated Icon Container */}
        <div className="relative w-36 h-36 mx-auto">
          <div className="absolute inset-0 bg-zinc-100 rounded-full animate-ping opacity-25 scale-75"></div>
          <div className="relative w-36 h-36 bg-white rounded-full border border-zinc-200/80 shadow-sm flex items-center justify-center">
            <span className="text-6xl select-none animate-bounce duration-1000">🔍</span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 text-zinc-800 border border-zinc-200/60 uppercase tracking-widest">
            Superadmin Error 404
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Page Not Found</h1>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-sm mx-auto">
            Sorry, the superadmin resource or page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
          <Link
            to="/superadmin"
            className="w-full sm:w-auto px-7 py-3 bg-zinc-950 text-white text-xs font-bold rounded-xl shadow-md shadow-zinc-950/10 hover:bg-black hover:shadow-lg transition-all active:scale-[0.98] tracking-wider uppercase"
          >
            Go to dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-7 py-3 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] tracking-wider uppercase"
          >
            Previous page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
