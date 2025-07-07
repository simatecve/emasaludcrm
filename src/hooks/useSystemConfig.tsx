
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemConfig {
  id: string;
  name: string;
  subtitle: string;
  copyright: string;
  version: string;
  logo_url: string | null;
}

export const useSystemConfig = () => {
  return useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as SystemConfig;
    },
  });
};
