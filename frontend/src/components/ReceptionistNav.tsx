import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ReceptionistNav() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-1 pb-1 border-b-2 ${
      isActive ? 'text-teal-700 border-teal-700' : 'text-slate-500 border-transparent'
    }`;

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-6">
          <span className="font-bold text-slate-800">Oracle Clinic</span>
          <nav className="flex gap-5">
            <NavLink to="/patients" className={linkClass}>Patients</NavLink>
            <NavLink to="/appointments" className={linkClass}>Appointments</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">{user?.name}</span>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800">Log out</button>
        </div>
      </div>
    </div>
  );
}