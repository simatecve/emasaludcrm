import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Credencial {
  id: string;
  paciente_id: number;
  numero_credencial: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: 'activa' | 'vencida' | 'suspendida';
  observaciones?: string;
  created_at: string;
  updated_at: string;
  paciente?: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    numero_afiliado?: string;
    obra_social?: {
      nombre: string;
    };
  };
}

export interface CredencialFormData {
  paciente_id: number;
  numero_credencial: string;
  fecha_vencimiento: string;
  estado?: 'activa' | 'vencida' | 'suspendida';
  observaciones?: string;
}

// Helper function to get last day of current month
const getLastDayOfMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  return lastDay.toISOString().split('T')[0];
};

export const useCredenciales = () => {
  return useQuery({
    queryKey: ['credenciales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credenciales')
        .select(`
          *,
          paciente:pacientes(
            id,
            nombre,
            apellido,
            dni,
            numero_afiliado,
            obra_social:obras_sociales(nombre)
          )
        `)
        .eq('estado', 'activa')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCredencialByPaciente = (pacienteId: number | null) => {
  return useQuery({
    queryKey: ['credencial-paciente', pacienteId],
    queryFn: async () => {
      if (!pacienteId) return null;
      
      const { data, error } = await supabase
        .from('credenciales')
        .select(`
          *,
          paciente:pacientes(
            id,
            nombre,
            apellido,
            dni,
            numero_afiliado,
            obra_social:obras_sociales(nombre)
          )
        `)
        .eq('paciente_id', pacienteId)
        .eq('estado', 'activa')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as any;
    },
    enabled: !!pacienteId,
  });
};

export const useCreateCredencial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CredencialFormData) => {
      // Generate credential number if not provided
      const numeroCredencial = data.numero_credencial || `CRED-${Date.now()}`;
      
      // Set expiration to last day of current month if not provided
      const fechaVencimiento = data.fecha_vencimiento || getLastDayOfMonth();
      
      const { data: credencial, error } = await supabase
        .from('credenciales')
        .insert({
          paciente_id: data.paciente_id,
          numero_credencial: numeroCredencial,
          fecha_vencimiento: fechaVencimiento,
          estado: data.estado || 'activa',
          observaciones: data.observaciones,
        })
        .select()
        .single();

      if (error) throw error;
      return credencial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credenciales'] });
      queryClient.invalidateQueries({ queryKey: ['credencial-paciente'] });
      toast({
        title: 'Credencial creada',
        description: 'La credencial ha sido creada exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo crear la credencial.',
        variant: 'destructive',
      });
      console.error('Error creating credencial:', error);
    },
  });
};

export const useUpdateCredencial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CredencialFormData> }) => {
      const { data: credencial, error } = await supabase
        .from('credenciales')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return credencial;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credenciales'] });
      queryClient.invalidateQueries({ queryKey: ['credencial-paciente'] });
      toast({
        title: 'Credencial actualizada',
        description: 'La credencial ha sido actualizada exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la credencial.',
        variant: 'destructive',
      });
      console.error('Error updating credencial:', error);
    },
  });
};

export const useDeleteCredencial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Instead of deleting, we update the status to 'suspendida'
      const { error } = await supabase
        .from('credenciales')
        .update({ estado: 'suspendida' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credenciales'] });
      queryClient.invalidateQueries({ queryKey: ['credencial-paciente'] });
      toast({
        title: 'Credencial eliminada',
        description: 'La credencial ha sido suspendida exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la credencial.',
        variant: 'destructive',
      });
      console.error('Error deleting credencial:', error);
    },
  });
};