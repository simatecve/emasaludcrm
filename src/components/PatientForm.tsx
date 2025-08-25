
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { usePatientTags } from '@/hooks/usePatientTags';
import { PatientFormData, Patient } from '@/hooks/usePatients';

interface PatientFormProps {
  patient?: Patient;
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onSubmit, onCancel, isLoading }) => {
  const { data: obrasSociales, isLoading: loadingObrasSociales } = useObrasSociales();
  const { data: patientTags, isLoading: loadingPatientTags } = usePatientTags();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: {
      nombre: '',
      apellido: '',
      dni: '',
      fecha_nacimiento: '',
      telefono: '',
      email: '',
      direccion: '',
      obra_social_id: undefined,
      numero_afiliado: '',
      consultas_maximas: 2,
      observaciones: '',
      tag_id: undefined,
      cuil_titular: '',
      cuil_beneficiario: '',
      tipo_doc: '',
      nro_doc: '',
      descripcion_paciente: '',
      parentesco: '',
      apellido_y_nombre: '',
      sexo: '',
      estado_civil: '',
      nacionalidad: '',
      fecha_nac_adicional: '',
      tipo_doc_familiar: '',
      nro_doc_familiar: '',
      localidad: '',
      provincia: '',
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
      setValue('obra_social_id', patient.obra_social_id);
      setValue('numero_afiliado', patient.numero_afiliado || '');
      setValue('consultas_maximas', patient.consultas_maximas);
      setValue('observaciones', patient.observaciones || '');
      setValue('tag_id', patient.tag_id);
      
      setValue('cuil_titular', patient.cuil_titular || '');
      setValue('cuil_beneficiario', patient.cuil_beneficiario || '');
      setValue('tipo_doc', patient.tipo_doc || '');
      setValue('nro_doc', patient.nro_doc || '');
      setValue('descripcion_paciente', patient.descripcion_paciente || '');
      setValue('parentesco', patient.parentesco || '');
      setValue('apellido_y_nombre', patient.apellido_y_nombre || '');
      setValue('sexo', patient.sexo || '');
      setValue('estado_civil', patient.estado_civil || '');
      setValue('nacionalidad', patient.nacionalidad || '');
      setValue('fecha_nac_adicional', patient.fecha_nac_adicional || '');
      setValue('tipo_doc_familiar', patient.tipo_doc_familiar || '');
      setValue('nro_doc_familiar', patient.nro_doc_familiar || '');
      setValue('localidad', patient.localidad || '');
      setValue('provincia', patient.provincia || '');
    }
  }, [patient, setValue]);

  const selectedObraSocial = watch('obra_social_id');
  const selectedTag = watch('tag_id');
  const selectedSexo = watch('sexo');
  const selectedEstadoCivil = watch('estado_civil');
  const selectedTipoDoc = watch('tipo_doc');
  const selectedTipoDocFamiliar = watch('tipo_doc_familiar');

  const handleFormSubmit = (data: PatientFormData) => {
    // Convert empty date strings to null
    const processedData = {
      ...data,
      fecha_nac_adicional: data.fecha_nac_adicional === '' ? null : data.fecha_nac_adicional,
    };
    
    // Remove empty string fields and convert them to null or undefined
    Object.keys(processedData).forEach(key => {
      if (processedData[key as keyof PatientFormData] === '') {
        if (key === 'fecha_nac_adicional') {
          processedData[key as keyof PatientFormData] = null as any;
        } else if (key === 'obra_social_id' || key === 'tag_id') {
          processedData[key as keyof PatientFormData] = undefined as any;
        }
      }
    });

    onSubmit(processedData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{patient ? 'Editar Paciente' : 'Nuevo Paciente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basicos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basicos">Datos Básicos</TabsTrigger>
              <TabsTrigger value="adicionales">Datos Adicionales</TabsTrigger>
              <TabsTrigger value="familiares">Datos Familiares</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basicos" className="space-y-4">
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
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    {...register('telefono', { required: 'El teléfono es requerido' })}
                    placeholder="+54 11 1234-5678"
                  />
                  {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { required: 'El email es requerido' })}
                    placeholder="email@ejemplo.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  {...register('direccion', { required: 'La dirección es requerida' })}
                  placeholder="Dirección completa"
                />
                {errors.direccion && <p className="text-red-500 text-sm">{errors.direccion.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="obra_social_id">Obra Social</Label>
                  <Select value={selectedObraSocial?.toString()} onValueChange={(value) => setValue('obra_social_id', value ? parseInt(value) : undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar obra social" />
                    </SelectTrigger>
                    <SelectContent>
                      {!loadingObrasSociales && obrasSociales?.map((obra) => (
                        <SelectItem key={obra.id} value={obra.id.toString()}>
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
                <div>
                  <Label htmlFor="tag_id">Etiqueta de Estado</Label>
                  <Select value={selectedTag?.toString()} onValueChange={(value) => setValue('tag_id', value ? parseInt(value) : undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar etiqueta" />
                    </SelectTrigger>
                    <SelectContent>
                      {!loadingPatientTags && patientTags?.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="consultas_maximas">Consultas Máximas por Mes</Label>
                <Input
                  id="consultas_maximas"
                  type="number"
                  min="1"
                  {...register('consultas_maximas', { 
                    min: { value: 1, message: 'Debe ser al menos 1' }
                  })}
                />
                {errors.consultas_maximas && <p className="text-red-500 text-sm">{errors.consultas_maximas.message}</p>}
              </div>
            </TabsContent>

            <TabsContent value="adicionales" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cuil_titular">CUIL Titular</Label>
                  <Input
                    id="cuil_titular"
                    {...register('cuil_titular')}
                    placeholder="XX-XXXXXXXX-X"
                  />
                </div>
                <div>
                  <Label htmlFor="cuil_beneficiario">CUIL Beneficiario</Label>
                  <Input
                    id="cuil_beneficiario"
                    {...register('cuil_beneficiario')}
                    placeholder="XX-XXXXXXXX-X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_doc">Tipo de Documento</Label>
                  <Select value={selectedTipoDoc} onValueChange={(value) => setValue('tipo_doc', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="LC">LC</SelectItem>
                      <SelectItem value="LE">LE</SelectItem>
                      <SelectItem value="CI">CI</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nro_doc">Número de Documento</Label>
                  <Input
                    id="nro_doc"
                    {...register('nro_doc')}
                    placeholder="Número de documento"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={selectedSexo} onValueChange={(value) => setValue('sexo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="X">No binario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estado_civil">Estado Civil</Label>
                  <Select value={selectedEstadoCivil} onValueChange={(value) => setValue('estado_civil', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                      <SelectItem value="Concubinato">Concubinato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nacionalidad">Nacionalidad</Label>
                  <Input
                    id="nacionalidad"
                    {...register('nacionalidad')}
                    placeholder="Nacionalidad"
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_nac_adicional">Fecha Nac. Adicional</Label>
                  <Input
                    id="fecha_nac_adicional"
                    type="date"
                    {...register('fecha_nac_adicional')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localidad">Localidad</Label>
                  <Input
                    id="localidad"
                    {...register('localidad')}
                    placeholder="Localidad"
                  />
                </div>
                <div>
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    {...register('provincia')}
                    placeholder="Provincia"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion_paciente">Descripción del Paciente</Label>
                <Textarea
                  id="descripcion_paciente"
                  {...register('descripcion_paciente')}
                  placeholder="Descripción adicional del paciente"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="familiares" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentesco">Parentesco</Label>
                  <Input
                    id="parentesco"
                    {...register('parentesco')}
                    placeholder="Parentesco"
                  />
                </div>
                <div>
                  <Label htmlFor="apellido_y_nombre">Apellido y Nombre</Label>
                  <Input
                    id="apellido_y_nombre"
                    {...register('apellido_y_nombre')}
                    placeholder="Apellido y nombre del familiar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_doc_familiar">Tipo Doc. Familiar</Label>
                  <Select value={selectedTipoDocFamiliar} onValueChange={(value) => setValue('tipo_doc_familiar', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="LC">LC</SelectItem>
                      <SelectItem value="LE">LE</SelectItem>
                      <SelectItem value="CI">CI</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nro_doc_familiar">Nro Doc. Familiar</Label>
                  <Input
                    id="nro_doc_familiar"
                    {...register('nro_doc_familiar')}
                    placeholder="Número de documento del familiar"
                  />
                </div>
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
            </TabsContent>
          </Tabs>

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
