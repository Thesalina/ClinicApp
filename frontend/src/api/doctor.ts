import api from './client';
import type { Appointment, AppointmentStatus } from '../types';

export async function getMyAppointments(date?: string): Promise<Appointment[]> {
  const res = await api.get('/appointments/mine', { params: date ? { date } : {} });
  return res.data.appointments;
}

interface UpdateStatusInput {
  status: AppointmentStatus;
  consultationNote?: string;
}

export async function updateAppointmentStatus(id: string, data: UpdateStatusInput): Promise<Appointment> {
  const res = await api.patch(`/appointments/${id}/status`, data);
  return res.data.appointment;
}