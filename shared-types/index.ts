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
  specializations: DoctorSpecialization[] | null;
}

export interface Hospital {
  id: number;
  name: string;
  description?: string;
  address: string;
  adminId?: number;
  adminName?: string;
  hospitalImages?: string[]
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

// Token types
export interface TokenDoctor {
  id: number;
  name: string;
  mobile: string;
  profilePicUrl: string | null;
}

export interface UpcomingToken {
  id: number;
  tokenDate: string;
  queueNumber: number;
  description: string | null;
  createdAt: string;
  doctor: TokenDoctor;
  currentConsultationNumber?: number; // Current consultation number for the doctor
}

export interface PastToken {
  id: number;
  tokenDate: string;
  queueNumber: number;
  description: string | null;
  createdAt: string;
  doctor: TokenDoctor;
  status?: 'COMPLETED' | 'MISSED' | 'CANCELLED';
  consultationNotes?: string | null;
}

export interface MyTokensResponse {
  message: string;
  tokens: UpcomingToken[];
}

export interface PastTokensResponse {
  message: string;
  tokens: PastToken[];
}

export interface BookTokenPayload {
  doctorId: number;
  userId: number;
  tokenDate: string;
  description?: string;
}

export interface BookTokenResponse {
  message: string;
  token: {
    id: number;
    doctorId: number;
    userId: number;
    tokenDate: string;
    queueNumber: number;
    description: string | null;
    createdAt: string;
  };
}

// Doctor availability types
export interface DoctorAvailability {
  id: number;
  doctorId: number;
  date: string;
  totalTokenCount: number;
  filledTokenCount: number;
  consultationsDone: number;
  isStopped: boolean;
  availableTokens: number;
  isPaused: boolean;
  isLeave: boolean;
  pauseReason: string | null;
}

export interface DoctorAvailabilityWithDate {
  date: string;
  availability: DoctorAvailability | null;
}

export interface DoctorAvailabilityResponse {
  message: string;
  doctorId: number;
  availabilities: DoctorAvailabilityWithDate[];
}

export interface DoctorAvailabilityPayload {
  doctorId: number;
  date: string;
  tokenCount: number;
  isStopped?: boolean;
  filledTokenCount?: number;
  consultationsDone?: number;
}

// Export the types from token-types.ts
export * from './token-types';