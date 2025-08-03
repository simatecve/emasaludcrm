
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PatientTag {
  id: number;
  name: string;
  color: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientTagFormData {
  name: string;
  color: string;
  description?: string;
}

export const usePatientTags = () => {
  return useQuery({
    queryKey: ['patient-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_tags')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data as PatientTag[];
    },
  });
};

export const useCreatePatientTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tagData: PatientTagFormData) => {
      const { data, error } = await supabase
        .from('patient_tags')
        .insert([tagData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-tags'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Etiqueta creada",
        description: "La etiqueta se ha creado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al crear etiqueta: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePatientTag = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PatientTagFormData> }) => {
      const { error } = await supabase
        .from('patient_tags')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-tags'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Etiqueta actualizada",
        description: "La etiqueta se ha actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Error al actualizar etiqueta: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
