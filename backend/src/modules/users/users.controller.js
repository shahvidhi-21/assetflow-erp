const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity } = require('../../utils/helpers');

async function getAllUsers(req, res, next) {
  try {
    const { departmentId, role, status } = req.query;

    const filter = {};
    if (departmentId) filter.departmentId = parseInt(departmentId);
    if (role) filter.role = role;
    if (status) filter.status = status;

    if (req.user.role === 'DEPARTMENT_HEAD') {
      if (!req.user.departmentId) {
        filter.id = req.user.id;
      } else {
        filter.departmentId = req.user.departmentId;
      }
    }

    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return sendSuccess(res, 'Users retrieved successfully', users);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        allocations: {
          include: { asset: true },
          orderBy: { allocatedDate: 'desc' },
        },
        bookings: {
          include: { asset: true },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (req.user.role === 'DEPARTMENT_HEAD' && user.departmentId !== req.user.departmentId) {
      return sendError(res, 'Access denied: user is outside your department', 403);
    }

    // Remove password field
    delete user.password;

    return sendSuccess(res, 'User details retrieved', user);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { name, role, status, departmentId } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent changing own role or status to avoid lockouts
    if (req.user.id === id && (role !== undefined && role !== user.role)) {
      return sendError(res, 'Cannot change your own role to prevent system lockout', 400);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    
    if (departmentId !== undefined) {
      updateData.departmentId = departmentId ? parseInt(departmentId) : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        createdAt: true,
      },
    });

    await logActivity(
      req.user.id,
      'UPDATE_USER',
      'USERS',
      `Updated user ID ${id}: ${JSON.stringify(updateData)}`
    );

    return sendSuccess(res, 'User updated successfully', updatedUser);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    if (req.user.id === id) {
      return sendError(res, 'Cannot delete your own account', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check allocations or bookings
    const activeAllocations = await prisma.assetAllocation.count({
      where: { employeeId: id, status: 'ACTIVE' },
    });

    if (activeAllocations > 0) {
      return sendError(res, 'Cannot delete employee with active asset allocations. Return assets first.', 400);
    }

    await prisma.user.delete({ where: { id } });

    await logActivity(req.user.id, 'DELETE_USER', 'USERS', `Deleted user: ${user.name} (${user.email})`);

    return sendSuccess(res, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
