import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Tags, Plus, X, Pencil, Trash2 } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, description });
      } else {
        await api.post('/categories', { name, description });
      }
      setShowModal(false);
      setName('');
      setDescription('');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
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
            Asset Categories
          </h1>
          <p className="text-sm text-gray-500">Manage categories for laptop assets, furniture, vehicles, and electronics.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setName('');
            setDescription('');
            setError('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-primary-500 hover:to-indigo-500 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:border-gray-850 dark:bg-gray-900/60">
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Total Assets In Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-850">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-400">No categories registered.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/25">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-sm truncate">
                      {cat.description || <span className="text-gray-300 dark:text-gray-650">—</span>}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                      {cat._count?.assets || 0} registered assets
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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
                {editingId ? 'Edit Category' : 'Add Category'}
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
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptops, Vehicles, Office Chairs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  placeholder="Category specifications..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                />
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

export default Categories;
