
import React, { useState } from 'react';
import { Search, Plus, Upload, FileText, User, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patients = [
    {
      id: 1,
      name: 'María González',
      surname: 'González',
      dni: '12345678',
      birthdate: '1985-03-15',
      phone: '+54 11 1234-5678',
      email: 'maria.gonzalez@email.com',
      obraSocial: 'OSDE',
      consultationsThisMonth: 1,
      maxConsultations: 2,
      lastVisit: '2024-05-20'
    },
    {
      id: 2,
      name: 'Juan Pérez',
      surname: 'Pérez',
      dni: '23456789',
      birthdate: '1978-07-22',
      phone: '+54 11 2345-6789',
      email: 'juan.perez@email.com',
      obraSocial: 'Swiss Medical',
      consultationsThisMonth: 2,
      maxConsultations: 2,
      lastVisit: '2024-05-18'
    },
    {
      id: 3,
      name: 'Ana Rodríguez',
      surname: 'Rodríguez',
      dni: '34567890',
      birthdate: '1992-11-08',
      phone: '+54 11 3456-7890',
      email: 'ana.rodriguez@email.com',
      obraSocial: 'Galeno',
      consultationsThisMonth: 0,
      maxConsultations: 3,
      lastVisit: '2024-04-30'
    },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.dni.includes(searchTerm) ||
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.surname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600">Administra los datos de los pacientes y sus obras sociales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nuevo Paciente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por DNI, nombre o apellido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {patient.name} {patient.surname}
                          </h3>
                          <p className="text-sm text-gray-500">DNI: {patient.dni}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{patient.obraSocial}</p>
                        <div className="flex items-center gap-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            patient.consultationsThisMonth >= patient.maxConsultations 
                              ? 'bg-red-500' 
                              : 'bg-green-500'
                          }`}></span>
                          <span className="text-xs text-gray-500">
                            {patient.consultationsThisMonth}/{patient.maxConsultations} consultas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
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
                    {selectedPatient.name} {selectedPatient.surname}
                  </h3>
                  <p className="text-gray-600">DNI: {selectedPatient.dni}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Nacimiento: {new Date(selectedPatient.birthdate).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedPatient.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Obra Social</h4>
                  <p className="text-blue-600 font-medium">{selectedPatient.obraSocial}</p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Consultas Este Mes</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedPatient.consultationsThisMonth}
                    </span>
                    <span className="text-sm text-gray-600">
                      de {selectedPatient.maxConsultations} permitidas
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(selectedPatient.consultationsThisMonth / selectedPatient.maxConsultations) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Editar Paciente
                  </Button>
                  <Button variant="outline" className="w-full">
                    Ver Historial
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
    </div>
  );
};

export default PatientManagement;
