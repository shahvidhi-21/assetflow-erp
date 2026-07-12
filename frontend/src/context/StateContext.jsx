import React, { createContext, useContext, useState, useEffect } from 'react';

const StateContext = createContext();

export function useAppState() {
  return useContext(StateContext);
}

export default function StateProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({
    name: 'Alice Smith',
    email: 'admin@assetflow.com',
    role: 'Admin',
    department: 'Operations',
  });

  const [theme, setTheme] = useState('light');

  // Initial Mock Database
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Engineering', description: 'Software Development & Infrastructure', status: 'Active' },
    { id: 2, name: 'Design', description: 'UI/UX & Product Design', status: 'Active' },
    { id: 3, name: 'Operations', description: 'Daily Logistics, HR, and Facilities', status: 'Active' },
    { id: 4, name: 'Marketing', description: 'Growth, Sales, and Communications', status: 'Active' },
  ]);

  const [categories, setCategories] = useState([
    { id: 1, name: 'Laptop', description: 'Employee developer & general workstations' },
    { id: 2, name: 'Furniture', description: 'Desks, ergonomic chairs, and conference setup' },
    { id: 3, name: 'Vehicle', description: 'Company transport assets' },
    { id: 4, name: 'Electronics', description: 'Projectors, display screens, and test devices' },
  ]);

  const [employees, setEmployees] = useState([
    { id: 101, name: 'John Doe', email: 'john@enterprise.com', department: 'Engineering', role: 'Employee', status: 'Active' },
    { id: 102, name: 'Alice Smith', email: 'admin@assetflow.com', department: 'Operations', role: 'Admin', status: 'Active' },
    { id: 103, name: 'Bob Johnson', email: 'bob@enterprise.com', department: 'Engineering', role: 'Asset Manager', status: 'Active' },
    { id: 104, name: 'Clara Vance', email: 'clara@enterprise.com', department: 'Design', role: 'Department Head', status: 'Active' },
    { id: 105, name: 'Ethan Hunt', email: 'ethan@enterprise.com', department: 'Operations', role: 'Employee', status: 'Inactive' },
  ]);

  const [assets, setAssets] = useState([
    {
      id: 1,
      tag: 'AST-001',
      name: 'MacBook Pro M3 Max',
      category: 'Laptop',
      serialNumber: 'MBP3M876543',
      acquisitionDate: '2025-10-15',
      acquisitionCost: 3499,
      condition: 'Excellent',
      location: 'Bangalore HQ - Floor 3',
      sharedResource: false,
      status: 'Allocated',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
      timeline: [
        { date: '2025-10-15', action: 'Registered', details: 'Added to inventory by Admin.' },
        { date: '2025-10-16', action: 'Allocated', details: 'Assigned to developer John Doe.' }
      ]
    },
    {
      id: 2,
      tag: 'AST-002',
      name: 'Dell XPS 15 9530',
      category: 'Laptop',
      serialNumber: 'DXPS9530112',
      acquisitionDate: '2025-11-20',
      acquisitionCost: 1999,
      condition: 'Good',
      location: 'Pune Office - Wing B',
      sharedResource: false,
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
      timeline: [
        { date: '2025-11-20', action: 'Registered', details: 'Added to inventory by Asset Manager.' }
      ]
    },
    {
      id: 3,
      tag: 'AST-003',
      name: 'Herman Miller Aeron Chair',
      category: 'Furniture',
      serialNumber: 'HMAERON8879',
      acquisitionDate: '2025-05-10',
      acquisitionCost: 1450,
      condition: 'Good',
      location: 'Bangalore HQ - Floor 3',
      sharedResource: false,
      status: 'Allocated',
      image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=400&q=80',
      timeline: [
        { date: '2025-05-10', action: 'Registered', details: 'Added to inventory.' },
        { date: '2025-05-12', action: 'Allocated', details: 'Assigned to Clara Vance.' }
      ]
    },
    {
      id: 4,
      tag: 'AST-004',
      name: 'Tesla Model Y',
      category: 'Vehicle',
      serialNumber: 'TESLAY2025SF',
      acquisitionDate: '2025-01-15',
      acquisitionCost: 47999,
      condition: 'Good',
      location: 'HQ Garage - Slot 12',
      sharedResource: true,
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=400&q=80',
      timeline: [
        { date: '2025-01-15', action: 'Registered', details: 'Added to shared resource pool.' }
      ]
    },
    {
      id: 5,
      tag: 'AST-005',
      name: 'Conference Room Alpha',
      category: 'Furniture',
      serialNumber: 'CONF-ALPHA-HQ',
      acquisitionDate: '2024-06-01',
      acquisitionCost: 12000,
      condition: 'Excellent',
      location: 'Bangalore HQ - Floor 1',
      sharedResource: true,
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
      timeline: [
        { date: '2024-06-01', action: 'Registered', details: 'Meeting room registered.' }
      ]
    },
    {
      id: 6,
      tag: 'AST-006',
      name: 'Epson 4K Laser Projector',
      category: 'Electronics',
      serialNumber: 'EPSON4K7789',
      acquisitionDate: '2025-07-02',
      acquisitionCost: 2200,
      condition: 'Fair',
      location: 'Conference Room Beta',
      sharedResource: true,
      status: 'Under Maintenance',
      image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=400&q=80',
      timeline: [
        { date: '2025-07-02', action: 'Registered', details: 'Added to projector inventory.' },
        { date: '2026-07-10', action: 'Maintenance', details: 'Bulb replacing request approved.' }
      ]
    }
  ]);

  const [allocations, setAllocations] = useState([
    { id: 1, assetId: 1, assetName: 'MacBook Pro M3 Max', assetTag: 'AST-001', employeeId: 101, employeeName: 'John Doe', allocatedDate: '2025-10-16', returnedDate: null, status: 'Active' },
    { id: 2, assetId: 3, assetName: 'Herman Miller Aeron Chair', assetTag: 'AST-003', employeeId: 104, employeeName: 'Clara Vance', allocatedDate: '2025-05-12', returnedDate: null, status: 'Active' }
  ]);

  const [bookings, setBookings] = useState([
    { id: 1, resourceId: 4, resourceName: 'Tesla Model Y', date: '2026-07-14', startTime: '09:00', endTime: '13:00', bookedBy: 'Clara Vance', status: 'Upcoming' },
    { id: 2, resourceId: 5, resourceName: 'Conference Room Alpha', date: '2026-07-12', startTime: '14:00', endTime: '15:30', bookedBy: 'John Doe', status: 'Completed' }
  ]);

  const [maintenanceRequests, setMaintenanceRequests] = useState([
    { id: 1, assetId: 6, assetName: 'Epson 4K Laser Projector', assetTag: 'AST-006', raisedBy: 'John Doe', issue: 'Lamp fading and flickering. Needs replacing.', status: 'Technician Assigned', dateRaised: '2026-07-09' }
  ]);

  const [activityLogs, setActivityLogs] = useState([
    { id: 1, user: 'Alice Smith', action: 'Asset Registered', date: '2026-07-12', time: '10:05 AM', module: 'Asset Management' },
    { id: 2, user: 'John Doe', action: 'Maintenance Request Raised', date: '2026-07-12', time: '09:45 AM', module: 'Maintenance' },
    { id: 3, user: 'Alice Smith', action: 'Role Assigned', date: '2026-07-12', time: '09:12 AM', module: 'Employee Directory' }
  ]);

  // Sync dark theme to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Log Activity Helper
  const logActivity = (action, module) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newLog = {
      id: Date.now(),
      user: currentUser ? currentUser.name : 'System',
      action,
      date: dateStr,
      time: timeStr,
      module,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Departments CRUD
  const addDepartment = (dept) => {
    setDepartments((prev) => [...prev, { id: Date.now(), ...dept }]);
    logActivity(`Created Department: ${dept.name}`, 'Department Management');
  };

  const updateDepartment = (id, updated) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    logActivity(`Updated Department: ${updated.name}`, 'Department Management');
  };

  const deleteDepartment = (id) => {
    const dept = departments.find((d) => d.id === id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    logActivity(`Deleted Department: ${dept?.name}`, 'Department Management');
  };

  // Categories CRUD
  const addCategory = (cat) => {
    setCategories((prev) => [...prev, { id: Date.now(), ...cat }]);
    logActivity(`Created Asset Category: ${cat.name}`, 'Asset Categories');
  };

  const updateCategory = (id, updated) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    logActivity(`Updated Category: ${updated.name}`, 'Asset Categories');
  };

  const deleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logActivity(`Deleted Category: ${cat?.name}`, 'Asset Categories');
  };

  // Employees Actions
  const updateEmployeeRole = (id, newRole) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, role: newRole } : e)));
    const emp = employees.find((e) => e.id === id);
    logActivity(`Promoted ${emp?.name} to ${newRole}`, 'Employee Directory');
  };

  const updateEmployeeStatus = (id, newStatus) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    const emp = employees.find((e) => e.id === id);
    logActivity(`Changed ${emp?.name} status to ${newStatus}`, 'Employee Directory');
  };

  // Assets CRUD
  const addAsset = (asset) => {
    const tagNum = String(assets.length + 1).padStart(3, '0');
    const newAsset = {
      id: Date.now(),
      tag: `AST-${tagNum}`,
      status: 'Available',
      timeline: [{ date: new Date().toISOString().split('T')[0], action: 'Registered', details: 'Registered into system.' }],
      ...asset,
    };
    setAssets((prev) => [...prev, newAsset]);
    logActivity(`Registered Asset: ${asset.name} (${newAsset.tag})`, 'Asset Management');
  };

  const updateAsset = (id, updated) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newTimeline = [...a.timeline, { date: new Date().toISOString().split('T')[0], action: 'Updated', details: 'Asset properties modified.' }];
          return { ...a, ...updated, timeline: newTimeline };
        }
        return a;
      })
    );
    logActivity(`Updated Asset details: ${updated.name}`, 'Asset Management');
  };

  const deleteAsset = (id) => {
    const asset = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    logActivity(`Retired/Removed Asset: ${asset?.name}`, 'Asset Management');
  };

  // Allocation Workflow
  const allocateAsset = (assetId, employeeId) => {
    const asset = assets.find((a) => a.id === assetId);
    const emp = employees.find((e) => e.id === employeeId);

    if (!asset || !emp) return;

    // Update Asset Status
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: 'Allocated',
              timeline: [...a.timeline, { date: new Date().toISOString().split('T')[0], action: 'Allocated', details: `Assigned to ${emp.name}` }],
            }
          : a
      )
    );

    // Create Allocation Record
    const newAllocation = {
      id: Date.now(),
      assetId,
      assetName: asset.name,
      assetTag: asset.tag,
      employeeId,
      employeeName: emp.name,
      allocatedDate: new Date().toISOString().split('T')[0],
      returnedDate: null,
      status: 'Active',
    };
    setAllocations((prev) => [...prev, newAllocation]);
    logActivity(`Allocated ${asset.name} to ${emp.name}`, 'Asset Allocation');
  };

  const returnAsset = (allocationId) => {
    const alloc = allocations.find((a) => a.id === allocationId);
    if (!alloc) return;

    // Update Allocation record
    setAllocations((prev) =>
      prev.map((a) => (a.id === allocationId ? { ...a, returnedDate: new Date().toISOString().split('T')[0], status: 'Returned' } : a))
    );

    // Update Asset status
    setAssets((prev) =>
      prev.map((a) =>
        a.id === alloc.assetId
          ? {
              ...a,
              status: 'Available',
              timeline: [...a.timeline, { date: new Date().toISOString().split('T')[0], action: 'Returned', details: `Returned by ${alloc.employeeName}` }],
            }
          : a
      )
    );

    logActivity(`Returned Asset: ${alloc.assetName} from ${alloc.employeeName}`, 'Asset Allocation');
  };

  const transferAsset = (allocationId, targetEmployeeId) => {
    const alloc = allocations.find((a) => a.id === allocationId);
    const targetEmp = employees.find((e) => e.id === targetEmployeeId);
    if (!alloc || !targetEmp) return;

    // Return current allocation
    setAllocations((prev) =>
      prev.map((a) => (a.id === allocationId ? { ...a, returnedDate: new Date().toISOString().split('T')[0], status: 'Transferred' } : a))
    );

    // Create new allocation record
    const newAllocation = {
      id: Date.now(),
      assetId: alloc.assetId,
      assetName: alloc.assetName,
      assetTag: alloc.assetTag,
      employeeId: targetEmployeeId,
      employeeName: targetEmp.name,
      allocatedDate: new Date().toISOString().split('T')[0],
      returnedDate: null,
      status: 'Active',
    };
    setAllocations((prev) => [...prev, newAllocation]);

    // Update Asset timeline
    setAssets((prev) =>
      prev.map((a) =>
        a.id === alloc.assetId
          ? {
              ...a,
              timeline: [...a.timeline, { date: new Date().toISOString().split('T')[0], action: 'Transferred', details: `Transferred from ${alloc.employeeName} to ${targetEmp.name}` }],
            }
          : a
      )
    );

    logActivity(`Transferred Asset: ${alloc.assetName} to ${targetEmp.name}`, 'Asset Allocation');
  };

  // Resource Booking
  const addBooking = (booking) => {
    const overlap = bookings.some(
      (b) =>
        b.resourceId === parseInt(booking.resourceId) &&
        b.date === booking.date &&
        b.status !== 'Cancelled' &&
        ((booking.startTime >= b.startTime && booking.startTime < b.endTime) ||
          (booking.endTime > b.startTime && booking.endTime <= b.endTime) ||
          (booking.startTime <= b.startTime && booking.endTime >= b.endTime))
    );

    if (overlap) {
      return { success: false, error: 'Scheduling conflict: This resource is already booked during this time.' };
    }

    const resource = assets.find((a) => a.id === parseInt(booking.resourceId));
    const newBooking = {
      id: Date.now(),
      resourceName: resource?.name || 'Shared Resource',
      bookedBy: currentUser?.name || 'Employee',
      status: 'Upcoming',
      ...booking,
      resourceId: parseInt(booking.resourceId),
    };

    setBookings((prev) => [...prev, newBooking]);
    logActivity(`Booked Resource: ${newBooking.resourceName} for ${booking.date}`, 'Resource Booking');
    return { success: true };
  };

  const cancelBooking = (id) => {
    const booking = bookings.find((b) => b.id === id);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)));
    logActivity(`Cancelled Booking: ${booking?.resourceName}`, 'Resource Booking');
  };

  // Maintenance Requests
  const raiseMaintenance = (assetId, issue) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const newRequest = {
      id: Date.now(),
      assetId,
      assetName: asset.name,
      assetTag: asset.tag,
      raisedBy: currentUser?.name || 'Employee',
      issue,
      status: 'Pending',
      dateRaised: new Date().toISOString().split('T')[0],
    };

    setMaintenanceRequests((prev) => [...prev, newRequest]);
    logActivity(`Raised Maintenance Request for ${asset.name}`, 'Maintenance');
  };

  const updateMaintenanceStatus = (id, newStatus) => {
    let req;
    setMaintenanceRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          req = r;
          return { ...r, status: newStatus };
        }
        return r;
      })
    );

    // Side Effect: update asset status
    if (req) {
      if (newStatus === 'Approved') {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === req.assetId
              ? {
                  ...a,
                  status: 'Under Maintenance',
                  timeline: [...a.timeline, { date: new Date().toISOString().split('T')[0], action: 'Maintenance', details: `Approved: ${req.issue}` }],
                }
              : a
          )
        );
      } else if (newStatus === 'Completed') {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === req.assetId
              ? {
                  ...a,
                  status: 'Available',
                  timeline: [...a.timeline, { date: new Date().toISOString().split('T')[0], action: 'Maintenance Completed', details: 'Technician completed repairs.' }],
                }
              : a
          )
        );
      }
    }

    logActivity(`Maintenance Request #${id} updated to ${newStatus}`, 'Maintenance');
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
      }}
    >
      {children}
    </StateContext.Provider>
  );
}
