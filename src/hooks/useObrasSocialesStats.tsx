
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ObraSocialStat {
  nombre: string;
  pacientes: number;
  consultas: number;
}

export const useObrasSocialesStats = () => {
  return useQuery({
    queryKey: ['obras-sociales-stats'],
    queryFn: async () => {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

      console.log('Fetching obras sociales stats for month:', { startOfMonth, endOfMonth });

      // Obtener obras sociales con conteo de pacientes
      const { data: obrasSociales, error: obrasError } = await supabase
        .from('obras_sociales')
        .select(`
          id,
          nombre,
          pacientes:pacientes(count)
        `)
        .eq('activa', true)
        .eq('pacientes.activo', true);

      if (obrasError) {
        console.error('Error fetching obras sociales:', obrasError);
        throw obrasError;
      }

      // Obtener consultas del mes por obra social
      const { data: consultas, error: consultasError } = await supabase
        .from('consultas')
        .select(`
          id,
          pacientes:paciente_id(obra_social_id)
        `)
        .gte('fecha_consulta', startOfMonth)
        .lte('fecha_consulta', endOfMonth);

      if (consultasError) {
        console.error('Error fetching consultas:', consultasError);
        throw consultasError;
      }

      // Procesar datos
      const stats: ObraSocialStat[] = obrasSociales?.map(obra => {
        const consultasCount = consultas?.filter(c => 
          c.pacientes?.obra_social_id === obra.id
        ).length || 0;

        return {
          nombre: obra.nombre,
          pacientes: obra.pacientes?.[0]?.count || 0,
          consultas: consultasCount
        };
      }).slice(0, 5) || []; // Top 5

      console.log('Obras sociales stats:', stats);
      return stats;
    },
  });
};
