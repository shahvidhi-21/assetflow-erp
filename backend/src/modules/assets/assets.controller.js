const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity } = require('../../utils/helpers');

async function generateAssetTag() {
  const lastAsset = await prisma.asset.findFirst({
    orderBy: { id: 'desc' },
  });
  let nextNum = 1001;
  if (lastAsset && lastAsset.assetTag) {
    const lastNum = parseInt(lastAsset.assetTag.replace('AST-', ''), 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }
  return `AST-${nextNum}`;
}

async function getAllAssets(req, res, next) {
  try {
    const { search, categoryId, status, isShared, condition, location } = req.query;

    const filter = {};

    if (categoryId) filter.categoryId = parseInt(categoryId);
    if (status) filter.status = status;
    if (isShared !== undefined) filter.isShared = isShared === 'true';
    if (condition) filter.condition = condition;
    if (location) filter.location = { contains: location };

    if (req.user.role === 'DEPARTMENT_HEAD') {
      const deptId = req.user.departmentId;
      filter.AND = [
        {
          OR: [
            { isShared: true },
            { allocations: { some: { employee: { departmentId: deptId }, status: 'ACTIVE' } } }
          ]
        }
      ];
      
      if (search) {
        filter.AND.push({
          OR: [
            { assetTag: { contains: search } },
            { name: { contains: search } },
            { serialNumber: { contains: search } },
            { location: { contains: search } },
          ]
        });
      }
    } else {
      if (search) {
        filter.OR = [
          { assetTag: { contains: search } },
          { name: { contains: search } },
          { serialNumber: { contains: search } },
          { location: { contains: search } },
        ];
      }
    }

    const assets = await prisma.asset.findMany({
      where: filter,
      include: {
        category: true,
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            employee: {
              select: { id: true, name: true, email: true, departmentId: true },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return sendSuccess(res, 'Assets retrieved successfully', assets);
  } catch (err) {
    next(err);
  }
}

async function getAssetById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        allocations: {
          include: {
            employee: {
              select: { id: true, name: true, email: true, departmentId: true, department: true },
            },
          },
          orderBy: { allocatedDate: 'desc' },
        },
        bookings: {
          include: {
            employee: { select: { id: true, name: true } },
          },
          orderBy: { startTime: 'desc' },
        },
        maintenanceRequests: {
          include: {
            employee: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    if (req.user.role === 'DEPARTMENT_HEAD') {
      const isShared = asset.isShared;
      const isAllocatedInDept = asset.allocations.some(
        (alloc) => alloc.status === 'ACTIVE' && alloc.employee.departmentId === req.user.departmentId
      );
      if (!isShared && !isAllocatedInDept) {
        return sendError(res, 'Access denied: cannot view asset details outside your department', 403);
      }
    }

    return sendSuccess(res, 'Asset retrieved successfully', asset);
  } catch (err) {
    next(err);
  }
}

async function getAssetByTag(req, res, next) {
  try {
    const { tag } = req.params;

    const asset = await prisma.asset.findUnique({
      where: { assetTag: tag },
      include: {
        category: true,
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            employee: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!asset) {
      return sendError(res, 'Asset tag not found', 404);
    }

    return sendSuccess(res, 'Asset retrieved successfully', asset);
  } catch (err) {
    next(err);
  }
}

async function createAsset(req, res, next) {
  try {
    const {
      name,
      categoryId,
      serialNumber,
      acquisitionDate,
      acquisitionCost,
      condition,
      location,
      image,
      isShared,
    } = req.body;

    if (!name || !categoryId || !serialNumber || !acquisitionDate || acquisitionCost === undefined) {
      return sendError(res, 'Name, Category, Serial Number, Acquisition Date and Cost are required', 400);
    }

    const existingAsset = await prisma.asset.findUnique({
      where: { serialNumber },
    });

    if (existingAsset) {
      return sendError(res, `Asset with Serial Number "${serialNumber}" already registered`, 400);
    }

    const assetTag = await generateAssetTag();

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name,
        categoryId: parseInt(categoryId),
        serialNumber,
        acquisitionDate: new Date(acquisitionDate),
        acquisitionCost: parseFloat(acquisitionCost),
        condition: condition || 'GOOD',
        location: location || 'Headquarters',
        image: image || null,
        isShared: isShared === true || isShared === 'true',
        status: 'AVAILABLE',
      },
    });

    await logActivity(req.user.id, 'CREATE_ASSET', 'ASSETS', `Registered asset: ${name} (${assetTag})`);

    return sendSuccess(res, 'Asset registered successfully', asset, 201);
  } catch (err) {
    next(err);
  }
}

async function updateAsset(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const {
      name,
      categoryId,
      serialNumber,
      acquisitionDate,
      acquisitionCost,
      condition,
      location,
      image,
      isShared,
      status,
    } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    if (serialNumber && serialNumber !== asset.serialNumber) {
      const existing = await prisma.asset.findUnique({ where: { serialNumber } });
      if (existing) {
        return sendError(res, `Serial Number "${serialNumber}" is already in use`, 400);
      }
    }

    const updated = await prisma.asset.update({
      where: { id },
      data: {
        name: name !== undefined ? name : asset.name,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : asset.categoryId,
        serialNumber: serialNumber !== undefined ? serialNumber : asset.serialNumber,
        acquisitionDate: acquisitionDate !== undefined ? new Date(acquisitionDate) : asset.acquisitionDate,
        acquisitionCost: acquisitionCost !== undefined ? parseFloat(acquisitionCost) : asset.acquisitionCost,
        condition: condition !== undefined ? condition : asset.condition,
        location: location !== undefined ? location : asset.location,
        image: image !== undefined ? image : asset.image,
        isShared: isShared !== undefined ? (isShared === true || isShared === 'true') : asset.isShared,
        status: status !== undefined ? status : asset.status,
      },
    });

    await logActivity(req.user.id, 'UPDATE_ASSET', 'ASSETS', `Updated asset ID ${id}: ${asset.assetTag}`);

    return sendSuccess(res, 'Asset updated successfully', updated);
  } catch (err) {
    next(err);
  }
}

async function deleteAsset(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        allocations: { where: { status: 'ACTIVE' } },
      },
    });

    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    if (asset.allocations.length > 0) {
      return sendError(res, 'Cannot delete allocated asset. Mark as returned first.', 400);
    }

    // Cascade delete bookings & maintenance requests or set references? 
    // For safety, let's delete them as it is standard in SQLite.
    await prisma.booking.deleteMany({ where: { assetId: id } });
    await prisma.maintenanceRequest.deleteMany({ where: { assetId: id } });
    await prisma.assetAllocation.deleteMany({ where: { assetId: id } });

    await prisma.asset.delete({ where: { id } });

    await logActivity(req.user.id, 'DELETE_ASSET', 'ASSETS', `Deleted asset: ${asset.name} (${asset.assetTag})`);

    return sendSuccess(res, 'Asset deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllAssets,
  getAssetById,
  getAssetByTag,
  createAsset,
  updateAsset,
  deleteAsset,
};
