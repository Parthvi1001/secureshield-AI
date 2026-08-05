import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify and Reset
  const [isLoading, setIsLoading] = useState(false);

  // Password criteria verification
  const criteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    specialChar: /[^A-Za-z0-9]/.test(newPassword)
  };

  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/', { email: email.toLowerCase() });
      toast.success(res.data.message || "OTP code transmitted to terminal console.");
      setStep(2);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.email?.[0] || err.response?.data?.message || "Failed to request password reset.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("New password does not meet complexity requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password/', {
        email: email.toLowerCase(),
        code: code.trim(),
        new_password: newPassword
      });
      toast.success(res.data.message || "Credential override successful. Please login.");
      navigate('/login');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.code?.[0] || err.response?.data?.new_password?.[0] || "Failed to reset password.";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md">
        <div className="mb-6">
          <Link to="/login" className="text-neon-blue/60 hover:text-neon-blue transition-all duration-300 flex items-center justify-center space-x-2 text-xs font-mono uppercase tracking-wider">
            <span>←</span> <span>Return to Login</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold font-orbitron neon-text text-center mb-2 uppercase tracking-widest">
          Password Reset
        </h2>
        <p className="text-xs text-white/50 text-center mb-6 font-mono">
          {step === 1 
            ? 'INITIATE SECURE RECOVERY KEY GENERATION' 
            : 'AUTHENTICATE WITH THE OTP KEY SENT TO SYSTEM LOGS'
          }
        </p>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider">REGISTERED OPERATIVE EMAIL</label>
              <input 
                type="email" 
                required 
                className="cyber-input" 
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="cyber-btn mt-6"
            >
              {isLoading ? 'GENERATING KEY...' : 'REQUEST RECOVERY OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider">RECOVERY OTP CODE (6-DIGITS)</label>
              <input 
                type="text" 
                maxLength="6"
                required 
                className="cyber-input text-center text-xl font-bold tracking-[0.5em]" 
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider">NEW PASSWORD</label>
              <input 
                type="password" 
                required 
                className="cyber-input" 
                placeholder="••••••••" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              
              {/* Real-time Validation Checklist */}
              <div className="mt-3 p-3 bg-cyber-dark/50 border border-neon-blue/10 rounded-lg space-y-1.5 font-mono text-xs">
                <span className="text-[10px] text-neon-blue/60 uppercase block mb-1 tracking-wider">Complexity Standards:</span>
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

            <div>
              <label className="block text-xs font-mono mb-1.5 uppercase tracking-wider">CONFIRM NEW PASSWORD</label>
              <input 
                type="password" 
                required 
                className="cyber-input" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !isPasswordValid} 
              className="cyber-btn mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'OVERRIDING CREDENTIALS...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
