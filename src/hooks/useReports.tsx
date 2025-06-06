
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReportFilters {
  fechaInicio?: string;
  fechaFin?: string;
  medicoId?: number;
  especialidadId?: number;
  obraSocialId?: number;
  pacienteId?: number;
}

export interface ConsultaReport {
  id: number;
  fecha_consulta: string;
  motivo: string;
  diagnostico: string;
  precio: number;
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  medico: string;
  obra_social?: string;
}

export interface TurnoReport {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  motivo: string;
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  medico: {
    nombre: string;
    apellido: string;
  };
  especialidad?: string;
}

export const useConsultasReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['consultas-report', filters],
    queryFn: async () => {
      console.log('Fetching consultas report with filters:', filters);
      
      let query = supabase
        .from('consultas')
        .select(`
          id,
          fecha_consulta,
          motivo,
          diagnostico,
          precio,
          medico,
          pacientes:paciente_id(
            nombre, 
            apellido, 
            dni, 
            obras_sociales:obra_social_id(nombre)
          )
        `)
        .order('fecha_consulta', { ascending: false });

      if (filters.fechaInicio) {
        query = query.gte('fecha_consulta', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('fecha_consulta', filters.fechaFin);
      }
      if (filters.pacienteId) {
        query = query.eq('paciente_id', filters.pacienteId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching consultas report:', error);
        throw error;
      }

      console.log('Raw consultas data:', data);

      const report: ConsultaReport[] = data?.map(consulta => ({
        id: consulta.id,
        fecha_consulta: consulta.fecha_consulta,
        motivo: consulta.motivo || 'Sin motivo especificado',
        diagnostico: consulta.diagnostico || 'Sin diagnóstico',
        precio: consulta.precio || 0,
        medico: consulta.medico || 'Sin médico asignado',
        paciente: {
          nombre: consulta.pacientes?.nombre || '',
          apellido: consulta.pacientes?.apellido || '',
          dni: consulta.pacientes?.dni || '',
        },
        obra_social: consulta.pacientes?.obras_sociales?.nombre || 'Sin obra social'
      })) || [];

      console.log('Processed consultas report:', report);
      return report;
    },
  });
};

export const useTurnosReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['turnos-report', filters],
    queryFn: async () => {
      console.log('Fetching turnos report with filters:', filters);
      
      let query = supabase
        .from('turnos')
        .select(`
          id,
          fecha,
          hora,
          estado,
          motivo,
          pacientes:paciente_id(nombre, apellido, dni),
          medicos:medico_id(
            nombre, 
            apellido, 
            especialidades:especialidad_id(nombre)
          )
        `)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false });

      if (filters.fechaInicio) {
        query = query.gte('fecha', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('fecha', filters.fechaFin);
      }
      if (filters.medicoId) {
        query = query.eq('medico_id', filters.medicoId);
      }
      if (filters.pacienteId) {
        query = query.eq('paciente_id', filters.pacienteId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching turnos report:', error);
        throw error;
      }

      console.log('Raw turnos data:', data);

      const report: TurnoReport[] = data?.map(turno => ({
        id: turno.id,
        fecha: turno.fecha,
        hora: turno.hora,
        estado: turno.estado,
        motivo: turno.motivo || 'Sin motivo especificado',
        paciente: {
          nombre: turno.pacientes?.nombre || '',
          apellido: turno.pacientes?.apellido || '',
          dni: turno.pacientes?.dni || '',
        },
        medico: {
          nombre: turno.medicos?.nombre || '',
          apellido: turno.medicos?.apellido || '',
        },
        especialidad: turno.medicos?.especialidades?.nombre || 'Sin especialidad'
      })) || [];

      console.log('Processed turnos report:', report);
      return report;
    },
  });
};

export const useRevenueReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['revenue-report', filters],
    queryFn: async () => {
      console.log('Fetching revenue report with filters:', filters);
      
      let query = supabase
        .from('consultas')
        .select(`
          fecha_consulta,
          precio,
          medico,
          pacientes:paciente_id(obras_sociales:obra_social_id(nombre))
        `)
        .not('precio', 'is', null)
        .order('fecha_consulta', { ascending: false });

      if (filters.fechaInicio) {
        query = query.gte('fecha_consulta', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('fecha_consulta', filters.fechaFin);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching revenue report:', error);
        throw error;
      }

      console.log('Raw revenue data:', data);

      const totalRevenue = data?.reduce((sum, consulta) => sum + (consulta.precio || 0), 0) || 0;
      const consultasCount = data?.length || 0;
      const averagePrice = consultasCount > 0 ? totalRevenue / consultasCount : 0;

      // Agrupar por obra social
      const revenueByObraSocial = data?.reduce((acc, consulta) => {
        const obraSocial = consulta.pacientes?.obras_sociales?.nombre || 'Sin obra social';
        if (!acc[obraSocial]) {
          acc[obraSocial] = { total: 0, count: 0 };
        }
        acc[obraSocial].total += consulta.precio || 0;
        acc[obraSocial].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>) || {};

      const result = {
        totalRevenue,
        consultasCount,
        averagePrice,
        revenueByObraSocial
      };

      console.log('Processed revenue report:', result);
      return result;
    },
  });
};

export const usePeriodStats = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['period-stats', filters],
    queryFn: async () => {
      console.log('Fetching period stats with filters:', filters);
      
      const startDate = filters.fechaInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = filters.fechaFin || new Date().toISOString().split('T')[0];

      // Consultas del período
      const { data: consultas } = await supabase
        .from('consultas')
        .select('id, precio, fecha_consulta')
        .gte('fecha_consulta', startDate)
        .lte('fecha_consulta', endDate);

      // Turnos del período
      const { data: turnos } = await supabase
        .from('turnos')
        .select('id, estado, fecha')
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      // Nuevos pacientes del período
      const { data: nuevosPacientes } = await supabase
        .from('pacientes')
        .select('id')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('activo', true);

      const stats = {
        totalConsultas: consultas?.length || 0,
        totalTurnos: turnos?.length || 0,
        turnosCompletados: turnos?.filter(t => t.estado === 'completado').length || 0,
        turnosCancelados: turnos?.filter(t => t.estado === 'cancelado').length || 0,
        nuevosPacientes: nuevosPacientes?.length || 0,
        ingresosTotales: consultas?.reduce((sum, c) => sum + (c.precio || 0), 0) || 0
      };

      console.log('Period stats:', stats);
      return stats;
    },
  });
};

export const useChartsData = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['charts-data', filters],
    queryFn: async () => {
      console.log('Fetching charts data with filters:', filters);
      
      const startDate = filters.fechaInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endDate = filters.fechaFin || new Date().toISOString().split('T')[0];

      // Consultas por día
      const { data: consultasDiarias } = await supabase
        .from('consultas')
        .select('fecha_consulta, precio')
        .gte('fecha_consulta', startDate)
        .lte('fecha_consulta', endDate)
        .order('fecha_consulta');

      // Turnos por estado
      const { data: turnosEstado } = await supabase
        .from('turnos')
        .select('estado')
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      // Agrupar consultas por día
      const consultasPorDia = consultasDiarias?.reduce((acc, consulta) => {
        const fecha = new Date(consulta.fecha_consulta).toLocaleDateString('es-AR');
        if (!acc[fecha]) {
          acc[fecha] = { fecha, consultas: 0, ingresos: 0 };
        }
        acc[fecha].consultas += 1;
        acc[fecha].ingresos += consulta.precio || 0;
        return acc;
      }, {} as Record<string, { fecha: string; consultas: number; ingresos: number }>) || {};

      // Agrupar turnos por estado
      const turnosPorEstado = turnosEstado?.reduce((acc, turno) => {
        if (!acc[turno.estado]) {
          acc[turno.estado] = 0;
        }
        acc[turno.estado] += 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        consultasPorDia: Object.values(consultasPorDia),
        turnosPorEstado: Object.entries(turnosPorEstado).map(([estado, count]) => ({
          estado,
          count
        }))
      };
    },
  });
};
