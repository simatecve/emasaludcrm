
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateAutorizacion } from '@/hooks/useAutorizaciones';
import { usePatients } from '@/hooks/usePatients';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { useMedicos } from '@/hooks/useMedicos';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { FileText, Upload, Search } from 'lucide-react';
import { AutorizacionPrestacionFormData } from '@/hooks/useAutorizacionPrestaciones';
import MultiplePrestacionesSelector from './MultiplePrestacionesSelector';

interface PrestadorAutorizacionFormProps {
  onClose: () => void;
}

// Componente de búsqueda de médico
interface MedicoSearchInputProps {
  onSelect: (medicoId: string, medicoNombre: string) => void;
  selectedMedico?: string;
}

const MedicoSearchInput = ({ onSelect, selectedMedico }: MedicoSearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: medicos } = useMedicos();

  const filteredMedicos = medicos?.filter(medico =>
    medico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5) || [];

  const handleSelect = (medico: any) => {
    onSelect(medico.id.toString(), `${medico.nombre} ${medico.apellido}`);
    setSearchTerm(`${medico.nombre} ${medico.apellido}`);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar médico por nombre..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10"
        />
      </div>
      
      {showSuggestions && filteredMedicos.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredMedicos.map((medico) => (
            <div
              key={medico.id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              onClick={() => handleSelect(medico)}
            >
              <div className="font-medium">{medico.nombre} {medico.apellido}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Matrícula: {medico.matricula}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PrestadorAutorizacionForm = ({ onClose }: PrestadorAutorizacionFormProps) => {
  const [formData, setFormData] = useState({
    paciente_id: '',
    obra_social_id: '',
    medico_id: '',
    tipo_autorizacion: '',
    descripcion: '',
    numero_credencial: '',
    parentesco_beneficiario: '',
    profesional_solicitante: '',
    observaciones: '',
    documento: null as File | null,
  });

  const [prestaciones, setPrestaciones] = useState<AutorizacionPrestacionFormData[]>([]);

  const { data: currentUser } = useCurrentUser();
  const { data: patients } = usePatients();
  const { data: obrasSociales } = useObrasSociales();
  const createAutorizacion = useCreateAutorizacion();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paciente_id || !formData.tipo_autorizacion) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (prestaciones.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos una prestación",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAutorizacion.mutateAsync({
        paciente_id: parseInt(formData.paciente_id),
        obra_social_id: formData.obra_social_id ? parseInt(formData.obra_social_id) : undefined,
        medico_id: formData.medico_id ? parseInt(formData.medico_id) : undefined,
        tipo_autorizacion: formData.tipo_autorizacion,
        descripcion: formData.descripcion,
        estado: 'pendiente',
        prestador: currentUser?.full_name || 'Prestador',
        numero_credencial: formData.numero_credencial,
        parentesco_beneficiario: formData.parentesco_beneficiario,
        profesional_solicitante: formData.profesional_solicitante,
        observaciones: formData.observaciones,
        documento: formData.documento,
        prestaciones: prestaciones,
      });
      
      onClose();
      toast({
        title: "Solicitud enviada",
        description: "Su solicitud de autorización ha sido enviada exitosamente.",
      });
    } catch (error) {
      console.error('Error creating authorization:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, documento: file }));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Solicitud de Autorización
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paciente_id">Paciente *</Label>
              <Select 
                value={formData.paciente_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, paciente_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.nombre} {patient.apellido} - DNI: {patient.dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="obra_social_id">Obra Social</Label>
              <Select 
                value={formData.obra_social_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, obra_social_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar obra social" />
                </SelectTrigger>
                <SelectContent>
                  {obrasSociales?.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id.toString()}>
                      {obra.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="medico_id">Médico Solicitante</Label>
            <MedicoSearchInput
              onSelect={(medicoId, medicoNombre) => {
                setFormData(prev => ({ ...prev, medico_id: medicoId }));
              }}
              selectedMedico={formData.medico_id}
            />
          </div>

          <div>
            <Label htmlFor="tipo_autorizacion">Tipo de Autorización *</Label>
            <Select 
              value={formData.tipo_autorizacion} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_autorizacion: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consulta">Consulta</SelectItem>
                <SelectItem value="estudio">Estudio</SelectItem>
                <SelectItem value="tratamiento">Tratamiento</SelectItem>
                <SelectItem value="cirugia">Cirugía</SelectItem>
                <SelectItem value="medicamento">Medicamento</SelectItem>
                <SelectItem value="internacion">Internación</SelectItem>
                <SelectItem value="laboratorio">Laboratorio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción General</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Descripción general de la solicitud"
              rows={3}
            />
          </div>

          {/* Múltiples Prestaciones */}
          <div className="space-y-4">
            <MultiplePrestacionesSelector
              prestaciones={prestaciones}
              onPrestacionesChange={setPrestaciones}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero_credencial">Número de Credencial</Label>
              <Input
                id="numero_credencial"
                value={formData.numero_credencial}
                onChange={(e) => setFormData(prev => ({ ...prev, numero_credencial: e.target.value }))}
                placeholder="Número de credencial"
              />
            </div>

            <div>
              <Label htmlFor="parentesco_beneficiario">Parentesco Beneficiario</Label>
              <Input
                id="parentesco_beneficiario"
                value={formData.parentesco_beneficiario}
                onChange={(e) => setFormData(prev => ({ ...prev, parentesco_beneficiario: e.target.value }))}
                placeholder="Parentesco del beneficiario"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="profesional_solicitante">Profesional Solicitante</Label>
            <Input
              id="profesional_solicitante"
              value={formData.profesional_solicitante}
              onChange={(e) => setFormData(prev => ({ ...prev, profesional_solicitante: e.target.value }))}
              placeholder="Nombre del profesional que solicita"
            />
          </div>

          <div>
            <Label htmlFor="documento">Documento Adjunto</Label>
            <div className="flex items-center gap-2">
              <Input
                id="documento"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-gray-400" />
            </div>
            {formData.documento && (
              <p className="text-sm text-gray-500 mt-1">
                Archivo seleccionado: {formData.documento.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Observaciones adicionales"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAutorizacion.isPending}>
              {createAutorizacion.isPending ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PrestadorAutorizacionForm;
