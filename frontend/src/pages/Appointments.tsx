import { useState, useEffect, useCallback } from 'react';
import ReceptionistNav from '../components/ReceptionistNav';
import BookAppointmentModal from '../components/BookingAppointmentModal';
import { getAppointments } from '../api/appointments';
import { getDoctors } from '../api/doctors';
import type { } from '../api/doctor';
import type { Appointment, Patient, User } from '../types';

const statusStyles: Record<string, string> = {
  Upcoming: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const borderStyles: Record<string, string> = {
  Upcoming: 'border-l-sky-400',
  Completed: 'border-l-emerald-400',
  Cancelled: 'border-l-rose-400',
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [date, setDate] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAppointments({ date, doctorId, status });
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, [date, doctorId, status]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);
  useEffect(() => { getDoctors().then(setDoctors); }, []);

  function handleBooked() {
    setSuccessMsg('Appointment booked successfully.');
    loadAppointments();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  const hasFilters = date || doctorId || status;

  return (
    <div className="min-h-screen bg-slate-50">
      <ReceptionistNav />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-xl font-bold text-slate-900">Appointments</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-teal-700 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-teal-800 transition"
          >
            + Book Appointment
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2.5 rounded-lg mb-4 ring-1 ring-emerald-200 flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Filters — grouped in a panel so they read as one control cluster */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
            <select
              value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            >
              <option value="">All doctors</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select
              value={status} onChange={(e) => setStatus(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            >
              <option value="">All statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {hasFilters && (
              <button
                onClick={() => { setDate(''); setDoctorId(''); setStatus(''); }}
                className="text-sm text-slate-500 hover:text-slate-800 font-medium transition ml-auto"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-slate-400">No appointments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => {
              const patient = a.patient as Patient;
              const doctor = a.doctor as User;
              return (
                <div
                  key={a._id}
                  className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderStyles[a.status] || 'border-l-slate-300'} p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {patient?.name} <span className="text-slate-400 font-normal">with</span> {doctor?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatTime(a.startTime)} • {a.durationMinutes} min • {a.reason}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${statusStyles[a.status] || 'bg-slate-100 text-slate-600'}`}>
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <BookAppointmentModal
          onClose={() => setModalOpen(false)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
}