import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, chartRes] = await Promise.all([
          api.get('/reports/kpis'),
          api.get('/reports/charts'),
        ]);
        setKpis(kpiRes.data.data.kpis);
        setActivities(kpiRes.data.data.recentActivities);
        setCharts(chartRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Fallbacks if data fails
  const total = kpis?.totalAssets || 0;
  const available = kpis?.availableAssets || 0;
  const allocated = kpis?.allocatedAssets || 0;
  const maintenance = kpis?.maintenanceAssets || 0;
  const activeBookings = kpis?.activeBookings || 0;
  const pendingTransfers = kpis?.pendingTransfers || 0;

  // Colors for charts
  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  const statusPieData = charts?.statusDistribution?.map((item) => ({
    name: item.status.replace('_', ' '),
    value: item.count,
  })) || [
    { name: 'AVAILABLE', value: available },
    { name: 'ALLOCATED', value: allocated },
    { name: 'UNDER MAINTENANCE', value: maintenance },
  ];

  const deptBarData = charts?.departmentAllocations || [];

  const kpiCards = [
    {
      title: 'Total company Assets',
      value: total,
      icon: Box,
      color: 'bg-primary-500',
      textColor: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-50 dark:bg-primary-950/20',
      border: 'border-primary-100 dark:border-primary-900/30',
    },
    {
      title: 'Available Assets',
      value: available,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      title: 'Allocated Assets',
      value: allocated,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      border: 'border-indigo-100 dark:border-indigo-900/30',
    },
    {
      title: 'Under Maintenance',
      value: maintenance,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      icon: Calendar,
      color: 'bg-sky-500',
      textColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/20',
      border: 'border-sky-100 dark:border-sky-900/30',
    },
    {
      title: 'Pending Transfers',
      value: pendingTransfers,
      icon: ArrowLeftRight,
      color: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-100 dark:border-rose-900/30',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 p-6 md:p-8 text-white shadow-xl shadow-primary-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-primary-100 mt-1 text-sm md:text-base">
            Here's a quick overview of your organization's physical assets and shared resources today.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-md self-start md:self-auto text-sm font-semibold">
          <Zap className="h-5 w-5 text-amber-300" />
          <span>Quick System Status: Optimal</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-6 rounded-3xl bg-white border border-gray-150/60 dark:bg-gray-950 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</p>
              <h3 className="font-display text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
                {card.value}
              </h3>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bgColor} ${card.textColor} border ${card.border}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
            Asset Status Distribution
          </h3>
          <div className="h-80 w-full flex flex-col sm:flex-row items-center justify-center">
            <div className="h-60 w-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 space-y-2 text-left w-full sm:w-auto">
              {statusPieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-semibold text-gray-500 uppercase">{entry.name}</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department-wise Allocation Bar Chart */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
            Department-wise Active Allocations
          </h3>
          <div className="h-80 w-full">
            {deptBarData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                No active allocations to display
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="allocatedCount" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                    {deptBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#8b5cf6" className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-primary-500" />
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
            System Activities Log
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-850">
          {activities.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">No recent activities logged</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400">
                      {act.module}
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {act.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{act.details}</p>
                </div>
                <div className="text-xs text-gray-400 self-start sm:self-auto">
                  <p className="font-medium">{act.user.name}</p>
                  <p className="mt-0.5">{new Date(act.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
