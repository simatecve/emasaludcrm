
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateEspecialidad, useUpdateEspecialidad, type EspecialidadFormData } from '@/hooks/useEspecialidades';

const especialidadSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
});

interface EspecialidadFormProps {
  especialidad?: any;
  onClose: () => void;
}

const EspecialidadForm = ({ especialidad, onClose }: EspecialidadFormProps) => {
  const { mutate: createEspecialidad } = useCreateEspecialidad();
  const { mutate: updateEspecialidad } = useUpdateEspecialidad();

  const form = useForm<EspecialidadFormData>({
    resolver: zodResolver(especialidadSchema),
    defaultValues: {
      nombre: especialidad?.nombre || '',
      descripcion: especialidad?.descripcion || '',
    },
  });

  const onSubmit = (data: EspecialidadFormData) => {
    if (especialidad) {
      updateEspecialidad({ id: especialidad.id, data });
    } else {
      createEspecialidad(data);
    }
    onClose();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {especialidad ? 'Editar Especialidad' : 'Nueva Especialidad'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Especialidad</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Cardiología" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Descripción de la especialidad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  {especialidad ? 'Actualizar' : 'Crear'} Especialidad
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EspecialidadForm;
