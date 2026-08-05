import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { logout } = useAuth();
  const fileInputRef = useRef(null);

  // Profile data states
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    mobile: '',
    photo_url: '',
    country: ''
  });
  const [securityScore, setSecurityScore] = useState({ raw: 100, grade: 'A+' });
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch profile telemetry
  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/profile/');
      const { profile, security_score, registered_devices } = res.data;
      setProfile(profile);
      setUsername(profile.username || '');
      setMobile(profile.mobile || '');
      setSecurityScore(security_score);
      setDevices(registered_devices);
    } catch (err) {
      console.error("Failed to load user profile", err);
      toast.error("Failed to load user profile telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle profile updates
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put('/users/profile/', {
        username,
        mobile
      });
      setProfile(res.data);
      toast.success("Profile parameters updated successfully.");
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error("Failed to update profile parameters.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle avatar image upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB) and type
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    const toastId = toast.loading("Uploading holographic avatar...");
    try {
      const res = await api.put('/users/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(res.data);
      toast.success("Avatar updated successfully.", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar.", { id: toastId });
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match new password.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.post('/users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword
      });
      toast.success("Password changed successfully. Keep it secure.");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        toast.error("Password change rejected. Verify old credentials.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const doubleCheck = window.confirm(
      "CRITICAL ALERT: You are about to permanently delete your account and clear all audit logs. This action CANNOT be undone.\n\nAre you sure you want to revoke your clearance?"
    );
    if (!doubleCheck) return;

    try {
      await api.delete('/users/delete-account/');
      toast.success("Operative clearance revoked. Severing connection...");
      logout();
    } catch (err) {
      console.error(err);
      toast.error("Revocation failed. System error.");
    }
  };

  // Generate color classes based on security grade
  const getScoreColor = (grade) => {
    if (grade === 'A+') return 'text-green-400 border-green-500/30 bg-green-500/5 shadow-glow-blue';
    if (grade === 'B') return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5';
    if (grade === 'C') return 'text-neon-purple border-neon-purple/30 bg-neon-purple/5';
    return 'text-alert-red border-alert-red/30 bg-alert-red/5 shadow-glow-red';
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold neon-text uppercase tracking-widest">Operative Control Center</h2>
        <p className="text-sm text-neon-blue/70">Manage credentials, contact telemetry, avatars, and review registered device footprints.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <span className="text-sm text-white/50 italic">Synchronizing profile telemetry...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Avatar & Security Score Card */}
          <div className="space-y-6">
            
            {/* Avatar Panel */}
            <div className="glass-panel flex flex-col items-center justify-center p-6 text-center">
              <div className="relative group w-32 h-32 rounded-full border border-neon-blue/30 overflow-hidden shadow-glow-blue bg-cyber-black">
                {profile.photo_url ? (
                  <img 
                    src={profile.photo_url} 
                    alt="Operative Avatar" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-neon-blue uppercase">
                    {profile.username?.slice(0, 2)}
                  </div>
                )}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200"
                >
                  <svg className="w-6 h-6 text-neon-blue mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-[10px] text-neon-blue uppercase font-bold tracking-wider">Update Avatar</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  className="hidden"
                />
              </div>

              <h3 className="mt-4 text-xl font-bold text-white uppercase tracking-wider">{profile.username}</h3>
              <p className="text-xs text-white/50 mt-1 font-mono">{profile.email}</p>
              <div className="mt-3 px-3 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-xs text-neon-blue uppercase tracking-widest font-mono">
                {profile.country || 'Unknown Location'}
              </div>
            </div>

            {/* Security Score Card */}
            <div className={`glass-panel border text-center p-6 ${getScoreColor(securityScore.grade)}`}>
              <h3 className="text-xs uppercase tracking-widest text-white/70">Account Security Clearance</h3>
              <div className="my-4 text-5xl font-black font-sans tracking-tighter">
                {securityScore.grade}
              </div>
              <div className="w-full bg-cyber-black/50 border border-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${
                    securityScore.raw >= 90 ? 'bg-green-400' :
                    securityScore.raw >= 80 ? 'bg-yellow-400' :
                    securityScore.raw >= 60 ? 'bg-neon-purple' : 'bg-alert-red'
                  }`}
                  style={{ width: `${securityScore.raw}%` }}
                />
              </div>
              <p className="text-xs text-white/50">
                Score rating: <span className="font-mono text-white font-bold">{securityScore.raw}%</span>. Keep alerts resolved to maximize integrity.
              </p>
            </div>

          </div>

          {/* Right Column: Update Forms & Danger Zone */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Form: Update Info & Password */}
            <div className="glass-panel space-y-6">
              <h3 className="text-lg font-bold text-neon-blue uppercase tracking-wider border-b border-neon-blue/20 pb-2">Profile Configuration</h3>
              
              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-white/60 mb-1">Operative Callsign (Username)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="cyber-input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-white/60 mb-1">Registered Email Link</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    readOnly
                    className="cyber-input text-sm bg-cyber-black/60 border-neon-blue/20 text-white/40 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-white/60 mb-1">Mobile Access Link</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="cyber-input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-white/60 mb-1">Geolocation Node (Country)</label>
                  <input
                    type="text"
                    value={profile.country || 'Unknown'}
                    disabled
                    readOnly
                    className="cyber-input text-sm bg-cyber-black/60 border-neon-blue/20 text-white/40 cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="cyber-btn w-auto px-6 border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black"
                  >
                    {isUpdating ? 'Updating Parameter Nodes...' : 'Update Node Parameters'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Panel */}
            <div className="glass-panel space-y-6">
              <h3 className="text-lg font-bold text-neon-blue uppercase tracking-wider border-b border-neon-blue/20 pb-2">Security Authorization Code Override</h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase text-white/60 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="cyber-input text-sm"
                    placeholder="••••••••"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-white/60 mb-1">New Secure Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="cyber-input text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase text-white/60 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="cyber-input text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isChangingPassword}
                  className="cyber-btn w-auto px-6 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                >
                  {isChangingPassword ? 'Modifying Authorization Matrix...' : 'Override Authorization Password'}
                </button>
              </form>
            </div>

            {/* Registered Devices List */}
            <div className="glass-panel space-y-6">
              <h3 className="text-lg font-bold text-neon-blue uppercase tracking-wider border-b border-neon-blue/20 pb-2">Registered Device Footprints</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neon-blue/30 text-neon-blue">
                      <th className="p-2">DEVICE TYPE</th>
                      <th className="p-2">BROWSER NODE</th>
                      <th className="p-2">IP ADDRESS</th>
                      <th className="p-2 text-right">LAST FOOTPRINT TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {devices.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-4 text-center text-white/40 italic">
                          No device foot prints tracked yet.
                        </td>
                      </tr>
                    ) : (
                      devices.map((dev, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-all">
                          <td className="p-2 text-white font-medium">{dev.device}</td>
                          <td className="p-2 text-white/80">{dev.browser}</td>
                          <td className="p-2 font-mono text-neon-blue">{dev.ip_address}</td>
                          <td className="p-2 text-right text-white/50">
                            {new Date(dev.last_used).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-panel border-alert-red/30 shadow-glow-red/20 space-y-4">
              <h3 className="text-lg font-bold text-alert-red uppercase tracking-wider border-b border-alert-red/20 pb-2">Danger Override Zone</h3>
              <p className="text-xs text-white/70">
                Permanently revokes your security clearance, deletes your login records, security alerts, and removes your account from the database registry. This operation is **irreversible**.
              </p>
              <div>
                <button 
                  onClick={handleDeleteAccount}
                  className="cyber-btn w-auto px-6 border-alert-red text-alert-red hover:bg-alert-red hover:text-black font-bold uppercase tracking-widest text-xs"
                >
                  Terminate Account & Evaporate Profile
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Profile;
