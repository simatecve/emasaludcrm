
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Diagnostico {
  id: number;
  paciente_id: number;
  fecha_diagnostico: string;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
  medico_tratante?: string;
  estado: 'activo' | 'resuelto' | 'en_tratamiento';
  created_at: string;
  updated_at: string;
}

export interface DiagnosticoFormData {
  paciente_id: number;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
  medico_tratante?: string;
  estado: 'activo' | 'resuelto' | 'en_tratamiento';
}

export const useDiagnosticos = (pacienteId?: number) => {
  return useQuery({
    queryKey: ['diagnosticos', pacienteId],
    queryFn: async () => {
      let query = supabase
        .from('diagnosticos')
        .select('*')
        .order('fecha_diagnostico', { ascending: false });

      if (pacienteId) {
        query = query.eq('paciente_id', pacienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Diagnostico[];
    },
  });
};

export const useCreateDiagnostico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (diagnosticoData: DiagnosticoFormData) => {
      const { data, error } = await supabase
        .from('diagnosticos')
        .insert([diagnosticoData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
      toast({
        title: "Diagnóstico creado",
        description: "El diagnóstico se ha creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al crear diagnóstico: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDiagnostico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DiagnosticoFormData> }) => {
      const { error } = await supabase
        .from('diagnosticos')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
      toast({
        title: "Diagnóstico actualizado",
        description: "El diagnóstico se ha actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar diagnóstico: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteDiagnostico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (diagnosticoId: number) => {
      const { error } = await supabase
        .from('diagnosticos')
        .delete()
        .eq('id', diagnosticoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnosticos'] });
      toast({
        title: "Diagnóstico eliminado",
        description: "El diagnóstico se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al eliminar diagnóstico: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
