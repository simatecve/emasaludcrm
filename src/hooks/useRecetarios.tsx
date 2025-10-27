import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export interface RecetarioEmitido {
  id: string;
  paciente_id: number;
  obra_social_id: number;
  tipo_recetario: number;
  fecha_emision: string;
  mes_control: string;
  observaciones: string | null;
  created_at: string;
  pacientes?: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  obras_sociales?: {
    nombre: string;
  };
  recetarios_tipos?: {
    nombre: string;
  };
}

export interface RecetarioConfig {
  id: number;
  obra_social_id: number;
  tipo_recetario: number;
  activo: boolean;
}

// Hook para obtener la configuración de recetario de una obra social
export const useRecetarioConfig = (obraSocialId: number | null) => {
  return useQuery({
    queryKey: ['recetario-config', obraSocialId],
    queryFn: async () => {
      if (!obraSocialId) return null;

      const { data, error } = await supabase
        .from('recetarios_obra_social_config')
        .select('*')
        .eq('obra_social_id', obraSocialId)
        .eq('activo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as RecetarioConfig | null;
    },
    enabled: !!obraSocialId,
  });
};

// Hook para verificar el límite mensual de recetarios
export const useRecetariosDelMes = (pacienteId: number | null) => {
  const mesActual = format(new Date(), 'yyyy-MM');

  return useQuery({
    queryKey: ['recetarios-mes', pacienteId, mesActual],
    queryFn: async () => {
      if (!pacienteId) return [];

      const { data, error } = await supabase
        .from('recetarios_emitidos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('mes_control', mesActual)
        .order('fecha_emision', { ascending: false });

      if (error) throw error;
      return data as RecetarioEmitido[];
    },
    enabled: !!pacienteId,
  });
};

// Hook para obtener todos los recetarios emitidos
export const useRecetarios = () => {
  return useQuery({
    queryKey: ['recetarios-emitidos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recetarios_emitidos')
        .select(`
          *,
          pacientes (nombre, apellido, dni),
          obras_sociales (nombre),
          recetarios_tipos (nombre)
        `)
        .order('fecha_emision', { ascending: false });

      if (error) throw error;
      return data as RecetarioEmitido[];
    },
  });
};

// Hook para emitir un nuevo recetario
export const useEmitirRecetario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      paciente_id: number;
      obra_social_id: number;
      tipo_recetario: number;
      observaciones?: string;
    }) => {
      const mesControl = format(new Date(), 'yyyy-MM');

      const { data: result, error } = await supabase
        .from('recetarios_emitidos')
        .insert([{
          ...data,
          mes_control: mesControl,
          fecha_emision: format(new Date(), 'yyyy-MM-dd'),
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recetarios-emitidos'] });
      queryClient.invalidateQueries({ queryKey: ['recetarios-mes'] });
      toast({
        title: "Recetario emitido",
        description: "El recetario se ha emitido exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al emitir recetario: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

// Hook para eliminar un recetario
export const useDeleteRecetario = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (recetarioId: string) => {
      const { error } = await supabase
        .from('recetarios_emitidos')
        .delete()
        .eq('id', recetarioId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recetarios-emitidos'] });
      queryClient.invalidateQueries({ queryKey: ['recetarios-mes'] });
      toast({
        title: "Recetario eliminado",
        description: "El recetario se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al eliminar recetario: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
