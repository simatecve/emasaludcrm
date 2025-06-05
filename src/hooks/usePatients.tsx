
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Patient {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  obra_social_id?: number;
  numero_afiliado?: string;
  consultas_mes_actual: number;
  consultas_maximas: number;
  ultima_visita?: string;
  observaciones?: string;
  activo: boolean;
  obra_social?: {
    nombre: string;
  };
}

export interface PatientFormData {
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  obra_social_id?: number;
  numero_afiliado?: string;
  consultas_maximas: number;
  observaciones?: string;
}

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          *,
          obra_social:obras_sociales(nombre)
        `)
        .eq('activo', true)
        .order('apellido');

      if (error) throw error;
      return data as Patient[];
    },
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (patientData: PatientFormData) => {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([patientData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Paciente creado",
        description: "El paciente se ha creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al crear paciente: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PatientFormData> }) => {
      const { error } = await supabase
        .from('pacientes')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Paciente actualizado",
        description: "Los datos del paciente se han actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar paciente: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (patientId: number) => {
      const { error } = await supabase
        .from('pacientes')
        .update({ activo: false })
        .eq('id', patientId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Paciente eliminado",
        description: "El paciente se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al eliminar paciente: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
