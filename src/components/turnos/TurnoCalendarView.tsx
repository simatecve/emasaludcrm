import React, { useState } from 'react';
import { addWeeks, subWeeks, startOfToday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTurnos, useDeleteTurno, type Turno } from '@/hooks/useTurnos';
import TurnoForm from '../TurnoForm';
import CalendarHeader from './CalendarHeader';
import CalendarSidebar from './CalendarSidebar';
import CalendarGrid from './CalendarGrid';
import TurnoList from './TurnoList';
import { Calendar, List, Grid3x3, Eye } from 'lucide-react';

const TurnoCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | undefined>();
  const [viewType, setViewType] = useState<'calendar' | 'list' | 'grid'>('calendar');
  const [selectedTurno, setSelectedTurno] = useState<Turno | undefined>();
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [selectedMedico, setSelectedMedico] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  const { data: turnos = [], isLoading } = useTurnos();
  const deleteMutation = useDeleteTurno();

  console.log('TurnoCalendarView - turnos loaded:', turnos);

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleTodayClick = () => {
    const today = startOfToday();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleNewAppointment = () => {
    setEditingTurno(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTurno = (turno: Turno) => {
    setEditingTurno(turno);
    setIsDialogOpen(true);
  };

  const handleViewTurno = (turno: Turno) => {
    setSelectedTurno(turno);
    setIsDetailDialogOpen(true);
  };

  const handleCreateTurno = (date: Date, time: string) => {
    setEditingTurno(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTurno(undefined);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedTurno(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(date);
    }
  };

  const handleDeleteTurno = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  // Filter turnos based on search and filters
  const filteredTurnos = turnos.filter(turno => {
    const matchesSearch = searchTerm === '' || 
      `${turno.pacientes?.nombre} ${turno.pacientes?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecialidad = selectedEspecialidad === '' || 
      turno.medicos?.especialidades?.id?.toString() === selectedEspecialidad;
    
    const matchesMedico = selectedMedico === '' || 
      turno.medico_id.toString() === selectedMedico;

    const matchesEstado = selectedEstado === '' || 
      turno.estado === selectedEstado;

    return matchesSearch && matchesEspecialidad && matchesMedico && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTurnos.map((turno) => (
        <Card key={turno.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {turno.pacientes?.nombre} {turno.pacientes?.apellido}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewTurno(turno)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Fecha:</strong> {new Date(turno.fecha).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Hora:</strong> {turno.hora}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Médico:</strong> Dr. {turno.medicos?.nombre} {turno.medicos?.apellido}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Estado:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                  turno.estado === 'programado' ? 'bg-blue-100 text-blue-800' :
                  turno.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {turno.estado}
                </span>
              </p>
              {turno.motivo && (
                <p className="text-sm text-gray-600">
                  <strong>Motivo:</strong> {turno.motivo}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendario de Turnos</h1>
        <div className="flex items-center space-x-2">
          <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'calendar' | 'list' | 'grid')}>
            <TabsList>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendario
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4" />
                Cuadrícula
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex space-x-6">
        <CalendarSidebar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedEspecialidad={selectedEspecialidad}
          onEspecialidadChange={setSelectedEspecialidad}
          selectedMedico={selectedMedico}
          onMedicoChange={setSelectedMedico}
          selectedEstado={selectedEstado}
          onEstadoChange={setSelectedEstado}
          turnos={turnos}
        />

        <div className="flex-1">
          {viewType === 'calendar' && (
            <>
              <CalendarHeader
                currentDate={currentDate}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
                onTodayClick={handleTodayClick}
                onNewAppointment={handleNewAppointment}
              />
              <CalendarGrid
                currentDate={currentDate}
                turnos={filteredTurnos}
                onEditTurno={handleEditTurno}
                onCreateTurno={handleCreateTurno}
                onViewTurno={handleViewTurno}
              />
            </>
          )}

          {viewType === 'list' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Lista de Turnos</h2>
                <Button onClick={handleNewAppointment}>
                  Nuevo Turno
                </Button>
              </div>
              <TurnoList
                turnos={filteredTurnos}
                totalTurnos={filteredTurnos.length}
                onEdit={handleEditTurno}
                onDelete={handleDeleteTurno}
                onView={handleViewTurno}
              />
            </>
          )}

          {viewType === 'grid' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Vista de Cuadrícula</h2>
                <Button onClick={handleNewAppointment}>
                  Nuevo Turno
                </Button>
              </div>
              {renderGridView()}
            </>
          )}

          {filteredTurnos.length === 0 && (
            <Card className="mt-8">
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay turnos encontrados</p>
                  <p className="text-sm mt-2">
                    {turnos.length === 0 
                      ? 'No hay turnos registrados en el sistema' 
                      : 'Intenta ajustar los filtros para encontrar turnos'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog for creating/editing turno */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingTurno ? 'Editar Turno' : 'Nuevo Turno'}
            </DialogTitle>
          </DialogHeader>
          <TurnoForm 
            turno={editingTurno} 
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for viewing turno details */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Turno</DialogTitle>
          </DialogHeader>
          {selectedTurno && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Información del Paciente</h3>
                  <p><strong>Nombre:</strong> {selectedTurno.pacientes?.nombre} {selectedTurno.pacientes?.apellido}</p>
                  <p><strong>DNI:</strong> {selectedTurno.pacientes?.dni}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Información del Médico</h3>
                  <p><strong>Nombre:</strong> Dr. {selectedTurno.medicos?.nombre} {selectedTurno.medicos?.apellido}</p>
                  <p><strong>Matrícula:</strong> {selectedTurno.medicos?.matricula}</p>
                  {selectedTurno.medicos?.especialidades && (
                    <p><strong>Especialidad:</strong> {selectedTurno.medicos.especialidades.nombre}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Información del Turno</h3>
                  <p><strong>Fecha:</strong> {new Date(selectedTurno.fecha).toLocaleDateString()}</p>
                  <p><strong>Hora:</strong> {selectedTurno.hora}</p>
                  <p><strong>Estado:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedTurno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                      selectedTurno.estado === 'programado' ? 'bg-blue-100 text-blue-800' :
                      selectedTurno.estado === 'cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTurno.estado}
                    </span>
                  </p>
                </div>
              </div>

              {selectedTurno.motivo && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Motivo</h3>
                  <p className="text-gray-700">{selectedTurno.motivo}</p>
                </div>
              )}

              {selectedTurno.observaciones && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Observaciones</h3>
                  <p className="text-gray-700">{selectedTurno.observaciones}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseDetailDialog}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  handleCloseDetailDialog();
                  handleEditTurno(selectedTurno);
                }}>
                  Editar Turno
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TurnoCalendarView;
