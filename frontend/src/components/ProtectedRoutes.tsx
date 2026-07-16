import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface Props {
  children: ReactNode;
  allowedRoles: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Logged in, but wrong role for this page — send them to their own home
    // instead of a blank/broken screen.
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/patients'} replace />;
  }

  return <>{children}</>;
}