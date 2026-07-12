import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Plus, Check, ArrowRight, User, AlertTriangle, X, Play } from 'lucide-react';

export default function Maintenance() {
  const { assets, maintenanceRequests, raiseMaintenance, updateMaintenanceStatus, currentUser } = useAppState();
  const [showModal, setShowModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [issue, setIssue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !issue) return;

    raiseMaintenance(parseInt(selectedAssetId), issue);
    
    setSelectedAssetId('');
    setIssue('');
    setShowModal(false);
  };

  // Group requests by status
  const getRequestsByStatus = (status) => {
    return maintenanceRequests.filter((r) => r.status === status);
  };

  const columns = [
    { title: 'Pending Approval', status: 'Pending', color: 'border-t-red-500 bg-red-500/5' },
    { title: 'Approved', status: 'Approved', color: 'border-t-blue-500 bg-blue-500/5' },
    { title: 'In Progress', status: 'Technician Assigned', color: 'border-t-amber-500 bg-amber-500/5' },
    { title: 'Completed', status: 'Completed', color: 'border-t-emerald-500 bg-emerald-500/5' },
  ];

  const canManage = currentUser.role === 'Admin' || currentUser.role === 'Asset Manager';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 text-left">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Maintenance requests</h1>
          <p className="text-sm font-medium text-gray-400">Track and manage physical asset repairs. Moving to approved automatically flags assets as 'Under Maintenance'.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer self-start"
        >
          <Plus size={16} />
          <span>Raise Request</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const list = getRequestsByStatus(col.status);
          return (
            <div
              key={col.status}
              className={`border-t-4 ${col.color} bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-sm min-h-[400px] flex flex-col gap-4`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">{col.title}</h4>
                <span className="text-[10px] font-black bg-gray-500/10 text-gray-500 px-2 py-0.5 rounded-full">{list.length}</span>
              </div>

              <div className="flex flex-col gap-3">
                {list.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-3 shadow-inner hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">{req.assetTag}</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white leading-tight mt-0.5">{req.assetName}</span>
                      <p className="text-[11px] text-gray-500 leading-normal mt-2 italic font-semibold">"{req.issue}"</p>
                    </div>

                    <div className="border-t border-gray-50 dark:border-gray-800 pt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                        <User size={12} />
                        <span className="truncate max-w-[80px]">{req.raisedBy}</span>
                      </div>

                      {/* Action buttons depending on status and role */}
                      {canManage && (
                        <div className="flex items-center gap-1">
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => updateMaintenanceStatus(req.id, 'Approved')}
                              title="Approve Maintenance"
                              className="p-1 bg-blue-500/15 hover:bg-blue-500/35 text-blue-600 dark:text-blue-400 rounded transition-colors cursor-pointer"
                            >
                              <Check size={12} strokeWidth={3} />
                            </button>
                          )}
                          {req.status === 'Approved' && (
                            <button
                              onClick={() => updateMaintenanceStatus(req.id, 'Technician Assigned')}
                              title="Assign Tech & Start Work"
                              className="p-1 bg-amber-500/15 hover:bg-amber-500/35 text-amber-600 dark:text-amber-400 rounded transition-colors cursor-pointer"
                            >
                              <Play size={12} fill="currentColor" />
                            </button>
                          )}
                          {req.status === 'Technician Assigned' && (
                            <button
                              onClick={() => updateMaintenanceStatus(req.id, 'Completed')}
                              title="Mark Resolved"
                              className="p-1 bg-emerald-500/15 hover:bg-emerald-500/35 text-emerald-600 dark:text-emerald-400 rounded transition-colors cursor-pointer"
                            >
                              <Check size={12} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div className="py-12 text-center text-[11px] text-gray-400 font-semibold border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    No requests logged
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Raise Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-5 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Raise Maintenance Request</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Select Target Asset</label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                >
                  <option value="">-- Choose Asset --</option>
                  {assets.filter(a => a.status !== 'Retired').map((asset) => (
                    <option key={asset.id} value={asset.id}>{asset.name} ({asset.tag})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Issue Description</label>
                <textarea
                  required
                  placeholder="Explain the defect or service request details..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  rows="3"
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer"
              >
                File Support Ticket
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
