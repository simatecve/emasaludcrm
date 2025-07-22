
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useMedicos } from '@/hooks/useMedicos';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { AutorizacionFormData, Autorizacion, useCreateAutorizacion, useUpdateAutorizacion } from '@/hooks/useAutorizaciones';
import PatientSelector from './PatientSelector';
import PrestacionSelector from './PrestacionSelector';

interface AutorizacionFormProps {
  autorizacion?: Autorizacion;
  onSubmit: (data: AutorizacionFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AutorizacionForm: React.FC<AutorizacionFormProps> = ({
  autorizacion,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AutorizacionFormData>({
    defaultValues: {
      paciente_id: autorizacion?.paciente_id || 0,
      medico_id: autorizacion?.medico_id || undefined,
      obra_social_id: autorizacion?.obra_social_id || undefined,
      tipo_autorizacion: autorizacion?.tipo_autorizacion || '',
      descripcion: autorizacion?.descripcion || '',
      fecha_vencimiento: autorizacion?.fecha_vencimiento || '',
      estado: autorizacion?.estado || 'pendiente',
      numero_autorizacion: autorizacion?.numero_autorizacion || '',
      observaciones: autorizacion?.observaciones || '',
      prestacion_codigo: autorizacion?.prestacion_codigo || '',
      prestacion_descripcion: autorizacion?.prestacion_descripcion || '',
      prestacion_cantidad: autorizacion?.prestacion_cantidad || 1,
      prestador: autorizacion?.prestador || '',
      observacion_prestacion: autorizacion?.observacion_prestacion || '',
      numero_credencial: autorizacion?.numero_credencial || '',
      parentesco_beneficiario: autorizacion?.parentesco_beneficiario || '',
      profesional_solicitante: autorizacion?.profesional_solicitante || '',
    }
  });

  const { data: patients } = usePatients();
  const { data: medicos } = useMedicos();
  const { data: obrasSociales } = useObrasSociales();

  const watchedValues = watch();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setValue('documento', file || undefined);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue('documento', undefined);
  };

  const onFormSubmit = (data: AutorizacionFormData) => {
    onSubmit({
      ...data,
      documento: selectedFile || undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {autorizacion ? 'Editar Autorización' : 'Nueva Autorización'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Información del Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <PatientSelector
                patients={patients || []}
                selectedPatientId={watchedValues.paciente_id}
                onSelect={(patientId) => setValue('paciente_id', patientId)}
                placeholder="Buscar y seleccionar paciente..."
              />
              {errors.paciente_id && (
                <p className="text-sm text-red-600">Debe seleccionar un paciente</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_credencial">Número de Credencial</Label>
                <Input
                  id="numero_credencial"
                  {...register('numero_credencial')}
                  placeholder="Número de credencial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentesco_beneficiario">Parentesco Beneficiario</Label>
                <Input
                  id="parentesco_beneficiario"
                  {...register('parentesco_beneficiario')}
                  placeholder="Parentesco del beneficiario"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Autorización */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalles de la Autorización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_autorizacion">Tipo de Autorización *</Label>
                <Select onValueChange={(value) => setValue('tipo_autorizacion', value)} defaultValue={watchedValues.tipo_autorizacion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="practica">Práctica</SelectItem>
                    <SelectItem value="medicamento">Medicamento</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_autorizacion && (
                  <p className="text-sm text-red-600">Debe seleccionar un tipo de autorización</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Select onValueChange={(value) => setValue('estado', value as 'pendiente' | 'aprobada' | 'rechazada' | 'vencida')} defaultValue={watchedValues.estado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-sm text-red-600">Debe seleccionar un estado</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                <Input
                  type="date"
                  id="fecha_vencimiento"
                  {...register('fecha_vencimiento')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_autorizacion">Número de Autorización</Label>
                <Input
                  id="numero_autorizacion"
                  {...register('numero_autorizacion')}
                  placeholder="Número de autorización"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...register('descripcion')}
                placeholder="Descripción de la autorización"
                rows={3}
              />
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
          </CardContent>
        </Card>

        {/* Información del Médico y Obra Social */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medico_id">Médico Solicitante</Label>
                <Select onValueChange={(value) => setValue('medico_id', parseInt(value))} defaultValue={watchedValues.medico_id?.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos?.map((medico) => (
                      <SelectItem key={medico.id} value={String(medico.id)}>
                        {medico.nombre} {medico.apellido} - Matrícula: {medico.matricula}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obra_social_id">Obra Social</Label>
                <Select onValueChange={(value) => setValue('obra_social_id', parseInt(value))} defaultValue={watchedValues.obra_social_id?.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar obra social" />
                  </SelectTrigger>
                  <SelectContent>
                    {obrasSociales?.map((obraSocial) => (
                      <SelectItem key={obraSocial.id} value={String(obraSocial.id)}>
                        {obraSocial.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profesional_solicitante">Profesional Solicitante</Label>
                <Input
                  id="profesional_solicitante"
                  {...register('profesional_solicitante')}
                  placeholder="Nombre del profesional"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Prestación */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de la Prestación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Prestación</Label>
              <PrestacionSelector
                onSelect={(prestacion) => {
                  setValue('prestacion_codigo', prestacion.codigo);
                  setValue('prestacion_descripcion', prestacion.descripcion);
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prestacion_codigo">Código de Prestación</Label>
                <Input
                  id="prestacion_codigo"
                  {...register('prestacion_codigo')}
                  placeholder="Código de la prestación"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestacion_descripcion">Descripción de la Prestación</Label>
                <Input
                  id="prestacion_descripcion"
                  {...register('prestacion_descripcion')}
                  placeholder="Descripción de la prestación"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prestacion_cantidad">Cantidad</Label>
                <Input
                  type="number"
                  id="prestacion_cantidad"
                  {...register('prestacion_cantidad', { valueAsNumber: true })}
                  placeholder="Cantidad"
                  defaultValue={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestador">Prestador</Label>
                <Input
                  id="prestador"
                  {...register('prestador')}
                  placeholder="Prestador"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacion_prestacion">Observación de la Prestación</Label>
              <Textarea
                id="observacion_prestacion"
                {...register('observacion_prestacion')}
                placeholder="Observación de la prestación"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subir Documento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documento Adjunto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documento">
                {selectedFile ? 'Reemplazar Documento' : 'Subir Documento'}
              </Label>
              <Input
                type="file"
                id="documento"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button asChild variant="outline">
                <label htmlFor="documento" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? 'Reemplazar Archivo' : 'Subir Archivo'}
                </label>
              </Button>
              {selectedFile && (
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                  <span className="text-sm text-gray-600">
                    {selectedFile.name} - {(selectedFile.size / 1024).toFixed(2)} KB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Autorización'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AutorizacionForm;
