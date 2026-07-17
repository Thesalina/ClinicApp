import { useState, useEffect, useCallback } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../api/doctor';
import type { Appointment, Patient } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

function initials(name?: string) {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { user, logout } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function startCompleting(appt: Appointment) {
    setExpandedId(appt._id);
    setNote(appt.consultationNote || '');
  }

  async function submitCompleted(id: string) {
    setSaving(true);
    try {
      await updateAppointmentStatus(id, { status: 'Completed', consultationNote: note });
      setExpandedId(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  const upcoming = appointments.filter((a) => a.status === 'Upcoming');
  const done = appointments.filter((a) => a.status !== 'Upcoming');
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Today's Schedule</h1>
            <p className="text-sm text-slate-500 mt-0.5">{user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition"
          >
            Log out
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-slate-400">No appointments scheduled for today.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="text-2xl font-semibold text-slate-900">{appointments.length}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-0.5">Total today</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="text-2xl font-semibold text-teal-700">{upcoming.length}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-0.5">Up next</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <p className="text-2xl font-semibold text-emerald-600">{completedCount}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 mt-0.5">Completed</p>
              </div>
            </div>

            {upcoming.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Up next ({upcoming.length})
                </h2>
                <div className="space-y-3 mb-8">
                  {upcoming.map((a) => {
                    const patient = a.patient as Patient;
                    const isExpanded = expandedId === a._id;
                    return (
                      <div
                        key={a._id}
                        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm transition hover:shadow-md hover:border-slate-300"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white font-semibold text-sm">
                              {initials(patient?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{patient?.name}</p>
                              <p className="text-sm text-slate-500">
                                {formatTime(a.startTime)} • {patient?.age}y, {patient?.gender} • {a.reason}
                              </p>
                            </div>
                          </div>
                          {!isExpanded && (
                            <button
                              onClick={() => startCompleting(a)}
                              className="text-sm bg-teal-700 text-white rounded-md px-3 py-1.5 font-medium whitespace-nowrap hover:bg-teal-800 transition"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Consultation note
                            </label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={3}
                              autoFocus
                              placeholder="What was discussed, diagnosis, prescription..."
                              className="w-full border border-slate-300 rounded-md px-3 py-2 text-base mb-3 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setExpandedId(null)}
                                className="flex-1 border border-slate-300 rounded-md py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => submitCompleted(a._id)}
                                disabled={saving}
                                className="flex-1 bg-teal-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 hover:bg-teal-800 transition"
                              >
                                {saving ? 'Saving...' : 'Confirm Completed'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {done.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Done today ({done.length})
                </h2>
                <div className="space-y-2">
                  {done.map((a) => {
                    const patient = a.patient as Patient;
                    return (
                      <div key={a._id} className="bg-white rounded-xl border border-slate-100 p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 font-semibold text-sm">
                              {initials(patient?.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-700 truncate">{patient?.name}</p>
                              <p className="text-sm text-slate-500">
                                {formatTime(a.startTime)} • {a.reason}
                              </p>
                              {a.consultationNote && (
                                <p className="text-sm text-slate-600 mt-2 italic border-l-2 border-teal-200 pl-3">
                                  "{a.consultationNote}"
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                              STATUS_STYLES[a.status] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}