
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReportFilters {
  fechaInicio?: string;
  fechaFin?: string;
  medicoId?: number;
  especialidadId?: number;
  obraSocialId?: number;
  pacienteId?: number;
  estado?: string;
  tipoAutorizacion?: string;
  numeroAutorizacion?: string;
  prestador?: string;
  prestacionCodigo?: string;
  numeroCredencial?: string;
  parentescoBeneficiario?: string;
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

      // Filter results in memory for obra social since it's a nested relationship
      let report: ConsultaReport[] = data?.map(consulta => ({
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

      // Apply obra social filter if specified
      if (filters.obraSocialId) {
        const obraSocialQuery = await supabase
          .from('obras_sociales')
          .select('nombre')
          .eq('id', filters.obraSocialId)
          .single();
        
        if (obraSocialQuery.data) {
          const obraSocialNombre = obraSocialQuery.data.nombre;
          report = report.filter(consulta => consulta.obra_social === obraSocialNombre);
        }
      }

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

export interface AutorizacionReport {
  id: number;
  numero_autorizacion: string;
  fecha_solicitud: string;
  fecha_vencimiento: string;
  tipo_autorizacion: string;
  estado: string;
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  obra_social?: string;
  prestador?: string;
  prestacion_codigo?: string;
  prestacion_descripcion?: string;
}

export interface MedicoReport {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  matricula: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  total_turnos: number;
  total_consultas: number;
}

export interface ObraSocialReport {
  id: number;
  nombre: string;
  codigo?: string;
  telefono?: string;
  email?: string;
  activa: boolean;
  total_pacientes: number;
  total_autorizaciones: number;
}

export const useAutorizacionesReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['autorizaciones-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('autorizaciones')
        .select(`
          id,
          numero_autorizacion,
          fecha_solicitud,
          fecha_vencimiento,
          tipo_autorizacion,
          estado,
          prestador,
          prestacion_codigo,
          prestacion_descripcion,
          pacientes:paciente_id(nombre, apellido, dni, obras_sociales:obra_social_id(nombre))
        `)
        .order('fecha_solicitud', { ascending: false });

      if (filters.fechaInicio) {
        query = query.gte('fecha_solicitud', filters.fechaInicio);
      }
      if (filters.fechaFin) {
        query = query.lte('fecha_solicitud', filters.fechaFin);
      }
      if (filters.pacienteId) {
        query = query.eq('paciente_id', filters.pacienteId);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
       if (filters.tipoAutorizacion) {
         query = query.eq('tipo_autorizacion', filters.tipoAutorizacion);
       }
       if (filters.numeroAutorizacion) {
         query = query.ilike('numero_autorizacion', `%${filters.numeroAutorizacion}%`);
       }
       if (filters.prestador) {
         query = query.ilike('prestador', `%${filters.prestador}%`);
       }
       if (filters.prestacionCodigo) {
         query = query.ilike('prestacion_codigo', `%${filters.prestacionCodigo}%`);
       }
       if (filters.numeroCredencial) {
         query = query.ilike('numero_credencial', `%${filters.numeroCredencial}%`);
       }
       if (filters.parentescoBeneficiario) {
         query = query.ilike('parentesco_beneficiario', `%${filters.parentescoBeneficiario}%`);
       }

       const { data, error } = await query;

      if (error) {
        console.error('Error fetching autorizaciones report:', error);
        throw error;
      }

      // Filter results in memory for obra social since it's a nested relationship
      let report: AutorizacionReport[] = data?.map(autorizacion => ({
        id: autorizacion.id,
        numero_autorizacion: autorizacion.numero_autorizacion || '',
        fecha_solicitud: autorizacion.fecha_solicitud,
        fecha_vencimiento: autorizacion.fecha_vencimiento || '',
        tipo_autorizacion: autorizacion.tipo_autorizacion,
        estado: autorizacion.estado,
        prestador: autorizacion.prestador || '',
        prestacion_codigo: autorizacion.prestacion_codigo || '',
        prestacion_descripcion: autorizacion.prestacion_descripcion || '',
        paciente: {
          nombre: autorizacion.pacientes?.nombre || '',
          apellido: autorizacion.pacientes?.apellido || '',
          dni: autorizacion.pacientes?.dni || '',
        },
        obra_social: autorizacion.pacientes?.obras_sociales?.nombre || 'Sin obra social'
      })) || [];

      // Apply obra social filter if specified
      if (filters.obraSocialId) {
        const obraSocialQuery = await supabase
          .from('obras_sociales')
          .select('nombre')
          .eq('id', filters.obraSocialId)
          .single();
        
        if (obraSocialQuery.data) {
          const obraSocialNombre = obraSocialQuery.data.nombre;
          report = report.filter(autorizacion => autorizacion.obra_social === obraSocialNombre);
        }
      }

      return report;
    },
  });
};

export const useMedicosReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['medicos-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('medicos')
        .select(`
          id,
          nombre,
          apellido,
          dni,
          matricula,
          telefono,
          email,
          activo,
          especialidades:especialidad_id(nombre)
        `)
        .order('apellido', { ascending: true });

      const { data: medicos, error } = await query;

      if (error) {
        console.error('Error fetching medicos report:', error);
        throw error;
      }

      // Get turnos count for each medico
      const { data: turnosData } = await supabase
        .from('turnos')
        .select('medico_id');

      // Get consultas count for each medico  
      const { data: consultasData } = await supabase
        .from('consultas')
        .select('medico');

      const turnosCount = turnosData?.reduce((acc, turno) => {
        acc[turno.medico_id] = (acc[turno.medico_id] || 0) + 1;
        return acc;
      }, {} as Record<number, number>) || {};

      const consultasCount = consultasData?.reduce((acc, consulta) => {
        const medicoName = consulta.medico;
        acc[medicoName] = (acc[medicoName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const report: MedicoReport[] = medicos?.map(medico => ({
        id: medico.id,
        nombre: medico.nombre,
        apellido: medico.apellido,
        dni: medico.dni,
        matricula: medico.matricula,
        telefono: medico.telefono || '',
        email: medico.email || '',
        activo: medico.activo,
        especialidad: medico.especialidades?.nombre || 'Sin especialidad',
        total_turnos: turnosCount[medico.id] || 0,
        total_consultas: consultasCount[`${medico.nombre} ${medico.apellido}`] || 0
      })) || [];

      return report;
    },
  });
};

export const useObrasSocialesReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['obras-sociales-report', filters],
    queryFn: async () => {
      let query = supabase
        .from('obras_sociales')
        .select('*')
        .order('nombre', { ascending: true });

      const { data: obrasSociales, error } = await query;

      if (error) {
        console.error('Error fetching obras sociales report:', error);
        throw error;
      }

      // Get pacientes count for each obra social
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('obra_social_id');

      // Get autorizaciones count for each obra social
      const { data: autorizacionesData } = await supabase
        .from('autorizaciones')
        .select('obra_social_id');

      const pacientesCount = pacientesData?.reduce((acc, paciente) => {
        if (paciente.obra_social_id) {
          acc[paciente.obra_social_id] = (acc[paciente.obra_social_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>) || {};

      const autorizacionesCount = autorizacionesData?.reduce((acc, autorizacion) => {
        if (autorizacion.obra_social_id) {
          acc[autorizacion.obra_social_id] = (acc[autorizacion.obra_social_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<number, number>) || {};

      const report: ObraSocialReport[] = obrasSociales?.map(obraSocial => ({
        id: obraSocial.id,
        nombre: obraSocial.nombre,
        codigo: obraSocial.codigo || '',
        telefono: obraSocial.telefono || '',
        email: obraSocial.email || '',
        activa: obraSocial.activa,
        total_pacientes: pacientesCount[obraSocial.id] || 0,
        total_autorizaciones: autorizacionesCount[obraSocial.id] || 0
      })) || [];

      return report;
    },
  });
};
