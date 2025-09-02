import axios from "@/services/axios";
import { useQuery } from "@tanstack/react-query";
import type { User } from "shared-types";

export function useGetUserById(userId: number | string | undefined) {
  console.log({userId})
  
  return useQuery<User | undefined>({
    queryKey: ['user', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return undefined;
      const res = await axios.get<User>(`/users/user/${userId}`);
      return res.data;
    },
  });
}