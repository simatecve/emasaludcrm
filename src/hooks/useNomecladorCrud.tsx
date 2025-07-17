
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NomecladorFormData {
  codigo_practica: string;
  descripcion_practica: string;
  modulo: string;
  valor_resultante_unidades?: string;
}

export const useNomecladorCrud = () => {
  return useQuery({
    queryKey: ['nomenclador-crud'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nomeclador')
        .select('*')
        .order('codigo_practica');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateNomeclador = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: NomecladorFormData) => {
      const { error } = await supabase
        .from('nomeclador')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclador-crud'] });
      queryClient.invalidateQueries({ queryKey: ['nomenclador'] });
      toast({
        title: "Éxito",
        description: "Nomenclador creado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al crear el nomenclador: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateNomeclador = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: NomecladorFormData }) => {
      const { error } = await supabase
        .from('nomeclador')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclador-crud'] });
      queryClient.invalidateQueries({ queryKey: ['nomenclador'] });
      toast({
        title: "Éxito",
        description: "Nomenclador actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al actualizar el nomenclador: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteNomeclador = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('nomeclador')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclador-crud'] });
      queryClient.invalidateQueries({ queryKey: ['nomenclador'] });
      toast({
        title: "Éxito",
        description: "Nomenclador eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Error al eliminar el nomenclador: " + error.message,
        variant: "destructive",
      });
    },
  });
};
