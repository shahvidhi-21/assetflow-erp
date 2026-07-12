const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity, createNotification } = require('../../utils/helpers');

async function getAllRequests(req, res, next) {
  try {
    const { assetId, employeeId, status } = req.query;

    const filter = {};
    if (assetId) filter.assetId = parseInt(assetId);
    if (employeeId) filter.employeeId = parseInt(employeeId);
    if (status) filter.status = status;

    const requests = await prisma.maintenanceRequest.findMany({
      where: filter,
      include: {
        asset: { include: { category: true } },
        employee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Maintenance requests retrieved', requests);
  } catch (err) {
    next(err);
  }
}

async function getRequestById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: { include: { category: true } },
        employee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!request) {
      return sendError(res, 'Maintenance request not found', 404);
    }

    return sendSuccess(res, 'Maintenance request details retrieved', request);
  } catch (err) {
    next(err);
  }
}

async function createRequest(req, res, next) {
  try {
    const { assetId, description, priority } = req.body;
    const employeeId = req.user.id;

    if (!assetId || !description) {
      return sendError(res, 'Asset ID and Description are required', 400);
    }

    const parsedAssetId = parseInt(assetId);

    // Check if asset exists
    const asset = await prisma.asset.findUnique({ where: { id: parsedAssetId } });
    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId: parsedAssetId,
        employeeId,
        description,
        priority: priority || 'MEDIUM',
        status: 'PENDING',
      },
      include: {
        asset: true,
      },
    });

    await logActivity(
      employeeId,
      'CREATE_MAINTENANCE_REQUEST',
      'MAINTENANCE',
      `Raised maintenance request for ${request.asset.name} (${request.asset.assetTag})`
    );

    // Notify Asset Managers
    const assetManagers = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'ASSET_MANAGER'] } },
    });
    for (const manager of assetManagers) {
      await createNotification(
        manager.id,
        'New Maintenance Request',
        `Maintenance request raised by ${req.user.name} for asset "${request.asset.name}" (${request.asset.assetTag}).`
      );
    }

    return sendSuccess(res, 'Maintenance request submitted successfully', request, 201);
  } catch (err) {
    next(err);
  }
}

async function updateRequestStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { status, technicianName } = req.body;

    if (!status) {
      return sendError(res, 'Status is required', 400);
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true, employee: true },
    });

    if (!request) {
      return sendError(res, 'Maintenance request not found', 404);
    }

    const currentStatus = request.status;
    const nextStatus = status;

    // Validate transition
    // PENDING -> APPROVED
    // APPROVED -> TECHNICIAN_ASSIGNED
    // TECHNICIAN_ASSIGNED -> IN_PROGRESS
    // IN_PROGRESS -> COMPLETED
    const validTransitions = {
      PENDING: ['APPROVED'],
      APPROVED: ['TECHNICIAN_ASSIGNED'],
      TECHNICIAN_ASSIGNED: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED'],
    };

    if (currentStatus !== nextStatus && (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(nextStatus))) {
      return sendError(res, `Invalid status transition from ${currentStatus} to ${nextStatus}`, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updateData = { status: nextStatus };
      if (technicianName) updateData.technicianName = technicianName;
      if (nextStatus === 'COMPLETED') updateData.completedDate = new Date();

      // Update maintenance record
      const updatedReq = await tx.maintenanceRequest.update({
        where: { id },
        data: updateData,
      });

      // Business Rules for Asset Status transitions:
      if (nextStatus === 'APPROVED') {
        // Enters Maintenance
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'UNDER_MAINTENANCE' },
        });
      } else if (nextStatus === 'COMPLETED') {
        // Enters Available
        await tx.asset.update({
          where: { id: request.assetId },
          data: { status: 'AVAILABLE' },
        });
      }

      return updatedReq;
    });

    await logActivity(
      req.user.id,
      'UPDATE_MAINTENANCE_STATUS',
      'MAINTENANCE',
      `Updated maintenance request ID ${id} status to ${nextStatus}`
    );

    // Notify employee who raised request
    await createNotification(
      request.employeeId,
      'Maintenance Status Updated',
      `Maintenance request for asset "${request.asset.name}" status updated to: ${nextStatus}.`
    );

    return sendSuccess(res, 'Maintenance request status updated', result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
};
