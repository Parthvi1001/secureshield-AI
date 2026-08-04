import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password criteria verification
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password)
  };

  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Please meet all password security requirements before proceeding.");
      return;
    }
    setIsLoading(true);
    await signup(username, email, password);
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
          </div>
          <div>
            <label className="block text-sm mb-1">EMAIL</label>
            <input 
              type="email" 
              required 
              className="cyber-input" 
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
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
            disabled={isLoading || !isPasswordValid} 
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
