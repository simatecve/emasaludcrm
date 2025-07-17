import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Autorizacion {
  id: number;
  paciente_id: number;
  medico_id?: number;
  obra_social_id?: number;
  tipo_autorizacion: string;
  descripcion?: string;
  fecha_solicitud?: string;
  fecha_vencimiento?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'vencida';
  numero_autorizacion?: string;
  observaciones?: string;
  documento_url?: string;
  activa: boolean;
  prestacion_codigo?: string;
  prestacion_descripcion?: string;
  prestacion_cantidad?: number;
  prestador?: string;
  observacion_prestacion?: string;
  numero_credencial?: string;
  parentesco_beneficiario?: string;
  profesional_solicitante?: string;
  pacientes?: { nombre: string; apellido: string; dni: string };
  medicos?: { nombre: string; apellido: string; matricula: string };
  obras_sociales?: { nombre: string };
}

export interface AutorizacionFormData {
  paciente_id: number;
  medico_id?: number;
  obra_social_id?: number;
  tipo_autorizacion: string;
  descripcion?: string;
  fecha_vencimiento?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'vencida';
  numero_autorizacion?: string;
  observaciones?: string;
  documento?: File;
  prestacion_codigo?: string;
  prestacion_descripcion?: string;
  prestacion_cantidad?: number;
  prestador?: string;
  observacion_prestacion?: string;
  numero_credencial?: string;
  parentesco_beneficiario?: string;
  profesional_solicitante?: string;
}

export const useAutorizaciones = () => {
  return useQuery({
    queryKey: ['autorizaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autorizaciones')
        .select(`
          *,
          pacientes (nombre, apellido, dni),
          medicos (nombre, apellido, matricula),
          obras_sociales (nombre)
        `)
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Autorizacion[];
    },
  });
};

export const useCreateAutorizacion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (autorizacionData: AutorizacionFormData) => {
      console.log('Creating authorization with data:', autorizacionData);
      
      let documento_url = null;

      // Subir documento si existe
      if (autorizacionData.documento) {
        const fileExt = autorizacionData.documento.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        console.log('Uploading document:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('autorizaciones')
          .upload(fileName, autorizacionData.documento);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Obtener URL pública del documento
        const { data: { publicUrl } } = supabase.storage
          .from('autorizaciones')
          .getPublicUrl(fileName);

        documento_url = publicUrl;
        console.log('Document uploaded successfully:', documento_url);
      }

      // Crear la autorización
      const { documento, ...dataToInsert } = autorizacionData;
      const insertData = {
        ...dataToInsert,
        documento_url
      };

      console.log('Inserting authorization data:', insertData);

      const { data, error } = await supabase
        .from('autorizaciones')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Authorization created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] });
      toast({
        title: "Autorización creada",
        description: "La autorización se ha creado exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: `Error al crear autorización: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAutorizacion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AutorizacionFormData> }) => {
      console.log('Updating authorization:', id, data);
      
      let documento_url = undefined;

      // Subir nuevo documento si existe
      if (data.documento) {
        const fileExt = data.documento.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        console.log('Uploading new document:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('autorizaciones')
          .upload(fileName, data.documento);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Obtener URL pública del documento
        const { data: { publicUrl } } = supabase.storage
          .from('autorizaciones')
          .getPublicUrl(fileName);

        documento_url = publicUrl;
        console.log('New document uploaded successfully:', documento_url);
      }

      // Actualizar la autorización
      const { documento, ...dataToUpdate } = data;
      const updateData = {
        ...dataToUpdate,
        ...(documento_url && { documento_url })
      };

      console.log('Updating authorization with data:', updateData);

      const { error } = await supabase
        .from('autorizaciones')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Authorization updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] });
      toast({
        title: "Autorización actualizada",
        description: "Los datos de la autorización se han actualizado exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      toast({
        title: "Error",
        description: `Error al actualizar autorización: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAutorizacion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (autorizacionId: number) => {
      console.log('Deleting authorization:', autorizacionId);
      
      const { error } = await supabase
        .from('autorizaciones')
        .update({ activa: false })
        .eq('id', autorizacionId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Authorization deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autorizaciones'] });
      toast({
        title: "Autorización eliminada",
        description: "La autorización se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: `Error al eliminar autorización: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
