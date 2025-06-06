
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, User, Plus } from 'lucide-react';
import { Turno } from '@/hooks/useTurnos';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface TurnoCalendarViewProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
  onNewTurno: () => void;
}

const TurnoCalendarView = ({ turnos, onEdit, onNewTurno }: TurnoCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  const getTurnosForDateAndTime = (date: Date, time: string) => {
    return turnos.filter(turno => 
      isSameDay(new Date(turno.fecha), date) && turno.hora === time
    );
  };

  const getTurnosForDate = (date: Date) => {
    return turnos.filter(turno => isSameDay(new Date(turno.fecha), date));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'programado':
        return 'bg-blue-100 text-blue-800';
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'completado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTurnos = turnos.filter(turno => 
    turno.pacientes?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turno.pacientes?.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Sidebar izquierdo */}
      <div className="col-span-3 space-y-4">
        {/* Calendario pequeño */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle className="text-lg">Calendario</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  ←
                </Button>
                <h3 className="font-medium">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  →
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                <div key={day} className="text-center p-1 font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {monthDays.map((day, index) => {
                const dayTurnos = getTurnosForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const hasAppointments = dayTurnos.length > 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      p-1 text-xs rounded relative hover:bg-blue-50
                      ${isSelected ? 'bg-blue-500 text-white' : ''}
                      ${hasAppointments && !isSelected ? 'bg-blue-100 text-blue-700 font-medium' : ''}
                    `}
                  >
                    {format(day, 'd')}
                    {hasAppointments && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Especialidades */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-blue-600 bg-blue-50">
                Todas
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                Cardiología
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área principal */}
      <div className="col-span-9 space-y-4">
        {/* Header con búsqueda */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Turnos - {format(selectedDate, 'dd/MM/yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={onNewTurno} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Turno
            </Button>
          </div>
        </div>

        {/* Grid de horarios */}
        <div className="grid grid-cols-3 gap-4">
          {timeSlots.map((time) => {
            const turnosEnHorario = getTurnosForDateAndTime(selectedDate, time);
            
            return (
              <Card key={time} className="min-h-[120px]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-lg">{time}</span>
                    {turnosEnHorario.length === 0 ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Ocupado
                      </Badge>
                    )}
                  </div>
                  
                  {turnosEnHorario.length === 0 ? (
                    <Button
                      variant="ghost"
                      className="w-full h-16 border-2 border-dashed border-green-300 text-green-600 hover:bg-green-50"
                      onClick={onNewTurno}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Asignar turno
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      {turnosEnHorario.map((turno) => (
                        <div
                          key={turno.id}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getEstadoColor(turno.estado)}`}
                          onClick={() => onEdit(turno)}
                        >
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {turno.pacientes?.nombre} {turno.pacientes?.apellido}
                              </p>
                              <p className="text-xs text-gray-600">
                                DNI: {turno.pacientes?.dni}
                              </p>
                              <p className="text-xs text-blue-600">
                                {turno.medicos?.especialidades?.nombre}
                              </p>
                              <p className="text-xs text-gray-500">
                                Dr. {turno.medicos?.apellido}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TurnoCalendarView;
