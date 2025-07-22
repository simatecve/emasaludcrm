
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

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as CurrentUser;
    },
    enabled: !!user?.id,
  });
};
