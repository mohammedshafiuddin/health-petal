export type Person = {
    name: string;
    age: number;
    email: string;
}


export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  profilePicUrl?: string;
}

export interface Hospital {
  id: number;
  name: string;
  description?: string;
  address: string;
  adminId?: number;
  adminName?: string;
}

export interface DoctorSpecialization {
  id: number;
  name: string;
  description: string | null;
}

export interface DoctorInfo {
  id: number;
  qualifications: string | null;
  dailyTokenCount: number;
  consultationFee: number | string;
}

export interface Doctor {
  id: number;
  name: string;
  username?: string | null;
  email?: string | null;
  mobile?: string;
  doctorInfo?: DoctorInfo;
  specializations?: DoctorSpecialization[] | null;
}