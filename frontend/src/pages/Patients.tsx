import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '../types';
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/patients';
import PatientFormModal from '../components/PatientFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import ReceptionistNav from '../components/ReceptionistNav';

function initials(name?: string) {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
}

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
            <ReceptionistNav />

            <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                <h1 className="text-xl font-bold text-slate-900 mb-5">Patients</h1>

                {/* Search + Add — stacked on mobile, side-by-side on desktop */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingPatient(null); setModalOpen(true); }}
                        className="bg-teal-700 text-white rounded-lg px-4 py-2.5 font-medium whitespace-nowrap hover:bg-teal-800 transition"
                    >
                        + Add Patient
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 rounded-lg bg-white border border-slate-200 animate-pulse" />
                        ))}
                    </div>
                ) : patients.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-sm text-slate-400">No patients found.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop: table. Hidden below sm. */}
                        <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
                                        <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white text-xs font-semibold">
                                                        {initials(p.name)}
                                                    </div>
                                                    <span className="font-medium text-slate-800">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{p.age}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.gender}</td>
                                            <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                                            <td className="px-4 py-3 text-right space-x-3">
                                                <button
                                                    onClick={() => { setEditingPatient(p); setModalOpen(true); }}
                                                    className="text-teal-700 font-medium hover:text-teal-800 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => requestDelete(p)}
                                                    className="text-rose-600 font-medium hover:text-rose-700 transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: stacked cards. Hidden from sm up. */}
                        <div className="sm:hidden space-y-3">
                            {patients.map((p) => (
                                <div key={p._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white font-semibold text-sm">
                                            {initials(p.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                                                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{p.age} • {p.gender}</span>
                                            </div>
                                            <p className="text-sm text-slate-500">{p.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-sm pl-13">
                                        <button
                                            onClick={() => { setEditingPatient(p); setModalOpen(true); }}
                                            className="text-teal-700 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => requestDelete(p)}
                                            className="text-rose-600 font-medium"
                                        >
                                            Delete
                                        </button>
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