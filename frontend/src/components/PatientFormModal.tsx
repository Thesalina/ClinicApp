import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Patient } from '../types';

interface Props {
  patient: Patient | null; // null = adding a new patient, otherwise editing this one
  onClose: () => void;
  onSave: (data: Omit<Patient, '_id'>) => Promise<void>;
}

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export default function PatientFormModal({ patient, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: '', age: '', gender: 'Male' as Patient['gender'], phone: '', address: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill the form when editing an existing patient.
  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name,
        age: String(patient.age),
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address || '',
        notes: patient.notes || '',
      });
    }
  }, [patient]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({ ...form, age: Number(form.age) });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    // Fixed overlay + centered panel — same modal works for mobile (full-width,
    // near-full-height) and desktop (centered card) via the sizing classes below.
    <div className="fixed inset-0 bg-slate-900/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl"
      >
        {/* Drag handle — mobile only, signals "this is a sheet" */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {patient ? 'Edit Patient' : 'Add Patient'}
        </h2>

        {error && (
          <div className="bg-rose-50 text-rose-700 text-sm px-3 py-2 rounded-lg mb-4 ring-1 ring-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <label className={labelClass}>Name</label>
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Age</label>
            <input
              required type="number" min={0} max={130} value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as Patient['gender'] })}
              className={inputClass}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Phone</label>
            <input
              required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes} rows={2}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button" onClick={onClose}
            className="flex-1 border border-slate-300 rounded-lg py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={saving}
            className="flex-1 bg-teal-700 text-white rounded-lg py-2.5 font-medium disabled:opacity-50 hover:bg-teal-800 transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}