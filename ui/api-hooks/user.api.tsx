import axios from "@/services/axios";
import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import type { User } from "shared-types";

export interface CreateUserPayload {
  name: string;
  email: string;
  mobile: string;
  address?: string;
  password: string;
  role?: string;
}

export interface CreateBusinessUserPayload {
  name: string;
  username: string;
  password: string;
  role: string;
}

export interface CreateUserResponse {
  user: User;
  message: string;
}

export interface UserResponsibilities {
  hospitalAdminFor: number | null; // ID of hospital the user is admin for, if any
  secretaryFor: number[]; // IDs of doctors the user is secretary for
}

export function useGetUserById(userId: number | string | undefined | null) {
  
  return useQuery<User | undefined>({
    queryKey: ['user', 'user-details', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      
      const res = await axios.get<User>(`/users/user/${userId}`);
      return res.data;
    },
  });
}

/**
 * Hook to fetch the responsibilities of the logged-in user
 */
export function useUserResponsibilities() {
  return useQuery({
    queryKey: ['userResponsibilities'],
    queryFn: async (): Promise<UserResponsibilities> => {
      const response = await axios.get('/users/responsibilities');
      return response.data;
    },
    enabled: false, // Don't run automatically, manually trigger when needed
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: async (userPayload: FormData) => {
      try {

        const response = await axios.post('/users/signup', userPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
      catch (error) {
        console.log(error);
      }
    },
  });
}

export function useCreateBusinessUser() {
  const queryClient = new QueryClient();

  return useMutation<CreateUserResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post<CreateUserResponse>('/users/business-user', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list query
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['business-users'] });
    },
  });
}

export interface BusinessUser {
  id: number;
  name: string;
  username: string;
  role: string;
  joinDate: string;
}

export interface UpdateBusinessUserPayload {
  name: string;
  password?: string; // Optional for updates
  specializationIds?: number[];
  consultationFee?: number;
  dailyTokenCount?: number;
  qualifications?: string;
}

export function useUpdateBusinessUser(userId: number) {
  const queryClient = new QueryClient();

  return useMutation<CreateUserResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await axios.put<CreateUserResponse>(
        `/users/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['business-users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}

export function useGetBusinessUsers() {
  return useQuery<BusinessUser[]>({
    queryKey: ['business-users'],
    queryFn: async () => {
      const response = await axios.get<BusinessUser[]>('/users/business-users');
      return response.data;
    }
  });
}