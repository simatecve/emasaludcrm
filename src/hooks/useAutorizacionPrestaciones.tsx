
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AutorizacionPrestacion {
  id: number;
  autorizacion_id: number;
  prestacion_codigo: string;
  prestacion_descripcion: string;
  cantidad: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface AutorizacionPrestacionFormData {
  prestacion_codigo: string;
  prestacion_descripcion: string;
  cantidad: number;
  observaciones?: string;
}

export const useAutorizacionPrestaciones = (autorizacionId?: number) => {
  return useQuery({
    queryKey: ['autorizacion-prestaciones', autorizacionId],
    queryFn: async () => {
      if (!autorizacionId) return [];
      
      const { data, error } = await supabase
        .from('autorizacion_prestaciones')
        .select('*')
        .eq('autorizacion_id', autorizacionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as AutorizacionPrestacion[];
    },
    enabled: !!autorizacionId,
  });
};

export const useCreateAutorizacionPrestaciones = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      autorizacionId, 
      prestaciones 
    }: { 
      autorizacionId: number; 
      prestaciones: AutorizacionPrestacionFormData[] 
    }) => {
      console.log('Creating prestaciones for authorization:', autorizacionId, prestaciones);

      const prestacionesData = prestaciones.map(prestacion => ({
        autorizacion_id: autorizacionId,
        ...prestacion
      }));

      const { data, error } = await supabase
        .from('autorizacion_prestaciones')
        .insert(prestacionesData)
        .select();

      if (error) {
        console.error('Insert prestaciones error:', error);
        throw error;
      }

      console.log('Prestaciones created successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['autorizacion-prestaciones'] });
      queryClient.invalidateQueries({ queryKey: ['autorizacion-prestaciones', variables.autorizacionId] });
      toast({
        title: "Prestaciones agregadas",
        description: "Las prestaciones se han agregado exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error('Create prestaciones mutation error:', error);
      toast({
        title: "Error",
        description: `Error al agregar prestaciones: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAutorizacionPrestaciones = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      autorizacionId, 
      prestaciones 
    }: { 
      autorizacionId: number; 
      prestaciones: AutorizacionPrestacionFormData[] 
    }) => {
      console.log('Updating prestaciones for authorization:', autorizacionId, prestaciones);

      // Primero eliminar todas las prestaciones existentes
      const { error: deleteError } = await supabase
        .from('autorizacion_prestaciones')
        .delete()
        .eq('autorizacion_id', autorizacionId);

      if (deleteError) {
        console.error('Delete prestaciones error:', deleteError);
        throw deleteError;
      }

      // Luego insertar las nuevas prestaciones
      if (prestaciones.length > 0) {
        const prestacionesData = prestaciones.map(prestacion => ({
          autorizacion_id: autorizacionId,
          ...prestacion
        }));

        const { data, error } = await supabase
          .from('autorizacion_prestaciones')
          .insert(prestacionesData)
          .select();

        if (error) {
          console.error('Insert new prestaciones error:', error);
          throw error;
        }

        console.log('Prestaciones updated successfully:', data);
        return data;
      }

      return [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['autorizacion-prestaciones'] });
      queryClient.invalidateQueries({ queryKey: ['autorizacion-prestaciones', variables.autorizacionId] });
      toast({
        title: "Prestaciones actualizadas",
        description: "Las prestaciones se han actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error('Update prestaciones mutation error:', error);
      toast({
        title: "Error",
        description: `Error al actualizar prestaciones: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
