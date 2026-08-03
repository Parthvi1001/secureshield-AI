import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
  const { signup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
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
        <h2 className="text-3xl font-bold neon-text text-center mb-6 uppercase tracking-widest">Request Access</h2>
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
            <p className="text-xs text-white/50 mt-2 font-mono">
              * Minimum 8 characters<br/>
              * Must contain uppercase, lowercase, and numbers<br/>
              * Cannot be a commonly used password
            </p>
          </div>
          <button type="submit" disabled={isLoading} className="cyber-btn mt-6">
            {isLoading ? 'Processing...' : 'Initialize Verification'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p>ALREADY CLEARED? <Link to="/login" className="text-neon-purple hover:text-neon-blue transition-colors">AUTHENTICATE</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
