import api from './client';

export interface Doctor {
    _id: string;
    name: string;
    specialization?: string;
}

export async function getDoctors(): Promise<Doctor[]> {
    const res = await api.get('/users/doctors');
    return res.data.doctors;
}