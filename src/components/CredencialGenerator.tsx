import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Search, Download, Users, Calendar } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useCreateCredencial, useCredencialByPaciente } from '@/hooks/useCredenciales';
import PatientSelector from '@/components/PatientSelector';

const CredencialCard: React.FC<{ 
  paciente: any; 
  credencial: any;
  logoUrl?: string;
  systemName?: string;
}> = ({ paciente, credencial, logoUrl, systemName }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg p-6 text-white shadow-lg relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 border-2 border-white rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-2 border-white rounded-full transform -translate-x-12 translate-y-12"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex items-center">
          {logoUrl && (
            <div className="w-16 h-16 bg-white rounded-lg p-2 mr-4 flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold">{systemName || 'Sistema Médico'}</h3>
            <p className="text-blue-100 text-sm">Su seguridad en salud</p>
          </div>
        </div>
      </div>

      {/* Credential Type */}
      <div className="relative z-10 mb-4">
        <div className="text-right">
          <p className="text-blue-100 text-sm">REGIMEN GENERAL</p>
          <p className="text-blue-100 text-xs">TIPO DE BENEFICIARIO</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="relative z-10 space-y-2">
        <div>
          <p className="text-lg font-bold">
            {paciente.nombre} {paciente.apellido}
          </p>
        </div>
        
        <div>
          <p className="text-blue-100 text-sm">AFILIADO</p>
          <p className="font-semibold">
            {paciente.numero_afiliado || `${paciente.dni}-001`}
          </p>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-blue-100 text-sm">VIGENCIA HASTA</p>
            <p className="font-semibold">{formatDate(credencial.fecha_vencimiento)}</p>
          </div>
          
          <div className="text-right">
            <p className="text-4xl font-bold text-blue-200">
              {credencial.numero_credencial.slice(-3)}
            </p>
            <p className="text-blue-100 text-xs">TOKEN</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CredencialGenerator: React.FC = () => {
  const [dni, setDni] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [showCredencial, setShowCredencial] = useState(false);
  
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const { data: systemConfig } = useSystemConfig();
  const { data: existingCredencial } = useCredencialByPaciente(selectedPatientId);
  const createCredencial = useCreateCredencial();

  const selectedPatient = patients?.find(p => p.id === selectedPatientId);

  const handleDniSubmit = () => {
    if (!dni.trim()) return;
    
    const patient = patients?.find(p => p.dni === dni.trim());
    if (patient) {
      setSelectedPatientId(patient.id);
      setShowCredencial(true);
    } else {
      alert('No se encontró un paciente con ese DNI');
    }
  };

  const handleGenerateCredencial = async () => {
    if (!selectedPatient) return;

    // If credential already exists, just show it
    if (existingCredencial) {
      setShowCredencial(true);
      return;
    }

    // Create new credential
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    
    await createCredencial.mutateAsync({
      paciente_id: selectedPatient.id,
      numero_credencial: `${selectedPatient.dni}-${Date.now().toString().slice(-4)}`,
      fecha_vencimiento: lastDay.toISOString().split('T')[0],
    });
    
    setShowCredencial(true);
  };

  const handleDownloadCredencial = () => {
    // This would implement the download functionality
    console.log('Download credential');
  };

  const currentCredencial = existingCredencial || {
    numero_credencial: selectedPatient ? `${selectedPatient.dni}-${Date.now().toString().slice(-4)}` : '',
    fecha_vencimiento: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      return lastDay.toISOString().split('T')[0];
    })(),
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Credencial Digital</h1>
        <p className="text-muted-foreground">
          Ingrese su DNI para generar la credencial digital
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI del Paciente</Label>
              <div className="flex gap-2">
                <Input
                  id="dni"
                  placeholder="Ingrese el DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDniSubmit()}
                />
                <Button onClick={handleDniSubmit}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label>O seleccione de la lista</Label>
              <div className="mt-2">
                {patientsLoading ? (
                  <p>Cargando pacientes...</p>
                ) : (
                  <PatientSelector
                    patients={patients || []}
                    selectedPatientId={selectedPatientId || undefined}
                    onSelect={(id) => {
                      setSelectedPatientId(id);
                      const patient = patients?.find(p => p.id === id);
                      if (patient) {
                        setDni(patient.dni || '');
                      }
                    }}
                    placeholder="Seleccionar paciente..."
                  />
                )}
              </div>
            </div>

            {selectedPatient && (
              <div className="mt-4 p-4 border rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Paciente Seleccionado</h3>
                <p><strong>Nombre:</strong> {selectedPatient.nombre} {selectedPatient.apellido}</p>
                <p><strong>DNI:</strong> {selectedPatient.dni}</p>
                {selectedPatient.obra_social && (
                  <p><strong>Obra Social:</strong> {selectedPatient.obra_social.nombre}</p>
                )}
                {selectedPatient.numero_afiliado && (
                  <p><strong>N° Afiliado:</strong> {selectedPatient.numero_afiliado}</p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateCredencial}
                disabled={!selectedPatient}
                className="flex-1"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {existingCredencial ? 'Ver Credencial' : 'Generar Credencial'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credential Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credencial Digital
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPatient && showCredencial ? (
              <div className="space-y-4">
                <CredencialCard 
                  paciente={selectedPatient}
                  credencial={currentCredencial}
                  logoUrl={systemConfig?.logo_url}
                  systemName={systemConfig?.name}
                />
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadCredencial}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Credencial
                  </Button>
                </div>

                {existingCredencial && (
                  <div className="text-sm text-muted-foreground text-center">
                    Credencial generada el {new Date(existingCredencial.created_at).toLocaleDateString('es-AR')}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Seleccione un paciente para generar la credencial</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CredencialGenerator;