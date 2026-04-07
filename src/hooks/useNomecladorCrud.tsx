
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NomecladorFormData {
  codigo_practica: string;
  descripcion_practica: string;
  valor_resultante_unidades?: string;
}

export const useNomecladorCrud = () => {
  return useQuery({
    queryKey: ['nomeclador'],
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
      const { data: result, error } = await supabase
        .from('nomeclador')
        .insert([data as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomeclador'] });
      toast({ title: "Éxito", description: "Nomenclador creado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Error al crear el nomenclador: " + error.message, variant: "destructive" });
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
        .update(data as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomeclador'] });
      toast({ title: "Éxito", description: "Nomenclador actualizado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Error al actualizar el nomenclador: " + error.message, variant: "destructive" });
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
      queryClient.invalidateQueries({ queryKey: ['nomeclador'] });
      toast({ title: "Éxito", description: "Nomenclador eliminado correctamente" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Error al eliminar el nomenclador: " + error.message, variant: "destructive" });
    },
  });
};

export const useDeleteAllNomeclador = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('nomeclador')
        .delete()
        .neq('id', 0); // delete all rows
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomeclador'] });
      toast({ title: "Éxito", description: "Todos los registros del nomenclador han sido eliminados" });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Error al eliminar el nomenclador: " + error.message, variant: "destructive" });
    },
  });
};

export const useBulkCreateNomeclador = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (items: NomecladorFormData[]) => {
      // Insert in batches of 100
      const BATCH = 100;
      let total = 0;
      for (let i = 0; i < items.length; i += BATCH) {
        const batch = items.slice(i, i + BATCH);
        const { error } = await supabase
          .from('nomeclador')
          .insert(batch as any[]);
        if (error) throw error;
        total += batch.length;
      }
      return total;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['nomeclador'] });
      toast({ title: "Éxito", description: `${count} registros importados correctamente` });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Error al importar nomenclador: " + error.message, variant: "destructive" });
    },
  });
};
