import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Turno {
  id: number;
  paciente_id: number;
  medico_id: number;
  fecha: string;
  hora: string;
  estado: 'programado' | 'confirmado' | 'cancelado' | 'completado';
  motivo?: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  pacientes?: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  medicos?: {
    nombre: string;
    apellido: string;
    matricula: string;
    especialidades?: {
      nombre: string;
    };
  };
}

export interface TurnoFormData {
  paciente_id: number;
  medico_id: number;
  fecha: string;
  hora: string;
  estado: 'programado' | 'confirmado' | 'cancelado' | 'completado';
  motivo?: string;
  observaciones?: string;
}

export const useTurnos = () => {
  return useQuery({
    queryKey: ['turnos'],
    queryFn: async () => {
      console.log('Fetching turnos...');
      
      const { data, error } = await supabase
        .from('turnos')
        .select(`
          *,
          pacientes(nombre, apellido, dni),
          medicos(
            nombre, 
            apellido, 
            matricula,
            especialidades(nombre)
          )
        `)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true });

      if (error) {
        console.error('Error fetching turnos:', error);
        throw error;
      }

      console.log('Turnos data:', data);
      return data as Turno[];
    },
  });
};

export const useCreateTurno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: TurnoFormData) => {
      const { data: turno, error } = await supabase
        .from('turnos')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return turno;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast({
        title: 'Turno creado',
        description: 'El turno ha sido programado exitosamente.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating turno:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el turno.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTurno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TurnoFormData> }) => {
      const { data: turno, error } = await supabase
        .from('turnos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return turno;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast({
        title: 'Turno actualizado',
        description: 'El turno ha sido actualizado exitosamente.',
      });
    },
    onError: (error: any) => {
      console.error('Error updating turno:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar el turno.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTurno = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('turnos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast({
        title: 'Turno eliminado',
        description: 'El turno ha sido eliminado exitosamente.',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting turno:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar el turno.',
        variant: 'destructive',
      });
    },
  });
};
