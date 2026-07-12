import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from './context/StateContext';

// Layout & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Allocation from './pages/Allocation';
import Booking from './pages/Booking';
import Maintenance from './pages/Maintenance';
import Departments from './pages/Departments';
import Categories from './pages/Categories';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

import ProtectedRoute from './routes/ProtectedRoute';

// Auth Guard Wrapper
function ProtectedRouteWithLayout({ children, allowedRoles }) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard Workspace Routes */}
        <Route
          path="/"
          element={
            <ProtectedRouteWithLayout>
              <Dashboard />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRouteWithLayout>
              <Assets />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/allocation"
          element={
            <ProtectedRouteWithLayout allowedRoles={['Admin', 'Asset Manager']}>
              <Allocation />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRouteWithLayout>
              <Booking />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRouteWithLayout>
              <Maintenance />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRouteWithLayout allowedRoles={['Admin']}>
              <Departments />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRouteWithLayout allowedRoles={['Admin']}>
              <Categories />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRouteWithLayout allowedRoles={['Admin']}>
              <Employees />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRouteWithLayout allowedRoles={['Admin', 'Asset Manager']}>
              <Reports />
            </ProtectedRouteWithLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRouteWithLayout>
              <Profile />
            </ProtectedRouteWithLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
