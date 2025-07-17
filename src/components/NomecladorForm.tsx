
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateNomeclador, useUpdateNomeclador, type NomecladorFormData } from '@/hooks/useNomecladorCrud';
import { Nomenclador } from '@/hooks/useNomeclador';

const nomencladorSchema = z.object({
  codigo_practica: z.string().min(1, 'El código de práctica es requerido'),
  descripcion_practica: z.string().min(1, 'La descripción de práctica es requerida'),
  modulo: z.string().min(1, 'El módulo es requerido'),
  valor_resultante_unidades: z.string().optional(),
});

interface NomecladorFormProps {
  nomenclador?: Nomenclador;
  onClose: () => void;
}

const NomecladorForm = ({ nomenclador, onClose }: NomecladorFormProps) => {
  const { mutate: createNomeclador } = useCreateNomeclador();
  const { mutate: updateNomeclador } = useUpdateNomeclador();

  const form = useForm<NomecladorFormData>({
    resolver: zodResolver(nomencladorSchema),
    defaultValues: {
      codigo_practica: nomenclador?.codigo_practica || '',
      descripcion_practica: nomenclador?.descripcion_practica || '',
      modulo: nomenclador?.modulo || '',
      valor_resultante_unidades: nomenclador?.valor_resultante_unidades || '',
    },
  });

  const onSubmit = (data: NomecladorFormData) => {
    if (nomenclador) {
      updateNomeclador({ id: nomenclador.id, data });
    } else {
      createNomeclador(data);
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
          {nomenclador ? 'Editar Nomenclador' : 'Nuevo Nomenclador'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Nomenclador</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="codigo_practica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Práctica *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 420101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion_practica"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción de Práctica *</FormLabel>
                    <FormControl>
                      <Input placeholder="Descripción detallada de la práctica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Módulo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CONSULTORIOS EXTERNOS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor_resultante_unidades"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Resultante Unidades</FormLabel>
                    <FormControl>
                      <Input placeholder="Valor en unidades" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit">
                  {nomenclador ? 'Actualizar' : 'Crear'} Nomenclador
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

export default NomecladorForm;
