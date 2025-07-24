
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  matricula: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  especialidad_id?: number;
  activo: boolean;
  especialidades?: {
    id: number;
    nombre: string;
  };
}

export interface MedicoFormData {
  nombre: string;
  apellido: string;
  dni: string;
  matricula: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  especialidad_id?: number;
}

export const useMedicos = () => {
  return useQuery({
    queryKey: ['medicos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicos')
        .select(`
          *,
          especialidades:especialidad_id(id, nombre)
        `)
        .eq('activo', true)
        .order('apellido');

      if (error) throw error;
      return data as Medico[];
    },
  });
};

export const useCreateMedico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (medicoData: MedicoFormData) => {
      const { data, error } = await supabase
        .from('medicos')
        .insert([medicoData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
      toast({
        title: "Médico creado",
        description: "El médico se ha creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al crear médico: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMedico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MedicoFormData> }) => {
      const { error } = await supabase
        .from('medicos')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
      toast({
        title: "Médico actualizado",
        description: "Los datos del médico se han actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar médico: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMedico = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (medicoId: number) => {
      const { error } = await supabase
        .from('medicos')
        .update({ activo: false })
        .eq('id', medicoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicos'] });
      toast({
        title: "Médico eliminado",
        description: "El médico se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al eliminar médico: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
