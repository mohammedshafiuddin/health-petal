import { useQuery } from '@tanstack/react-query';
import axios from '@/services/axios';

interface Specialization {
  id: number;
  name: string;
  description?: string;
}

interface Hospital {
  id: number;
  name: string;
  address: string;
  description?: string;
  employeeCount?: number;
}

interface FeaturedDoctor {
  id: number;
  doctorId: number;
  name: string;
  profilePicUrl?: string;
  qualifications?: string;
  consultationFee: number;
  dailyTokenCount: number;
  specializations: Specialization[];
  hospital: {
    id: number;
    name: string;
    address: string;
    designation: string;
  } | null;
}

interface AppointmentScreenDoctor extends FeaturedDoctor {
  // Same structure as FeaturedDoctor for now
}

export function useFeaturedDoctors(limit: number = 5) {
  return useQuery<FeaturedDoctor[]>({
    queryKey: ['featuredDoctors', limit],
    queryFn: async () => {
      const res = await axios.get<FeaturedDoctor[]>(`/dashboard/featured-doctors?limit=${limit}`);
      return res.data;
    },
  });
}

export function useFeaturedHospitals(limit: number = 5) {
  return useQuery<Hospital[]>({
    queryKey: ['featuredHospitals', limit],
    queryFn: async () => {
      const res = await axios.get<Hospital[]>(`/dashboard/featured-hospitals?limit=${limit}`);
      return res.data;
    },
  });
}

export function useAppointmentScreenDoctors(searchQuery: string = '', limit: number = 20, offset: number = 0) {
  return useQuery<AppointmentScreenDoctor[]>({
    queryKey: ['appointmentScreenDoctors', searchQuery, limit, offset],
    queryFn: async () => {
      const res = await axios.get<AppointmentScreenDoctor[]>(
        `/dashboard/appointments-screen?search=${encodeURIComponent(searchQuery)}&limit=${limit}&offset=${offset}`
      );
      return res.data;
    },
  });
}
