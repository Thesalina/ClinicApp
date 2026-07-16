import api from './client';
import type { Appointment } from '../types';

interface BookAppointmentInput {
  patientId: string;
  doctorId: string;
  startTime: string; // ISO string
  durationMinutes: number;
  reason: string;
}
export interface AppointmentFilters {
  date?: string;
  doctorId?: string;
  status?: string;
}

export async function getAppointments(filters: AppointmentFilters): Promise<Appointment[]> {
  const res = await api.get('/appointments', { params: filters });
  return res.data.appointments;
}
export async function bookAppointment(data: BookAppointmentInput): Promise<Appointment> {
  const res = await api.post('/appointments', data);
  return res.data.appointment;
}