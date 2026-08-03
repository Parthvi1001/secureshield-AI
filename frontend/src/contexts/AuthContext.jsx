import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        // Assume authenticated for now since JWT validation happens on API calls
        setUser({ authenticated: true });
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login/', { email, password });
      
      if (res.data.requires_otp) {
        toast.error(`ALERT: ${res.data.risk_level} login detected. ML Engine has intercepted authentication.`, { duration: 5000 });
        navigate('/verify-login-2fa', { state: { email: res.data.email, threat_score: res.data.threat_score } });
        return { success: false, requires_otp: true };
      }
      
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setUser({ email, authenticated: true });
      toast.success('Authentication successful. Welcome, Operative.');
      navigate('/dashboard');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials.');
      return { success: false };
    }
  };

  const verifyLogin2FA = async (email, code) => {
    try {
      const res = await api.post('/auth/verify-login-otp/', { email, code });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setUser({ email, authenticated: true });
      toast.success('Threat cleared. Secondary Authentication successful.');
      navigate('/dashboard');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid 2FA sequence.');
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      await api.post('/auth/signup/', { username, email, password });
      toast.success('Identity registered. Check terminal for verification sequence.');
      navigate('/verify-otp');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data ? Object.values(err.response.data)[0] : 'Registration failed.';
      toast.error(errorMsg[0] || errorMsg);
      return false;
    }
  };

  const verifyOtp = async (email, code) => {
    try {
      await api.post('/auth/verify-email/', { email, code });
      toast.success('Clearance granted. Please authenticate.');
      navigate('/login');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid cryptographic sequence.');
      return false;
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      toast.success('Connection severed. Goodbye.');
      navigate('/');
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    verifyOtp,
    verifyLogin2FA,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
