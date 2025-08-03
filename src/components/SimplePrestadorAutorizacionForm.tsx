
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateAutorizacion } from '@/hooks/useAutorizaciones';
import { usePatients } from '@/hooks/usePatients';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { FileText, Search } from 'lucide-react';

interface SimplePrestadorAutorizacionFormProps {
  onClose: () => void;
}

const SimplePrestadorAutorizacionForm = ({ onClose }: SimplePrestadorAutorizacionFormProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: patients } = usePatients();
  const createAutorizacion = useCreateAutorizacion();
  const { toast } = useToast();

  // Filter patients by DNI or CUIT
  const filteredPatients = patients?.filter(patient => 
    patient.dni.includes(searchTerm) || 
    patient.cuil_titular?.includes(searchTerm) ||
    patient.cuil_beneficiario?.includes(searchTerm)
  );

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setSearchTerm(`${patient.nombre} ${patient.apellido} - DNI: ${patient.dni}`);
    setIsExpanded(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "Debe seleccionar un paciente",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAutorizacion.mutateAsync({
        paciente_id: selectedPatient.id,
        tipo_autorizacion: 'consulta',
        estado: 'pendiente',
        prestacion_codigo: '420101',
        prestacion_descripcion: 'Consulta médica',
        prestacion_cantidad: 1,
        prestador: currentUser?.full_name || 'Prestador',
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Nueva Solicitud de Autorización
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Búsqueda de paciente */}
          <div className="space-y-2">
            <Label htmlFor="patient-search">Buscar Paciente por DNI o CUIT *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="patient-search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedPatient(null);
                  setIsExpanded(false);
                }}
                placeholder="Ingrese DNI o CUIT del paciente"
                className="pl-10"
                autoComplete="off"
              />
            </div>
            
            {/* Lista de pacientes filtrados */}
            {searchTerm && !selectedPatient && filteredPatients && filteredPatients.length > 0 && (
              <div className="border rounded-md max-h-32 overflow-y-auto bg-white">
                {filteredPatients.slice(0, 5).map((patient) => (
                  <div
                    key={patient.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="text-sm font-medium">
                      {patient.nombre} {patient.apellido}
                    </div>
                    <div className="text-xs text-gray-500">
                      DNI: {patient.dni}
                      {patient.cuil_titular && ` - CUIT: ${patient.cuil_titular}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchTerm && !selectedPatient && filteredPatients && filteredPatients.length === 0 && (
              <div className="text-sm text-gray-500 p-2 border rounded-md">
                No se encontraron pacientes con ese DNI o CUIT
              </div>
            )}
          </div>

          {/* Campos expandidos automáticamente */}
          {isExpanded && selectedPatient && (
            <>
              <div className="space-y-2">
                <Label>Tipo de Autorización</Label>
                <Input
                  value="Consulta"
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label>Código de Prestación</Label>
                <Input
                  value="420101"
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
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
            </>
          )}

          {!isExpanded && (
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default SimplePrestadorAutorizacionForm;
