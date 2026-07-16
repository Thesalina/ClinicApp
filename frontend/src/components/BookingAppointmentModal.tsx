import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { getPatients } from '../api/patients';
import { getDoctors } from '../api/doctors';
import type { Doctor } from '../api/doctor';
import { bookAppointment } from '../api/appointments';
import type { Patient } from '../types';

interface Props {
  onClose: () => void;
  onBooked: () => void;
}

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function BookAppointmentModal({ onClose, onBooked }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isConflict, setIsConflict] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load dropdown data once when the modal opens.
  useEffect(() => {
    getPatients('').then(setPatients);
    getDoctors().then(setDoctors);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsConflict(false);
    setSaving(true);
    try {
      // Combine date + time into a single ISO string the backend expects.
      const startTime = new Date(`${date}T${time}`).toISOString();
      await bookAppointment({ patientId, doctorId, startTime, durationMinutes: duration, reason });
      onBooked();
      onClose();
    } catch (err: any) {
      const status = err.response?.status;
      setIsConflict(status === 409);
      setError(err.response?.data?.message || 'Could not book appointment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Drag handle — mobile only, signals "this is a sheet" */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

        <h2 className="text-xl font-bold text-slate-900 mb-4">Book Appointment</h2>

        {error && (
          <div
            className={`text-sm px-3 py-2.5 rounded-lg mb-4 flex items-start gap-2 ${
              isConflict
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
            }`}
          >
            {isConflict && (
              <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
            <span>{isConflict ? 'Scheduling conflict — ' : ''}{error}</span>
          </div>
        )}

        <label className={labelClass}>Patient</label>
        <select
          required value={patientId} onChange={(e) => setPatientId(e.target.value)}
          className={`${inputClass} mb-4`}
        >
          <option value="">Select patient...</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.name} — {p.phone}</option>
          ))}
        </select>

        <label className={labelClass}>Doctor</label>
        <select
          required value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
          className={`${inputClass} mb-4`}
        >
          <option value="">Select doctor...</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>{d.name}{d.specialization ? ` — ${d.specialization}` : ''}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={labelClass}>Date</label>
            <input
              required type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input
              required type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <label className={labelClass}>Duration (minutes)</label>
        <select
          value={duration} onChange={(e) => setDuration(Number(e.target.value))}
          className={`${inputClass} mb-4`}
        >
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>

        <label className={labelClass}>Reason for visit</label>
        <input
          required value={reason} onChange={(e) => setReason(e.target.value)}
          className={`${inputClass} mb-6`}
        />

        <div className="flex gap-3">
          <button
            type="button" onClick={onClose}
            className="flex-1 border border-slate-300 rounded-lg py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={saving}
            className="flex-1 bg-teal-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-50 hover:bg-teal-800 transition whitespace-nowrap"
          >
            {saving ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}