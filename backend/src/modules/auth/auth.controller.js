const prisma = require('../../prisma');
const {
  hashPassword,
  comparePassword,
  generateToken,
  logActivity,
  sendSuccess,
  sendError,
} = require('../../utils/helpers');

// Automatic admin seed check
async function checkAndCreateAdmin() {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });
    if (adminCount === 0) {
      const hashedPassword = await hashPassword('admin123');
      await prisma.user.create({
        data: {
          name: 'System Admin',
          email: 'admin@assetflow.com',
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      console.log('--- DEFAULT ADMIN SEEDED: admin@assetflow.com / admin123 ---');
    }
  } catch (err) {
    console.error('Error seeding default admin:', err);
  }
}

// Check admin seed on startup
checkAndCreateAdmin();

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Secure email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return sendError(res, 'Invalid email format', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return sendError(res, 'Email already in use', 400);
    }

    const hashedPassword = await hashPassword(password);

    // First user registered can be ADMIN, subsequent users are EMPLOYEE
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'EMPLOYEE';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: sanitizedEmail,
        password: hashedPassword,
        role,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    await logActivity(user.id, 'SIGNUP', 'AUTH', `User registered successfully with role ${role}`);
    const token = generateToken(user);

    return sendSuccess(res, 'Registration successful', { user, token }, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Double check admin seed in case DB was reset
    await checkAndCreateAdmin();

    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: { department: true }
    });

    if (!user) {
      return sendError(res, 'Invalid email or password', 400);
    }

    if (user.status !== 'ACTIVE') {
      return sendError(res, 'Account is disabled. Contact system administrator.', 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 400);
    }

    const token = generateToken(user);

    // Remove password before returning user object
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
      department: user.department,
    };

    await logActivity(user.id, 'LOGIN', 'AUTH', 'User logged in successfully');

    return sendSuccess(res, 'Login successful', { user: userResponse, token });
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        department: true,
      },
    });

    if (!user) {
      return sendError(res, 'User profile not found', 404);
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
      department: user.department,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, 'Profile retrieved', userResponse);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  getProfile,
};
