import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppState();
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.description) return;

    if (isEditing) {
      updateCategory(editId, form);
    } else {
      addCategory(form);
    }

    closeModal();
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description });
    setEditId(cat.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setForm({ name: '', description: '' });
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Asset Categories</h1>
          <p className="text-sm font-medium text-gray-400">Classify physical assets and shared resources (e.g. Laptops, Vehicles, Office Setup).</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer self-start"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Category Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-500/5 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-400">#{cat.id}</td>
                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{cat.name}</td>
                <td className="px-6 py-4 text-gray-500 max-w-md truncate">{cat.description}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm font-medium">No categories found.</div>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-6 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Printer"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea
                  required
                  placeholder="Summarize asset classification parameters"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer"
              >
                {isEditing ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
