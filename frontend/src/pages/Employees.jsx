import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, X, Pencil, ArrowUpCircle } from 'lucide-react';

const Employees = () => {
  const { user, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [role, setRole] = useState('EMPLOYEE');
  const [status, setStatus] = useState('ACTIVE');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data.data);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

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
      await Promise.all([fetchEmployees(), fetchDepartments()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleEdit = (emp) => {
    setSelectedEmp(emp);
    setRole(emp.role);
    setStatus(emp.status);
    setDepartmentId(emp.departmentId || '');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.put(`/users/${selectedEmp.id}`, {
        role,
        status,
        departmentId: departmentId ? parseInt(departmentId) : null,
      });
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee details');
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
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Employee Directory
        </h1>
        <p className="text-sm text-gray-500">View corporate departments, assign employees to branches, and manage roles.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:border-gray-850 dark:bg-gray-900/60">
                <th className="px-6 py-4">Employee Details</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Security Role</th>
                <th className="px-6 py-4">Status</th>
                {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-850">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/25">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">
                    {emp.department?.name || <span className="text-gray-300 dark:text-gray-650">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 uppercase dark:text-gray-300">
                      {emp.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      emp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-950/40'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Promote / Edit</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee details modal (Admin only) */}
      {showModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-150 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-gray-950">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-primary-500" />
                <h3 className="font-display text-lg font-bold">Promote Employee: {selectedEmp.name}</h3>
              </div>
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
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Assign Security Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="EMPLOYEE">Employee (Base access)</option>
                  <option value="DEPARTMENT_HEAD">Department Head (Approval access)</option>
                  <option value="ASSET_MANAGER">Asset Manager (CRUD access)</option>
                  <option value="ADMIN">System Admin (Full rights)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Company Department</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="">Unassigned / Remote</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive (Disables Login)</option>
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
                  Apply Role Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
