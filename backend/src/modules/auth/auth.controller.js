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
    // Accept either 'email' or 'username' field from the request
    const rawEmail = req.body.email || req.body.username;
    const password = req.body.password;
    if (!rawEmail || !password) {
      return sendError(res, 'Email (or username) and password are required', 400);
    }
    const sanitizedEmail = rawEmail.trim().toLowerCase();

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

async function googleLogin(req, res, next) {
  try {
    const { credentialToken } = req.body;

    if (!credentialToken) {
      return sendError(res, 'Google credential token is required', 400);
    }

    // Verify token with Google API endpoint (Secure & requires no external NPM package)
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credentialToken}`;
    
    // Node 18+ native fetch
    const response = await fetch(googleVerifyUrl);
    if (!response.ok) {
      return sendError(res, 'Invalid Google token signature or expired session', 401);
    }

    const payload = await response.json();

    // Verify issuer is Google
    if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
      return sendError(res, 'Invalid token issuer', 401);
    }

    const { email, name, sub: googleId } = payload;

    if (!email) {
      return sendError(res, 'Google account email not provided', 400);
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      include: { department: true }
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Generate a random secure password hash because it is required in the schema
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      const hashedPassword = await hashPassword(randomPassword);

      // First user registered can be ADMIN, subsequent users are EMPLOYEE
      const userCount = await prisma.user.count();
      const role = userCount === 0 ? 'ADMIN' : 'EMPLOYEE';

      user = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email: sanitizedEmail,
          password: hashedPassword,
          role,
          status: 'ACTIVE',
        },
        include: { department: true }
      });

      await logActivity(user.id, 'SIGNUP_GOOGLE', 'AUTH', `User registered via Google with role ${role}`);
    } else {
      if (user.status !== 'ACTIVE') {
        return sendError(res, 'Account is disabled. Contact system administrator.', 403);
      }
      await logActivity(user.id, 'LOGIN_GOOGLE', 'AUTH', 'User logged in successfully via Google');
    }

    const token = generateToken(user);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
      department: user.department,
    };

    return sendSuccess(res, isNewUser ? 'Google registration successful' : 'Google login successful', {
      user: userResponse,
      token,
    }, isNewUser ? 201 : 200);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    
    if (email !== undefined) {
      const sanitizedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return sendError(res, 'Invalid email format', 400);
      }

      // Check if email already used by someone else
      const existing = await prisma.user.findFirst({
        where: { email: sanitizedEmail, NOT: { id: userId } },
      });
      if (existing) {
        return sendError(res, 'Email already in use by another user', 400);
      }
      updateData.email = sanitizedEmail;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
      },
    });

    await logActivity(userId, 'UPDATE_PROFILE', 'AUTH', 'User updated profile details');

    return sendSuccess(res, 'Profile updated successfully', updatedUser);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return sendError(res, 'Old password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters long', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return sendError(res, 'Incorrect old password', 400);
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    await logActivity(userId, 'CHANGE_PASSWORD', 'AUTH', 'User successfully changed their account password');

    return sendSuccess(res, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  getProfile,
  googleLogin,
  updateProfile,
  changePassword,
};
