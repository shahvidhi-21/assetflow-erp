import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Plus,
  Search,
  SlidersHorizontal,
  FileCode2,
  Calendar,
  IndianRupee,
  MapPin,
  Maximize2,
  X,
  History,
  QrCode,
} from 'lucide-react';

const Assets = () => {
  const { user, isAssetManager, isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sharedFilter, setSharedFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Allocation forms inside details
  const [allocatingTo, setAllocatingTo] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    acquisitionDate: '',
    acquisitionCost: '',
    condition: 'GOOD',
    location: 'Office HQ',
    isShared: false,
  });

  const [formError, setFormError] = useState('');

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets', {
        params: {
          search: search || undefined,
          categoryId: catFilter || undefined,
          status: statusFilter || undefined,
          isShared: sharedFilter !== '' ? sharedFilter : undefined,
        },
      });
      setAssets(response.data.data);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    }
  };

  const fetchMeta = async () => {
    try {
      const [catRes, empRes] = await Promise.all([
        api.get('/categories'),
        api.get('/users'),
      ]);
      setCategories(catRes.data.data);
      setEmployees(empRes.data.data);
    } catch (err) {
      console.error('Failed to fetch meta:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchAssets(), fetchMeta()]);
      setLoading(false);
    };
    init();
  }, [search, catFilter, statusFilter, sharedFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      await api.post('/assets', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        categoryId: '',
        serialNumber: '',
        acquisitionDate: '',
        acquisitionCost: '',
        condition: 'GOOD',
        location: 'Office HQ',
        isShared: false,
      });
      fetchAssets();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register asset');
    }
  };

  const handleAllocate = async (assetId) => {
    if (!allocatingTo) return;
    try {
      await api.post('/allocations', {
        assetId,
        employeeId: allocatingTo,
      });
      setAllocatingTo('');
      // Refresh detailed view
      const detailRes = await api.get(`/assets/${assetId}`);
      setSelectedAsset(detailRes.data.data);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Allocation failed');
    }
  };

  const handleReturn = async (allocationId, assetId) => {
    if (!confirm('Are you sure you want to return this asset?')) return;
    try {
      await api.post(`/allocations/${allocationId}/return`);
      const detailRes = await api.get(`/assets/${assetId}`);
      setSelectedAsset(detailRes.data.data);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Return request failed');
    }
  };

  const handleOpenDetails = async (asset) => {
    try {
      const response = await api.get(`/assets/${asset.id}`);
      setSelectedAsset(response.data.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Failed to fetch asset details:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'ALLOCATED':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400';
      case 'UNDER_MAINTENANCE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Asset Directory
          </h1>
          <p className="text-sm text-gray-500">
            View, search, audit, and allocate your organization's physical assets.
          </p>
        </div>
        {isAssetManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-primary-500 hover:to-indigo-500 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Register Asset</span>
          </button>
        )}
      </div>

      {/* Filter Block */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-150/60 p-4 rounded-2xl dark:bg-gray-950 dark:border-gray-800 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by tag, name, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200/80 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        </div>

        <div className="flex w-full md:w-auto items-center justify-end gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              showFilters
                ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-950/20'
                : 'border-gray-200 dark:border-gray-800 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-gray-150 p-4 rounded-2xl dark:bg-gray-950 dark:border-gray-800 shadow-inner">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Category</label>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="RESERVED">Reserved</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Asset Type</label>
            <select
              value={sharedFilter}
              onChange={(e) => setSharedFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <option value="">All Types</option>
              <option value="true">Shared Resources Only</option>
              <option value="false">Individual Allocations</option>
            </select>
          </div>
        </div>
      )}

      {/* Asset Table / List */}
      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:border-gray-850 dark:bg-gray-900/60">
                <th className="px-6 py-4">Asset Tag</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-850">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    No assets found in inventory.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/25">
                    <td className="px-6 py-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      {asset.assetTag}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{asset.name}</div>
                      <div className="text-xs text-gray-400">S/N: {asset.serialNumber}</div>
                    </td>
                    <td className="px-6 py-4">{asset.category.name}</td>
                    <td className="px-6 py-4 text-gray-500">{asset.location}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {asset.condition}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(asset.status)}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(asset)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 cursor-pointer"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal (Includes Asset Timeline, QR Rendering, Allocation Form) */}
      {showDetailsModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl border border-gray-150 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-gray-950 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <Box className="h-6 w-6 text-primary-500" />
                <h3 className="font-display text-xl font-bold">
                  Manage Asset: {selectedAsset.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedAsset(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 text-left">
              {/* Left Column: QR & Info */}
              <div className="space-y-6">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-850 dark:bg-gray-900/60">
                  <QRCodeSVG value={selectedAsset.assetTag} size={130} />
                  <p className="mt-3 font-mono font-bold text-sm text-gray-700 dark:text-gray-300">{selectedAsset.assetTag}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Asset Identification QR Code</p>
                </div>

                <div className="space-y-3.5">
                  <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Acquisition Details</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4.5 w-4.5 text-gray-400" />
                    <span>Bought: {new Date(selectedAsset.acquisitionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="h-4.5 w-4.5 text-gray-400" />
                    <span>Cost: ₹{selectedAsset.acquisitionCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4.5 w-4.5 text-gray-400" />
                    <span>Location: {selectedAsset.location}</span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Current Status & Actions */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-2">Current Lifecycle Status</h4>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(selectedAsset.status)}`}>
                    {selectedAsset.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Operations: Allocator panel */}
                {isAssetManager && selectedAsset.status === 'AVAILABLE' && (
                  <div className="p-4 rounded-2xl border border-primary-100 bg-primary-50/20 dark:border-primary-900/20">
                    <h5 className="font-bold text-sm text-primary-950 dark:text-primary-400 mb-2">Allocate This Asset</h5>
                    <div className="flex gap-2">
                      <select
                        value={allocatingTo}
                        onChange={(e) => setAllocatingTo(e.target.value)}
                        className="flex-1 rounded-xl border border-gray-200 bg-white p-2 text-sm dark:border-gray-800 dark:bg-gray-900"
                      >
                        <option value="">Select Employee...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAllocate(selectedAsset.id)}
                        disabled={!allocatingTo}
                        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-500 cursor-pointer disabled:opacity-55"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                )}

                {/* Return Control Panel */}
                {selectedAsset.status === 'ALLOCATED' && selectedAsset.allocations?.[0] && (
                  <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/20">
                    <h5 className="font-bold text-sm text-indigo-950 dark:text-indigo-400 mb-1">
                      Allocated Assignee
                    </h5>
                    <p className="text-sm">
                      Currently assigned to:{' '}
                      <span className="font-bold">{selectedAsset.allocations[0].employee?.name}</span> ({selectedAsset.allocations[0].employee?.email})
                    </p>
                    {isAssetManager && (
                      <button
                        onClick={() => handleReturn(selectedAsset.allocations[0].id, selectedAsset.id)}
                        className="mt-3 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 cursor-pointer"
                      >
                        Process Return
                      </button>
                    )}
                  </div>
                )}

                {/* horizontal chronological Timeline */}
                <div>
                  <div className="flex items-center gap-1.5 mb-4">
                    <History className="h-4.5 w-4.5 text-gray-400" />
                    <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Asset Lifecycle Timeline</h4>
                  </div>
                  <div className="relative pl-6 border-l-2 border-primary-100 dark:border-primary-900 space-y-5">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-primary-600 bg-white dark:bg-gray-950" />
                      <p className="text-xs font-bold text-gray-400">REGISTERED</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">Asset entered database</p>
                      <p className="text-xs text-gray-400">{new Date(selectedAsset.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedAsset.allocations.slice(0, 3).map((alloc, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-gray-950" />
                        <p className="text-xs font-bold text-gray-400 uppercase">{alloc.status}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                          {alloc.status === 'ACTIVE' ? 'Allocated to' : 'Returned from'} {alloc.employee?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(alloc.status === 'ACTIVE' ? alloc.allocatedDate : (alloc.returnDate || alloc.updatedAt)).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-gray-150 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-gray-950 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-850">
              <h3 className="font-display text-lg font-bold">Register New Asset</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M3"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C02X874KMD6M"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Acquisition Date</label>
                  <input
                    type="date"
                    required
                    value={formData.acquisitionDate}
                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 50000"
                    value={formData.acquisitionCost}
                    onChange={(e) => setFormData({ ...formData, acquisitionCost: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  >
                    <option value="NEW">New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isShared"
                  checked={formData.isShared}
                  onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isShared" className="text-xs font-semibold text-gray-600 dark:text-gray-300 select-none cursor-pointer">
                  Shared Resource (Can be booked by hours e.g. Meeting Room, Vehicle, Projector)
                </label>
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
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
