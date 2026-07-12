import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Plus, Search, Eye, QrCode, Trash2, X, History, Box, Tag, Award, HeartHandshake } from 'lucide-react';

export default function Assets() {
  const { assets, categories, addAsset, deleteAsset, currentUser } = useAppState();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'Laptop',
    serialNumber: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    condition: 'Excellent',
    location: '',
    sharedResource: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.serialNumber) return;

    addAsset({
      ...form,
      acquisitionCost: parseFloat(form.acquisitionCost) || 0,
      category: form.category,
    });

    closeModal();
  };

  const closeModal = () => {
    setForm({
      name: '',
      category: categories[0]?.name || 'Laptop',
      serialNumber: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: '',
      condition: 'Excellent',
      location: '',
      sharedResource: false,
    });
    setShowModal(false);
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.tag.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.status.toLowerCase().includes(search.toLowerCase())
  );

  // Checks for permissions
  const canWrite = currentUser.role === 'Admin' || currentUser.role === 'Asset Manager';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Assets Inventory</h1>
          <p className="text-sm font-medium text-gray-400">Add, track, view timeline lifecycles, and generate QR Codes for physical inventory.</p>
        </div>
        {canWrite && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer self-start"
          >
            <Plus size={16} />
            <span>Register Asset</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 px-4 py-3 rounded-2xl shadow-sm">
        <Search className="text-gray-400 shrink-0" size={18} />
        <input
          type="text"
          placeholder="Global Search (Tag, Name, Category, Serial, Status...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none placeholder-gray-400 font-semibold"
        />
      </div>

      {/* Assets Directory Table */}
      <div className="bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Asset Tag</th>
                <th className="px-6 py-4">Asset Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-500/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 font-bold">{asset.tag}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={asset.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=80&q=80'} className="w-9 h-9 rounded-lg object-cover bg-gray-100 shrink-0 shadow-sm" alt="" />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-gray-900 dark:text-white">{asset.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">S/N: {asset.serialNumber}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500">{asset.category}</span>
                    {asset.sharedResource && (
                      <span className="inline-flex ml-1.5 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] rounded font-black uppercase">Shared</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asset.condition === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      asset.condition === 'Good' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      asset.condition === 'Fair' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-[150px]">{asset.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      asset.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      asset.status === 'Allocated' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                      asset.status === 'Under Maintenance' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => { setSelectedAsset(asset); setShowTimelineModal(true); }}
                        title="Lifecycle Timeline"
                        className="p-1.5 hover:bg-gray-500/10 text-gray-500 hover:text-gray-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <History size={15} />
                      </button>
                      <button
                        onClick={() => { setSelectedAsset(asset); setShowQrModal(true); }}
                        title="View Asset QR"
                        className="p-1.5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <QrCode size={15} />
                      </button>
                      {canWrite && (
                        <button
                          onClick={() => deleteAsset(asset.id)}
                          title="Retire Asset"
                          className="p-1.5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAssets.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm font-medium">No assets matched your query.</div>
        )}
      </div>

      {/* 1. Register Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-5 text-left animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Register Physical Asset</h3>
              <button onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Asset Name</label>
                <input
                  type="text" required placeholder="e.g. MacBook Pro M3" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Serial Number (S/N)</label>
                <input
                  type="text" required placeholder="e.g. SN1234567" value={form.serialNumber}
                  onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Acquisition Date</label>
                <input
                  type="date" required value={form.acquisitionDate}
                  onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Acquisition Cost (USD)</label>
                <input
                  type="number" required placeholder="e.g. 1500" value={form.acquisitionCost}
                  onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Initial Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Location / Shelf</label>
                <input
                  type="text" required placeholder="e.g. Bangalore HQ" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-2 py-2">
                <input
                  type="checkbox" id="sharedResource" checked={form.sharedResource}
                  onChange={(e) => setForm({ ...form, sharedResource: e.target.checked })}
                  className="w-4.5 h-4.5 rounded text-blue-600"
                />
                <label htmlFor="sharedResource" className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase cursor-pointer">
                  Shared Resource (Available for employee booking slots)
                </label>
              </div>

              <button
                type="submit"
                className="w-full sm:col-span-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer"
              >
                Register Asset Into Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Asset Timeline Modal */}
      {showTimelineModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-6 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{selectedAsset.tag}</span>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white truncate max-w-[280px]">{selectedAsset.name}</h3>
              </div>
              <button onClick={() => { setSelectedAsset(null); setShowTimelineModal(false); }} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Timelines logs */}
            <div className="flex flex-col gap-5 pl-2 relative border-l-2 border-blue-500/20 max-h-[360px] overflow-y-auto scrollbar-none">
              {selectedAsset.timeline?.map((step, idx) => (
                <div key={idx} className="relative flex flex-col gap-1 pl-6">
                  {/* Point */}
                  <div className="absolute -left-[30px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-[#111827]" />
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span className="uppercase tracking-wider">{step.action}</span>
                    <span>{step.date}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{step.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. QR Code Generator Modal */}
      {showQrModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Asset QR Code</h3>
              <button onClick={() => { setSelectedAsset(null); setShowQrModal(false); }} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 text-center">
              {/* Simulated QR Code SVG */}
              <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-inner flex items-center justify-center">
                <svg width="160" height="160" viewBox="0 0 160 160" className="text-gray-900">
                  {/* Outer boundaries */}
                  <rect width="160" height="160" fill="white" />
                  {/* Position detection patterns (corner rings) */}
                  <rect x="10" y="10" width="30" height="30" fill="currentColor" />
                  <rect x="15" y="15" width="20" height="20" fill="white" />
                  <rect x="18" y="18" width="14" height="14" fill="currentColor" />

                  <rect x="120" y="10" width="30" height="30" fill="currentColor" />
                  <rect x="125" y="15" width="20" height="20" fill="white" />
                  <rect x="128" y="18" width="14" height="14" fill="currentColor" />

                  <rect x="10" y="120" width="30" height="30" fill="currentColor" />
                  <rect x="15" y="125" width="20" height="20" fill="white" />
                  <rect x="18" y="128" width="14" height="14" fill="currentColor" />

                  {/* Random pixels simulating code based on tag */}
                  <rect x="55" y="20" width="10" height="20" fill="currentColor" />
                  <rect x="70" y="10" width="20" height="10" fill="currentColor" />
                  <rect x="100" y="30" width="10" height="10" fill="currentColor" />
                  
                  <rect x="20" y="55" width="20" height="10" fill="currentColor" />
                  <rect x="10" y="70" width="10" height="20" fill="currentColor" />
                  
                  <rect x="50" y="50" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
                  <rect x="75" y="75" width="10" height="10" fill="currentColor" />
                  <rect x="60" y="90" width="15" height="10" fill="currentColor" />
                  <rect x="85" y="60" width="10" height="20" fill="currentColor" />

                  <rect x="120" y="60" width="20" height="10" fill="currentColor" />
                  <rect x="130" y="80" width="10" height="30" fill="currentColor" />
                  <rect x="100" y="120" width="10" height="20" fill="currentColor" />
                  <rect x="60" y="130" width="30" height="10" fill="currentColor" />
                </svg>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">{selectedAsset.tag}</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">{selectedAsset.name}</span>
                <span className="text-[11px] text-gray-400 font-semibold mt-1">Scan tag to register maintenance or verify allocation audits.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
