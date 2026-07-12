import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { CheckCircle2, UserCheck, RefreshCw, X, ArrowLeftRight } from 'lucide-react';

export default function Allocation() {
  const { assets, employees, allocations, allocateAsset, returnAsset, transferAsset } = useAppState();
  
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');

  // Filter lists
  const availableAssets = assets.filter((a) => a.status === 'Available' && !a.sharedResource);
  const activeAllocations = allocations.filter((a) => a.status === 'Active');

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsset || !targetEmployeeId) return;

    allocateAsset(selectedAsset.id, parseInt(targetEmployeeId));
    
    setSelectedAsset(null);
    setTargetEmployeeId('');
    setShowAllocateModal(false);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!selectedAllocation || !targetEmployeeId) return;

    transferAsset(selectedAllocation.id, parseInt(targetEmployeeId));

    setSelectedAllocation(null);
    setTargetEmployeeId('');
    setShowTransferModal(false);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200 text-left">
      
      <div>
        <h1 className="text-2xl font-black tracking-tight">Asset Allocation</h1>
        <p className="text-sm font-medium text-gray-400">Assign physical inventory assets to active employees, transfer equipment, and handle returns.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Panel 1: Available Assets to Assign */}
        <div className="flex flex-col gap-4 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Available Inventory</h3>
            <p className="text-xs font-semibold text-gray-400">Equipment in stock ready for deployment</p>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {availableAssets.map((asset) => (
              <div key={asset.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between hover:bg-gray-500/5 transition-colors gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-bold shrink-0">
                    AST
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{asset.tag}</span>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{asset.name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{asset.category} • {asset.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedAsset(asset); setShowAllocateModal(true); }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-blue-600/10"
                >
                  <UserCheck size={13} />
                  <span>Assign</span>
                </button>
              </div>
            ))}
            {availableAssets.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-medium">All physical assets are currently allocated.</div>
            )}
          </div>
        </div>

        {/* Panel 2: Active Deployments */}
        <div className="flex flex-col gap-4 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Active Deployments</h3>
            <p className="text-xs font-semibold text-gray-400">Assets currently assigned to personnel</p>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {activeAllocations.map((alloc) => (
              <div key={alloc.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-500/5 transition-colors gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold shrink-0">
                    ACT
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{alloc.assetTag}</span>
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{alloc.assetName}</span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1">Assigned to: <strong className="text-gray-700 dark:text-gray-300">{alloc.employeeName}</strong></span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Assigned Date: {alloc.allocatedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => { setSelectedAllocation(alloc); setShowTransferModal(true); }}
                    title="Transfer Asset to another User"
                    className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-indigo-500/10"
                  >
                    <ArrowLeftRight size={13} />
                    <span>Transfer</span>
                  </button>
                  <button
                    onClick={() => returnAsset(alloc.id)}
                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-emerald-500/10"
                  >
                    <CheckCircle2 size={13} />
                    <span>Return</span>
                  </button>
                </div>
              </div>
            ))}
            {activeAllocations.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-medium">No active allocations recorded.</div>
            )}
          </div>
        </div>

      </div>

      {/* 1. Allocate Asset Modal */}
      {showAllocateModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-5 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">Assign {selectedAsset.tag}</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white truncate max-w-[260px]">{selectedAsset.name}</h3>
              </div>
              <button onClick={() => { setSelectedAsset(null); setShowAllocateModal(false); }} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Select Target Employee</label>
                <select
                  required
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.filter(e => e.status === 'Active').map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer"
              >
                Assign Asset to Employee
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Transfer Asset Modal */}
      {showTransferModal && selectedAllocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-5 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">Transfer {selectedAllocation.assetTag}</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white truncate max-w-[260px]">{selectedAllocation.assetName}</h3>
              </div>
              <button onClick={() => { setSelectedAllocation(null); setShowTransferModal(false); }} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4">
              <div className="text-xs font-semibold text-gray-400">
                Current Owner: <strong className="text-gray-800 dark:text-gray-200">{selectedAllocation.employeeName}</strong>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Select Target Recipient</label>
                <select
                  required
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.filter(e => e.status === 'Active' && e.name !== selectedAllocation.employeeName).map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm cursor-pointer"
              >
                Perform Transfer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
