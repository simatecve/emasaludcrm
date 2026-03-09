
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

      // Run all queries in parallel
      const [pacientesRes, turnosHoyRes, consultasRes, autorizacionesRes] = await Promise.all([
        // Total pacientes - count only
        supabase.from('pacientes').select('*', { count: 'exact', head: true }),
        // Turnos de hoy
        supabase.from('turnos').select('id, estado').eq('fecha', today),
        // Consultas del mes
        supabase.from('autorizaciones')
          .select('id, tipo_autorizacion, autorizacion_prestaciones(prestacion_descripcion)')
          .gte('fecha_solicitud', startOfMonth)
          .lte('fecha_solicitud', endOfMonth),
        // Autorizaciones pendientes - count only
        supabase.from('autorizaciones').select('*', { count: 'exact', head: true })
          .eq('estado', 'pendiente').eq('activa', true),
      ]);

      if (pacientesRes.error) throw pacientesRes.error;
      if (turnosHoyRes.error) throw turnosHoyRes.error;
      if (consultasRes.error) throw consultasRes.error;
      if (autorizacionesRes.error) throw autorizacionesRes.error;

      const consultasMes = consultasRes.data?.filter(auth => {
        if (auth.tipo_autorizacion?.toLowerCase() === 'consulta') return true;
        if (Array.isArray(auth.autorizacion_prestaciones)) {
          return auth.autorizacion_prestaciones.some(
            (p: any) => p.prestacion_descripcion?.toLowerCase().includes('consulta')
          );
        }
        return false;
      }) || [];

      const turnosPendientesHoy = turnosHoyRes.data?.filter(t => t.estado === 'programado').length || 0;

      return {
        totalPacientes: pacientesRes.count || 0,
        turnosHoy: turnosHoyRes.data?.length || 0,
        consultasMes: consultasMes.length,
        autorizacionesPendientes: autorizacionesRes.count || 0,
        turnosPendientesHoy
      } as DashboardStats;
    },
  });
};
