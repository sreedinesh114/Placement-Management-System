import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { Companies } from './pages/officer/Companies';
import { Students } from './pages/officer/Students';
import { ManageDrives } from './pages/officer/ManageDrives';
import { Analytics } from './pages/officer/Analytics';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { CampusDrives } from './pages/student/CampusDrives';
import { MyApplications } from './pages/student/MyApplications';
import { MyProfile } from './pages/student/MyProfile';
import { AIAssistant } from './pages/student/AIAssistant';
import './App.css';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">{children}</div>
    </div>
  );
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'officer' ? '/officer/dashboard' : '/student/dashboard'} /> : <LandingPage />} />
      
      <Route path="/officer/dashboard" element={<PrivateRoute allowedRole="officer"><OfficerDashboard /></PrivateRoute>} />
      <Route path="/officer/companies" element={<PrivateRoute allowedRole="officer"><Companies /></PrivateRoute>} />
      <Route path="/officer/students" element={<PrivateRoute allowedRole="officer"><Students /></PrivateRoute>} />
      <Route path="/officer/drives" element={<PrivateRoute allowedRole="officer"><ManageDrives /></PrivateRoute>} />
      <Route path="/officer/analytics" element={<PrivateRoute allowedRole="officer"><Analytics /></PrivateRoute>} />
      
      <Route path="/student/dashboard" element={<PrivateRoute allowedRole="student"><StudentDashboard /></PrivateRoute>} />
      <Route path="/student/drives" element={<PrivateRoute allowedRole="student"><CampusDrives /></PrivateRoute>} />
      <Route path="/student/applications" element={<PrivateRoute allowedRole="student"><MyApplications /></PrivateRoute>} />
      <Route path="/student/profile" element={<PrivateRoute allowedRole="student"><MyProfile /></PrivateRoute>} />
      <Route path="/student/ai-assistant" element={<PrivateRoute allowedRole="student"><AIAssistant /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;