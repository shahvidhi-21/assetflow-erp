const prisma = require('../../prisma');
const { sendSuccess, sendError } = require('../../utils/helpers');

async function getDashboardKPIs(req, res, next) {
  try {
    const totalAssets = await prisma.asset.count();
    const availableAssets = await prisma.asset.count({ where: { status: 'AVAILABLE' } });
    const allocatedAssets = await prisma.asset.count({ where: { status: 'ALLOCATED' } });
    const maintenanceAssets = await prisma.asset.count({ where: { status: 'UNDER_MAINTENANCE' } });

    const activeBookings = await prisma.booking.count({ where: { status: 'ONGOING' } });
    const upcomingBookings = await prisma.booking.count({ where: { status: 'UPCOMING' } });
    const pendingTransfers = await prisma.assetAllocation.count({ where: { status: 'PENDING_TRANSFER' } });

    // Recent activities (limit 5)
    const recentActivities = await prisma.activityLog.findMany({
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

module.exports = {
  getDashboardKPIs,
  getChartsData,
  getAIInsights,
  exportAssetsCSV,
};
