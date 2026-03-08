import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Calendar, BarChart3, Bot, Briefcase, FileText, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const officerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/officer/dashboard' },
    { icon: Building2, label: 'Companies', path: '/officer/companies' },
    { icon: Users, label: 'Students', path: '/officer/students' },
    { icon: Calendar, label: 'Manage Drives', path: '/officer/drives' },
    { icon: BarChart3, label: 'Analytics', path: '/officer/analytics' },
  ];

  const studentMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: Briefcase, label: 'Campus Drives', path: '/student/drives' },
    { icon: FileText, label: 'My Applications', path: '/student/applications' },
    { icon: User, label: 'My Profile', path: '/student/profile' },
    { icon: Bot, label: 'AI Assistant', path: '/student/ai-assistant' },
  ];

  const menuItems = user?.role === 'officer' ? officerMenuItems : studentMenuItems;

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold" data-testid="sidebar-logo">PlaceMe</h1>
        <p className="text-sm text-blue-200 mt-1">{user?.role === 'officer' ? 'Officer Portal' : 'Student Portal'}</p>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`sidebar-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 hover:bg-blue-700 transition-colors ${
                isActive ? 'bg-blue-700' : ''
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-700">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="font-semibold">{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-blue-200">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full hover:bg-red-700 transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};