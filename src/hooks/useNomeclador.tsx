
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Nomenclador {
  id: number;
  codigo_practica: string;
  descripcion_practica: string;
  valor_resultante_unidades: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useNomeclador = () => {
  return useQuery({
    queryKey: ['nomeclador'],
    queryFn: async () => {
      // Remover límite para obtener todos los registros
      const { data, error } = await supabase
        .from('nomeclador')
        .select('*')
        .order('codigo_practica');

      if (error) throw error;
      return data as Nomenclador[];
    },
  });
};

export const useNomecladorSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: ['nomeclador-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from('nomeclador')
        .select('*')
        .or(`codigo_practica.ilike.%${searchTerm}%,descripcion_practica.ilike.%${searchTerm}%`)
        .order('codigo_practica')
        .limit(50); // Mantener límite solo para búsquedas específicas

      if (error) throw error;
      return data as Nomenclador[];
    },
    enabled: searchTerm.trim().length > 0,
  });
};
