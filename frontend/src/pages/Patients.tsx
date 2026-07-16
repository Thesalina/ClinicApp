import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '../types';
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/Patients';
import PatientFormModal from '../components/PatientFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const { user, logout } = useAuth();

  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatients(search);
      setPatients(data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Debounce search so we're not firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(loadPatients, 300);
    return () => clearTimeout(timer);
  }, [loadPatients]);

  async function handleSave(data: Omit<Patient, '_id'>) {
    if (editingPatient) {
      await updatePatient(editingPatient._id, data);
    } else {
      await createPatient(data);
    }
    await loadPatients();
  }

  function requestDelete(patient: Patient) {
    setDeleteTarget(patient);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deletePatient(deleteTarget._id);
    setDeleteTarget(null);
    await loadPatients();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Patients</h1>
          <p className="text-xs text-slate-500">{user?.name}</p>
        </div>
        <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">
          Log out
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {/* Search + Add — stacked on mobile, side-by-side on desktop */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2.5 text-base bg-white"
          />
          <button
            onClick={() => { setEditingPatient(null); setModalOpen(true); }}
            className="bg-teal-700 text-white rounded-md px-4 py-2.5 font-medium whitespace-nowrap"
          >
            + Add Patient
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : patients.length === 0 ? (
          <p className="text-slate-400 text-sm">No patients found.</p>
        ) : (
          <>
            {/* Desktop: table. Hidden below sm. */}
            <div className="hidden sm:block bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Age</th>
                    <th className="px-4 py-3 font-medium">Gender</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600">{p.age}</td>
                      <td className="px-4 py-3 text-slate-600">{p.gender}</td>
                      <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button onClick={() => { setEditingPatient(p); setModalOpen(true); }} className="text-teal-700 font-medium">Edit</button>
                        <button onClick={() => requestDelete(p)} className="text-red-600 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards. Hidden from sm up. */}
            <div className="sm:hidden space-y-3">
              {patients.map((p) => (
                <div key={p._id} className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <span className="text-xs text-slate-400">{p.age} • {p.gender}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{p.phone}</p>
                  <div className="flex gap-4 text-sm">
                    <button onClick={() => { setEditingPatient(p); setModalOpen(true); }} className="text-teal-700 font-medium">Edit</button>
                    <button onClick={() => requestDelete(p)} className="text-red-600 font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <PatientFormModal
          patient={editingPatient}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete patient"
          message={`Delete ${deleteTarget.name}? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}