import { useState, useEffect, useCallback } from 'react';
import { getMyAppointments, updateAppointmentStatus } from '../api/doctor';
import type { Appointment, Patient } from '../types';
import { useAuth } from '../context/AuthContext';

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
      const data = await getMyAppointments(); // defaults to today, per the backend
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Today's Schedule</h1>
          <p className="text-xs text-slate-500">{user?.name}</p>
        </div>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">Log out</button>
      </div>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : appointments.length === 0 ? (
          <p className="text-slate-400 text-sm">No appointments scheduled for today.</p>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-slate-500 mb-3">Up next ({upcoming.length})</h2>
                <div className="space-y-3 mb-8">
                  {upcoming.map((a) => {
                    const patient = a.patient as Patient;
                    const isExpanded = expandedId === a._id;
                    return (
                      <div key={a._id} className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-800">{patient?.name}</p>
                            <p className="text-sm text-slate-500">
                              {formatTime(a.startTime)} • {patient?.age}y, {patient?.gender} • {a.reason}
                            </p>
                          </div>
                          {!isExpanded && (
                            <button
                              onClick={() => startCompleting(a)}
                              className="text-sm bg-teal-700 text-white rounded-md px-3 py-1.5 font-medium whitespace-nowrap"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Consultation note</label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={3}
                              autoFocus
                              placeholder="What was discussed, diagnosis, prescription..."
                              className="w-full border border-slate-300 rounded-md px-3 py-2 text-base mb-3"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setExpandedId(null)}
                                className="flex-1 border border-slate-300 rounded-md py-2 text-sm font-medium text-slate-700"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => submitCompleted(a._id)}
                                disabled={saving}
                                className="flex-1 bg-teal-700 text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
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
                <h2 className="text-sm font-semibold text-slate-500 mb-3">Done today ({done.length})</h2>
                <div className="space-y-2">
                  {done.map((a) => {
                    const patient = a.patient as Patient;
                    return (
                      <div key={a._id} className="bg-white rounded-lg border border-slate-100 p-4 opacity-70">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-700">{patient?.name}</p>
                            <p className="text-sm text-slate-500">{formatTime(a.startTime)} • {a.reason}</p>
                            {a.consultationNote && (
                              <p className="text-sm text-slate-600 mt-1 italic">"{a.consultationNote}"</p>
                            )}
                          </div>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
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