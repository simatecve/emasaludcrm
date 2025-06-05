
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

export interface EspecialidadFormData {
  nombre: string;
  descripcion?: string;
}

export const useEspecialidades = () => {
  return useQuery({
    queryKey: ['especialidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('especialidades')
        .select('*')
        .eq('activa', true)
        .order('nombre');

      if (error) throw error;
      return data as Especialidad[];
    },
  });
};

export const useCreateEspecialidad = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (especialidadData: EspecialidadFormData) => {
      const { data, error } = await supabase
        .from('especialidades')
        .insert([especialidadData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['especialidades'] });
      toast({
        title: "Especialidad creada",
        description: "La especialidad se ha creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al crear especialidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEspecialidad = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EspecialidadFormData> }) => {
      const { error } = await supabase
        .from('especialidades')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['especialidades'] });
      toast({
        title: "Especialidad actualizada",
        description: "Los datos de la especialidad se han actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar especialidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEspecialidad = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (especialidadId: number) => {
      const { error } = await supabase
        .from('especialidades')
        .update({ activa: false })
        .eq('id', especialidadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['especialidades'] });
      toast({
        title: "Especialidad eliminada",
        description: "La especialidad se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al eliminar especialidad: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
