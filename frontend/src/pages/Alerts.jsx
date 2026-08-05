import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/alerts/');
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
      toast.error("Failed to retrieve security alert feeds.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId) => {
    try {
      toast.loading('Clearing threat node...', { id: 'resolve-alert' });
      await api.post(`/alerts/${alertId}/resolve/`);
      toast.success('Clearance authorized. Threat status resolved.', { id: 'resolve-alert', icon: '⚡' });
      
      // Update local state list to remove acknowledged alert
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to acknowledge security alert.', { id: 'resolve-alert' });
    }
  };

  // Get border and icon details based on severity level
  const getSeverityStyles = (severity) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'border-alert-red shadow-glow-red/30 text-alert-red';
      case 'HIGH':
        return 'border-amber-500 shadow-glow-amber/20 text-amber-500';
      case 'MEDIUM':
        return 'border-neon-purple/50 shadow-glow-purple/10 text-neon-purple';
      default:
        return 'border-neon-blue/40 shadow-glow-blue/10 text-neon-blue';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-alert-red uppercase tracking-widest drop-shadow-[0_0_10px_#ff2a2a]">Active Threats</h2>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-panel text-center p-6 h-28 animate-pulse bg-white/5 border-white/10 rounded-lg"></div>
          ))}
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`glass-panel border transition-all duration-300 ${getSeverityStyles(alert.severity)}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 font-bold tracking-wider">
                      {alert.severity}
                    </span>
                    <span className="text-xs text-white/40 font-mono">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wide mt-1">
                    {alert.title}
                  </h3>
                  <p className="text-sm text-white/70 font-mono">
                    {alert.description}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-4 py-2 bg-transparent border border-neon-blue text-neon-blue text-xs font-mono font-bold rounded hover:bg-neon-blue hover:text-cyber-black transition-all whitespace-nowrap shadow-glow-blue/10"
                >
                  ACKNOWLEDGE
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel border-green-500/20 shadow-glow-green/5 text-center p-8 rounded-lg space-y-3">
          <div className="w-12 h-12 rounded-full border border-green-400/40 flex items-center justify-center mx-auto text-green-400 animate-pulse">
            ✓
          </div>
          <h3 className="text-lg font-bold text-green-400 uppercase tracking-widest">No Active Threats</h3>
          <p className="text-xs text-white/50 font-mono max-w-sm mx-auto">
            All systems are functioning within normal clearance parameters. Node monitoring active.
          </p>
        </div>
      )}
    </div>
  );
};

export default Alerts;
