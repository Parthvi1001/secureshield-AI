import React from 'react';

const Alerts = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-alert-red uppercase tracking-widest drop-shadow-[0_0_10px_#ff2a2a]">Active Threats</h2>
      
      <div className="space-y-4">
        <div className="glass-panel border-alert-red/50 shadow-glow-red">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-alert-red">Unrecognized Login Attempt Blocked</h3>
              <p className="text-sm mt-2">Multiple failed authentication attempts detected from IP 45.22.11.9.</p>
            </div>
            <button className="px-3 py-1 bg-transparent border border-neon-blue text-neon-blue text-xs rounded hover:bg-neon-blue hover:text-cyber-black transition-all">
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
