
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalPacientes: number;
  turnosHoy: number;
  consultasMes: number;
  autorizacionesPendientes: number;
  turnosPendientesHoy: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

      console.log('Fetching dashboard stats for:', { today, startOfMonth, endOfMonth });

      // Total pacientes activos
      const { data: pacientes, error: pacientesError } = await supabase
        .from('pacientes')
        .select('id')
        .eq('activo', true);

      if (pacientesError) {
        console.error('Error fetching pacientes:', pacientesError);
        throw pacientesError;
      }

      // Turnos de hoy
      const { data: turnosHoy, error: turnosHoyError } = await supabase
        .from('turnos')
        .select('id, estado')
        .eq('fecha', today);

      if (turnosHoyError) {
        console.error('Error fetching turnos hoy:', turnosHoyError);
        throw turnosHoyError;
      }

      // Consultas del mes
      const { data: consultasMes, error: consultasMesError } = await supabase
        .from('consultas')
        .select('id')
        .gte('fecha_consulta', startOfMonth)
        .lte('fecha_consulta', endOfMonth);

      if (consultasMesError) {
        console.error('Error fetching consultas mes:', consultasMesError);
        throw consultasMesError;
      }

      // Autorizaciones pendientes
      const { data: autorizaciones, error: autorizacionesError } = await supabase
        .from('autorizaciones')
        .select('id')
        .eq('estado', 'pendiente')
        .eq('activa', true);

      if (autorizacionesError) {
        console.error('Error fetching autorizaciones:', autorizacionesError);
        throw autorizacionesError;
      }

      const turnosPendientesHoy = turnosHoy?.filter(t => t.estado === 'programado').length || 0;

      const stats: DashboardStats = {
        totalPacientes: pacientes?.length || 0,
        turnosHoy: turnosHoy?.length || 0,
        consultasMes: consultasMes?.length || 0,
        autorizacionesPendientes: autorizaciones?.length || 0,
        turnosPendientesHoy
      };

      console.log('Dashboard stats:', stats);
      return stats;
    },
  });
};
