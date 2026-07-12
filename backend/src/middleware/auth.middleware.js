const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const { sendError } = require('../utils/helpers');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authorization token required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback');
    
    // Fetch fresh user data to ensure role and status are current
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        departmentId: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (user.status !== 'ACTIVE') {
      return sendError(res, 'User account is inactive', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired authorization token', 401);
  }
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Access denied: insufficient permissions', 403);
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRoles,
};
