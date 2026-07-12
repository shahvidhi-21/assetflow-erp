const prisma = require('../../prisma');
const { sendSuccess, sendError } = require('../../utils/helpers');

async function getDashboardKPIs(req, res, next) {
  try {
    let totalAssets, availableAssets, allocatedAssets, maintenanceAssets, activeBookings, upcomingBookings, pendingTransfers;
    const activitiesFilter = {};

    if (req.user.role === 'DEPARTMENT_HEAD') {
      const deptId = req.user.departmentId;
      totalAssets = await prisma.asset.count({
        where: {
          OR: [
            { isShared: true },
            { allocations: { some: { employee: { departmentId: deptId }, status: 'ACTIVE' } } }
          ]
        }
      });
      availableAssets = await prisma.asset.count({ where: { status: 'AVAILABLE', isShared: true } });
      allocatedAssets = await prisma.assetAllocation.count({ where: { employee: { departmentId: deptId }, status: 'ACTIVE' } });
      maintenanceAssets = await prisma.maintenanceRequest.count({ where: { employee: { departmentId: deptId }, status: { in: ['PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'] } } });
      activeBookings = await prisma.booking.count({ where: { employee: { departmentId: deptId }, status: 'ONGOING' } });
      upcomingBookings = await prisma.booking.count({ where: { employee: { departmentId: deptId }, status: 'UPCOMING' } });
      pendingTransfers = await prisma.assetAllocation.count({ where: { employee: { departmentId: deptId }, status: 'PENDING_TRANSFER' } });
      activitiesFilter.user = { departmentId: deptId };
    } else {
      totalAssets = await prisma.asset.count();
      availableAssets = await prisma.asset.count({ where: { status: 'AVAILABLE' } });
      allocatedAssets = await prisma.asset.count({ where: { status: 'ALLOCATED' } });
      maintenanceAssets = await prisma.asset.count({ where: { status: 'UNDER_MAINTENANCE' } });
      activeBookings = await prisma.booking.count({ where: { status: 'ONGOING' } });
      upcomingBookings = await prisma.booking.count({ where: { status: 'UPCOMING' } });
      pendingTransfers = await prisma.assetAllocation.count({ where: { status: 'PENDING_TRANSFER' } });
    }

    // Recent activities (limit 5)
    const recentActivities = await prisma.activityLog.findMany({
      where: activitiesFilter,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Notifications (limit 5 for current user)
    const recentNotifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Dashboard KPIs retrieved', {
      kpis: {
        totalAssets,
        availableAssets,
        allocatedAssets,
        maintenanceAssets,
        activeBookings,
        upcomingBookings,
        pendingTransfers,
      },
      recentActivities,
      recentNotifications,
    });
  } catch (err) {
    next(err);
  }
}

async function getChartsData(req, res, next) {
  try {
    // 1. Status distribution
    const statusDistribution = await prisma.asset.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    // 2. Department-wise Allocations
    const departments = await prisma.department.findMany({
      include: {
        employees: {
          include: {
            _count: {
              select: { allocations: { where: { status: 'ACTIVE' } } },
            },
          },
        },
      },
    });

    const departmentAllocations = departments.map((dept) => {
      let activeAllocCount = 0;
      dept.employees.forEach((emp) => {
        activeAllocCount += emp._count.allocations;
      });
      return {
        name: dept.name,
        allocatedCount: activeAllocCount,
      };
    });

    // 3. Category distribution
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });
    const categoryDistribution = categories.map((cat) => ({
      name: cat.name,
      count: cat._count.assets,
    }));

    // 4. Maintenance frequency (top 5 assets)
    const maintenanceCounts = await prisma.maintenanceRequest.groupBy({
      by: ['assetId'],
      _count: { _all: true },
      orderBy: { _count: { assetId: 'desc' } },
      take: 5,
    });

    const maintenanceAssetsData = await prisma.asset.findMany({
      where: { id: { in: maintenanceCounts.map((c) => c.assetId) } },
      select: { id: true, name: true, assetTag: true },
    });

    const maintenanceChart = maintenanceCounts.map((count) => {
      const asset = maintenanceAssetsData.find((a) => a.id === count.assetId);
      return {
        name: asset ? `${asset.assetTag} (${asset.name.substring(0, 8)})` : `ID ${count.assetId}`,
        maintenanceCount: count._count._all,
      };
    });

    return sendSuccess(res, 'Charts data retrieved', {
      statusDistribution: statusDistribution.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      departmentAllocations,
      categoryDistribution,
      maintenanceChart,
    });
  } catch (err) {
    next(err);
  }
}

async function getAIInsights(req, res, next) {
  try {
    const assets = await prisma.asset.findMany({
      include: { category: true, allocations: true, maintenanceRequests: true },
    });

    // 1. Calculate Average Age & Conditions
    let poorConditionCount = 0;
    const now = new Date();
    const highRiskAssets = [];
    const nearingRetirement = [];

    assets.forEach((asset) => {
      // Age in years
      const ageInYears = (now - new Date(asset.acquisitionDate)) / (1000 * 60 * 60 * 24 * 365.25);
      
      if (asset.condition === 'POOR') {
        poorConditionCount++;
      }

      // Breakdown risk
      if (asset.condition === 'POOR' && ageInYears > 2.0) {
        highRiskAssets.push({
          id: asset.id,
          tag: asset.assetTag,
          name: asset.name,
          risk: 'HIGH',
          reason: 'POOR condition and over 2 years old',
        });
      } else if (asset.maintenanceRequests.length >= 3) {
        highRiskAssets.push({
          id: asset.id,
          tag: asset.assetTag,
          name: asset.name,
          risk: 'MEDIUM',
          reason: 'Frequent maintenance requests (3+ logs)',
        });
      }

      // Nearing retirement (age > 4 years or POOR condition & age > 3 years)
      if (ageInYears > 4.0 || (asset.condition === 'POOR' && ageInYears > 3.0)) {
        nearingRetirement.push({
          id: asset.id,
          tag: asset.assetTag,
          name: asset.name,
          ageYears: parseFloat(ageInYears.toFixed(1)),
          cost: asset.acquisitionCost,
        });
      }
    });

    // 2. Overdue Returns (Allocations active for > 30 days)
    const activeAllocations = await prisma.assetAllocation.findMany({
      where: { status: 'ACTIVE' },
      include: { asset: true, employee: { select: { name: true, email: true } } },
    });

    const overdueReturns = [];
    activeAllocations.forEach((alloc) => {
      const daysAllocated = (now - new Date(alloc.allocatedDate)) / (1000 * 60 * 60 * 24);
      if (daysAllocated > 30) {
        overdueReturns.push({
          id: alloc.id,
          tag: alloc.asset.assetTag,
          name: alloc.asset.name,
          employee: alloc.employee.name,
          daysElapsed: Math.floor(daysAllocated),
        });
      }
    });

    // 3. Bottleneck Departments
    const bookingUsage = await prisma.booking.groupBy({
      by: ['assetId'],
      _count: { _all: true },
    });
    bookingUsage.sort((a, b) => b._count._all - a._count._all);
    const mostBooked = [];
    if (bookingUsage.length > 0) {
      const topBookedAssets = await prisma.asset.findMany({
        where: { id: { in: bookingUsage.slice(0, 3).map((u) => u.assetId) } },
        select: { id: true, name: true, assetTag: true },
      });
      bookingUsage.slice(0, 3).forEach((u) => {
        const a = topBookedAssets.find((ast) => ast.id === u.assetId);
        if (a) {
          mostBooked.push({
            tag: a.assetTag,
            name: a.name,
            bookingsCount: u._count._all,
          });
        }
      });
    }

    // 4. Financial Depreciation estimate (Straight line 20% per year)
    let totalValue = 0;
    let depreciatedValue = 0;
    assets.forEach((asset) => {
      const ageInYears = (now - new Date(asset.acquisitionDate)) / (1000 * 60 * 60 * 24 * 365.25);
      const depreciationRate = 0.20; // 20% per year
      const deprAmt = asset.acquisitionCost * Math.min(1.0, ageInYears * depreciationRate);
      totalValue += asset.acquisitionCost;
      depreciatedValue += (asset.acquisitionCost - deprAmt);
    });

    return sendSuccess(res, 'AI Predictive Insights generated', {
      insights: {
        poorConditionCount,
        highRiskCount: highRiskAssets.length,
        nearingRetirementCount: nearingRetirement.length,
        overdueCount: overdueReturns.length,
        financials: {
          totalOriginalValue: parseFloat(totalValue.toFixed(2)),
          currentDepreciatedValue: parseFloat(depreciatedValue.toFixed(2)),
        },
      },
      highRiskAssets,
      nearingRetirement,
      overdueReturns,
      bookingCongestion: mostBooked,
    });
  } catch (err) {
    next(err);
  }
}

async function exportAssetsCSV(req, res, next) {
  try {
    const assets = await prisma.asset.findMany({
      include: { category: true },
    });

    let csv = 'Asset Tag,Asset Name,Category,Serial Number,Acquisition Cost,Condition,Location,Status\n';

    assets.forEach((a) => {
      const name = a.name.replace(/"/g, '""');
      const category = a.category.name.replace(/"/g, '""');
      const location = a.location.replace(/"/g, '""');
      csv += `${a.assetTag},"${name}","${category}","${a.serialNumber}",${a.acquisitionCost},${a.condition},"${location}",${a.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assets_report.csv');
    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

async function handleChatQuery(req, res, next) {
  try {
    const { message } = req.body;
    if (!message) {
      return sendError(res, 'Message is required', 400);
    }

    const query = message.toLowerCase().trim();
    let responseText = '';
    let contextData = {};

    // Helper: format money
    const formatMoney = (val) => `$${parseFloat(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 1. Portfolio Worth / Financials
    if (
      query.includes('worth') || 
      query.includes('value') || 
      query.includes('cost') || 
      query.includes('price') || 
      query.includes('financial') || 
      query.includes('depreciat')
    ) {
      const assets = await prisma.asset.findMany();
      let totalCost = 0;
      let depreciatedValue = 0;
      const now = new Date();
      assets.forEach((asset) => {
        const ageInYears = (now - new Date(asset.acquisitionDate)) / (1000 * 60 * 60 * 24 * 365.25);
        const deprAmt = asset.acquisitionCost * Math.min(1.0, ageInYears * 0.20);
        totalCost += asset.acquisitionCost;
        depreciatedValue += (asset.acquisitionCost - deprAmt);
      });
      
      responseText = `The total historical acquisition cost of our asset inventory is **${formatMoney(totalCost)}**. Accounting for a standard straight-line depreciation of 20% per year, the current net book value of all active resources is estimated at **${formatMoney(depreciatedValue)}**.`;
      contextData = {
        type: 'financial_summary',
        totalOriginalValue: totalCost,
        currentDepreciatedValue: depreciatedValue,
      };
    } 
    // 2. Specific Asset Custody Search (e.g., "who has AST-002" or "who is using Dell")
    else if (
      query.includes('who has') || 
      query.includes('custody') || 
      query.includes('using') || 
      query.includes('allocated to') ||
      query.includes('assigned to')
    ) {
      // Find asset tag or search by name
      const tagMatch = query.match(/ast-\d+/i);
      let asset = null;
      if (tagMatch) {
        const tag = tagMatch[0].toUpperCase();
        asset = await prisma.asset.findUnique({
          where: { assetTag: tag },
          include: { allocations: { where: { status: 'ACTIVE' }, include: { employee: true } } },
        });
      } else {
        // Try searching by name keyword
        const words = query.split(' ');
        const skipWords = ['who', 'has', 'custody', 'using', 'allocated', 'to', 'assigned', 'the', 'a', 'is'];
        const keyword = words.find(w => w.length > 2 && !skipWords.includes(w));
        if (keyword) {
          asset = await prisma.asset.findFirst({
            where: { name: { contains: keyword } },
            include: { allocations: { where: { status: 'ACTIVE' }, include: { employee: true } } },
          });
        }
      }

      if (asset) {
        const activeAlloc = asset.allocations[0];
        if (asset.status === 'ALLOCATED' && activeAlloc) {
          responseText = `The asset **${asset.name} (${asset.assetTag})** is currently allocated to **${activeAlloc.employee.name}** (${activeAlloc.employee.email}). It was assigned on ${new Date(activeAlloc.allocatedDate).toLocaleDateString()}.`;
          contextData = {
            type: 'allocation_detail',
            asset,
            assignedTo: activeAlloc.employee,
          };
        } else {
          responseText = `The asset **${asset.name} (${asset.assetTag})** is currently **${asset.status}** and is not assigned to any employee.`;
          contextData = { type: 'asset_detail', asset };
        }
      } else {
        responseText = `I searched our inventory records but couldn't identify the specific asset you are asking about. Please verify the asset tag (e.g., AST-001) or provide a key model name.`;
        contextData = { type: 'not_found' };
      }
    }
    // 3. High Risk / Failure Alerts
    else if (
      query.includes('risk') || 
      query.includes('fail') || 
      query.includes('breakdown') || 
      query.includes('warn') || 
      query.includes('maintenance') || 
      query.includes('broken')
    ) {
      const assets = await prisma.asset.findMany({
        include: { maintenanceRequests: true },
      });
      const highRisk = [];
      const now = new Date();
      assets.forEach((asset) => {
        const age = (now - new Date(asset.acquisitionDate)) / (1000 * 60 * 60 * 24 * 365.25);
        if (asset.condition === 'POOR' && age > 2.0) {
          highRisk.push(asset);
        } else if (asset.maintenanceRequests.length >= 3) {
          highRisk.push(asset);
        }
      });

      if (highRisk.length > 0) {
        const listText = highRisk.map(a => `• **${a.name} (${a.assetTag})** located at *${a.location}*`).join('\n');
        responseText = `Yes, our predictive analytics engine has flagged **${highRisk.length} asset(s)** at high breakdown risk due to age, conditions, or high failure logs:\n\n${listText}\n\nWe recommend raising maintenance checks or scheduling retirement replacements.`;
        contextData = { type: 'high_risk_list', count: highRisk.length, assets: highRisk };
      } else {
        responseText = `Excellent news! All active assets are within standard lifetime metrics and have low failure frequencies. No high-risk anomalies detected.`;
        contextData = { type: 'high_risk_list', count: 0, assets: [] };
      }
    }
    // 4. Overdue return search
    else if (query.includes('overdue') || query.includes('late') || query.includes('over-allocated')) {
      const activeAllocations = await prisma.assetAllocation.findMany({
        where: { status: 'ACTIVE' },
        include: { asset: true, employee: true },
      });
      const overdue = [];
      const now = new Date();
      activeAllocations.forEach((alloc) => {
        const days = (now - new Date(alloc.allocatedDate)) / (1000 * 60 * 60 * 24);
        if (days > 30) {
          overdue.push({ alloc, days: Math.floor(days) });
        }
      });

      if (overdue.length > 0) {
        const listText = overdue.map(o => `• **${o.alloc.asset.name} (${o.alloc.asset.assetTag})** held by **${o.alloc.employee.name}** for *${o.days} days*`).join('\n');
        responseText = `I found **${overdue.length} asset allocation(s)** that have exceeded the standard 30-day return window:\n\n${listText}\n\nConsider sending return audit notifications to the respective employee(s).`;
        contextData = { type: 'overdue_list', count: overdue.length, records: overdue };
      } else {
        responseText = `All employee asset assignments are within their 30-day review period. No overdue returns found.`;
        contextData = { type: 'overdue_list', count: 0, records: [] };
      }
    }
    // 5. Booking Statuses
    else if (query.includes('book') || query.includes('reserve') || query.includes('meeting') || query.includes('room') || query.includes('schedule')) {
      const activeBookings = await prisma.booking.findMany({
        where: { status: { in: ['UPCOMING', 'ONGOING'] } },
        include: { asset: true, employee: { select: { name: true } } },
        orderBy: { startTime: 'asc' },
        take: 5,
      });

      if (activeBookings.length > 0) {
        const listText = activeBookings.map(b => `• **${b.asset.name}** booked by **${b.employee.name}** on *${new Date(b.startTime).toLocaleDateString()}* from *${new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}* to *${new Date(b.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}*`).join('\n');
        responseText = `Here are the next upcoming shared resource bookings:\n\n${listText}`;
        contextData = { type: 'bookings_list', bookings: activeBookings };
      } else {
        responseText = `There are no active or upcoming shared resource bookings scheduled in the system.`;
        contextData = { type: 'bookings_list', bookings: [] };
      }
    }
    // 6. General fallback help
    else {
      responseText = `Hello! I am **AssetBot**, your AI ERP assistant. 🤖\n\nI can help you monitor inventory analytics. Try asking me:\n\n1. *"Who has laptop AST-002?"* (Custody lookup)\n2. *"What is our total portfolio worth?"* (Financial & depreciation metrics)\n3. *"Show assets at high breakdown risk"* (Predictive diagnostics)\n4. *"List overdue asset returns"* (Compliance checking)\n5. *"What are the upcoming boardroom bookings?"* (Resource scheduling)`;
      contextData = { type: 'help_intro' };
    }

    return sendSuccess(res, 'Chat response processed successfully', {
      response: responseText,
      context: contextData,
    });
  } catch (err) {
    next(err);
  }
}

async function handleDemoSimulation(req, res, next) {
  try {
    const { scenario } = req.body;
    if (!scenario) {
      return sendError(res, 'Scenario type is required', 400);
    }

    const now = new Date();

    if (scenario === 'OVERDUE') {
      let asset = await prisma.asset.findFirst({ where: { status: 'AVAILABLE', category: { name: 'Laptops' } } });
      if (!asset) {
        const cat = await prisma.category.findFirst({ where: { name: 'Laptops' } });
        asset = await prisma.asset.create({
          data: {
            assetTag: `AST-SIM-${Math.floor(100 + Math.random() * 900)}`,
            name: 'Simulated ThinkPad T14',
            categoryId: cat ? cat.id : 1,
            serialNumber: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
            acquisitionDate: new Date('2023-01-01'),
            acquisitionCost: 1450.0,
            condition: 'GOOD',
            location: 'HQ SF',
            status: 'AVAILABLE',
          },
        });
      }

      const employee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
      if (!employee) return sendError(res, 'No employee found to assign', 400);

      const overdueDate = new Date();
      overdueDate.setDate(now.getDate() - 45);

      const allocation = await prisma.assetAllocation.create({
        data: {
          assetId: asset.id,
          employeeId: employee.id,
          allocatedDate: overdueDate,
          status: 'ACTIVE',
        },
      });

      await prisma.asset.update({
        where: { id: asset.id },
        data: { status: 'ALLOCATED' },
      });

      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'SIMULATE',
          module: 'REPORTS',
          details: `Simulated overdue return for asset ${asset.assetTag} assigned to ${employee.name} (45 days ago)`,
        },
      });

      return sendSuccess(res, 'Overdue return scenario injected successfully', {
        asset,
        allocation,
      });
    }

    else if (scenario === 'MAINTENANCE_SPIKE') {
      let asset = await prisma.asset.findFirst({ where: { status: 'AVAILABLE' } });
      if (!asset) {
        const cat = await prisma.category.findFirst();
        asset = await prisma.asset.create({
          data: {
            assetTag: `AST-SIM-${Math.floor(100 + Math.random() * 900)}`,
            name: 'Simulated Heavy Duty Projector',
            categoryId: cat ? cat.id : 1,
            serialNumber: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
            acquisitionDate: new Date('2022-06-01'),
            acquisitionCost: 2200.0,
            condition: 'GOOD',
            location: 'HQ NY',
            status: 'AVAILABLE',
          },
        });
      }

      const employee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
      if (!employee) return sendError(res, 'No employee found', 400);

      for (let i = 0; i < 4; i++) {
        await prisma.maintenanceRequest.create({
          data: {
            assetId: asset.id,
            employeeId: employee.id,
            description: `Simulated breakdown event #${i + 1}`,
            priority: 'HIGH',
            status: 'COMPLETED',
            technicianName: 'Internal Repair Team',
            completedDate: new Date(),
          },
        });
      }

      const updatedAsset = await prisma.asset.update({
        where: { id: asset.id },
        data: { condition: 'POOR' },
      });

      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'SIMULATE',
          module: 'REPORTS',
          details: `Simulated high breakdown risk on ${asset.assetTag} (4 maintenance logs injected)`,
        },
      });

      return sendSuccess(res, 'Maintenance spike simulated successfully', {
        asset: updatedAsset,
      });
    }

    else if (scenario === 'RESET') {
      const exec = require('child_process').exec;
      exec('node prisma/seed.js', (err, stdout, stderr) => {
        if (err) {
          console.error('Failed to trigger reset simulation:', err);
        } else {
          console.log('Database reset seed triggered by simulation:', stdout);
        }
      });

      return sendSuccess(res, 'Database reset simulation triggered. Tables are being refreshed.', {});
    }

    return sendError(res, 'Invalid scenario type. Use OVERDUE, MAINTENANCE_SPIKE, or RESET.', 400);
  } catch (err) {
    next(err);
  }
}

async function getActivityLogs(req, res, next) {
  try {
    const { userId, module, action } = req.query;

    const filter = {};
    if (userId) filter.userId = parseInt(userId);
    if (module) filter.module = module;
    if (action) filter.action = action;

    const logs = await prisma.activityLog.findMany({
      where: filter,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Activity logs retrieved successfully', logs);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardKPIs,
  getChartsData,
  getAIInsights,
  exportAssetsCSV,
  handleChatQuery,
  handleDemoSimulation,
  getActivityLogs,
};
