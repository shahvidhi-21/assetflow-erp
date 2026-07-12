const prisma = require('../../prisma');
const { sendSuccess, sendError, logActivity, createNotification } = require('../../utils/helpers');

async function getAllBookings(req, res, next) {
  try {
    const { assetId, employeeId, status } = req.query;

    const filter = {};
    if (assetId) filter.assetId = parseInt(assetId);
    if (employeeId) filter.employeeId = parseInt(employeeId);
    if (status) filter.status = status;

    const bookings = await prisma.booking.findMany({
      where: filter,
      include: {
        asset: { include: { category: true } },
        employee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return sendSuccess(res, 'Bookings retrieved successfully', bookings);
  } catch (err) {
    next(err);
  }
}

async function getBookingById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        asset: { include: { category: true } },
        employee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    return sendSuccess(res, 'Booking retrieved successfully', booking);
  } catch (err) {
    next(err);
  }
}

async function createBooking(req, res, next) {
  try {
    const { assetId, startTime, endTime } = req.body;
    const employeeId = req.user.id;

    if (!assetId || !startTime || !endTime) {
      return sendError(res, 'Asset ID, Start Time, and End Time are required', 400);
    }

    const parsedAssetId = parseInt(assetId);
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime >= endDateTime) {
      return sendError(res, 'Start time must be before end time', 400);
    }

    if (startDateTime < new Date()) {
      return sendError(res, 'Cannot make bookings in the past', 400);
    }

    // Verify asset is shared
    const asset = await prisma.asset.findUnique({ where: { id: parsedAssetId } });
    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    if (!asset.isShared) {
      return sendError(res, 'Asset is not designated as a shared resource. Cannot book.', 400);
    }

    if (['LOST', 'RETIRED', 'DISPOSED'].includes(asset.status)) {
      return sendError(res, `Asset is currently unavailable for booking due to status: ${asset.status}`, 400);
    }

    // Strict overlapping check
    const overlapping = await prisma.booking.findFirst({
      where: {
        assetId: parsedAssetId,
        status: { in: ['UPCOMING', 'ONGOING'] },
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime },
      },
    });

    if (overlapping) {
      return sendError(res, 'Scheduling conflict: Asset is already booked during this timeframe.', 409);
    }

    const booking = await prisma.booking.create({
      data: {
        assetId: parsedAssetId,
        employeeId,
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'UPCOMING',
      },
      include: {
        asset: true,
      },
    });

    await logActivity(
      employeeId,
      'CREATE_BOOKING',
      'BOOKINGS',
      `Booked resource ${booking.asset.name} (${booking.asset.assetTag}) from ${startTime} to ${endTime}`
    );

    await createNotification(
      employeeId,
      'Booking Confirmed',
      `Your booking for "${booking.asset.name}" from ${startDateTime.toLocaleString()} to ${endDateTime.toLocaleString()} is confirmed.`
    );

    return sendSuccess(res, 'Booking created successfully', booking, 201);
  } catch (err) {
    next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    // Employees can only cancel their own bookings
    if (req.user.role === 'EMPLOYEE' && booking.employeeId !== req.user.id) {
      return sendError(res, 'Access denied: cannot cancel other employee bookings', 403);
    }

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return sendError(res, `Cannot cancel booking that is already ${booking.status.toLowerCase()}`, 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await logActivity(
      req.user.id,
      'CANCEL_BOOKING',
      'BOOKINGS',
      `Cancelled booking for ${booking.asset.name} (Booking ID: ${id})`
    );

    await createNotification(
      booking.employeeId,
      'Booking Cancelled',
      `Your booking for "${booking.asset.name}" has been cancelled.`
    );

    return sendSuccess(res, 'Booking cancelled successfully', updatedBooking);
  } catch (err) {
    next(err);
  }
}

async function rescheduleBooking(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return sendError(res, 'Start Time and End Time are required', 400);
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime >= endDateTime) {
      return sendError(res, 'Start time must be before end time', 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    if (req.user.role === 'EMPLOYEE' && booking.employeeId !== req.user.id) {
      return sendError(res, 'Access denied: cannot reschedule other employee bookings', 403);
    }

    if (booking.status !== 'UPCOMING') {
      return sendError(res, `Cannot reschedule booking that is already ${booking.status.toLowerCase()}`, 400);
    }

    // Check overlap ignoring the current booking
    const overlapping = await prisma.booking.findFirst({
      where: {
        id: { not: id },
        assetId: booking.assetId,
        status: { in: ['UPCOMING', 'ONGOING'] },
        startTime: { lt: endDateTime },
        endTime: { gt: startDateTime },
      },
    });

    if (overlapping) {
      return sendError(res, 'Scheduling conflict: Asset is already booked during this timeframe.', 409);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        startTime: startDateTime,
        endTime: endDateTime,
      },
    });

    await logActivity(
      req.user.id,
      'RESCHEDULE_BOOKING',
      'BOOKINGS',
      `Rescheduled booking ID ${id} to ${startTime} - ${endTime}`
    );

    await createNotification(
      booking.employeeId,
      'Booking Rescheduled',
      `Your booking for "${booking.asset.name}" has been rescheduled to ${startDateTime.toLocaleString()} - ${endDateTime.toLocaleString()}.`
    );

    return sendSuccess(res, 'Booking rescheduled successfully', updatedBooking);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  rescheduleBooking,
};
