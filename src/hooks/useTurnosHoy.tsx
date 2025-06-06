
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TurnoHoy {
  id: number;
  hora: string;
  estado: string;
  pacientes: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  medicos: {
    nombre: string;
    apellido: string;
    especialidades?: {
      nombre: string;
    };
  };
}

export const useTurnosHoy = () => {
  return useQuery({
    queryKey: ['turnos-hoy'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('turnos')
        .select(`
          id,
          hora,
          estado,
          pacientes:paciente_id(nombre, apellido, dni),
          medicos:medico_id(nombre, apellido, especialidades:especialidad_id(nombre))
        `)
        .eq('fecha', today)
        .order('hora');

      if (error) {
        console.error('Error fetching turnos hoy:', error);
        throw error;
      }

      console.log('Turnos hoy:', data);
      return data as TurnoHoy[];
    },
  });
};
