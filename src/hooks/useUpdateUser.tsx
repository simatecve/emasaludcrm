
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateUserData {
  username?: string;
  full_name?: string;
  email?: string;
}

export const useUpdateUser = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Actualizar email en Supabase Auth si se proporciona
      if (userData.email && userData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: userData.email
        });
        
        if (emailError) throw emailError;
      }

      // Actualizar datos en la tabla users
      const { data, error } = await supabase
        .from('users')
        .update({
          username: userData.username,
          full_name: userData.full_name,
          email: userData.email
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Los datos del usuario se han actualizado correctamente",
      });
      
      // Invalidar las consultas relacionadas con el usuario
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el perfil",
        variant: "destructive",
      });
    },
  });
};
