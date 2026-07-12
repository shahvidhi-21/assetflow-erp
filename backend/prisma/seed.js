const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

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

  // 2. Create Departments
  const engineering = await prisma.department.create({
    data: { name: 'Engineering', description: 'Software and Hardware development team', status: 'ACTIVE' },
  });
  const sales = await prisma.department.create({
    data: { name: 'Sales & Marketing', description: 'Global client outreach and advertisements', status: 'ACTIVE' },
  });
  const hr = await prisma.department.create({
    data: { name: 'Human Resources', description: 'Talent acquisition and employee relations', status: 'ACTIVE' },
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

  // 4. Create Users (hashed passwords)
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
      name: 'John Asset Manager',
      email: 'manager@assetflow.com',
      password: passwordManager,
      role: 'ASSET_MANAGER',
      status: 'ACTIVE',
      departmentId: engineering.id,
    },
  });

  const employeeUser1 = await prisma.user.create({
    data: {
      name: 'Alice Cooper',
      email: 'alice@assetflow.com',
      password: passwordEmployee,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      departmentId: engineering.id,
    },
  });

  const employeeUser2 = await prisma.user.create({
    data: {
      name: 'Bob Marley',
      email: 'bob@assetflow.com',
      password: passwordEmployee,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      departmentId: sales.id,
    },
  });

  console.log('Users created.');

  // 5. Create Assets
  const asset1 = await prisma.asset.create({
    data: {
      assetTag: 'AST-001',
      name: 'MacBook Pro 16" M3 Max',
      categoryId: laptops.id,
      serialNumber: 'C02F1234Q05D',
      acquisitionDate: new Date('2025-01-10'),
      acquisitionCost: 3499.00,
      condition: 'NEW',
      location: 'HQ SF - Desk 12',
      isShared: false,
      status: 'AVAILABLE',
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      assetTag: 'AST-002',
      name: 'Dell XPS 15 9530',
      categoryId: laptops.id,
      serialNumber: 'DELL-987654321',
      acquisitionDate: new Date('2023-05-15'),
      acquisitionCost: 1999.00,
      condition: 'POOR',
      location: 'HQ SF - Desk 14',
      isShared: false,
      status: 'ALLOCATED',
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      assetTag: 'AST-003',
      name: 'Boardroom Delta (Level 3)',
      categoryId: meetingRooms.id,
      serialNumber: 'ROOM-DELTA-L3',
      acquisitionDate: new Date('2022-01-01'),
      acquisitionCost: 12000.00,
      condition: 'GOOD',
      location: 'HQ NY - Floor 3',
      isShared: true,
      status: 'AVAILABLE',
    },
  });

  const asset4 = await prisma.asset.create({
    data: {
      assetTag: 'AST-004',
      name: 'Tesla Model 3 Pool Car',
      categoryId: vehicles.id,
      serialNumber: '5YJ3E1EBXLF123456',
      acquisitionDate: new Date('2024-06-20'),
      acquisitionCost: 39990.00,
      condition: 'GOOD',
      location: 'SF Garage - Bay 4',
      isShared: true,
      status: 'AVAILABLE',
    },
  });

  const asset5 = await prisma.asset.create({
    data: {
      assetTag: 'AST-005',
      name: 'HP LaserJet Enterprise M507',
      categoryId: printers.id,
      serialNumber: 'HP-LJM507-99',
      acquisitionDate: new Date('2021-03-12'),
      acquisitionCost: 899.00,
      condition: 'FAIR',
      location: 'HQ SF - Copier Room',
      isShared: true,
      status: 'UNDER_MAINTENANCE',
    },
  });

  console.log('Assets registered.');

  // 6. Create Asset Allocation History
  // Allocating AST-002 Dell XPS to Bob Marley
  const allocation = await prisma.assetAllocation.create({
    data: {
      assetId: asset2.id,
      employeeId: employeeUser2.id,
      allocatedDate: new Date('2026-06-01'),
      status: 'ACTIVE',
    },
  });

  console.log('Asset allocations seeded.');

  // 7. Create Resource Bookings
  // Booking Boardroom Delta for Alice Cooper
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

  // Past booking
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

  // 8. Create Maintenance Request
  const maintenance = await prisma.maintenanceRequest.create({
    data: {
      assetId: asset5.id,
      employeeId: employeeUser1.id,
      description: 'Paper jams constantly and prints double images on legal sheets.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      technicianName: 'Xerox Support Group',
    },
  });

  console.log('Maintenance tickets seeded.');

  // 9. Add Activity Logs
  await prisma.activityLog.create({
    data: { userId: adminUser.id, action: 'CREATE', module: 'DEPARTMENT', details: 'Seeded initial departments' },
  });
  await prisma.activityLog.create({
    data: { userId: adminUser.id, action: 'CREATE', module: 'ASSETS', details: 'Seeded core inventory assets' },
  });
  await prisma.activityLog.create({
    data: { userId: employeeUser2.id, action: 'ALLOCATE', module: 'ALLOCATION', details: 'Assigned AST-002 to Bob Marley' },
  });

  // 10. Add Notification
  await prisma.notification.create({
    data: { userId: employeeUser2.id, title: 'Asset Assigned', message: 'You have been allocated Dell XPS 15 (AST-002).' },
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
