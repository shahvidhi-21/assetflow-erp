const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// Password helpers
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password, hashed) {
  return await bcrypt.compare(password, hashed);
}

// JWT helpers
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'supersecret_fallback',
    { expiresIn: '24h' }
  );
}

// Activity logging helper
async function logActivity(userId, action, module, details = null) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        module,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
      },
    });
  } catch (err) {
    console.error('Activity logging failed:', err);
  }
}

// Notification creation helper
async function createNotification(userId, title, message) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
}

// Standard responses
const sendSuccess = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message, status = 500, errors = null) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  logActivity,
  createNotification,
  sendSuccess,
  sendError,
};
