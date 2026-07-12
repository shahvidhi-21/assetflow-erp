import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Download,
  AlertTriangle,
  TrendingDown,
  Clock,
  Gauge,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [highRisk, setHighRisk] = useState([]);
  const [retirement, setRetirement] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [congestion, setCongestion] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/reports/insights');
        setInsights(response.data.data.insights);
        setHighRisk(response.data.data.highRiskAssets);
        setRetirement(response.data.data.nearingRetirement);
        setOverdue(response.data.data.overdueReturns);
        setCongestion(response.data.data.bookingCongestion);
      } catch (err) {
        console.error('Failed to load reports insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const handleCSVExport = () => {
    // Open in a new tab to trigger browser download stream
    window.open('/api/reports/export-csv');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const financials = insights?.financials || { totalOriginalValue: 0, currentDepreciatedValue: 0 };

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Asset Intelligence & Reports
          </h1>
          <p className="text-sm text-gray-500">
            Export database tables and review AI preventive maintenance forecasts.
          </p>
        </div>
        <button
          onClick={handleCSVExport}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-gray-850 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer"
        >
          <Download className="h-4.5 w-4.5" />
          <span>Export Assets CSV</span>
        </button>
      </div>

      {/* AI Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-800 via-indigo-800 to-indigo-950 p-6 text-white shadow-xl shadow-primary-500/10 flex items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-200">
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            <span>AI Predictive Insight Engine</span>
          </div>
          <h2 className="font-display text-xl md:text-2xl font-extrabold">
            Predictive Health & Depreciation Analysis
          </h2>
          <p className="text-indigo-200 text-xs md:text-sm max-w-2xl">
            AssetFlow monitors asset condition cycles, maintenance logs, and operational age metrics to forecast replacement timelines and prevent hardware bottlenecks.
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-8 select-none pointer-events-none hidden lg:block">
          <Sparkles className="h-64 w-64 text-white" />
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Book Value depreciation card */}
        <div className="p-6 rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Book Value (Depreciated)</span>
              <h3 className="font-display text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                ₹{financials.currentDepreciatedValue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Computed using Straight Line depreciation (20% per year). Original purchase price: <span className="font-bold">₹{financials.totalOriginalValue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* High Risk failure cards count */}
        <div className="p-6 rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">High Breakdown Risk</span>
              <h3 className="font-display text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400">
                {insights?.highRiskCount || 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Assets showing POOR conditions combined with operational ages over 2.0 years.
          </div>
        </div>

        {/* Overdue returns card */}
        <div className="p-6 rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Overdue Returns (&gt;30d)</span>
              <h3 className="font-display text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                {insights?.overdueCount || 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Individual assets that have been allocated for longer than 30 consecutive days.
          </div>
        </div>
      </div>

      {/* Tables section: Risk Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk profile List */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Preventive Maintenance Warnings</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {highRisk.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400">No high breakdown risk assets detected</p>
            ) : (
              highRisk.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <h5 className="font-semibold text-sm">{item.name}</h5>
                    <p className="text-xs text-gray-400 font-mono">{item.tag}</p>
                    <p className="text-xs text-red-500 mt-0.5">{item.reason}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400">
                    {item.risk} RISK
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Nearing retirement list */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Recommended Asset Replacements</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {retirement.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400">No assets pending replacement</p>
            ) : (
              retirement.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <h5 className="font-semibold text-sm">{item.name}</h5>
                    <p className="text-xs text-gray-400 font-mono">{item.tag}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Asset Age: {item.ageYears} years</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold">₹{item.cost.toLocaleString('en-IN')}</span>
                    <p className="text-[10px] font-semibold text-gray-400">Orig. Cost</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overdue and Congestions row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overdue details table */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold">Overdue Return Audit Details</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {overdue.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400">No overdue assets detected</p>
            ) : (
              overdue.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <h5 className="font-semibold text-sm">{item.name}</h5>
                    <p className="text-xs text-gray-400 font-mono">{item.tag}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Holder: {item.employee}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {item.daysElapsed} days out
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottlenecks list */}
        <div className="rounded-3xl border border-gray-150 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-sm space-y-4">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <Gauge className="h-5 w-5 text-indigo-500" />
            <span>Shared Resource Utilization Bottlenecks</span>
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-850">
            {congestion.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400">No booking bottlenecks logged</p>
            ) : (
              congestion.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <h5 className="font-semibold text-sm">{item.name}</h5>
                    <p className="text-xs text-gray-400 font-mono">{item.tag}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{item.bookingsCount} Bookings</span>
                    <p className="text-[10px] text-gray-400">High Congestion</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
