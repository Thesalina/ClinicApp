export type Role = 'receptionist' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialization?: string;
}

export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Appointment {
  _id: string;
  patient: Patient | string;   // populated object when fetched, or just an ID
  doctor: User | string;
  startTime: string;           // ISO date string from the API
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  consultationNote?: string;
}