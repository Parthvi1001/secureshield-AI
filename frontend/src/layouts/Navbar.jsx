import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { logout, user } = useAuth();

  return (
    <header className="bg-cyber-gray bg-opacity-75 backdrop-blur-md border-b border-neon-blue/20 h-16 flex items-center justify-between px-6 z-20 relative">
      {/* Mobile Hamburger Toggle */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleSidebar}
          className="text-neon-blue p-1 rounded hover:bg-neon-blue/15 md:hidden focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <span className="text-neon-blue font-mono tracking-widest md:hidden font-bold">SECURESHIELD</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-mono text-white/70">
          <span>Operative:</span>
          <span className="text-neon-blue font-bold drop-shadow-[0_0_3px_rgba(0,243,255,0.4)]">{user?.email || 'Unknown'}</span>
          <span className="text-white/30">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="heartbeat-dot"></span>
            <span className="text-green-400 font-bold drop-shadow-[0_0_3px_rgba(74,222,128,0.4)]">SYSTEM SECURE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
