const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  rescheduleBooking,
} = require('./bookings.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

router.get('/', requireAuth, getAllBookings);
router.get('/:id', requireAuth, getBookingById);
router.post('/', requireAuth, createBooking);
router.post('/:id/cancel', requireAuth, cancelBooking);
router.put('/:id/reschedule', requireAuth, rescheduleBooking);

module.exports = router;
