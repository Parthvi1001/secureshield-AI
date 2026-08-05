import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Signup = () => {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP and Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Custom feedback messages
  const [otpMessage, setOtpMessage] = useState('');
  const [otpStatus, setOtpStatus] = useState(''); // 'success' | 'error'

  // Countdown timer for Resend OTP
  const [countdown, setCountdown] = useState(60);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
      setCountdown(60);
    }
    return () => clearInterval(interval);
  }, [isCountdownActive, countdown]);

  // Username validation rules
  const hasLetter = /[a-zA-Z]/.test(username);
  const isOnlyDigits = username.length > 0 && /^\d+$/.test(username);
  const isOnlyLetters = username.length > 0 && /^[a-zA-Z]+$/.test(username);

  const isUsernameValid = username.length > 0 &&
    !isOnlyDigits &&
    hasLetter &&
    (!isOnlyLetters || username.length > 3);

  // Password criteria verification
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password)
  };

  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleSendOTP = async () => {
    // Validate email format before sending
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setOtpStatus('error');
      setOtpMessage("Invalid email format.");
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSendingOtp(true);
    setOtpMessage('');
    setOtpStatus('');
    
    try {
      const res = await api.post('/auth/register-send-otp/', { email: email.toLowerCase() });
      setIsOtpSent(true);
      setOtpStatus('success');
      setOtpMessage(res.data.message || "OTP has been sent successfully. Please check your Inbox or Spam folder.");
      setIsCountdownActive(true);
      toast.success("Verification code transmitted successfully.");
    } catch (err) {
      console.error(err);
      setOtpStatus('error');
      const errDetail = err.response?.data?.error || "Failed to send OTP.";
      setOtpMessage(errDetail);
      toast.error(errDetail);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpStatus('error');
      setOtpMessage("Please enter a valid 6-digit OTP.");
      toast.error("OTP must be 6 digits.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpMessage('');
    setOtpStatus('');

    try {
      const res = await api.post('/auth/register-verify-otp/', { 
        email: email.toLowerCase(), 
        code: otpCode.trim() 
      });
      setIsEmailVerified(true);
      setOtpStatus('success');
      setOtpMessage("Email Verified Successfully.");
      toast.success("Email clearance verified successfully.");
    } catch (err) {
      console.error(err);
      setOtpStatus('error');
      const errDetail = err.response?.data?.error || "Invalid OTP. Please try again.";
      setOtpMessage(errDetail);
      toast.error(errDetail);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isUsernameValid) {
      toast.error("Username does not meet the operative identity validation rules.");
      return;
    }
    if (!isEmailVerified) {
      toast.error("Email verification is mandatory before registration.");
      return;
    }
    if (!isPasswordValid) {
      toast.error("Please meet all password security requirements before proceeding.");
      return;
    }
    setIsLoading(true);
    const success = await signup(username, email, password, otpCode.trim());
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md">
        <div className="mb-6">
          <Link to="/" className="text-neon-blue/60 hover:text-neon-blue transition-all duration-300 flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider">
            <span>←</span> <span>Return to HQ</span>
          </Link>
        </div>
        <h2 className="text-3xl font-bold neon-text text-center mb-6 uppercase tracking-widest">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">USERNAME</label>
            <input 
              type="text" 
              required 
              className="cyber-input" 
              placeholder="Operative Name" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            
            {/* Dynamic Username Requirements Checklist */}
            {username.length > 0 && (
              <div className="mt-3 p-3 bg-cyber-dark/50 border border-neon-blue/10 rounded-lg space-y-1.5 font-mono text-xs">
                <span className="text-[10px] text-neon-blue/60 uppercase block mb-1 tracking-wider">Username Requirements:</span>
                <div className="flex items-center space-x-2">
                  <span>{hasLetter ? '✅' : '❌'}</span>
                  <span className={hasLetter ? 'text-green-400' : 'text-white/60'}>Contains at least one letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{!isOnlyDigits ? '✅' : '❌'}</span>
                  <span className={!isOnlyDigits ? 'text-green-400' : 'text-white/60'}>Cannot consist only of numbers</span>
                </div>
                {isOnlyLetters && (
                  <div className="flex items-center space-x-2">
                    <span>{username.length > 3 ? '✅' : '❌'}</span>
                    <span className={username.length > 3 ? 'text-green-400' : 'text-white/60'}>More than 3 characters if letter-only</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">EMAIL</label>
            <div className="flex gap-2">
              <input 
                type="email" 
                required 
                className="cyber-input flex-1" 
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailVerified || isSendingOtp}
              />
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isSendingOtp || isEmailVerified || isCountdownActive}
                className="px-4 py-2 bg-neon-blue/20 border border-neon-blue/40 text-neon-blue font-mono text-xs rounded hover:bg-neon-blue/30 disabled:opacity-40 transition-all font-bold whitespace-nowrap"
              >
                {isCountdownActive ? `Resend in ${countdown}s` : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* OTP Verification Section (visible only when OTP is sent) */}
          {isOtpSent && !isEmailVerified && (
            <div className="space-y-2 border border-neon-blue/10 bg-cyber-dark/40 p-3 rounded-lg animate-fade-in">
              <label className="block text-xs font-mono mb-1 uppercase tracking-wider text-neon-blue">Verification OTP Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength="6"
                  required 
                  className="cyber-input flex-1 text-center text-lg font-bold tracking-[0.3em] font-mono" 
                  placeholder="000000" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isVerifyingOtp}
                  className="px-4 py-2 bg-neon-purple/20 border border-neon-purple/40 text-neon-purple font-mono text-xs rounded hover:bg-neon-purple/30 disabled:opacity-40 transition-all font-bold"
                >
                  {isVerifyingOtp ? 'Checking...' : 'Verify OTP'}
                </button>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono mt-1 text-white/40">
                <span>Expires in 5 minutes</span>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isCountdownActive}
                  className="text-neon-blue hover:underline disabled:text-white/30 disabled:no-underline transition-all"
                >
                  {isCountdownActive ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Inline Feedback Message */}
          {otpMessage && (
            <p className={`text-xs font-mono p-2.5 rounded border ${
              otpStatus === 'success' 
                ? 'text-green-400 bg-green-500/5 border-green-500/20' 
                : 'text-red-400 bg-red-500/5 border-red-500/20'
            }`}>
              {otpMessage}
            </p>
          )}

          <div>
            <label className="block text-sm mb-1">PASSPHRASE</label>
            <input 
              type="password" 
              required 
              className="cyber-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* Real-time Validation Checklist */}
            <div className="mt-3 p-3 bg-cyber-dark/50 border border-neon-blue/10 rounded-lg space-y-1.5 font-mono text-xs">
              <span className="text-[10px] text-neon-blue/60 uppercase block mb-1 tracking-wider">Passphrase Requirements:</span>
              <div className="flex items-center space-x-2">
                <span>{criteria.length ? '✅' : '❌'}</span>
                <span className={criteria.length ? 'text-green-400' : 'text-white/60'}>Minimum 8 characters</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{criteria.uppercase ? '✅' : '❌'}</span>
                <span className={criteria.uppercase ? 'text-green-400' : 'text-white/60'}>At least one uppercase letter (A-Z)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{criteria.lowercase ? '✅' : '❌'}</span>
                <span className={criteria.lowercase ? 'text-green-400' : 'text-white/60'}>At least one lowercase letter (a-z)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{criteria.number ? '✅' : '❌'}</span>
                <span className={criteria.number ? 'text-green-400' : 'text-white/60'}>At least one number (0-9)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{criteria.specialChar ? '✅' : '❌'}</span>
                <span className={criteria.specialChar ? 'text-green-400' : 'text-white/60'}>At least one special character</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !isPasswordValid || !isEmailVerified || !isUsernameValid} 
            className="cyber-btn mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {isLoading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p>ALREADY CLEARED? <Link to="/login" className="text-neon-purple hover:text-neon-blue transition-colors">LOGIN</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
