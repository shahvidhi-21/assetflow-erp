import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Wrench, Plus, X, User, ShieldAlert, CheckCircle, Play, AlertCircle } from 'lucide-react';

const Maintenance = () => {
  const { user, isAssetManager } = useAuth();
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [formError, setFormError] = useState('');

  // Technician assignment state
  const [assigningRequestId, setAssigningRequestId] = useState(null);
  const [technicianName, setTechnicianName] = useState('');

  const fetchRequests = async () => {
    try {
      const response = await api.get('/maintenance');
      setRequests(response.data.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data.data);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchAssets()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      await api.post('/maintenance', {
        assetId: selectedAssetId,
        description,
        priority,
      });
      setShowCreateModal(false);
      setSelectedAssetId('');
      setDescription('');
      setPriority('MEDIUM');
      fetchRequests();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit maintenance request');
    }
  };

  const handleUpdateStatus = async (id, status, techName = null) => {
    try {
      await api.put(`/maintenance/${id}/status`, {
        status,
        technicianName: techName || undefined,
      });
      setAssigningRequestId(null);
      setTechnicianName('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update workflow status');
    }
  };

  const getPriorityColor = (pri) => {
    switch (pri) {
      case 'HIGH':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400';
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400';
      case 'APPROVED':
        return 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-400';
      case 'TECHNICIAN_ASSIGNED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-850';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Maintenance Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Submit break-fix tickets and track equipment repair pipelines.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-primary-500 hover:to-indigo-500 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Raise Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:border-gray-850 dark:bg-gray-900/60">
                <th className="px-6 py-4">Asset Info</th>
                <th className="px-6 py-4">Issue Description</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-850">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    No active maintenance tickets reported.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/25">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{req.asset.name}</div>
                      <div className="text-xs font-mono text-gray-400">{req.asset.assetTag}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {req.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{req.employee.name}</div>
                      <div className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {req.technicianName || <span className="text-gray-300 dark:text-gray-650">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAssetManager && (
                        <div className="flex justify-end gap-1.5">
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="rounded-lg border border-violet-200 px-2 py-1 text-xs font-bold text-violet-600 hover:bg-violet-50 dark:border-violet-900 dark:text-violet-400 dark:hover:bg-violet-950/20"
                            >
                              Approve
                            </button>
                          )}

                          {req.status === 'APPROVED' && (
                            <div className="flex gap-1">
                              {assigningRequestId === req.id ? (
                                <div className="flex gap-1 items-center">
                                  <input
                                    type="text"
                                    placeholder="Tech Name"
                                    value={technicianName}
                                    onChange={(e) => setTechnicianName(e.target.value)}
                                    className="rounded border border-gray-300 px-1.5 py-0.5 text-xs bg-white text-gray-900"
                                  />
                                  <button
                                    onClick={() => handleUpdateStatus(req.id, 'TECHNICIAN_ASSIGNED', technicianName)}
                                    disabled={!technicianName}
                                    className="bg-emerald-600 text-white rounded px-2 py-0.5 text-xs"
                                  >
                                    Assign
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAssigningRequestId(req.id)}
                                  className="rounded-lg border border-amber-200 px-2 py-1 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/20"
                                >
                                  Assign Tech
                                </button>
                              )}
                            </div>
                          )}

                          {req.status === 'TECHNICIAN_ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                              className="rounded-lg border border-sky-200 px-2 py-1 text-xs font-bold text-sky-600 hover:bg-sky-50 dark:border-sky-900 dark:text-sky-400 dark:hover:bg-sky-950/20"
                            >
                              Start
                            </button>
                          )}

                          {req.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                              className="rounded-lg border border-emerald-200 px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-150 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-gray-950">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary-500" />
                <h3 className="font-display text-lg font-bold">Raise Maintenance Ticket</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Select Asset</label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="">Select Asset...</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.assetTag}) - {asset.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Problem Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Explain the damage or break-fix issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-500 cursor-pointer"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
