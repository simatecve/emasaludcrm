
import React, { useState } from 'react';
import { addWeeks, subWeeks, startOfToday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTurnos, type Turno } from '@/hooks/useTurnos';
import TurnoForm from '../TurnoForm';
import CalendarHeader from './CalendarHeader';
import CalendarSidebar from './CalendarSidebar';
import CalendarGrid from './CalendarGrid';

const TurnoCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurno, setEditingTurno] = useState<Turno | undefined>();
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [selectedMedico, setSelectedMedico] = useState('');

  const { data: turnos = [], isLoading } = useTurnos();

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

  const handleCreateTurno = (date: Date, time: string) => {
    setEditingTurno(undefined);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTurno(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(date);
    }
  };

  // Filter turnos based on search and filters
  const filteredTurnos = turnos.filter(turno => {
    const matchesSearch = searchTerm === '' || 
      `${turno.pacientes?.nombre} ${turno.pacientes?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecialidad = selectedEspecialidad === '' || 
      turno.medicos?.especialidades?.id?.toString() === selectedEspecialidad;
    
    const matchesMedico = selectedMedico === '' || 
      turno.medico_id.toString() === selectedMedico;

    return matchesSearch && matchesEspecialidad && matchesMedico;
  });

  if (isLoading) {
    return <div className="p-6">Cargando calendario...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onTodayClick={handleTodayClick}
        onNewAppointment={handleNewAppointment}
      />

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
        />

        <CalendarGrid
          currentDate={currentDate}
          turnos={filteredTurnos}
          onEditTurno={handleEditTurno}
          onCreateTurno={handleCreateTurno}
        />
      </div>

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
    </div>
  );
};

export default TurnoCalendarView;
