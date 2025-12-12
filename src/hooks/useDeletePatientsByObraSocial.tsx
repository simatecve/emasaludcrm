import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeletePatientsByObraSocial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (obraSocialId: number) => {
      const { data, error } = await supabase
        .from('pacientes')
        .update({ activo: false })
        .eq('obra_social_id', obraSocialId)
        .eq('activo', true)
        .select('id');

      if (error) throw error;
      return data?.length || 0;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Pacientes eliminados",
        description: `Se eliminaron ${count} pacientes exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al eliminar pacientes: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
