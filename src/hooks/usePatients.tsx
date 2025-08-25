
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
  tag_id?: number;
  // Nuevos campos agregados
  cuil_titular?: string;
  cuil_beneficiario?: string;
  tipo_doc?: string;
  nro_doc?: string;
  descripcion_paciente?: string;
  parentesco?: string;
  apellido_y_nombre?: string;
  sexo?: string;
  estado_civil?: string;
  nacionalidad?: string;
  fecha_nac_adicional?: string | null;
  tipo_doc_familiar?: string;
  nro_doc_familiar?: string;
  localidad?: string;
  provincia?: string;
  fecha_alta?: string;
  obra_social?: {
    nombre: string;
  };
  patient_tag?: {
    id: number;
    name: string;
    color: string;
    description?: string;
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
  tag_id?: number;
  // Nuevos campos agregados
  cuil_titular?: string;
  cuil_beneficiario?: string;
  tipo_doc?: string;
  nro_doc?: string;
  descripcion_paciente?: string;
  parentesco?: string;
  apellido_y_nombre?: string;
  sexo?: string;
  estado_civil?: string;
  nacionalidad?: string;
  fecha_nac_adicional?: string | null;
  tipo_doc_familiar?: string;
  nro_doc_familiar?: string;
  localidad?: string;
  provincia?: string;
}

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          *,
          obra_social:obras_sociales(nombre),
          patient_tag:patient_tags(id, name, color, description)
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
      console.log('Creating patient with data:', patientData);
      
      // Process the data to handle empty strings and null values
      const processedData = { ...patientData };
      
      // Convert empty strings to null for date fields
      if (processedData.fecha_nac_adicional === '') {
        processedData.fecha_nac_adicional = null;
      }
      
      // Remove undefined values for foreign key fields
      if (processedData.obra_social_id === undefined) {
        delete processedData.obra_social_id;
      }
      if (processedData.tag_id === undefined) {
        delete processedData.tag_id;
      }

      const { data, error } = await supabase
        .from('pacientes')
        .insert([processedData])
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        throw error;
      }
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
      console.error('Create patient error:', error);
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
