import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import {
  LayoutDashboard,
  Building2,
  Tags,
  Users,
  Box,
  CalendarDays,
  Wrench,
  FileBarChart2,
  User,
  ArrowLeftRight,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  LogOut,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { currentUser, setCurrentUser, theme, setTheme, employees, maintenanceRequests, bookings } = useAppState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifyMenu, setShowNotifyMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleChange = (roleName) => {
    // Find matching employee or set mock
    const matched = employees.find((e) => e.role === roleName) || {
      name: `Demo ${roleName}`,
      email: `${roleName.toLowerCase().replace(' ', '')}@assetflow.com`,
      role: roleName,
      department: 'Engineering',
    };
    setCurrentUser({
      name: matched.name,
      email: matched.email,
      role: matched.role,
      department: matched.department,
    });
    setShowRoleMenu(false);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // Sidebar navigation configuration with role requirements
  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Assets', path: '/assets', icon: Box, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Asset Allocation', path: '/allocation', icon: ArrowLeftRight, roles: ['Admin', 'Asset Manager'] },
    { name: 'Resource Booking', path: '/booking', icon: CalendarDays, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Departments', path: '/departments', icon: Building2, roles: ['Admin'] },
    { name: 'Asset Categories', path: '/categories', icon: Tags, roles: ['Admin'] },
    { name: 'Employee Directory', path: '/employees', icon: Users, roles: ['Admin'] },
    { name: 'Reports', path: '/reports', icon: FileBarChart2, roles: ['Admin', 'Asset Manager'] },
    { name: 'Profile Settings', path: '/profile', icon: User, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const allowedItems = navigationItems.filter((item) => item.roles.includes(currentUser?.role));

  // Count pending maintenance or upcoming bookings for notifications
  const pendingRequests = maintenanceRequests.filter(r => r.status === 'Pending').length;
  const upcomingBookings = bookings.filter(b => b.status === 'Upcoming').length;
  const notificationsCount = pendingRequests + upcomingBookings;

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-[#0B0F19] text-gray-100' : 'bg-gray-50 text-gray-800'} transition-colors duration-200`}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:static flex flex-col justify-between border-r transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'dark'
            ? 'bg-[#111827] border-gray-800'
            : 'bg-white border-gray-200'
        }`}
      >
        <div>
          {/* Header branding */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-inherit">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg shadow-md shadow-blue-600/20 overflow-hidden">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 22H7L12 12L17 22H22L12 2Z" fill="white" />
                  <path d="M12 12L9 18H15L12 12Z" fill="#10b981" />
                </svg>
              </div>
              <span className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-500">AssetFlow</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* User badge */}
          <div className="p-4 border-b border-inherit bg-gray-50/50 dark:bg-gray-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase shadow-sm">
                {currentUser?.name?.substring(0, 2)}
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-sm font-bold truncate">{currentUser?.name}</span>
                <span className="text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md mt-1 self-start">
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <nav className="p-4 flex flex-col gap-1">
            {allowedItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-inherit">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-left transition-colors duration-150 ${
              theme === 'dark'
                ? 'text-rose-400 hover:bg-rose-950/20'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Header Navigation */}
        <header
          className={`h-16 flex items-center justify-between px-6 border-b z-30 transition-colors duration-200 ${
            theme === 'dark' ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={22} />
            </button>
            <h2 className="text-base font-extrabold tracking-tight uppercase hidden sm:block text-gray-500">
              {location.pathname === '/' ? 'System Overview' : location.pathname.substring(1).replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Demonstration Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20 shadow-sm"
              >
                <UserCheck size={14} />
                <span>Simulate: {currentUser?.role}</span>
                <ChevronDown size={12} />
              </button>

              {showRoleMenu && (
                <>
                  <div onClick={() => setShowRoleMenu(false)} className="fixed inset-0 z-30" />
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border p-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150 ${
                      theme === 'dark' ? 'bg-[#1f2937] border-gray-800' : 'bg-white border-gray-200'
                    }`}
                  >
                    <p className="text-[10px] font-bold text-gray-400 uppercase px-3 py-1 tracking-wider border-b border-inherit">Select Role View</p>
                    {['Admin', 'Asset Manager', 'Department Head', 'Employee'].map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          currentUser?.role === role
                            ? 'bg-blue-600 text-white'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications Tray */}
            <div className="relative">
              <button
                onClick={() => setShowNotifyMenu(!showNotifyMenu)}
                className={`p-2 rounded-xl border relative transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-800 hover:bg-gray-800 text-gray-300'
                    : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Bell size={18} />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border border-white">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {showNotifyMenu && (
                <>
                  <div onClick={() => setShowNotifyMenu(false)} className="fixed inset-0 z-30" />
                  <div
                    className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-2 ${
                      theme === 'dark' ? 'bg-[#1f2937] border-gray-800' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-inherit pb-2">
                      <span className="text-xs font-bold">Inbox Alerts</span>
                      <span className="text-[10px] font-bold bg-gray-500/10 px-1.5 py-0.5 rounded text-gray-500">
                        {notificationsCount} New
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                      {pendingRequests > 0 && (
                        <div className="p-2 hover:bg-gray-500/5 rounded-lg flex flex-col text-left gap-0.5 border-b border-gray-500/5 last:border-b-0 cursor-pointer" onClick={() => { navigate('/maintenance'); setShowNotifyMenu(false); }}>
                          <span className="text-xs font-bold text-amber-500">Maintenance Request Pending</span>
                          <span className="text-[10px] text-gray-400">There are {pendingRequests} request(s) awaiting approval.</span>
                        </div>
                      )}
                      {upcomingBookings > 0 && (
                        <div className="p-2 hover:bg-gray-500/5 rounded-lg flex flex-col text-left gap-0.5 border-b border-gray-500/5 last:border-b-0 cursor-pointer" onClick={() => { navigate('/booking'); setShowNotifyMenu(false); }}>
                          <span className="text-xs font-bold text-emerald-500">Upcoming Reservations</span>
                          <span className="text-[10px] text-gray-400">You have {upcomingBookings} upcoming shared booking(s).</span>
                        </div>
                      )}
                      {notificationsCount === 0 && (
                        <div className="py-6 text-center text-xs text-gray-400 font-medium">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'border-gray-800 hover:bg-gray-800 text-yellow-400'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-600'
              }`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Dynamic Inner Router Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
