import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-cyber-gray border-t border-neon-blue/30 p-4 text-center text-xs text-neon-blue/50 mt-auto">
      &copy; {new Date().getFullYear()} SecureShield AI. All rights reserved.
    </footer>
  );
};

export default Footer;
