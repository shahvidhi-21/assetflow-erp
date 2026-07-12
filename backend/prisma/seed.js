const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding Indian database...');

  // 1. Clean database
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.assetAllocation.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('Database cleaned.');

  // 2. Create Departments (Indian Context)
  const engineering = await prisma.department.create({
    data: { name: 'Engineering (Bengaluru Hub)', description: 'Software and Hardware development team', status: 'ACTIVE' },
  });
  const sales = await prisma.department.create({
    data: { name: 'Sales & Marketing (Mumbai Office)', description: 'Global client outreach and advertisements', status: 'ACTIVE' },
  });
  const hr = await prisma.department.create({
    data: { name: 'Human Resources (Delhi NCR)', description: 'Talent acquisition and employee relations', status: 'ACTIVE' },
  });

  console.log('Departments created.');

  // 3. Create Categories
  const laptops = await prisma.category.create({
    data: { name: 'Laptops', description: 'Company workstation laptops' },
  });
  const meetingRooms = await prisma.category.create({
    data: { name: 'Meeting Rooms', description: 'Shared physical conference rooms' },
  });
  const vehicles = await prisma.category.create({
    data: { name: 'Vehicles', description: 'Company transport and pool cars' },
  });
  const printers = await prisma.category.create({
    data: { name: 'Printers & Copiers', description: 'Network office printers' },
  });

  console.log('Categories created.');

  // 4. Create Users (hashed passwords, Indian names)
  const salt = await bcrypt.genSalt(10);
  const passwordAdmin = await bcrypt.hash('admin123', salt);
  const passwordManager = await bcrypt.hash('manager123', salt);
  const passwordEmployee = await bcrypt.hash('employee123', salt);

  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@assetflow.com',
      password: passwordAdmin,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'manager@assetflow.com',
      password: passwordManager,
      role: 'ASSET_MANAGER',
      status: 'ACTIVE',
      departmentId: engineering.id,
    },
  });

  const employeeUser1 = await prisma.user.create({
    data: {
      name: 'Ananya Iyer',
      email: 'alice@assetflow.com',
      password: passwordEmployee,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      departmentId: engineering.id,
    },
  });

  const employeeUser2 = await prisma.user.create({
    data: {
      name: 'Amit Patel',
      email: 'bob@assetflow.com',
      password: passwordEmployee,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      departmentId: sales.id,
    },
  });

  console.log('Users created.');

  // 5. Create Assets (Indian Context, Cost in INR)
  const asset1 = await prisma.asset.create({
    data: {
      assetTag: 'AST-001',
      name: 'MacBook Pro 14" M3',
      categoryId: laptops.id,
      serialNumber: 'C02F1234Q05D',
      acquisitionDate: new Date('2025-01-10'),
      acquisitionCost: 199900.00, // INR
      condition: 'NEW',
      location: 'Bengaluru Hub - Desk 12',
      isShared: false,
      status: 'AVAILABLE',
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      assetTag: 'AST-002',
      name: 'Dell Latitude 5440',
      categoryId: laptops.id,
      serialNumber: 'DELL-987654321',
      acquisitionDate: new Date('2023-05-15'),
      acquisitionCost: 95000.00, // INR
      condition: 'POOR',
      location: 'Bengaluru Hub - Desk 14',
      isShared: false,
      status: 'ALLOCATED',
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      assetTag: 'AST-003',
      name: 'Boardroom Kohinoor (Floor 3)',
      categoryId: meetingRooms.id,
      serialNumber: 'ROOM-KOHINOOR-F3',
      acquisitionDate: new Date('2022-01-01'),
      acquisitionCost: 850000.00, // INR
      condition: 'GOOD',
      location: 'Mumbai Office - Floor 3',
      isShared: true,
      status: 'AVAILABLE',
    },
  });

  const asset4 = await prisma.asset.create({
    data: {
      assetTag: 'AST-004',
      name: 'Tata Nexon EV Pool Car',
      categoryId: vehicles.id,
      serialNumber: '9YJ3E1EBXLF123456',
      acquisitionDate: new Date('2024-06-20'),
      acquisitionCost: 1650000.00, // INR
      condition: 'GOOD',
      location: 'Mumbai Office - Garage Bay 4',
      isShared: true,
      status: 'AVAILABLE',
    },
  });

  const asset5 = await prisma.asset.create({
    data: {
      assetTag: 'AST-005',
      name: 'HP LaserJet Pro MFP',
      categoryId: printers.id,
      serialNumber: 'HP-LJPRO-99',
      acquisitionDate: new Date('2021-03-12'),
      acquisitionCost: 45000.00, // INR
      condition: 'FAIR',
      location: 'Delhi NCR - Copier Room',
      isShared: true,
      status: 'UNDER_MAINTENANCE',
    },
  });

  console.log('Assets registered.');

  // 6. Create Asset Allocation History (Amit Patel)
  const allocation = await prisma.assetAllocation.create({
    data: {
      assetId: asset2.id,
      employeeId: employeeUser2.id,
      allocatedDate: new Date('2026-06-01'),
      status: 'ACTIVE',
    },
  });

  console.log('Asset allocations seeded.');

  // 7. Create Resource Bookings (Ananya Iyer)
  const booking1 = await prisma.booking.create({
    data: {
      assetId: asset3.id,
      employeeId: employeeUser1.id,
      bookingDate: new Date(),
      startTime: new Date(new Date().setHours(14, 0, 0)),
      endTime: new Date(new Date().setHours(16, 0, 0)),
      status: 'UPCOMING',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      assetId: asset3.id,
      employeeId: employeeUser2.id,
      bookingDate: new Date(Date.now() - 86400000),
      startTime: new Date(Date.now() - 86400000),
      endTime: new Date(Date.now() - 86400000 + 7200000),
      status: 'COMPLETED',
    },
  });

  console.log('Bookings seeded.');

  // 8. Create Maintenance Request (Ananya Iyer)
  const maintenance = await prisma.maintenanceRequest.create({
    data: {
      assetId: asset5.id,
      employeeId: employeeUser1.id,
      description: 'Paper jams constantly and prints double images on legal sheets.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      technicianName: 'HP India Support Group',
    },
  });

  console.log('Maintenance tickets seeded.');

  // 9. Add Activity Logs
  await prisma.activityLog.create({
    data: { userId: adminUser.id, action: 'CREATE', module: 'DEPARTMENT', details: 'Seeded initial Indian departments' },
  });
  await prisma.activityLog.create({
    data: { userId: adminUser.id, action: 'CREATE', module: 'ASSETS', details: 'Seeded core inventory assets in INR' },
  });
  await prisma.activityLog.create({
    data: { userId: employeeUser2.id, action: 'ALLOCATE', module: 'ALLOCATION', details: 'Assigned AST-002 to Amit Patel' },
  });

  // 10. Add Notification
  await prisma.notification.create({
    data: { userId: employeeUser2.id, title: 'Asset Assigned', message: 'You have been allocated Dell Latitude 5440 (AST-002).' },
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
