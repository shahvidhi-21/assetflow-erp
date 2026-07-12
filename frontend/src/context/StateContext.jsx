import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const StateContext = createContext();

export function useAppState() {
  return useContext(StateContext);
}

// Translate UPPERCASE database roles/statuses to UI Title Case
const roleMap = {
  'ADMIN': 'Admin',
  'ASSET_MANAGER': 'Asset Manager',
  'DEPARTMENT_HEAD': 'Department Head',
  'EMPLOYEE': 'Employee',
};

const reverseRoleMap = {
  'Admin': 'ADMIN',
  'Asset Manager': 'ASSET_MANAGER',
  'Department Head': 'DEPARTMENT_HEAD',
  'Employee': 'EMPLOYEE',
};

const assetStatusMap = {
  'AVAILABLE': 'Available',
  'ALLOCATED': 'Allocated',
  'RESERVED': 'Reserved',
  'UNDER_MAINTENANCE': 'Under Maintenance',
  'LOST': 'Lost',
  'RETIRED': 'Retired',
  'DISPOSED': 'Disposed',
};

const maintenanceStatusMap = {
  'PENDING': 'Pending',
  'APPROVED': 'Approved',
  'TECHNICIAN_ASSIGNED': 'Technician Assigned',
  'IN_PROGRESS': 'In Progress',
  'COMPLETED': 'Completed',
};

const bookingStatusMap = {
  'UPCOMING': 'Upcoming',
  'ONGOING': 'Ongoing',
  'COMPLETED': 'Completed',
  'CANCELLED': 'Cancelled',
};

export default function StateProvider({ children }) {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState('light');

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Dynamic Timeline builder
  const buildTimeline = (asset, allAllocations, allMaintenanceRequests) => {
    const timeline = [];
    
    timeline.push({
      date: asset.createdAt ? asset.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      action: 'Registered',
      details: 'Registered into system inventory.',
      timestamp: asset.createdAt ? new Date(asset.createdAt).getTime() : Date.now()
    });

    const assetAllocations = allAllocations.filter(a => a.assetId === asset.id);
    assetAllocations.forEach(alloc => {
      if (alloc.allocatedDate) {
        timeline.push({
          date: alloc.allocatedDate.split('T')[0],
          action: 'Allocated',
          details: `Allocated to ${alloc.employeeName || alloc.employee?.name || 'employee'}.`,
          timestamp: new Date(alloc.allocatedDate).getTime()
        });
      }
      if (alloc.returnedDate) {
        timeline.push({
          date: alloc.returnedDate.split('T')[0],
          action: 'Returned',
          details: `Returned from ${alloc.employeeName || alloc.employee?.name || 'employee'}.`,
          timestamp: new Date(alloc.returnedDate).getTime()
        });
      }
    });

    const assetMaintenance = allMaintenanceRequests.filter(m => m.assetId === asset.id);
    assetMaintenance.forEach(req => {
      if (req.dateRaised) {
        timeline.push({
          date: req.dateRaised,
          action: 'Maintenance Request',
          details: `Defect reported: "${req.issue}"`,
          timestamp: new Date(req.dateRaised).getTime()
        });
      }
      if (req.status === 'Completed') {
        timeline.push({
          date: req.dateRaised,
          action: 'Maintenance Completed',
          details: `Repair completed.`,
          timestamp: new Date(req.dateRaised).getTime() + 1000
        });
      }
    });

    timeline.sort((a, b) => a.timestamp - b.timestamp);
    return timeline;
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [deptsRes, catsRes, usersRes, assetsRes, allocsRes, bookingsRes, mainRes, kpisRes] = await Promise.all([
        api.get('/departments'),
        api.get('/categories'),
        api.get('/users'),
        api.get('/assets'),
        api.get('/allocations'),
        api.get('/bookings'),
        api.get('/maintenance'),
        api.get('/reports/kpis')
      ]);

      // 1. Departments mapping
      const mappedDepts = deptsRes.data.data.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        status: d.status === 'ACTIVE' ? 'Active' : 'Inactive',
      }));
      setDepartments(mappedDepts);

      // 2. Categories mapping
      setCategories(catsRes.data.data);

      // 3. Employees mapping
      const mappedEmployees = usersRes.data.data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department?.name || 'Unassigned',
        role: roleMap[u.role] || u.role,
        status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
      }));
      setEmployees(mappedEmployees);

      // 4. Allocations mapping
      const mappedAllocs = allocsRes.data.data.map(a => ({
        id: a.id,
        assetId: a.assetId,
        assetName: a.asset?.name || 'General Asset',
        assetTag: a.asset?.assetTag || 'AST-000',
        employeeId: a.employeeId,
        employeeName: a.employee?.name || 'Employee',
        allocatedDate: a.allocatedDate ? a.allocatedDate.split('T')[0] : '',
        returnedDate: a.returnDate ? a.returnDate.split('T')[0] : null,
        status: a.status === 'ACTIVE' ? 'Active' : (a.status === 'TRANSFERRED' ? 'Transferred' : 'Returned'),
      }));
      setAllocations(mappedAllocs);

      // 5. Maintenance mapping
      const mappedMaintenance = mainRes.data.data.map(m => ({
        id: m.id,
        assetId: m.assetId,
        assetName: m.asset?.name || 'Asset',
        assetTag: m.asset?.assetTag || 'AST-000',
        raisedBy: m.employee?.name || 'Employee',
        issue: m.description,
        status: maintenanceStatusMap[m.status] || m.status,
        dateRaised: m.createdAt ? m.createdAt.split('T')[0] : '',
      }));
      setMaintenanceRequests(mappedMaintenance);

      // 6. Assets mapping
      const mappedAssets = assetsRes.data.data.map(a => ({
        id: a.id,
        tag: a.assetTag,
        name: a.name,
        category: a.category?.name || 'Laptop',
        serialNumber: a.serialNumber,
        acquisitionDate: a.acquisitionDate ? a.acquisitionDate.split('T')[0] : '',
        acquisitionCost: a.acquisitionCost,
        condition: a.condition.charAt(0).toUpperCase() + a.condition.slice(1).toLowerCase(),
        location: a.location,
        sharedResource: a.isShared,
        status: assetStatusMap[a.status] || a.status,
        image: a.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
        timeline: buildTimeline(a, mappedAllocs, mappedMaintenance)
      }));
      setAssets(mappedAssets);

      // 7. Bookings mapping
      const mappedBookings = bookingsRes.data.data.map(b => {
        const start = new Date(b.startTime);
        const end = new Date(b.endTime);
        const formatTime = (date) => {
          try {
            return date.toISOString().split('T')[1].substring(0, 5);
          } catch(e) {
            return '';
          }
        };
        return {
          id: b.id,
          resourceId: b.assetId,
          resourceName: b.asset?.name || 'Shared Resource',
          date: b.startTime ? b.startTime.split('T')[0] : '',
          startTime: formatTime(start),
          endTime: formatTime(end),
          bookedBy: b.employee?.name || 'Employee',
          status: bookingStatusMap[b.status] || b.status,
        };
      });
      setBookings(mappedBookings);

      // 8. Activity logs mapping
      if (kpisRes.data.data.recentActivities) {
        const mappedLogs = kpisRes.data.data.recentActivities.map(l => {
          const created = new Date(l.createdAt);
          return {
            id: l.id,
            user: l.user?.name || 'System',
            action: l.action.replace(/_/g, ' '),
            date: l.createdAt.split('T')[0],
            time: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            module: l.module,
          };
        });
        setActivityLogs(mappedLogs);
      }

    } catch (err) {
      console.error('Error fetching backend data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync auth user to current ERP user role translated
  useEffect(() => {
    if (user) {
      setCurrentUser({
        ...user,
        role: roleMap[user.role] || user.role,
      });
      fetchData();
    } else {
      setCurrentUser(null);
      setDepartments([]);
      setCategories([]);
      setEmployees([]);
      setAssets([]);
      setAllocations([]);
      setBookings([]);
      setMaintenanceRequests([]);
      setActivityLogs([]);
    }
  }, [user]);

  // Log Activity Helper
  const logActivity = (action, module) => {
    // Backend creates log automatically for CRUD actions
  };

  // Departments CRUD
  const addDepartment = async (dept) => {
    try {
      await api.post('/departments', dept);
      await fetchData();
    } catch (err) {
      console.error('Failed to add department:', err);
    }
  };

  const updateDepartment = async (id, updated) => {
    try {
      await api.put(`/departments/${id}`, updated);
      await fetchData();
    } catch (err) {
      console.error('Failed to update department:', err);
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  // Categories CRUD
  const addCategory = async (cat) => {
    try {
      await api.post('/categories', cat);
      await fetchData();
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  const updateCategory = async (id, updated) => {
    try {
      await api.put(`/categories/${id}`, updated);
      await fetchData();
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  // Employees Actions
  const updateEmployeeRole = async (id, newRole) => {
    try {
      const mappedRole = reverseRoleMap[newRole] || newRole;
      await api.put(`/users/${id}`, { role: mappedRole });
      await fetchData();
    } catch (err) {
      console.error('Failed to update employee role:', err);
    }
  };

  const updateEmployeeStatus = async (id, newStatus) => {
    try {
      const mappedStatus = newStatus === 'Active' ? 'ACTIVE' : 'INACTIVE';
      await api.put(`/users/${id}`, { status: mappedStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to update employee status:', err);
    }
  };

  // Assets CRUD
  const addAsset = async (asset) => {
    try {
      const categoryObj = categories.find(c => c.name === asset.category);
      const categoryId = categoryObj ? categoryObj.id : 1;

      await api.post('/assets', {
        name: asset.name,
        categoryId,
        serialNumber: asset.serialNumber,
        acquisitionDate: new Date(asset.acquisitionDate).toISOString(),
        acquisitionCost: parseFloat(asset.acquisitionCost),
        condition: asset.condition.toUpperCase(),
        location: asset.location,
        isShared: asset.sharedResource,
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to add asset:', err);
    }
  };

  const updateAsset = async (id, updated) => {
    try {
      const payload = { ...updated };
      if (updated.category) {
        const categoryObj = categories.find(c => c.name === updated.category);
        if (categoryObj) payload.categoryId = categoryObj.id;
        delete payload.category;
      }
      if (updated.condition) payload.condition = updated.condition.toUpperCase();
      if (updated.sharedResource !== undefined) {
        payload.isShared = updated.sharedResource;
        delete payload.sharedResource;
      }
      await api.put(`/assets/${id}`, payload);
      await fetchData();
    } catch (err) {
      console.error('Failed to update asset:', err);
    }
  };

  const deleteAsset = async (id) => {
    try {
      await api.delete(`/assets/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  // Allocation Workflow
  const allocateAsset = async (assetId, employeeId) => {
    try {
      await api.post('/allocations', { assetId, employeeId });
      await fetchData();
    } catch (err) {
      console.error('Failed to allocate asset:', err);
    }
  };

  const returnAsset = async (allocationId) => {
    try {
      await api.post(`/allocations/${allocationId}/return`);
      await fetchData();
    } catch (err) {
      console.error('Failed to return asset:', err);
    }
  };

  const transferAsset = async (allocationId, targetEmployeeId) => {
    try {
      await api.post(`/allocations/${allocationId}/transfer`, { targetEmployeeId });
      await api.post(`/allocations/${allocationId}/approve-transfer`);
      await fetchData();
    } catch (err) {
      console.error('Failed to transfer asset:', err);
    }
  };

  // Resource Booking
  const addBooking = async (booking) => {
    try {
      const startISO = new Date(`${booking.date}T${booking.startTime}:00`).toISOString();
      const endISO = new Date(`${booking.date}T${booking.endTime}:00`).toISOString();
      
      await api.post('/bookings', {
        assetId: parseInt(booking.resourceId),
        startTime: startISO,
        endTime: endISO
      });
      await fetchData();
      return { success: true };
    } catch (err) {
      console.error('Failed to add booking:', err);
      const errorMsg = err.response?.data?.message || 'Failed to book resource';
      return { success: false, error: errorMsg };
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/cancel`);
      await fetchData();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  // Maintenance Requests
  const raiseMaintenance = async (assetId, issue) => {
    try {
      await api.post('/maintenance', { assetId, description: issue, priority: 'MEDIUM' });
      await fetchData();
    } catch (err) {
      console.error('Failed to raise maintenance request:', err);
    }
  };

  const updateMaintenanceStatus = async (id, newStatus) => {
    try {
      const mappedStatus = newStatus.toUpperCase().replace(/\s+/g, '_');
      await api.put(`/maintenance/${id}/status`, { status: mappedStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to update maintenance status:', err);
    }
  };

  return (
    <StateContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        theme,
        setTheme,
        departments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        employees,
        updateEmployeeRole,
        updateEmployeeStatus,
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        allocations,
        allocateAsset,
        returnAsset,
        transferAsset,
        bookings,
        addBooking,
        cancelBooking,
        maintenanceRequests,
        raiseMaintenance,
        updateMaintenanceStatus,
        activityLogs,
        logActivity,
        loading,
        refreshData: fetchData,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}
