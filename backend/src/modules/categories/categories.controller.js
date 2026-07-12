const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity } = require('../../utils/helpers');

async function getAllCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, 'Categories retrieved successfully', categories);
  } catch (err) {
    next(err);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        assets: true,
      },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, 'Category retrieved successfully', category);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return sendError(res, 'Category name is required', 400);
    }

    const existingCat = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCat) {
      return sendError(res, 'Category name already exists', 400);
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    await logActivity(req.user.id, 'CREATE_CATEGORY', 'CATEGORIES', `Created category: ${name}`);

    return sendSuccess(res, 'Category created successfully', category, 201);
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    if (name && name !== category.name) {
      const existing = await prisma.category.findUnique({ where: { name } });
      if (existing) {
        return sendError(res, 'Category name already exists', 400);
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : category.name,
        description: description !== undefined ? description : category.description,
      },
    });

    await logActivity(req.user.id, 'UPDATE_CATEGORY', 'CATEGORIES', `Updated category ID ${id}`);

    return sendSuccess(res, 'Category updated successfully', updated);
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assets: true },
        },
      },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    if (category._count.assets > 0) {
      return sendError(res, 'Cannot delete category containing assets. Reassign or delete assets first.', 400);
    }

    await prisma.category.delete({ where: { id } });

    await logActivity(req.user.id, 'DELETE_CATEGORY', 'CATEGORIES', `Deleted category: ${category.name}`);

    return sendSuccess(res, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
