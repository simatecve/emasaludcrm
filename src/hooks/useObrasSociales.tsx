
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ObraSocial {
  id: string;
  nombre: string;
  codigo?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activa: boolean;
}

export const useObrasSociales = () => {
  return useQuery({
    queryKey: ['obras-sociales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obras_sociales')
        .select('*')
        .eq('activa', true)
        .order('nombre');

      if (error) throw error;
      return data as ObraSocial[];
    },
  });
};
