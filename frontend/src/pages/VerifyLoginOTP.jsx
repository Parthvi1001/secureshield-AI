import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyLoginOTP = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyLogin2FA } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const threatScore = location.state?.threat_score;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await verifyLogin2FA(email, code);
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="glass-panel w-full max-w-md p-8 border-alert-red/50 shadow-glow-red">
        <div className="text-center mb-8">
          <svg className="w-12 h-12 text-alert-red mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 className="text-3xl font-bold text-alert-red uppercase tracking-widest">Security Override</h2>
          <p className="text-alert-red/80 mt-2">Suspicious Login Detected</p>
          <p className="text-xs text-alert-red/60 mt-1">Threat Score: {(threatScore * 100).toFixed(1)}%</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-neon-blue text-sm mb-2">Override Code (2FA)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="cyber-input w-full"
              placeholder="Enter 6-digit code"
              required
              maxLength={6}
            />
            <p className="text-xs text-white/50 mt-2">Code sent to terminal for demo purposes.</p>
          </div>
          
          <button 
            type="submit" 
            className="cyber-button w-full border-alert-red hover:bg-alert-red/20 text-alert-red"
            disabled={loading}
          >
            {loading ? 'VERIFYING...' : 'AUTHORIZE LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyLoginOTP;
