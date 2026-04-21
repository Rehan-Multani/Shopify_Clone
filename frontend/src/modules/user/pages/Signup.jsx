import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const Signup = () => {
  const [email, setEmail] = useState('');

  const handleContinue = (e) => {
    e?.preventDefault();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#0B0D11] flex flex-col items-center justify-center px-6 py-14">

      {/* Logo */}
      <div className="mb-6 flex items-center gap-3">
        <img src={logo} alt="Storify" className="h-10 w-auto" />
        <span className="text-3xl brand-text leading-none">storify</span>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-white text-center mb-2 tracking-tight">
        Start your free trial
      </h1>
      <p className="text-gray-400 text-base text-center mb-8">
        3 days free, then 3 months for <span className="text-white font-semibold">₹20/month</span>
      </p>

      {/* White Card */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] p-7 space-y-5">

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
            Email address
          </label>
          <input
            type="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-gray-900 text-sm font-medium focus:outline-none focus:border-gray-800 focus:ring-2 focus:ring-gray-900/5 transition-all"
          />
        </div>

        {/* Continue with email */}
        <form onSubmit={handleContinue}>
          <button
            type="submit"
            className="w-full bg-[#111111] text-white font-bold rounded-xl py-3.5 text-sm hover:bg-[#222222] active:scale-[0.98] transition-all"
          >
            Continue with email
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-grow bg-gray-200"></div>
          <span className="text-xs font-semibold text-gray-400">or</span>
          <div className="h-px flex-grow bg-gray-200"></div>
        </div>

        {/* Social Buttons */}
        <div className="space-y-3">
          {/* Google */}
          <button
            onClick={handleContinue}
            className="w-full flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 hover:bg-gray-100 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"/>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#FBBC05" d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700">Continue with Google</span>
          </button>

          {/* Apple */}
          <button
            onClick={handleContinue}
            className="w-full flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 hover:bg-gray-100 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.51 12.09 1.011 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700">Continue with Apple</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleContinue}
            className="w-full flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 hover:bg-gray-100 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.95.925-1.95 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700">Continue with Facebook</span>
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-400 pt-1">
          Already have a Storify account?{' '}
          <Link to="/login" className="text-gray-600 font-semibold underline hover:text-gray-900 transition-colors">
            Log in
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center space-y-2">
        <a href="#" className="text-white text-sm font-semibold hover:text-[#14B8A6] transition-colors block">
          Need Help?
        </a>
        <p className="text-gray-500 text-xs leading-relaxed">
          By continuing, you agree to the{' '}
          <a href="#" className="text-white font-semibold hover:text-[#14B8A6] transition-colors">Terms</a>{' '}
          and{' '}
          <a href="#" className="text-white font-semibold hover:text-[#14B8A6] transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Signup;
