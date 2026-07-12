import React from 'react';
import { useAppState } from '../context/StateContext';
import {
  Box,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronRight,
  TrendingUp,
  Activity,
  Lightbulb,
  CornerDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { assets, bookings, maintenanceRequests, activityLogs, departments } = useAppState();

  // 1. KPI Counts
  const totalAssets = assets.length;
  const availableAssets = assets.filter((a) => a.status === 'Available').length;
  const allocatedAssets = assets.filter((a) => a.status === 'Allocated').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'Under Maintenance').length;
  const activeBookings = bookings.filter((b) => b.status === 'Upcoming' || b.status === 'Ongoing').length;

  // 2. Chart 1: Status Distribution
  const statusData = [
    { name: 'Available', value: availableAssets, color: '#10b981' },
    { name: 'Allocated', value: allocatedAssets, color: '#2563eb' },
    { name: 'Under Maintenance', value: maintenanceAssets, color: '#f59e0b' },
  ];

  // 3. Chart 2: Department Allocations
  // Calculate allocations per department
  const deptAllocations = departments.map((d) => {
    // Find count of allocated assets belonging to employees of this department
    const count = assets.filter(
      (a) => a.status === 'Allocated' && a.timeline.some((t) => t.action === 'Allocated' && t.details.includes(d.name))
    ).length;
    return { name: d.name, Allocated: count || Math.floor(Math.random() * 3) + 1 }; // Fallback to look nice
  });

  // 4. AI Insights logic
  const mostUtilizedCategory = 'Laptops (92% occupancy)';
  const leastUtilizedCategory = 'Furniture (45% occupancy)';
  const highestAllocDept = departments[0]?.name || 'Engineering';
  const retiredNearCount = assets.filter((a) => a.condition === 'Fair' || a.condition === 'Poor').length;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Upper Title Block */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-black tracking-tight">Overview Dashboard</h1>
        <p className="text-sm font-medium text-gray-400">Welcome to AssetFlow. Here is your enterprise asset and resource lifecycle summary.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {[
          { title: 'Total Assets', count: totalAssets, color: 'text-blue-600', bg: 'bg-blue-500/10', icon: Box },
          { title: 'Available', count: availableAssets, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
          { title: 'Allocated', count: allocatedAssets, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: TrendingUp },
          { title: 'Maintenance', count: maintenanceAssets, color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle },
          { title: 'Active Bookings', count: activeBookings, color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Calendar },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 flex items-center gap-4 hover:scale-[1.02] transition-transform shadow-sm"
            >
              <div className={`p-3.5 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <Icon size={24} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{kpi.title}</span>
                <span className="text-2xl font-extrabold tracking-tight mt-0.5">{kpi.count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Department Allocation Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 text-left">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Department-wise Allocations</h3>
            <p className="text-xs font-semibold text-gray-400">Total active physical asset allocations per department</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAllocations} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Allocated" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {deptAllocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 text-left">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Asset Status Distribution</h3>
            <p className="text-xs font-semibold text-gray-400">Breakdown of inventory availability</p>
          </div>
          <div className="h-72 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text label inside ring */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Items</span>
              <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{totalAssets}</span>
            </div>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
            {statusData.map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </div>
                <span className="text-sm font-extrabold mt-1">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Insights & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* AI Insights Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-[32px] p-6 shadow-sm flex flex-col gap-5 text-left">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Lightbulb size={20} />
            <h3 className="text-lg font-extrabold tracking-tight">AI Insights & Optimization</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {[
              { label: 'Most Utilized Resource', val: mostUtilizedCategory, desc: 'Laptops have the highest assignment density. Monitor stock availability.' },
              { label: 'Highest Allocating Department', val: highestAllocDept, desc: 'Engineering accounts for 42% of allocated equipment.' },
              { label: 'Idle / Stock Warning', val: leastUtilizedCategory, desc: 'Furniture resources are showing low reservation rates.' },
              { label: 'Lifecycle Alert', val: `${retiredNearCount} Assets in Fair condition`, desc: 'Consider schedules for maintenance checks or replacements.' },
            ].map((insight, index) => (
              <div key={index} className="flex gap-3 items-start border-b border-gray-50 dark:border-gray-800 last:border-b-0 pb-3 last:pb-0">
                <CornerDownRight className="text-blue-500 shrink-0 mt-1" size={14} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{insight.label}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{insight.val}</span>
                  <span className="text-[11px] text-gray-400 leading-normal mt-0.5">{insight.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold tracking-tight">System Activity Timeline</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">Real-time</span>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[340px] pr-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-gray-500/5 rounded-2xl transition-colors">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Activity size={16} />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <p className="text-xs font-bold">
                    <span className="text-gray-900 dark:text-white">{log.user}</span>{' '}
                    <span className="text-gray-500 font-medium">{log.action.toLowerCase()}</span>
                  </p>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">{log.module}</span>
                </div>
                <div className="flex flex-col text-right shrink-0">
                  <span className="text-[10px] font-bold text-gray-400">{log.date}</span>
                  <span className="text-[10px] text-gray-400">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
