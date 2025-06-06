
import { useState } from 'react';
import { Turno } from '@/hooks/useTurnos';

export const useTurnoFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');

  const clearFilters = () => {
    setSelectedDate(undefined);
    setSelectedEspecialidad('');
    setSelectedEstado('');
    setSearchTerm('');
  };

  const filterTurnos = (turnos: Turno[] | undefined) => {
    return turnos?.filter(turno => {
      const matchesSearch = turno.pacientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turno.pacientes?.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turno.pacientes?.dni.includes(searchTerm) ||
        turno.medicos?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turno.medicos?.apellido.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !selectedDate || 
        new Date(turno.fecha).toDateString() === selectedDate.toDateString();

      const matchesEspecialidad = !selectedEspecialidad || 
        turno.medicos?.especialidades?.nombre === selectedEspecialidad;

      const matchesEstado = !selectedEstado || turno.estado === selectedEstado;

      return matchesSearch && matchesDate && matchesEspecialidad && matchesEstado;
    }) || [];
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedDate,
    setSelectedDate,
    selectedEspecialidad,
    setSelectedEspecialidad,
    selectedEstado,
    setSelectedEstado,
    clearFilters,
    filterTurnos
  };
};
