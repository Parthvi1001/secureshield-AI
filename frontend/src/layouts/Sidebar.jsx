import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const links = [
    { 
      name: 'Profile', 
      path: '/profile',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      )
    },
    { 
      name: 'Dashboard', 
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      )
    },
    { 
      name: 'Health Card', 
      path: '/health-card',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      name: 'Scanner', 
      path: '/scanner',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      )
    },
    { 
      name: 'Cyber News', 
      path: '/news',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-95" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
        </svg>
      )
    },
    { 
      name: 'Alerts', 
      path: '/alerts',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      )
    },
    { 
      name: 'History', 
      path: '/history',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
        </svg>
      )
    },
    { 
      name: 'Admin Panel', 
      path: '/admin',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
      )
    },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-64 bg-cyber-gray border-r border-neon-blue/20 flex flex-col transition-transform duration-300 ease-in-out
      md:static md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Brand Header */}
      <div className="p-6 border-b border-neon-blue/20 flex justify-between items-center">
        <h1 className="text-xl font-bold neon-text uppercase tracking-widest text-center w-full">SecureShield</h1>
        {/* Close Drawer Button on Mobile */}
        <button 
          onClick={() => setIsOpen(false)}
          className="text-neon-blue p-1 rounded hover:bg-neon-blue/15 md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      {/* Nav Link Items */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-3 px-4">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-300 border border-transparent ${
                    isActive
                      ? 'bg-neon-blue/10 border-neon-blue/30 text-white shadow-glow-blue/20 font-bold'
                      : 'text-neon-blue/70 hover:bg-neon-blue/10 hover:text-white hover:border-neon-blue/20'
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Action Button Pinned to Bottom */}
      <div className="p-4 border-t border-neon-blue/20 bg-cyber-dark/10">
        <button
          onClick={() => {
            setIsOpen(false);
            logout();
          }}
          className="group flex items-center w-full px-4 py-3 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all duration-300 border border-transparent text-alert-red/70 hover:bg-alert-red/10 hover:text-white hover:border-alert-red/20 text-left"
        >
          <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {/* Footer System Active Status */}
      <div className="p-5 border-t border-neon-blue/20 text-center text-[10px] font-mono text-neon-blue/50 tracking-wider">
        STATUS: <span className="text-green-400 font-bold animate-pulse">ACTIVE NODE</span>
      </div>
    </aside>
  );
};

export default Sidebar;
