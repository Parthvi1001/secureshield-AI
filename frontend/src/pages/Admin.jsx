import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
  const [purging, setPurging] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await api.get('/admin/stats/');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleManageOperatives = () => {
    // Dynamically resolve target Django admin endpoint depending on development or production server
    const adminUrl = window.location.origin.includes('517')
      ? 'http://localhost:8000/admin/'
      : '/admin/';
    window.open(adminUrl, '_blank');
    toast.success('Opening system administration console...', { icon: '🔑' });
  };

  const handleSystemPurge = async () => {
    const confirmWipe = window.confirm(
      "☢️ WARNING: CRITICAL SYSTEM PURGE INITIATED ☢️\n\n" +
      "This destructive administrator override will:\n" +
      "• Delete all file scan logs & uploaded threat records.\n" +
      "• Truncate all security alert history.\n" +
      "• Wipe all login attempt and session logs.\n" +
      "• Permanently delete all non-admin user accounts.\n\n" +
      "Are you absolutely sure you want to purge the database?"
    );

    if (!confirmWipe) return;

    try {
      setPurging(true);
      toast.loading('Purging databases and retraining engines...', { id: 'purge-action' });
      
      const response = await api.post('/admin/purge/');
      
      toast.success(
        response.data.message || 'Purge complete. All tables truncated.', 
        { id: 'purge-action', duration: 5000 }
      );
      // Refresh stats
      setStats({
        total_files_cleaned: 0,
        total_threats_removed: 0,
        most_common_threat_type: 'None',
        average_cleaning_time: 0,
        cleaning_success_rate: 0
      });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Authorization failed. Admin clearance level required.';
      toast.error(errMsg, { id: 'purge-action' });
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Global Admin Override</h2>
      
      {/* Analytics Cards Section */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-panel text-center p-4 h-24 animate-pulse bg-white/5 border-white/10"></div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Files Cleaned */}
          <div className="glass-panel border-green-500/30 shadow-glow-green/5 text-center p-4">
            <h3 className="text-xs uppercase text-green-400 tracking-wider font-semibold">Total Files Cleaned</h3>
            <p className="text-3xl font-extrabold text-green-400 drop-shadow-[0_0_8px_#4ade80] mt-2">
              {stats.total_files_cleaned}
            </p>
          </div>
          
          {/* Total Threats Removed */}
          <div className="glass-panel border-green-500/30 text-center p-4">
            <h3 className="text-xs uppercase text-green-400 tracking-wider font-semibold">Total Threats Removed</h3>
            <p className="text-3xl font-extrabold text-green-400 mt-2">
              {stats.total_threats_removed}
            </p>
          </div>

          {/* Most Common Threat Type */}
          <div className="glass-panel border-neon-purple/35 text-center p-4">
            <h3 className="text-xs uppercase text-neon-purple tracking-wider font-semibold">Most Common Threat</h3>
            <p className="text-sm font-bold text-white/95 mt-3.5 font-mono truncate" title={stats.most_common_threat_type}>
              {stats.most_common_threat_type}
            </p>
          </div>

          {/* Average Cleaning Time */}
          <div className="glass-panel border-neon-blue/30 text-center p-4">
            <h3 className="text-xs uppercase text-neon-blue tracking-wider font-semibold">Avg Cleaning Time</h3>
            <p className="text-3xl font-extrabold text-neon-blue mt-2 font-mono">
              {stats.average_cleaning_time}s
            </p>
          </div>

          {/* Success Rate */}
          <div className="glass-panel border-green-500/30 text-center p-4">
            <h3 className="text-xs uppercase text-green-400 tracking-wider font-semibold">Success Rate</h3>
            <p className="text-3xl font-extrabold text-green-400 mt-2">
              {stats.cleaning_success_rate}%
            </p>
          </div>
        </div>
      ) : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Operatives Card */}
        <div 
          onClick={handleManageOperatives}
          className="glass-panel border-neon-purple/50 shadow-glow-purple text-center cursor-pointer hover:bg-neon-purple/10 transition-all p-8 flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-neon-purple/10 flex items-center justify-center border border-neon-purple/30 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-neon-purple animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-neon-purple tracking-wide">Manage Operatives</h3>
            <p className="mt-2 text-sm text-gray-400">View, edit, or revoke user clearances via core control center.</p>
          </div>
        </div>

        {/* System Purge Card */}
        <div 
          onClick={purging ? null : handleSystemPurge}
          className={`glass-panel border-alert-red/50 shadow-glow-red text-center cursor-pointer hover:bg-alert-red/10 transition-all p-8 flex flex-col items-center justify-center space-y-4 ${purging ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-16 h-16 rounded-full bg-alert-red/10 flex items-center justify-center border border-alert-red/30">
            <svg className="w-8 h-8 text-alert-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-alert-red tracking-wide">System Purge</h3>
            <p className="mt-2 text-sm text-gray-400">Force reset all ML models, threat logs, and databases.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
