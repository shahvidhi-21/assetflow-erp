import React from 'react';
import { useAppState } from '../context/StateContext';
import { Award, UserMinus, Shield } from 'lucide-react';

export default function Employees() {
  const { employees, updateEmployeeRole, updateEmployeeStatus } = useAppState();

  const handleRoleChange = (id, currentRole) => {
    const roles = ['Employee', 'Department Head', 'Asset Manager', 'Admin'];
    const currentIndex = roles.indexOf(currentRole);
    const nextIndex = (currentIndex + 1) % roles.length;
    updateEmployeeRole(id, roles[nextIndex]);
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateEmployeeStatus(id, newStatus);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      
      <div className="text-left">
        <h1 className="text-2xl font-black tracking-tight">Employee Directory</h1>
        <p className="text-sm font-medium text-gray-400">Manage user authorization roles and active status profiles inside AssetFlow ERP.</p>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">System Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-500/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase flex items-center justify-center shrink-0 border border-blue-500/15">
                      {emp.name.substring(0, 2)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-gray-900 dark:text-white">{emp.name}</span>
                      <span className="text-[10px] text-gray-400 leading-none mt-0.5">{emp.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-500">{emp.department}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-750">
                    <Shield size={12} className="text-blue-500" />
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      emp.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => handleRoleChange(emp.id, emp.role)}
                      title="Cycle System Role"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/25 transition-colors cursor-pointer text-[10px] font-black uppercase"
                    >
                      <Award size={13} />
                      <span>Change Role</span>
                    </button>
                    <button
                      onClick={() => toggleStatus(emp.id, emp.status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer border ${
                        emp.status === 'Active'
                          ? 'bg-rose-500/10 border-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      <UserMinus size={13} />
                      <span>{emp.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
