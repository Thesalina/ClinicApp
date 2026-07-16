import { useState, useEffect, useCallback } from 'react';
import ReceptionistNav from '../components/ReceptionistNav';
import BookAppointmentModal from '../components/BookingAppointmentModal';
import { getAppointments } from '../api/appointments';
import { getDoctors } from '../api/doctors';
import type { } from '../api/doctor';
import type { Appointment, Patient, User } from '../types';

const statusStyles: Record<string, string> = {
  Upcoming: 'bg-slate-100 text-slate-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
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

  return (
    <div className="min-h-screen bg-slate-50">
      <ReceptionistNav />

      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-lg font-bold text-slate-800">Appointments</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-teal-700 text-white rounded-md px-4 py-2.5 font-medium"
          >
            + Book Appointment
          </button>
        </div>

        {successMsg && (
          <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-md mb-4">
            {successMsg}
          </div>
        )}

        {/* Filters — wrap on mobile, row on desktop */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
          />
          <select
            value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select
            value={status} onChange={(e) => setStatus(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="">All statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {(date || doctorId || status) && (
            <button
              onClick={() => { setDate(''); setDoctorId(''); setStatus(''); }}
              className="text-sm text-slate-500 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-slate-400 text-sm">No appointments found.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => {
              const patient = a.patient as Patient;
              const doctor = a.doctor as User;
              return (
                <div key={a._id} className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{patient?.name} <span className="text-slate-400 font-normal">with</span> {doctor?.name}</p>
                    <p className="text-sm text-slate-500">{formatTime(a.startTime)} • {a.durationMinutes} min • {a.reason}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${statusStyles[a.status]}`}>
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