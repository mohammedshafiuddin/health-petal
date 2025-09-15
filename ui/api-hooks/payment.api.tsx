import axios from '@/services/axios';
import { useMutation, useQuery } from '@tanstack/react-query';

// Initiate token payment
export function useInitiateTokenPayment() {
  return useMutation({
    mutationFn: async (payload: { doctorId: number; date: string }) => {
      const response = await axios.post('/payments/initiate-token-payment', payload);
      return response.data;
    },
  });
}

// Check payment status
export function useCheckPaymentStatus(paymentId: string) {
  return useQuery({
    queryKey: ['payment-status', paymentId],
    enabled: !!paymentId,
    queryFn: async () => {
      const response = await axios.post('/payments/check-status', { paymentId });
      return response.data;
    },
  });
}

// Fetch PhonePe credentials
export function usePhonepeCreds() {
  return useQuery({
    queryKey: ['phonepe-creds'],
    queryFn: async () => {
      const response = await axios.get('/payments/get-phonepe-creds');
      return response.data;
    },
  });
}

// Mark payment as successful
export function useMarkPaymentSuccess() {
  return useMutation({
    mutationFn: async (paymentId: string | number) => {
      const response = await axios.post('/payments/mark-payment-success', { paymentId });
      return response.data;
    },
  });
}

// Mark payment as failed
export function useMarkPaymentFailure() {
  return useMutation({
    mutationFn: async (paymentId: string | number) => {
      const response = await axios.post('/payments/mark-payment-failure', { paymentId });
      return response.data;
    },
  });
}