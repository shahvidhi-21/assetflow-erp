const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity } = require('../../utils/helpers');

async function getAllDepartments(req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, 'Departments retrieved successfully', departments);
  } catch (err) {
    next(err);
  }
}

async function getDepartmentById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!department) {
      return sendError(res, 'Department not found', 404);
    }
    return sendSuccess(res, 'Department retrieved successfully', department);
  } catch (err) {
    next(err);
  }
}

async function createDepartment(req, res, next) {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return sendError(res, 'Department name is required', 400);
    }

    const existingDept = await prisma.department.findUnique({
      where: { name },
    });

    if (existingDept) {
      return sendError(res, 'Department name already exists', 400);
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        status: status || 'ACTIVE',
      },
    });

    await logActivity(req.user.id, 'CREATE_DEPARTMENT', 'DEPARTMENTS', `Created department: ${name}`);

    return sendSuccess(res, 'Department created successfully', department, 201);
  } catch (err) {
    next(err);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { name, description, status } = req.body;

    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      return sendError(res, 'Department not found', 404);
    }

    if (name && name !== department.name) {
      const existing = await prisma.department.findUnique({ where: { name } });
      if (existing) {
        return sendError(res, 'Department name already exists', 400);
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data: {
        name: name !== undefined ? name : department.name,
        description: description !== undefined ? description : department.description,
        status: status !== undefined ? status : department.status,
      },
    });

    await logActivity(req.user.id, 'UPDATE_DEPARTMENT', 'DEPARTMENTS', `Updated department ID ${id}`);

    return sendSuccess(res, 'Department updated successfully', updated);
  } catch (err) {
    next(err);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!department) {
      return sendError(res, 'Department not found', 404);
    }

    if (department._count.employees > 0) {
      return sendError(res, 'Cannot delete department containing employees. Reassign employees first.', 400);
    }

    await prisma.department.delete({ where: { id } });

    await logActivity(req.user.id, 'DELETE_DEPARTMENT', 'DEPARTMENTS', `Deleted department: ${department.name}`);

    return sendSuccess(res, 'Department deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
