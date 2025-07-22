
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DiagnosticoFormData, Diagnostico } from '@/hooks/useDiagnosticos';

interface DiagnosticoFormProps {
  diagnostico?: Diagnostico;
  pacienteId: number;
  onSubmit: (data: DiagnosticoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DiagnosticoForm: React.FC<DiagnosticoFormProps> = ({
  diagnostico,
  pacienteId,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<DiagnosticoFormData>({
    defaultValues: {
      paciente_id: pacienteId,
      diagnostico: diagnostico?.diagnostico || '',
      tratamiento: diagnostico?.tratamiento || '',
      observaciones: diagnostico?.observaciones || '',
      medico_tratante: diagnostico?.medico_tratante || '',
      estado: diagnostico?.estado || 'activo',
    }
  });

  const estadoValue = watch('estado');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {diagnostico ? 'Editar Diagnóstico' : 'Nuevo Diagnóstico'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico *</Label>
            <Textarea
              id="diagnostico"
              {...register('diagnostico', { required: 'El diagnóstico es obligatorio' })}
              placeholder="Descripción del diagnóstico"
              rows={3}
            />
            {errors.diagnostico && (
              <p className="text-sm text-red-600">{errors.diagnostico.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={estadoValue} onValueChange={(value) => setValue('estado', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="en_tratamiento">En Tratamiento</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medico_tratante">Médico Tratante</Label>
            <Input
              id="medico_tratante"
              {...register('medico_tratante')}
              placeholder="Nombre del médico"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tratamiento">Tratamiento</Label>
            <Textarea
              id="tratamiento"
              {...register('tratamiento')}
              placeholder="Descripción del tratamiento"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            {...register('observaciones')}
            placeholder="Observaciones adicionales"
            rows={2}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosticoForm;
