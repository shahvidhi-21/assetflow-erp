const express = require('express');
const cors = require('cors');
const { notFoundMiddleware, errorMiddleware } = require('./middleware/error.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const departmentsRoutes = require('./modules/departments/departments.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const assetsRoutes = require('./modules/assets/assets.routes');
const allocationRoutes = require('./modules/allocation/allocation.routes');
const bookingsRoutes = require('./modules/bookings/bookings.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const reportsRoutes = require('./modules/reports/reports.routes');

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AssetFlow ERP System API API Services',
    timestamp: new Date(),
  });
});

// Module routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
