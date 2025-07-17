import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateAutorizacion, useUpdateAutorizacion, type Autorizacion, type AutorizacionFormData } from '@/hooks/useAutorizaciones';
import { usePatients } from '@/hooks/usePatients';
import { useMedicos } from '@/hooks/useMedicos';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, X } from 'lucide-react';
import PrestacionSelector from './PrestacionSelector';

interface AutorizacionFormProps {
  autorizacion?: Autorizacion;
  onClose: () => void;
}

const AutorizacionForm = ({ autorizacion, onClose }: AutorizacionFormProps) => {
  const [formData, setFormData] = useState<AutorizacionFormData>({
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
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: pacientes, isLoading: loadingPacientes } = usePatients();
  const { data: medicos, isLoading: loadingMedicos } = useMedicos();
  const { data: obrasSociales, isLoading: loadingObrasSociales } = useObrasSociales();

  const createMutation = useCreateAutorizacion();
  const updateMutation = useUpdateAutorizacion();

  const handlePrestacionSelect = (prestacion: { codigo: string; descripcion: string }) => {
    setFormData({
      ...formData,
      prestacion_codigo: prestacion.codigo,
      prestacion_descripcion: prestacion.descripcion
    });
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paciente_id || !formData.tipo_autorizacion) {
      return;
    }

    const submitData = {
      ...formData,
      ...(selectedFile && { documento: selectedFile })
    };

    if (autorizacion) {
      await updateMutation.mutateAsync({ id: autorizacion.id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          {autorizacion ? 'Editar Autorización' : 'Nueva Autorización'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select
                value={formData.paciente_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, paciente_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPacientes ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    pacientes?.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id.toString()}>
                        {paciente.nombre} {paciente.apellido} - {paciente.dni}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_credencial">Número de Credencial</Label>
              <Input
                id="numero_credencial"
                type="text"
                value={formData.numero_credencial}
                onChange={(e) => setFormData({ ...formData, numero_credencial: e.target.value })}
                placeholder="Número de credencial del beneficiario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentesco_beneficiario">Parentesco del Beneficiario</Label>
              <Select
                value={formData.parentesco_beneficiario || ""}
                onValueChange={(value) => setFormData({ ...formData, parentesco_beneficiario: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar parentesco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="titular">Titular</SelectItem>
                  <SelectItem value="conyuge">Cónyuge</SelectItem>
                  <SelectItem value="hijo">Hijo/a</SelectItem>
                  <SelectItem value="padre">Padre</SelectItem>
                  <SelectItem value="madre">Madre</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obra_social_id">Obra Social</Label>
              <Select
                value={formData.obra_social_id?.toString() || "sin-obra-social"}
                onValueChange={(value) => setFormData({ ...formData, obra_social_id: value === "sin-obra-social" ? undefined : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar obra social" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-obra-social">Sin obra social</SelectItem>
                  {loadingObrasSociales ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    obrasSociales?.map((obraSocial) => (
                      <SelectItem key={obraSocial.id} value={obraSocial.id.toString()}>
                        {obraSocial.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prestación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Prestación Solicitada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PrestacionSelector
                onSelect={handlePrestacionSelect}
                selectedCodigo={formData.prestacion_codigo}
              />

              <div className="space-y-2">
                <Label htmlFor="prestacion_descripcion">Descripción de la Prestación</Label>
                <Textarea
                  id="prestacion_descripcion"
                  value={formData.prestacion_descripcion}
                  onChange={(e) => setFormData({ ...formData, prestacion_descripcion: e.target.value })}
                  placeholder="Descripción detallada de la prestación"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestacion_cantidad">Cantidad</Label>
                <Input
                  id="prestacion_cantidad"
                  type="number"
                  min="1"
                  value={formData.prestacion_cantidad}
                  onChange={(e) => setFormData({ ...formData, prestacion_cantidad: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestador">Prestador</Label>
                <Input
                  id="prestador"
                  type="text"
                  value={formData.prestador}
                  onChange={(e) => setFormData({ ...formData, prestador: e.target.value })}
                  placeholder="Institución o profesional prestador"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacion_prestacion">Observaciones de la Prestación</Label>
              <Textarea
                id="observacion_prestacion"
                value={formData.observacion_prestacion}
                onChange={(e) => setFormData({ ...formData, observacion_prestacion: e.target.value })}
                placeholder="Observaciones específicas sobre la prestación"
                rows={2}
              />
            </div>
          </div>

          {/* Médico Solicitante */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Médico Solicitante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medico_id">Médico</Label>
                <Select
                  value={formData.medico_id?.toString() || "sin-medico"}
                  onValueChange={(value) => setFormData({ ...formData, medico_id: value === "sin-medico" ? undefined : parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-medico">Sin médico asignado</SelectItem>
                    {loadingMedicos ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : (
                      medicos?.map((medico) => (
                        <SelectItem key={medico.id} value={medico.id.toString()}>
                          {medico.nombre} {medico.apellido} - {medico.matricula}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profesional_solicitante">Especialidad/Profesión</Label>
                <Input
                  id="profesional_solicitante"
                  type="text"
                  value={formData.profesional_solicitante}
                  onChange={(e) => setFormData({ ...formData, profesional_solicitante: e.target.value })}
                  placeholder="Especialidad del profesional solicitante"
                />
              </div>
            </div>
          </div>

          {/* Detalles de Autorización */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de la Autorización</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_autorizacion">Tipo de Autorización *</Label>
                <Select
                  value={formData.tipo_autorizacion}
                  onValueChange={(value) => setFormData({ ...formData, tipo_autorizacion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta Especializada">Consulta Especializada</SelectItem>
                    <SelectItem value="Estudios Médicos">Estudios Médicos</SelectItem>
                    <SelectItem value="Cirugía">Cirugía</SelectItem>
                    <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                    <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                    <SelectItem value="Internación">Internación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => setFormData({ ...formData, estado: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                    <SelectItem value="vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_autorizacion">Número de Autorización</Label>
                <Input
                  id="numero_autorizacion"
                  type="text"
                  value={formData.numero_autorizacion}
                  onChange={(e) => setFormData({ ...formData, numero_autorizacion: e.target.value })}
                  placeholder="Ej: AUT-2024-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                <Input
                  id="fecha_vencimiento"
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Descripciones y Observaciones */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción detallada de la autorización"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Documento de Autorización</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : autorizacion?.documento_url ? (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Documento actual</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(autorizacion.documento_url, '_blank')}
                  >
                    Ver
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra un archivo aquí o haz clic para seleccionar
                  </p>
                  <Button type="button" variant="outline" onClick={handleFileSelect}>
                    Seleccionar Archivo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.paciente_id || !formData.tipo_autorizacion}
            >
              {isLoading ? 'Guardando...' : autorizacion ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AutorizacionForm;
