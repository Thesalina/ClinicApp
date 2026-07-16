import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ReceptionistNav() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-1 pb-1 border-b-2 transition ${
      isActive ? 'text-teal-700 border-teal-700' : 'text-slate-500 border-transparent hover:text-slate-800'
    }`;

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
      {/* Row 1: brand + user/logout — always one line */}
      <div className="flex items-center justify-between py-3">
        <span className="font-bold text-slate-900">Oracle Clinic</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:text-slate-800 transition whitespace-nowrap"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Row 2: tabs — own row on mobile so they never compete for space */}
      <nav className="flex gap-5 pb-2">
        <NavLink to="/patients" className={linkClass}>Patients</NavLink>
        <NavLink to="/appointments" className={linkClass}>Appointments</NavLink>
      </nav>
    </div>
  );
}