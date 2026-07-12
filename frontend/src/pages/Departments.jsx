import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Plus, X, Pencil, Trash2 } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchDepartments();
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, { name, description, status });
      } else {
        await api.post('/departments', { name, description, status });
      }
      setShowModal(false);
      setName('');
      setDescription('');
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (dept) => {
    setEditingId(dept.id);
    setName(dept.name);
    setDescription(dept.description || '');
    setStatus(dept.status);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Departments
          </h1>
          <p className="text-sm text-gray-500">Manage your company's departments and employee divisions.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setName('');
            setDescription('');
            setStatus('ACTIVE');
            setError('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-primary-500 hover:to-indigo-500 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:border-gray-850 dark:bg-gray-900/60">
                <th className="px-6 py-4">Department Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Employees Count</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-850">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">No departments registered.</td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/25">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-sm truncate">
                      {dept.description || <span className="text-gray-300 dark:text-gray-650">—</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {dept._count?.employees || 0} employees
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        dept.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-850 dark:bg-gray-800'
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 dark:border-red-950/20 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-150 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-gray-950">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-850">
              <h3 className="font-display text-lg font-bold">
                {editingId ? 'Edit Department' : 'Add Department'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-650">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering, Sales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  placeholder="Department details..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-500 cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
