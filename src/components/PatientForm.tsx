
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { PatientFormData, Patient } from '@/hooks/usePatients';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSubmit, onCancel, isLoading }) => {
  const { data: obrasSociales, isLoading: loadingObrasSociales } = useObrasSociales();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      fecha_nacimiento: '',
      telefono: '',
      email: '',
      direccion: '',
      obra_social_id: '',
      numero_afiliado: '',
      consultas_maximas: 2,
      observaciones: '',
    }
  });

  useEffect(() => {
    if (patient) {
      setValue('nombre', patient.nombre);
      setValue('apellido', patient.apellido);
      setValue('dni', patient.dni);
      setValue('fecha_nacimiento', patient.fecha_nacimiento);
      setValue('telefono', patient.telefono || '');
      setValue('email', patient.email || '');
      setValue('direccion', patient.direccion || '');
      setValue('obra_social_id', patient.obra_social_id || '');
      setValue('numero_afiliado', patient.numero_afiliado || '');
      setValue('consultas_maximas', patient.consultas_maximas);
      setValue('observaciones', patient.observaciones || '');
    }
  }, [patient, setValue]);

  const selectedObraSocial = watch('obra_social_id');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{patient ? 'Editar Paciente' : 'Nuevo Paciente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                {...register('nombre', { required: 'El nombre es requerido' })}
                placeholder="Nombre"
              />
              {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
            </div>
            <div>
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                {...register('apellido', { required: 'El apellido es requerido' })}
                placeholder="Apellido"
              />
              {errors.apellido && <p className="text-red-500 text-sm">{errors.apellido.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                {...register('dni', { required: 'El DNI es requerido' })}
                placeholder="DNI sin puntos ni espacios"
              />
              {errors.dni && <p className="text-red-500 text-sm">{errors.dni.message}</p>}
            </div>
            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                {...register('fecha_nacimiento', { required: 'La fecha de nacimiento es requerida' })}
              />
              {errors.fecha_nacimiento && <p className="text-red-500 text-sm">{errors.fecha_nacimiento.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register('telefono')}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              {...register('direccion')}
              placeholder="Dirección completa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="obra_social_id">Obra Social</Label>
              <Select value={selectedObraSocial} onValueChange={(value) => setValue('obra_social_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar obra social" />
                </SelectTrigger>
                <SelectContent>
                  {!loadingObrasSociales && obrasSociales?.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numero_afiliado">Número de Afiliado</Label>
              <Input
                id="numero_afiliado"
                {...register('numero_afiliado')}
                placeholder="Número de afiliado"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="consultas_maximas">Consultas Máximas por Mes</Label>
            <Input
              id="consultas_maximas"
              type="number"
              min="1"
              {...register('consultas_maximas', { 
                required: 'Las consultas máximas son requeridas',
                min: { value: 1, message: 'Debe ser al menos 1' }
              })}
            />
            {errors.consultas_maximas && <p className="text-red-500 text-sm">{errors.consultas_maximas.message}</p>}
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              {...register('observaciones')}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Guardando...' : (patient ? 'Actualizar' : 'Crear')} Paciente
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
