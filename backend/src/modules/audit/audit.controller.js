const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity } = require('../../utils/helpers');

async function createAuditCycle(req, res, next) {
  try {
    const { name, auditorId } = req.body;

    if (!name || !auditorId) {
      return sendError(res, 'Audit cycle name and auditor ID are required', 400);
    }

    const parsedAuditorId = parseInt(auditorId);

    // Verify auditor exists
    const auditor = await prisma.user.findUnique({ where: { id: parsedAuditorId } });
    if (!auditor) {
      return sendError(res, 'Assigned auditor not found', 404);
    }

    // Create Audit Cycle
    const cycle = await prisma.$transaction(async (tx) => {
      const activeCycle = await tx.auditCycle.create({
        data: {
          name,
          auditorId: parsedAuditorId,
          status: 'ACTIVE',
        },
      });

      // Automatically fetch all active assets to include in this audit cycle
      const assets = await tx.asset.findMany({
        where: { NOT: { status: 'DISPOSED' } },
      });

      // Create pending reports for each asset
      const reportsData = assets.map((asset) => ({
        auditCycleId: activeCycle.id,
        assetId: asset.id,
        status: 'PENDING',
      }));

      if (reportsData.length > 0) {
        await tx.auditReport.createMany({
          data: reportsData,
        });
      }

      return activeCycle;
    });

    await logActivity(
      req.user.id,
      'CREATE_AUDIT_CYCLE',
      'AUDIT',
      `Created audit cycle "${name}" assigned to auditor ${auditor.name}`
    );

    return sendSuccess(res, 'Audit cycle created successfully', cycle, 201);
  } catch (err) {
    next(err);
  }
}

async function getAllAuditCycles(req, res, next) {
  try {
    const cycles = await prisma.auditCycle.findMany({
      include: {
        auditor: { select: { id: true, name: true, email: true } },
        _count: { select: { reports: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    return sendSuccess(res, 'Audit cycles retrieved successfully', cycles);
  } catch (err) {
    next(err);
  }
}

async function getAuditCycleById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        auditor: { select: { id: true, name: true, email: true } },
        reports: {
          include: {
            asset: { select: { id: true, name: true, assetTag: true, location: true, status: true } },
          },
        },
      },
    });

    if (!cycle) {
      return sendError(res, 'Audit cycle not found', 404);
    }

    return sendSuccess(res, 'Audit cycle retrieved successfully', cycle);
  } catch (err) {
    next(err);
  }
}

async function verifyAuditReport(req, res, next) {
  try {
    const reportId = parseInt(req.params.reportId);
    const { status, notes } = req.body; // VERIFIED, MISSING, DAMAGED

    if (!status) {
      return sendError(res, 'Status is required to verify report', 400);
    }

    if (!['VERIFIED', 'MISSING', 'DAMAGED'].includes(status)) {
      return sendError(res, 'Invalid status. Use VERIFIED, MISSING, or DAMAGED', 400);
    }

    const report = await prisma.auditReport.findUnique({
      where: { id: reportId },
      include: { auditCycle: true, asset: true },
    });

    if (!report) {
      return sendError(res, 'Audit report not found', 404);
    }

    if (report.auditCycle.status !== 'ACTIVE') {
      return sendError(res, 'Cannot verify reports on a closed audit cycle', 400);
    }

    // Enforce auditor verification permissions
    if (req.user.role === 'EMPLOYEE' && report.auditCycle.auditorId !== req.user.id) {
      return sendError(res, 'Access denied: you are not the assigned auditor for this cycle', 403);
    }

    const updatedReport = await prisma.$transaction(async (tx) => {
      // 1. Update report status
      const rep = await tx.auditReport.update({
        where: { id: reportId },
        data: {
          status,
          notes,
          verifiedAt: new Date(),
        },
      });

      // 2. If missing, update asset status to LOST
      if (status === 'MISSING') {
        await tx.asset.update({
          where: { id: report.assetId },
          data: { status: 'LOST' },
        });
      }

      return rep;
    });

    await logActivity(
      req.user.id,
      'VERIFY_AUDIT_REPORT',
      'AUDIT',
      `Verified asset ${report.asset.assetTag} in cycle ID ${report.auditCycleId} as ${status}`
    );

    return sendSuccess(res, 'Audit report verified successfully', updatedReport);
  } catch (err) {
    next(err);
  }
}

async function closeAuditCycle(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const cycle = await prisma.auditCycle.findUnique({ where: { id } });
    if (!cycle) {
      return sendError(res, 'Audit cycle not found', 404);
    }

    if (cycle.status !== 'ACTIVE') {
      return sendError(res, 'Audit cycle is already completed/closed', 400);
    }

    const updated = await prisma.auditCycle.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
      },
    });

    await logActivity(
      req.user.id,
      'CLOSE_AUDIT_CYCLE',
      'AUDIT',
      `Closed audit cycle "${cycle.name}" (ID ${id})`
    );

    return sendSuccess(res, 'Audit cycle closed successfully', updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAuditCycle,
  getAllAuditCycles,
  getAuditCycleById,
  verifyAuditReport,
  closeAuditCycle,
};
