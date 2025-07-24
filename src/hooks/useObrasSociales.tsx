import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ObraSocial {
  id: number;
  nombre: string;
  codigo?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activa: boolean;
}

export interface ObraSocialFormData {
  nombre: string;
  codigo?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export const useObrasSociales = () => {
  return useQuery({
    queryKey: ['obras-sociales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obras_sociales')
        .select('*')
        .order('nombre');

      if (error) throw error;
      return data as ObraSocial[];
    },
  });
};

export const useCreateObraSocial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (obraSocialData: ObraSocialFormData) => {
      const { data, error } = await supabase
        .from('obras_sociales')
        .insert([obraSocialData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras-sociales'] });
      toast({
        title: "Obra Social creada",
        description: "La obra social se ha creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al crear obra social: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateObraSocial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ObraSocialFormData & { activa: boolean }> }) => {
      const { error } = await supabase
        .from('obras_sociales')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras-sociales'] });
      toast({
        title: "Obra Social actualizada",
        description: "Los datos de la obra social se han actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar obra social: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteObraSocial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (obraSocialId: number) => {
      const { error } = await supabase
        .from('obras_sociales')
        .delete()
        .eq('id', obraSocialId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras-sociales'] });
      toast({
        title: "Obra Social eliminada",
        description: "La obra social se ha eliminado permanentemente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al eliminar obra social: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
