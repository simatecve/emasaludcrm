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
import { useNomecladorSearch } from '@/hooks/useNomeclador';
import { FileText, Upload, Search } from 'lucide-react';

// Prestadores restringidos: solo pueden emitir consultas con código 420101
const RESTRICTED_PRESTADOR_EMAILS = [
  'ceac@ema.com',
  'cimyn@ema-salud.com',
  'sanatoriodemayo@ema.com',
];

interface PrestacionSearchInputProps {
  onSelect: (codigo: string, descripcion: string) => void;
}

const PrestacionSearchInput: React.FC<PrestacionSearchInputProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { data: suggestions } = useNomecladorSearch(searchTerm);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearchTerm('');
    onSelect(suggestion.codigo_practica, suggestion.descripcion_practica);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        value={searchTerm}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Buscar prestación por código o descripción..."
      />
      
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.slice(0, 10).map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium text-sm">{suggestion.codigo_practica}</div>
              <div className="text-gray-600 text-xs truncate">{suggestion.descripcion_practica}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

interface SimplePrestadorAutorizacionFormProps {
  onClose: () => void;
}

const SimplePrestadorAutorizacionForm = ({ onClose }: SimplePrestadorAutorizacionFormProps) => {
  const { data: currentUser } = useCurrentUser();
  
  const isRestricted = currentUser?.email ? RESTRICTED_PRESTADOR_EMAILS.includes(currentUser.email.toLowerCase()) : false;

  const [formData, setFormData] = useState({
    paciente_id: '',
    obra_social_id: '',
    medico_id: '',
    tipo_autorizacion: isRestricted ? 'consulta' : '',
    descripcion: '',
    prestacion_codigo: isRestricted ? '420101' : '',
    prestacion_descripcion: isRestricted ? 'CONSULTA MEDICA DIURNA' : '',
    prestacion_cantidad: 1,
    numero_credencial: '',
    parentesco_beneficiario: '',
    profesional_solicitante: '',
    observaciones: '',
    documento: null as File | null,
  });

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

    try {
      // Crear array de prestaciones desde los campos simples
      const prestaciones = [];
      if (formData.prestacion_codigo || formData.prestacion_descripcion) {
        prestaciones.push({
          prestacion_codigo: formData.prestacion_codigo,
          prestacion_descripcion: formData.prestacion_descripcion,
          cantidad: formData.prestacion_cantidad,
          observaciones: '',
        });
      }

      await createAutorizacion.mutateAsync({
        paciente_id: parseInt(formData.paciente_id),
        obra_social_id: formData.obra_social_id ? parseInt(formData.obra_social_id) : undefined,
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Solicitud Simple de Autorización
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isRestricted ? (
              <Input value="Consulta" disabled className="bg-muted" />
            ) : (
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
            )}
          </div>

          {/* Prestación Simple */}
          <div className="space-y-4 border rounded-lg p-4">
            <Label className="text-lg font-semibold">Prestación</Label>
            {isRestricted ? (
              <div className="space-y-2">
                <div>
                  <Label>Código de Prestación</Label>
                  <Input value="420101" disabled className="bg-muted font-mono" />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Input value="CONSULTA MEDICA DIURNA" disabled className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="prestacion_cantidad">Cantidad</Label>
                  <Input
                    id="prestacion_cantidad"
                    type="number"
                    min="1"
                    value={formData.prestacion_cantidad}
                    onChange={(e) => setFormData(prev => ({ ...prev, prestacion_cantidad: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Buscar Prestación</Label>
                    <PrestacionSearchInput
                      onSelect={(codigo, descripcion) => {
                        setFormData(prev => ({
                          ...prev,
                          prestacion_codigo: codigo,
                          prestacion_descripcion: descripcion
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prestacion_cantidad">Cantidad</Label>
                    <Input
                      id="prestacion_cantidad"
                      type="number"
                      min="1"
                      value={formData.prestacion_cantidad}
                      onChange={(e) => setFormData(prev => ({ ...prev, prestacion_cantidad: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                {formData.prestacion_codigo && (
                  <div className="space-y-2">
                    <Label>Código de Prestación Seleccionado</Label>
                    <Input
                      value={formData.prestacion_codigo}
                      disabled
                      className="bg-green-50 border-green-200 font-mono"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Descripción de la Prestación</Label>
                  <Input
                    value={formData.prestacion_descripcion}
                    placeholder="Se completa automáticamente al seleccionar"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </>
            )}
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

export default SimplePrestadorAutorizacionForm;