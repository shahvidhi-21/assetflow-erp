import React from 'react';
import { useAppState } from '../context/StateContext';
import { Shield, Mail, Building2, ToggleLeft, ShieldAlert, Award } from 'lucide-react';

export default function Profile() {
  const { currentUser } = useAppState();

  const getRolePermissions = () => {
    switch (currentUser.role) {
      case 'Admin':
        return [
          'Full read & write access across all modules.',
          'Manage departments, asset categories, and company settings.',
          'Create employee accounts, promote roles, and activate directories.',
          'View and export full analytical reports.'
        ];
      case 'Asset Manager':
        return [
          'Register and modify physical inventory assets.',
          'Assign assets to employees and handle return workflows.',
          'Initiate, approve, and complete maintenance schedules.',
          'View inventory allocations and export reports.'
        ];
      case 'Department Head':
        return [
          'View asset allocations belonging to department staff.',
          'Approve transfers requested within the department.',
          'Schedule shared resources (meeting rooms, cars, projectors).'
        ];
      case 'Employee':
        default:
        return [
          'View all physical assets currently allocated to you.',
          'Book shared company resources for scheduling slots.',
          'Raise maintenance requests for damaged or faulty equipment.',
          'Request asset transfers or returns to the pool.'
        ];
    }
  };

  const permissions = getRolePermissions();

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200 text-left max-w-3xl">
      
      <div>
        <h1 className="text-2xl font-black tracking-tight">Profile Settings</h1>
        <p className="text-sm font-medium text-gray-400">View user configuration, system permissions, and role details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* User Card */}
        <div className="md:col-span-5 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center text-3xl font-black uppercase shadow-md shadow-blue-500/5">
            {currentUser?.name?.substring(0, 2)}
          </div>
          
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">{currentUser?.name}</h3>
            <span className="text-xs font-semibold text-gray-400">{currentUser?.email}</span>
          </div>

          <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase rounded-lg border border-blue-500/10 shadow-sm mt-1">
            {currentUser?.role}
          </span>
        </div>

        {/* Roles details */}
        <div className="md:col-span-7 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="text-base font-extrabold tracking-tight">Employee Details</h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 text-gray-500">
                <Building2 size={15} className="text-gray-400" />
                <span>Department:</span>
                <strong className="text-gray-800 dark:text-gray-200">{currentUser?.department}</strong>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <ToggleLeft size={15} className="text-gray-400" />
                <span>Status:</span>
                <strong className="text-emerald-500 dark:text-emerald-400">Active</strong>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Shield size={16} />
              <h4 className="text-sm font-extrabold uppercase tracking-wider">System Permissions</h4>
            </div>

            <ul className="flex flex-col gap-2.5">
              {permissions.map((p, i) => (
                <li key={i} className="flex gap-2.5 items-start text-xs font-semibold text-gray-500">
                  <ShieldAlert className="text-blue-500 shrink-0 mt-0.5" size={14} />
                  <span className="leading-normal">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
