import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/storify-logo.png';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${AUTH_API_URL}/merchant/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message || 'Verification code sent successfully!');
        setStep(2);
      } else {
        setError(data.message || 'Email not found or error occurred.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${AUTH_API_URL}/merchant/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('OTP verified successfully!');
        setStep(3);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        return setError('Passwords do not match');
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${AUTH_API_URL}/merchant/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password has been reset successfully!');
        setTimeout(() => {
            navigate('/admin/login');
        }, 2000);
      } else {
        setError(data.message || 'Error resetting password.');
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
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {step === 1 ? 'Recover Password' : step === 2 ? 'Verify OTP' : 'Set New Password'}
          </h1>
          <p className="text-gray-400 text-[15px] font-medium">
            {step === 1 && 'Enter your registered email address to receive a verification code'}
            {step === 2 && `Enter the 6-digit code sent to ${email}`}
            {step === 3 && 'Please enter your new password below'}
          </p>
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

        {/* Step 1: Request OTP */}
        {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
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
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-[#111827] border-2 border-white/10 rounded-lg py-2.5 px-4 text-white text-center text-xl tracking-[0.5em] font-bold focus:outline-none focus:border-storify transition-all"
                  placeholder="------"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className={`w-full bg-storify text-white font-bold rounded-lg py-3 mt-2 text-[15px] transition-all flex justify-center items-center ${(isLoading || otp.length !== 6) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-storify-glow active:scale-[0.98]'}`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  'Verify OTP'
                )}
              </button>
              
              <div className="text-center">
                  <button type="button" onClick={handleRequestOtp} className="text-[13px] text-gray-400 hover:text-white transition-colors">
                      Didn't receive code? Resend
                  </button>
              </div>
            </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#111827] border-2 border-white/10 rounded-lg py-2.5 px-4 text-white text-base font-medium focus:outline-none focus:border-storify transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    {showNewPassword ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-300 block ml-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#111827] border-2 border-white/10 rounded-lg py-2.5 px-4 text-white text-base font-medium focus:outline-none focus:border-storify transition-all pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    {showConfirmPassword ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-storify text-white font-bold rounded-lg py-3 mt-2 text-[15px] transition-all flex justify-center items-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-storify-glow active:scale-[0.98]'}`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  'Set New Password'
                )}
              </button>
            </form>
        )}

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
