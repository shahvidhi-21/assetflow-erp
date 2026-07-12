import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Plus, Clock, Video, Car, Projector, HelpCircle, X, AlertCircle } from 'lucide-react';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [sharedAssets, setSharedAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  const fetchSharedAssets = async () => {
    try {
      const response = await api.get('/assets', { params: { isShared: 'true' } });
      setSharedAssets(response.data.data.filter(a => ['AVAILABLE', 'RESERVED'].includes(a.status)));
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchSharedAssets()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    // Combine Date and Times into ISO strings
    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const endDateTime = new Date(`${bookingDate}T${endTime}:00`);

    if (startDateTime >= endDateTime) {
      setFormError('End time must be after start time.');
      setFormLoading(false);
      return;
    }

    if (startDateTime < new Date()) {
      setFormError('Booking time cannot be in the past.');
      setFormLoading(false);
      return;
    }

    try {
      await api.post('/bookings', {
        assetId: selectedAssetId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      setShowCreateModal(false);
      setSelectedAssetId('');
      setBookingDate('');
      setStartTime('');
      setEndTime('');
      fetchBookings();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to book resource');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getAssetIcon = (categoryName) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes('room') || cat.includes('hall') || cat.includes('space')) {
      return Video;
    }
    if (cat.includes('car') || cat.includes('vehicle') || cat.includes('truck')) {
      return Car;
    }
    if (cat.includes('projector') || cat.includes('screen') || cat.includes('tv')) {
      return Projector;
    }
    return HelpCircle;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400';
      case 'ONGOING':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-850';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Resource Booking
          </h1>
          <p className="text-sm text-gray-500">
            Book company vehicles, conference rooms, projectors, and shared assets without conflicts.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-primary-500 hover:to-indigo-500 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          <span>Book Shared Resource</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:border-gray-850 dark:bg-gray-900/60">
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Reserved By</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Timeframe</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm dark:divide-gray-850">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    No bookings scheduled.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const Icon = getAssetIcon(booking.asset.category.name);
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/25">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500 border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{booking.asset.name}</div>
                            <div className="text-xs font-mono text-gray-400">{booking.asset.assetTag}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{booking.employee.name}</div>
                        <div className="text-xs text-gray-400">{booking.employee.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {booking.status === 'UPCOMING' && (booking.employeeId === user?.id || user?.role === 'ADMIN') && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-950/20 dark:text-red-400 dark:hover:bg-red-950/45 cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Shared Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-150 bg-white p-6 shadow-2xl dark:border-gray-850 dark:bg-gray-950">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-850">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                <h3 className="font-display text-lg font-bold">New Resource Booking</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleBooking} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Select Shared Resource</label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <option value="">Select Resource...</option>
                  {sharedAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      [{asset.category.name}] {asset.name} ({asset.assetTag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Reservation Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm dark:border-gray-800 dark:bg-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-500 cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? 'Reserving...' : 'Book Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
