import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const OTPVerification = () => {
  const { verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await verifyOtp(email, code);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md text-center">
        <h2 className="text-3xl font-bold neon-text mb-4 uppercase tracking-widest">Verify Access</h2>
        <p className="mb-6 text-sm">Enter the 6-digit cryptographic sequence sent to your terminal.</p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input 
              type="email" 
              required 
              className="cyber-input mb-4" 
              placeholder="Email used for access" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="text" 
              maxLength="6" 
              required 
              className="cyber-input text-center text-2xl tracking-[1em]" 
              placeholder="000000" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isLoading} className="cyber-btn mt-4">
            {isLoading ? 'Verifying...' : 'Confirm Identity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
