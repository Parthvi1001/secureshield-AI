import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OTPVerification from './pages/OTPVerification';
import VerifyLoginOTP from './pages/VerifyLoginOTP';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import News from './pages/News';
import History from './pages/History';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import HealthCard from './pages/HealthCard';
import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#00f3ff',
            border: '1px solid #00f3ff',
          }
        }} 
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/verify-login-2fa" element={<VerifyLoginOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/health-card" element={<HealthCard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/news" element={<News />} />
            <Route path="/history" element={<History />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
