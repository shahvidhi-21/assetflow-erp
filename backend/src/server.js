require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`   ASSETFLOW ERP RUNNING ON PORT ${PORT}      `);
  console.log(`   ENVIRONMENT: DEVELOPMENT                  `);
  console.log(`   DATABASE: SQLITE via PRISMA               `);
  console.log(`=============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Optional: Graceful server shutdown
  // server.close(() => process.exit(1));
});
