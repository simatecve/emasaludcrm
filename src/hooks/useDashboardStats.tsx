
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

      // Total pacientes (incluyendo activos e inactivos)
      const { data: pacientes, error: pacientesError } = await supabase
        .from('pacientes')
        .select('id', { count: 'exact' });

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

      // Consultas del mes (autorizaciones con tipo "consulta" o prestación "Consulta")
      const { data: autorizacionesConsulta, error: consultasMesError } = await supabase
        .from('autorizaciones')
        .select('id, tipo_autorizacion, autorizacion_prestaciones(prestacion_descripcion)')
        .gte('fecha_solicitud', startOfMonth)
        .lte('fecha_solicitud', endOfMonth);

      if (consultasMesError) {
        console.error('Error fetching consultas mes:', consultasMesError);
        throw consultasMesError;
      }

      // Filtrar autorizaciones que son de tipo "consulta" o tienen prestaciones de consulta
      const consultasMes = autorizacionesConsulta?.filter(auth => {
        if (auth.tipo_autorizacion?.toLowerCase() === 'consulta') return true;
        if (Array.isArray(auth.autorizacion_prestaciones)) {
          return auth.autorizacion_prestaciones.some(
            (p: any) => p.prestacion_descripcion?.toLowerCase().includes('consulta')
          );
        }
        return false;
      }) || [];

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
