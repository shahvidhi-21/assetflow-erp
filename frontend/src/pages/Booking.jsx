import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Calendar, Clock, AlertCircle, CheckCircle, Plus, Trash2, CalendarDays, X } from 'lucide-react';

export default function Booking() {
  const { assets, bookings, addBooking, cancelBooking, currentUser } = useAppState();
  
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    resourceId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
  });

  // Filter out assets marked as shared resources
  const sharedResources = assets.filter((a) => a.sharedResource);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!form.resourceId) {
      setErrorMsg('Please select a shared resource.');
      return;
    }

    if (form.startTime >= form.endTime) {
      setErrorMsg('Start time must be before end time.');
      return;
    }

    const res = addBooking({
      resourceId: form.resourceId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
    });

    if (res && !res.success) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Booking confirmed successfully!');
      setTimeout(() => {
        closeModal();
      }, 1000);
    }
  };

  const closeModal = () => {
    setForm({
      resourceId: sharedResources[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
    });
    setErrorMsg('');
    setSuccessMsg('');
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200 text-left">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Resource Booking</h1>
          <p className="text-sm font-medium text-gray-400">Schedule shared rooms, company cars, and tech equipment without overlap conflicts.</p>
        </div>
        <button
          onClick={() => {
            setForm((prev) => ({ ...prev, resourceId: sharedResources[0]?.id || '' }));
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer self-start"
        >
          <Plus size={16} />
          <span>Book Resource</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Shared Resources directory */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Shared Resource Pool</h3>
            <p className="text-xs font-semibold text-gray-400">Items available for reservation</p>
          </div>

          <div className="flex flex-col gap-3">
            {sharedResources.map((res) => (
              <div key={res.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <CalendarDays size={18} />
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{res.name}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{res.category} • {res.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Timeline schedules */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111827] border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-base font-extrabold tracking-tight">Active Reservations</h3>
            <p className="text-xs font-semibold text-gray-400">Chronological schedule logs</p>
          </div>

          <div className="flex flex-col gap-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-500/5 transition-colors gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{booking.resourceName}</span>
                    <span className="text-[11px] text-gray-500 font-semibold mt-1">Booked by: {booking.bookedBy}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} /> {booking.date} @ {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    booking.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    booking.status === 'Ongoing' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    'bg-gray-500/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {booking.status}
                  </span>
                  
                  {booking.status === 'Upcoming' && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      title="Cancel Booking"
                      className="p-1.5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-medium">No bookings logged. Click Book Resource to schedule slots.</div>
            )}
          </div>
        </div>

      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-150 dark:border-gray-800 flex flex-col gap-5 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Reserve Shared Resource</h3>
              <button onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/10 text-rose-600 dark:text-rose-450 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Select Resource</label>
                <select
                  required
                  value={form.resourceId}
                  onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                >
                  <option value="">-- Choose Resource --</option>
                  {sharedResources.map((res) => (
                    <option key={res.id} value={res.id}>{res.name} ({res.category})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase">Reservation Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">Start Time</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">End Time</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all text-sm cursor-pointer"
              >
                Confirm Resource Slot
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
