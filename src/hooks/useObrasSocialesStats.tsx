
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

      // Run both queries in parallel
      const [obrasRes, consultasRes] = await Promise.all([
        supabase
          .from('obras_sociales')
          .select('id, nombre, pacientes:pacientes(count)')
          .eq('activa', true)
          .eq('pacientes.activo', true),
        supabase
          .from('consultas')
          .select('id, pacientes:paciente_id(obra_social_id)')
          .gte('fecha_consulta', startOfMonth)
          .lte('fecha_consulta', endOfMonth),
      ]);

      if (obrasRes.error) throw obrasRes.error;
      if (consultasRes.error) throw consultasRes.error;

      const stats: ObraSocialStat[] = obrasRes.data?.map(obra => {
        const consultasCount = consultasRes.data?.filter(c => 
          c.pacientes?.obra_social_id === obra.id
        ).length || 0;

        return {
          nombre: obra.nombre,
          pacientes: obra.pacientes?.[0]?.count || 0,
          consultas: consultasCount
        };
      })
      .sort((a, b) => b.consultas - a.consultas) || [];

      return stats;
    },
  });
};
