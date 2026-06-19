import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/merchants/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || 'Password recovery email sent successfully!');
      } else {
        setError(data.message || 'Email not found or error occurred.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <img src={logo} alt="Storify" className="h-12 w-auto" />
        <span className="text-4xl brand-text leading-none text-white">storify</span>
      </div>

      {/* Forgot Password Card */}
      <div className="w-full max-w-[440px] bg-[#1F2937] border border-white/10 rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-8 space-y-5">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Recover Password</h1>
          <p className="text-gray-400 text-[15px] font-medium">Enter your registered email address to recover your password</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-teal-500/10 border border-teal-500/50 text-teal-400 px-4 py-3 rounded-lg text-sm font-medium">
            {success}
          </div>
        )}

        {/* Form area */}
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111827] border-2 border-white/10 rounded-lg py-2.5 px-4 text-white text-base font-medium focus:outline-none focus:border-storify transition-all"
              placeholder="name@store.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-storify text-white font-bold rounded-lg py-3 mt-2 text-[15px] transition-all flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-storify-glow active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send Recovery Email'
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-gray-400 text-[14px]">
            Remember your password?{' '}
            <Link to="/admin/login" className="text-storify font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
