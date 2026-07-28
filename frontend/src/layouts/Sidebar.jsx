import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const links = [
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
      name: 'Scanner', 
      path: '/scanner',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
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
      name: 'Cyber News', 
      path: '/news',
      icon: (
        <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-95" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
        </svg>
      )
    },
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

      {/* Footer System Active Status */}
      <div className="p-5 border-t border-neon-blue/20 text-center text-[10px] font-mono text-neon-blue/50 tracking-wider">
        STATUS: <span className="text-green-400 font-bold animate-pulse">ACTIVE NODE</span>
      </div>
    </aside>
  );
};

export default Sidebar;
