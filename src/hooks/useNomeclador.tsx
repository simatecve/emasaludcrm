
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Nomenclador {
  id: number;
  codigo_practica: string;
  descripcion_practica: string;
  modulo: string;
  valor_resultante_unidades?: number;
}

export const useNomeclador = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['nomenclador', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('nomeclador')
        .select('*')
        .order('codigo_practica');

      if (searchTerm && searchTerm.trim() !== '') {
        query = query.or(`codigo_practica.ilike.%${searchTerm}%,descripcion_practica.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as Nomenclador[];
    },
    enabled: true,
  });
};

export const useNomecladorById = (id: number) => {
  return useQuery({
    queryKey: ['nomenclador', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nomeclador')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Nomenclador;
    },
    enabled: !!id,
  });
};
