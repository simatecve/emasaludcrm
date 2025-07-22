
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'usuario_normal' | 'prestador';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  full_name: string;
  role: 'admin' | 'usuario_normal' | 'prestador';
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as User[];
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Crear perfil en users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          username: userData.username,
          full_name: userData.full_name,
          role: userData.role,
          password_hash: 'managed_by_auth'
        }]);

      if (userError) throw userError;

      // Crear log de auditoría
      await (supabase as any).rpc('create_audit_log', {
        p_action: 'CREATE_USER',
        p_table_name: 'users',
        p_record_id: authData.user.id,
        p_new_values: { email: userData.email, username: userData.username, full_name: userData.full_name, role: userData.role }
      });

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Error al crear usuario: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Crear log de auditoría
      await (supabase as any).rpc('create_audit_log', {
        p_action: 'UPDATE_USER',
        p_table_name: 'users',
        p_record_id: id,
        p_new_values: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Error al actualizar usuario: " + error.message,
        variant: "destructive",
      });
    },
  });
};
