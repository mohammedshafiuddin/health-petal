import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function MyTokensScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the upcoming tokens page
    router.replace({
      pathname: '/(drawer)/my-tokens/upcoming'
    } as any);
  }, [router]);
  
  return null;
}
