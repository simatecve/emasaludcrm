

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'usuario_normal' | 'prestador';
  is_active: boolean;
}

export const useCurrentUser = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-user', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      console.log('Fetching user data for ID:', user.id);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('User data fetched:', data);
      console.log('Error:', error);

      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
      
      return data as CurrentUser;
    },
    enabled: !!user?.id,
    retry: false, // No reintentar para evitar loops infinitos
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false, // Evitar refetch automático
  });
};

