import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { FileDown, Calendar, AlertTriangle, User, RefreshCw, BarChart2 } from 'lucide-react';

export default function Reports() {
  const { assets, allocations, bookings, maintenanceRequests } = useAppState();
  const [reportType, setReportType] = useState('allocations');

  // Generate Report Data
  const getReportData = () => {
    switch (reportType) {
      case 'allocations':
        return allocations.map((a) => ({
          col1: a.assetTag,
          col2: a.assetName,
          col3: a.employeeName,
          col4: a.allocatedDate,
          col5: a.returnedDate || 'Active',
          status: a.status,
        }));
      case 'maintenance':
        return maintenanceRequests.map((m) => ({
          col1: m.assetTag,
          col2: m.assetName,
          col3: m.raisedBy,
          col4: m.dateRaised,
          col5: m.issue,
          status: m.status,
        }));
      case 'bookings':
        return bookings.map((b) => ({
          col1: b.resourceName,
          col2: b.bookedBy,
          col3: b.date,
          col4: `${b.startTime} - ${b.endTime}`,
          col5: 'N/A',
          status: b.status,
        }));
      default:
        return [];
    }
  };

  const reportHeaders = () => {
    switch (reportType) {
      case 'allocations':
        return ['Asset Tag', 'Asset Name', 'Allocated To', 'Allocated Date', 'Return Date', 'Status'];
      case 'maintenance':
        return ['Asset Tag', 'Asset Name', 'Raised By', 'Date Raised', 'Issue Details', 'Status'];
      case 'bookings':
        return ['Resource Name', 'Booked By', 'Date', 'Time Slot', '', 'Status'];
      default:
        return [];
    }
  };

  const reportTitle = () => {
    switch (reportType) {
      case 'allocations':
        return 'Active & Historical Asset Allocations';
      case 'maintenance':
        return 'Asset Maintenance & Repair Frequency';
      case 'bookings':
        return 'Shared Resource Allocation Slots';
      default:
        return '';
    }
  };

  const handleExportCSV = () => {
    const headers = reportHeaders().filter(h => h !== '');
    const rows = getReportData().map(row => [
      row.col1,
      row.col2,
      row.col3,
      row.col4,
      row.col5 === 'N/A' ? '' : row.col5,
      row.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      const sanitized = row.map(v => `"${String(v).replace(/"/g, '""')}"`);
      csvContent += sanitized.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AssetFlow_${reportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportData = getReportData();
  const headers = reportHeaders();

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 text-left">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Reports Panel</h1>
          <p className="text-sm font-medium text-gray-400">Generate aggregated data metrics and download spreadsheets.</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={reportData.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/10 cursor-pointer self-start"
        >
          <FileDown size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { id: 'allocations', label: 'Allocation History', icon: RefreshCw },
          { id: 'maintenance', label: 'Maintenance Freq', icon: AlertTriangle },
          { id: 'bookings', label: 'Shared Booking Logs', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                reportType === tab.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Table Display */}
      <div className="bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col gap-4 p-6">
        <div>
          <h3 className="text-base font-extrabold tracking-tight">{reportTitle()}</h3>
          <p className="text-xs font-semibold text-gray-400">Report details generated on {new Date().toISOString().split('T')[0]}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {headers.map((h, i) => h !== '' && (
                  <th key={i} className="px-6 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {reportData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-500/5 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{row.col1}</td>
                  <td className="px-6 py-4">{row.col2}</td>
                  <td className="px-6 py-4 text-gray-500">{row.col3}</td>
                  <td className="px-6 py-4 text-gray-450 font-mono">{row.col4}</td>
                  {headers[4] !== '' && (
                    <td className="px-6 py-4 text-gray-450 truncate max-w-[200px]">{row.col5}</td>
                  )}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {reportData.length === 0 && (
          <div className="py-12 text-center text-xs text-gray-400 font-medium">No report records found for this category.</div>
        )}
      </div>

    </div>
  );
}
