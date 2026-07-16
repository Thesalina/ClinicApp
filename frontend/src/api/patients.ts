import api from './client';
import type { Patient } from '../types';

export async function getPatients(search: string): Promise<Patient[]> {
  const res = await api.get('/patients', { params: { search } });
  return res.data.patients;
}

export async function createPatient(data: Omit<Patient, '_id'>): Promise<Patient> {
  const res = await api.post('/patients', data);
  return res.data.patient;
}

export async function updatePatient(id: string, data: Omit<Patient, '_id'>): Promise<Patient> {
  const res = await api.put(`/patients/${id}`, data);
  return res.data.patient;
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/patients/${id}`);
}