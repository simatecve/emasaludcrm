
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { useMedicos } from '@/hooks/useMedicos';

interface CalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedEspecialidad: string;
  onEspecialidadChange: (value: string) => void;
  selectedMedico: string;
  onMedicoChange: (value: string) => void;
  selectedEstado: string;
  onEstadoChange: (value: string) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onDateSelect,
  searchTerm,
  onSearchChange,
  selectedEspecialidad,
  onEspecialidadChange,
  selectedMedico,
  onMedicoChange,
  selectedEstado,
  onEstadoChange
}) => {
  const { data: especialidades } = useEspecialidades();
  const { data: medicos } = useMedicos();

  const estados = [
    { value: 'programado', label: 'Programado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'completado', label: 'Completado' }
  ];

  return (
    <div className="w-80 space-y-4">
      {/* Mini Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">Buscar paciente</Label>
            <Input
              id="search"
              placeholder="Nombre del paciente..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="especialidad">Especialidad</Label>
            <select
              id="especialidad"
              className="w-full p-2 border rounded-md bg-white"
              value={selectedEspecialidad}
              onChange={(e) => onEspecialidadChange(e.target.value)}
            >
              <option value="">Todas las especialidades</option>
              {especialidades?.map((esp) => (
                <option key={esp.id} value={esp.id.toString()}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="medico">Médico</Label>
            <select
              id="medico"
              className="w-full p-2 border rounded-md bg-white"
              value={selectedMedico}
              onChange={(e) => onMedicoChange(e.target.value)}
            >
              <option value="">Todos los médicos</option>
              {medicos?.map((med) => (
                <option key={med.id} value={med.id.toString()}>
                  Dr. {med.nombre} {med.apellido}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              className="w-full p-2 border rounded-md bg-white"
              value={selectedEstado}
              onChange={(e) => onEstadoChange(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onSearchChange('');
              onEspecialidadChange('');
              onMedicoChange('');
              onEstadoChange('');
            }}
          >
            Limpiar filtros
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estadísticas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Hoy:</span>
              <span className="font-medium">12 turnos</span>
            </div>
            <div className="flex justify-between">
              <span>Esta semana:</span>
              <span className="font-medium">48 turnos</span>
            </div>
            <div className="flex justify-between">
              <span>Pendientes:</span>
              <span className="font-medium text-blue-600">8 turnos</span>
            </div>
            <div className="flex justify-between">
              <span>Confirmados:</span>
              <span className="font-medium text-green-600">25 turnos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSidebar;
