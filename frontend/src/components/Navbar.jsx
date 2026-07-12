import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Moon, Sun, User, Bell, Shield } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/reports/kpis');
      setNotifications(response.data.data.recentNotifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async () => {
    // for standard simplify, we can clear locally
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:bg-gray-900"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="font-display text-lg font-semibold text-gray-850 dark:text-gray-100 hidden sm:block">
          AssetFlow System Management
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-gray-200/60 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={markAsRead}
            className="relative rounded-xl border border-gray-200/60 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-150 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-950">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-850">
                <h4 className="font-semibold text-sm">Notifications</h4>
              </div>
              <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs py-6 text-gray-400">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 text-left cursor-pointer">
                      <h5 className="font-semibold text-xs text-gray-900 dark:text-white">{n.title}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown info */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4 dark:border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
