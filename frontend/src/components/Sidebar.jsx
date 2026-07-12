import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Box,
  CalendarDays,
  Wrench,
  Building2,
  Tags,
  Users,
  BarChart3,
  LogOut,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, isAdmin, isAssetManager, isDepartmentHead } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/assets', label: 'Assets', icon: Box, show: true },
    { to: '/bookings', label: 'Bookings', icon: CalendarDays, show: true },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench, show: true },
    { to: '/departments', label: 'Departments', icon: Building2, show: isAdmin },
    { to: '/categories', label: 'Categories', icon: Tags, show: isAssetManager },
    { to: '/employees', label: 'Employees', icon: Users, show: isDepartmentHead },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3, show: isDepartmentHead },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white/90 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-950/90 dark:backdrop-blur-md lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-850">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white shadow-md shadow-primary-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Asset<span className="text-primary-600 dark:text-primary-400">Flow</span>
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-gray-50 border border-gray-150/40 dark:bg-gray-900/40 dark:border-gray-800/40">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Logged In As</p>
          <h4 className="mt-1 font-semibold text-gray-900 dark:text-white truncate">{user?.name}</h4>
          <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-0.5 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
        </div>

        {/* QR Scanner Quick Action */}
        <div className="px-4 mb-2">
          <NavLink
            to="/scan"
            onClick={() => isOpen && toggleSidebar()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-500 hover:to-indigo-500 transition-all duration-200 transform active:scale-95 cursor-pointer"
          >
            <QrCode className="h-4 w-4" />
            <span>Scan Asset QR</span>
          </NavLink>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-4 py-3 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => isOpen && toggleSidebar()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden group cursor-pointer ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900/40 dark:hover:text-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-1/4 h-1/2 w-1.5 rounded-r bg-primary-600 dark:bg-primary-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
