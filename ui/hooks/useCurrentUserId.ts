import { useEffect, useState } from 'react';
import { getCurrentUserId } from '@/utils/getCurrentUserId';

export function useCurrentUserId(): number | null {
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    getCurrentUserId().then(setUserId);
  }, []);
  return userId;
}
