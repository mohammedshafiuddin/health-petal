import axios from "@/services/axios";
import { useMutation } from "@tanstack/react-query";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      
      // Use the shared axios instance directly
      await axios.post('/users/logout');
    },
    retry: false
  });
}
