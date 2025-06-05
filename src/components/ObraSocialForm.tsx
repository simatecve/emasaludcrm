
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateObraSocial, useUpdateObraSocial, type ObraSocialFormData } from '@/hooks/useObrasSociales';

const obraSocialSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
});

interface ObraSocialFormProps {
  obraSocial?: any;
  onClose: () => void;
}

const ObraSocialForm = ({ obraSocial, onClose }: ObraSocialFormProps) => {
  const { mutate: createObraSocial } = useCreateObraSocial();
  const { mutate: updateObraSocial } = useUpdateObraSocial();

  const form = useForm<ObraSocialFormData>({
    resolver: zodResolver(obraSocialSchema),
    defaultValues: {
      nombre: obraSocial?.nombre || '',
      codigo: obraSocial?.codigo || '',
      telefono: obraSocial?.telefono || '',
      email: obraSocial?.email || '',
      direccion: obraSocial?.direccion || '',
    },
  });

  const onSubmit = (data: ObraSocialFormData) => {
    if (obraSocial) {
      updateObraSocial({ id: obraSocial.id, data });
    } else {
      createObraSocial(data);
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
          {obraSocial ? 'Editar Obra Social' : 'Nueva Obra Social'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de la Obra Social</CardTitle>
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
                      <Input placeholder="Nombre de la obra social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Código de la obra social" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  {obraSocial ? 'Actualizar' : 'Crear'} Obra Social
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

export default ObraSocialForm;
