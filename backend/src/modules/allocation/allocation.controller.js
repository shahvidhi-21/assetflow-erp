const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity, createNotification } = require('../../utils/helpers');

async function getAllAllocations(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'DEPARTMENT_HEAD') {
      const deptId = req.user.departmentId;
      if (!deptId) {
        filter.id = 0;
      } else {
        filter.employee = { departmentId: deptId };
      }
    }

    const allocations = await prisma.assetAllocation.findMany({
      where: filter,
      include: {
        asset: { include: { category: true } },
        employee: { select: { id: true, name: true, email: true, department: true } },
      },
      orderBy: { allocatedDate: 'desc' },
    });
    return sendSuccess(res, 'Allocations retrieved successfully', allocations);
  } catch (err) {
    next(err);
  }
}

async function getAllocationsByEmployee(req, res, next) {
  try {
    const employeeId = parseInt(req.params.employeeId);

    // Employees can only view their own allocations unless they are admin/manager
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employeeId) {
      return sendError(res, 'Access denied: cannot view other employee allocations', 403);
    }

    const allocations = await prisma.assetAllocation.findMany({
      where: { employeeId },
      include: {
        asset: { include: { category: true } },
      },
      orderBy: { allocatedDate: 'desc' },
    });

    return sendSuccess(res, 'Employee allocations retrieved', allocations);
  } catch (err) {
    next(err);
  }
}

async function allocateAsset(req, res, next) {
  try {
    const { assetId, employeeId } = req.body;

    if (!assetId || !employeeId) {
      return sendError(res, 'Asset ID and Employee ID are required', 400);
    }

    const parsedAssetId = parseInt(assetId);
    const parsedEmployeeId = parseInt(employeeId);

    // Verify asset availability
    const asset = await prisma.asset.findUnique({ where: { id: parsedAssetId } });
    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    if (asset.status !== 'AVAILABLE') {
      return sendError(res, `Asset allocation rejected: status is currently "${asset.status}"`, 400);
    }

    // Verify employee exists
    const employee = await prisma.user.findUnique({ where: { id: parsedEmployeeId } });
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    // Single active allocation per asset constraint (Prisma transaction)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create allocation record
      const allocation = await tx.assetAllocation.create({
        data: {
          assetId: parsedAssetId,
          employeeId: parsedEmployeeId,
          status: 'ACTIVE',
        },
      });

      // 2. Mark asset as allocated
      const updatedAsset = await tx.asset.update({
        where: { id: parsedAssetId },
        data: { status: 'ALLOCATED' },
      });

      return { allocation, updatedAsset };
    });

    await logActivity(
      req.user.id,
      'ALLOCATE_ASSET',
      'ALLOCATION',
      `Allocated asset ${result.updatedAsset.assetTag} to ${employee.name}`
    );

    await createNotification(
      parsedEmployeeId,
      'Asset Allocated',
      `Asset "${result.updatedAsset.name}" (${result.updatedAsset.assetTag}) has been allocated to you.`
    );

    return sendSuccess(res, 'Asset allocated successfully', result.allocation, 201);
  } catch (err) {
    next(err);
  }
}

async function returnAsset(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const allocation = await prisma.assetAllocation.findUnique({
      where: { id },
      include: { asset: true, employee: true },
    });

    if (!allocation) {
      return sendError(res, 'Allocation record not found', 404);
    }

    if (allocation.status !== 'ACTIVE' && allocation.status !== 'PENDING_TRANSFER') {
      return sendError(res, 'Asset is already returned or transferred', 400);
    }

    // Allow employee to request return, Asset manager approves return, etc.
    // For immediate hackathon simplicity, we process return directly.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update allocation status
      const updatedAlloc = await tx.assetAllocation.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
        },
      });

      // 2. Set asset status back to AVAILABLE
      const updatedAsset = await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'AVAILABLE' },
      });

      return { updatedAlloc, updatedAsset };
    });

    await logActivity(
      req.user.id,
      'RETURN_ASSET',
      'ALLOCATION',
      `Returned asset ${result.updatedAsset.assetTag} from ${allocation.employee.name}`
    );

    await createNotification(
      allocation.employeeId,
      'Asset Return Confirmed',
      `Return request for "${result.updatedAsset.name}" (${result.updatedAsset.assetTag}) has been confirmed.`
    );

    return sendSuccess(res, 'Asset returned successfully', result.updatedAlloc);
  } catch (err) {
    next(err);
  }
}

async function requestTransfer(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { targetEmployeeId } = req.body;

    if (!targetEmployeeId) {
      return sendError(res, 'Target Employee ID is required', 400);
    }

    const parsedTargetId = parseInt(targetEmployeeId);

    const allocation = await prisma.assetAllocation.findUnique({
      where: { id },
      include: { asset: true, employee: true },
    });

    if (!allocation) {
      return sendError(res, 'Allocation record not found', 404);
    }

    if (allocation.status !== 'ACTIVE') {
      return sendError(res, 'Allocation is not active', 400);
    }

    if (allocation.employeeId === parsedTargetId) {
      return sendError(res, 'Cannot transfer asset to the current assignee', 400);
    }

    const targetEmployee = await prisma.user.findUnique({ where: { id: parsedTargetId } });
    if (!targetEmployee) {
      return sendError(res, 'Target employee not found', 404);
    }

    const updatedAlloc = await prisma.assetAllocation.update({
      where: { id },
      data: {
        status: 'PENDING_TRANSFER',
        transferRequestedTo: parsedTargetId,
      },
    });

    await logActivity(
      req.user.id,
      'REQUEST_TRANSFER',
      'ALLOCATION',
      `Requested transfer of asset ${allocation.asset.assetTag} from ${allocation.employee.name} to ${targetEmployee.name}`
    );

    await createNotification(
      parsedTargetId,
      'Asset Transfer Requested',
      `An asset "${allocation.asset.name}" (${allocation.asset.assetTag}) is requested to be transferred to you.`
    );

    return sendSuccess(res, 'Asset transfer request submitted', updatedAlloc);
  } catch (err) {
    next(err);
  }
}

async function approveTransfer(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const allocation = await prisma.assetAllocation.findUnique({
      where: { id },
      include: { asset: true, employee: true },
    });

    if (!allocation) {
      return sendError(res, 'Allocation record not found', 404);
    }

    if (allocation.status !== 'PENDING_TRANSFER' || !allocation.transferRequestedTo) {
      return sendError(res, 'No pending transfer request found for this allocation', 400);
    }

    const targetEmployee = await prisma.user.findUnique({
      where: { id: allocation.transferRequestedTo },
    });

    if (!targetEmployee) {
      return sendError(res, 'Target employee not found', 404);
    }

    // Security check: if department head, check department matching
    if (req.user.role === 'DEPARTMENT_HEAD') {
      const isEmployeeInDept = allocation.employee.departmentId === req.user.departmentId;
      const isTargetInDept = targetEmployee.departmentId === req.user.departmentId;
      if (!isEmployeeInDept && !isTargetInDept) {
        return sendError(res, 'Access denied: cannot approve transfer outside your department', 403);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Close current allocation
      await tx.assetAllocation.update({
        where: { id },
        data: {
          status: 'TRANSFERRED',
          returnDate: new Date(),
        },
      });

      // 2. Create new allocation for target employee
      const newAlloc = await tx.assetAllocation.create({
        data: {
          assetId: allocation.assetId,
          employeeId: allocation.transferRequestedTo,
          status: 'ACTIVE',
        },
      });

      return newAlloc;
    });

    await logActivity(
      req.user.id,
      'APPROVE_TRANSFER',
      'ALLOCATION',
      `Approved transfer of asset ${allocation.asset.assetTag} to ${targetEmployee.name}`
    );

    await createNotification(
      allocation.employeeId,
      'Asset Transferred Out',
      `Asset "${allocation.asset.name}" (${allocation.asset.assetTag}) has been transferred to ${targetEmployee.name}.`
    );

    await createNotification(
      allocation.transferRequestedTo,
      'Asset Received',
      `Asset "${allocation.asset.name}" (${allocation.asset.assetTag}) transfer has been approved and allocated to you.`
    );

    return sendSuccess(res, 'Asset transfer approved successfully', result);
  } catch (err) {
    next(err);
  }
}

async function rejectTransfer(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const allocation = await prisma.assetAllocation.findUnique({
      where: { id },
      include: { asset: true, employee: true },
    });

    if (!allocation) {
      return sendError(res, 'Allocation record not found', 404);
    }

    if (allocation.status !== 'PENDING_TRANSFER') {
      return sendError(res, 'No pending transfer request found for this allocation', 400);
    }

    // Security check: if department head, check department matching
    if (req.user.role === 'DEPARTMENT_HEAD') {
      const isEmployeeInDept = allocation.employee.departmentId === req.user.departmentId;
      const isTargetInDept = await prisma.user.findFirst({
        where: { id: allocation.transferRequestedTo, departmentId: req.user.departmentId }
      });
      if (!isEmployeeInDept && !isTargetInDept) {
        return sendError(res, 'Access denied: cannot reject transfer outside your department', 403);
      }
    }

    const updated = await prisma.assetAllocation.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        transferRequestedTo: null,
      },
    });

    await logActivity(
      req.user.id,
      'REJECT_TRANSFER',
      'ALLOCATION',
      `Rejected transfer of asset ${allocation.asset.assetTag} from ${allocation.employee.name}`
    );

    await createNotification(
      allocation.employeeId,
      'Asset Transfer Rejected',
      `Transfer request for "${allocation.asset.name}" (${allocation.asset.assetTag}) has been rejected.`
    );

    return sendSuccess(res, 'Asset transfer rejected successfully', updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllAllocations,
  getAllocationsByEmployee,
  allocateAsset,
  returnAsset,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
};
