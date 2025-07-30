import React, { useState } from 'react';
import { Search, Plus, Upload, FileText, User, Phone, Calendar, Edit, Trash2, MapPin, Users, Activity, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient, Patient, PatientFormData } from '@/hooks/usePatients';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { useCreateDiagnostico, useUpdateDiagnostico } from '@/hooks/useDiagnosticos';
import PatientForm from './PatientForm';
import PatientTable from './PatientTable';
import DiagnosticosList from './DiagnosticosList';
import DiagnosticoForm from './DiagnosticoForm';
import PatientImport from './PatientImport';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  
  // Nuevos estados para filtros
  const [selectedObraSocial, setSelectedObraSocial] = useState<string>('all');
  const [selectedSexo, setSelectedSexo] = useState<string>('all');
  const [selectedProvincia, setSelectedProvincia] = useState<string>('all');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: patients, isLoading, error } = usePatients();
  const { data: obrasSociales } = useObrasSociales();
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const createDiagnostico = useCreateDiagnostico();
  const updateDiagnostico = useUpdateDiagnostico();

  // Obtener valores únicos para filtros
  const uniqueProvincias = Array.from(new Set(patients?.map(p => p.provincia).filter(Boolean))).sort();
  const uniqueSexos = Array.from(new Set(patients?.map(p => p.sexo).filter(Boolean))).sort();

  const filteredPatients = patients?.filter(patient => {
    // Filtro de búsqueda por texto
    const searchMatch = searchTerm === '' || 
      patient.dni.includes(searchTerm) ||
      patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.localidad && patient.localidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.provincia && patient.provincia.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por obra social
    const obraSocialMatch = selectedObraSocial === 'all' || 
      (selectedObraSocial === 'sin-obra-social' && !patient.obra_social_id) ||
      patient.obra_social_id?.toString() === selectedObraSocial;

    // Filtro por sexo
    const sexoMatch = selectedSexo === 'all' || patient.sexo === selectedSexo;

    // Filtro por provincia
    const provinciaMatch = selectedProvincia === 'all' || patient.provincia === selectedProvincia;

    // Filtro por estado (activo/inactivo)
    const estadoMatch = selectedEstado === 'all' || 
      (selectedEstado === 'activo' && patient.activo) ||
      (selectedEstado === 'inactivo' && !patient.activo);

    return searchMatch && obraSocialMatch && sexoMatch && provinciaMatch && estadoMatch;
  }) || [];

  const clearAllFilters = () => {
    setSelectedObraSocial('all');
    setSelectedSexo('all');
    setSelectedProvincia('all');
    setSelectedEstado('all');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedObraSocial !== 'all' || selectedSexo !== 'all' || 
    selectedProvincia !== 'all' || selectedEstado !== 'all' || searchTerm !== '';

  const handleCreatePatient = (data: PatientFormData) => {
    createPatient.mutate(data, {
      onSuccess: () => {
        setShowForm(false);
      }
    });
  };

  const handleUpdatePatient = (data: PatientFormData) => {
    if (editingPatient) {
      updatePatient.mutate({ id: editingPatient.id, data }, {
        onSuccess: () => {
          setEditingPatient(null);
          setShowForm(false);
          if (selectedPatient?.id === editingPatient.id) {
            setSelectedPatient(null);
          }
        }
      });
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    if (confirm(`¿Está seguro que desea eliminar al paciente ${patient.nombre} ${patient.apellido}?`)) {
      deletePatient.mutate(patient.id, {
        onSuccess: () => {
          if (selectedPatient?.id === patient.id) {
            setSelectedPatient(null);
          }
        }
      });
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleNewPatient = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('details');
  };

  if (showForm) {
    return (
      <div className="p-6">
        <PatientForm
          patient={editingPatient || undefined}
          onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
          onCancel={handleCancelForm}
          isLoading={createPatient.isPending || updatePatient.isPending}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar los pacientes: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600">Administra los datos de los pacientes y sus obras sociales</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4" />
            Importar Excel/CSV
          </Button>
          <Button onClick={handleNewPatient} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Pacientes</TabsTrigger>
          {selectedPatient && (
            <>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="space-y-4">
                    {/* Búsqueda principal */}
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Buscar por DNI, nombre, apellido, localidad..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {hasActiveFilters && (
                          <Badge variant="destructive" className="ml-1 text-xs">
                            {[selectedObraSocial !== 'all', selectedSexo !== 'all', selectedProvincia !== 'all', selectedEstado !== 'all', searchTerm !== ''].filter(Boolean).length}
                          </Badge>
                        )}
                      </Button>
                    </div>

                    {/* Filtros desplegables */}
                    {showFilters && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-700">Filtros Avanzados</h3>
                          {hasActiveFilters && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllFilters}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Filtro por Obra Social */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Obra Social
                            </label>
                            <Select value={selectedObraSocial} onValueChange={setSelectedObraSocial}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todas" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todas las obras sociales</SelectItem>
                                <SelectItem value="sin-obra-social">Sin obra social</SelectItem>
                                {obrasSociales?.filter(os => os.activa).map((obraSocial) => (
                                  <SelectItem key={obraSocial.id} value={obraSocial.id.toString()}>
                                    {obraSocial.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Filtro por Sexo */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Sexo
                            </label>
                            <Select value={selectedSexo} onValueChange={setSelectedSexo}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {uniqueSexos.map((sexo) => (
                                  <SelectItem key={sexo} value={sexo}>
                                    {sexo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Filtro por Provincia */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Provincia
                            </label>
                            <Select value={selectedProvincia} onValueChange={setSelectedProvincia}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todas" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todas las provincias</SelectItem>
                                {uniqueProvincias.map((provincia) => (
                                  <SelectItem key={provincia} value={provincia}>
                                    {provincia}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Filtro por Estado */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                              Estado
                            </label>
                            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                              <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="activo">Activos</SelectItem>
                                <SelectItem value="inactivo">Inactivos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Resumen de resultados */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-gray-600">
                            Mostrando {filteredPatients.length} de {patients?.length || 0} pacientes
                          </span>
                          {hasActiveFilters && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Filtros activos:</span>
                              {selectedObraSocial !== 'all' && (
                                <Badge variant="secondary">
                                  {selectedObraSocial === 'sin-obra-social' ? 'Sin OS' : 
                                    obrasSociales?.find(os => os.id.toString() === selectedObraSocial)?.nombre}
                                </Badge>
                              )}
                              {selectedSexo !== 'all' && (
                                <Badge variant="secondary">{selectedSexo}</Badge>
                              )}
                              {selectedProvincia !== 'all' && (
                                <Badge variant="secondary">{selectedProvincia}</Badge>
                              )}
                              {selectedEstado !== 'all' && (
                                <Badge variant="secondary">{selectedEstado === 'activo' ? 'Activos' : 'Inactivos'}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">Cargando pacientes...</div>
                  ) : (
                    <PatientTable
                      patients={filteredPatients}
                      onEdit={handleEditPatient}
                      onDelete={handleDeletePatient}
                      onSelect={handlePatientSelect}
                      selectedPatient={selectedPatient}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Patient Details Preview */}
            <div className="space-y-4">
              {selectedPatient ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Detalles del Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {selectedPatient.nombre} {selectedPatient.apellido}
                      </h3>
                      <p className="text-gray-600">DNI: {selectedPatient.dni}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setActiveTab('details')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Ver Detalles
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('diagnostics')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Activity className="h-4 w-4" />
                        Diagnósticos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Selecciona un paciente para ver sus detalles
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {selectedPatient && (
          <>
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Detalles Completos - {selectedPatient.nombre} {selectedPatient.apellido}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedPatient.nombre} {selectedPatient.apellido}
                    </h3>
                    <p className="text-gray-600">DNI: {selectedPatient.dni}</p>
                    {selectedPatient.sexo && (
                      <p className="text-sm text-gray-500">Sexo: {selectedPatient.sexo}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        Nacimiento: {new Date(selectedPatient.fecha_nacimiento).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    {selectedPatient.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedPatient.telefono}</span>
                      </div>
                    )}
                    {selectedPatient.email && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedPatient.email}</span>
                      </div>
                    )}
                    {(selectedPatient.localidad || selectedPatient.provincia) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {selectedPatient.localidad}
                          {selectedPatient.localidad && selectedPatient.provincia && ', '}
                          {selectedPatient.provincia}
                        </span>
                      </div>
                    )}
                    {selectedPatient.nacionalidad && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Nacionalidad: {selectedPatient.nacionalidad}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Obra Social</h4>
                    <p className="text-blue-600 font-medium">
                      {selectedPatient.obra_social?.nombre || 'Sin obra social'}
                    </p>
                    {selectedPatient.numero_afiliado && (
                      <p className="text-sm text-gray-600">
                        Nº Afiliado: {selectedPatient.numero_afiliado}
                      </p>
                    )}
                  </div>

                  {(selectedPatient.cuil_titular || selectedPatient.cuil_beneficiario) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Información CUIL</h4>
                      {selectedPatient.cuil_titular && (
                        <p className="text-sm text-gray-600">
                          CUIL Titular: {selectedPatient.cuil_titular}
                        </p>
                      )}
                      {selectedPatient.cuil_beneficiario && (
                        <p className="text-sm text-gray-600">
                          CUIL Beneficiario: {selectedPatient.cuil_beneficiario}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Consultas Este Mes</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedPatient.consultas_mes_actual}
                      </span>
                      <span className="text-sm text-gray-600">
                        de {selectedPatient.consultas_maximas} permitidas
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(selectedPatient.consultas_mes_actual / selectedPatient.consultas_maximas) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleEditPatient(selectedPatient)}
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Paciente
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full flex items-center gap-2"
                      onClick={() => handleDeletePatient(selectedPatient)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar Paciente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-4">
              <DiagnosticosList
                pacienteId={selectedPatient.id}
                pacienteNombre={`${selectedPatient.nombre} ${selectedPatient.apellido}`}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      <PatientImport 
        isOpen={showImport}
        onClose={() => setShowImport(false)}
      />
    </div>
  );
};

export default PatientManagement;
