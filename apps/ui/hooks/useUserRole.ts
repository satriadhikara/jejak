import { useQuery } from '@tanstack/react-query';
import { getCookie } from '@/lib/auth-client';

export const useUserRole = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const baseURL = process.env.EXPO_PUBLIC_API_URL;
      const cookies = getCookie();

      const response = await fetch(`${baseURL}/api/user/role`, {
        method: 'GET',
        headers: {
          Cookie: cookies || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user role');
      }

      const result = await response.json();
      return result.role;
    },
  });

  return { role: data || null, isLoading, error };
};
