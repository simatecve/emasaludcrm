
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

export interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

export const useConsultasReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['consultas-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('consultas')
        .select(`
          id,
          fecha_consulta,
          motivo,
          diagnostico,
          precio,
          medico,
          pacientes:paciente_id(nombre, apellido, dni, obras_sociales:obra_social_id(nombre))
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

      const report: ConsultaReport[] = data?.map(consulta => ({
        id: consulta.id,
        fecha_consulta: consulta.fecha_consulta,
        motivo: consulta.motivo || '',
        diagnostico: consulta.diagnostico || '',
        precio: consulta.precio || 0,
        medico: consulta.medico || '',
        paciente: {
          nombre: consulta.pacientes?.nombre || '',
          apellido: consulta.pacientes?.apellido || '',
          dni: consulta.pacientes?.dni || '',
        },
        obra_social: consulta.pacientes?.obras_sociales?.nombre || 'Sin obra social'
      })) || [];

      console.log('Consultas report:', report);
      return report;
    },
  });
};

export const useTurnosReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['turnos-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('turnos')
        .select(`
          id,
          fecha,
          hora,
          estado,
          motivo,
          pacientes:paciente_id(nombre, apellido, dni),
          medicos:medico_id(nombre, apellido, especialidades:especialidad_id(nombre))
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

      const report: TurnoReport[] = data?.map(turno => ({
        id: turno.id,
        fecha: turno.fecha,
        hora: turno.hora,
        estado: turno.estado,
        motivo: turno.motivo || '',
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

      console.log('Turnos report:', report);
      return report;
    },
  });
};

export const useRevenueReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['revenue-report', filters],
    queryFn: async () => {
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

      console.log('Revenue report:', { totalRevenue, consultasCount, averagePrice, revenueByObraSocial });
      
      return {
        totalRevenue,
        consultasCount,
        averagePrice,
        revenueByObraSocial
      };
    },
  });
};

export const useChartData = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['chart-data', filters],
    queryFn: async () => {
      // Datos para gráfico de turnos por estado
      const { data: turnosData } = await supabase
        .from('turnos')
        .select('estado')
        .gte('fecha', filters.fechaInicio || '2024-01-01')
        .lte('fecha', filters.fechaFin || new Date().toISOString().split('T')[0]);

      const turnosPorEstado: ChartData[] = (turnosData || []).reduce((acc, turno) => {
        const existing = acc.find(item => item.name === turno.estado);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({
            name: turno.estado,
            value: 1,
            fill: turno.estado === 'completado' ? '#10b981' : 
                  turno.estado === 'programado' ? '#f59e0b' : '#ef4444'
          });
        }
        return acc;
      }, [] as ChartData[]);

      // Datos para gráfico de consultas por mes
      const { data: consultasData } = await supabase
        .from('consultas')
        .select('fecha_consulta, precio')
        .gte('fecha_consulta', filters.fechaInicio || '2024-01-01')
        .lte('fecha_consulta', filters.fechaFin || new Date().toISOString());

      const consultasPorMes: ChartData[] = (consultasData || []).reduce((acc, consulta) => {
        const fecha = new Date(consulta.fecha_consulta);
        const mes = fecha.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.name === mes);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: mes, value: 1 });
        }
        return acc;
      }, [] as ChartData[]);

      return {
        turnosPorEstado,
        consultasPorMes
      };
    },
  });
};
