import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md">
        <h2 className="text-3xl font-bold neon-text text-center mb-6 uppercase tracking-widest">System Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">IDENTIFIER (EMAIL)</label>
            <input 
              type="email" 
              required 
              className="cyber-input" 
              placeholder="admin@secureshield.local"
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
          </div>
          <button type="submit" disabled={isLoading} className="cyber-btn mt-6">
            {isLoading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <p>NO CLEARANCE? <Link to="/signup" className="text-neon-purple hover:text-neon-blue transition-colors">REQUEST ACCESS</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
