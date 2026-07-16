import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const features = [
  { title: 'Patient records at a glance', desc: 'Search by name or phone in seconds' },
  { title: 'Conflict-free booking', desc: 'Double-booking is caught automatically' },
  { title: 'Role-based dashboards', desc: 'Doctors see only their own schedule' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      login(user, token);
      navigate(user.role === 'doctor' ? '/doctor' : '/patients');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Branding panel — hidden on mobile, shown from md breakpoint up */}
        <div className="hidden md:flex flex-col justify-center bg-teal-900 text-white p-10">
          <div className="w-11 h-11 rounded-lg bg-teal-700 flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M12 3v18M3 12h18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1">Oracle Clinic</h1>
          <p className="text-teal-200 text-sm mb-8">Digital records for a paperless front desk.</p>

          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-teal-700 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-xs text-teal-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form panel — always visible, full width on mobile */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-6">Log in with your clinic account</p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border border-slate-300 rounded-md px-3 py-2.5 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-teal-600"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-slate-300 rounded-md px-3 py-2.5 mb-6 text-base focus:outline-none focus:ring-2 focus:ring-teal-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white font-medium py-3 rounded-md hover:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-xs text-slate-400 text-center mt-6">
            Accounts are created by clinic staff — contact your admin for access.
          </p>
        </form>
      </div>
    </div>
  );
}