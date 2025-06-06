
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Turno } from '@/hooks/useTurnos';

interface CalendarGridProps {
  currentDate: Date;
  turnos: Turno[];
  onEditTurno: (turno: Turno) => void;
  onCreateTurno: (date: Date, time: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  turnos,
  onEditTurno,
  onCreateTurno
}) => {
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getTurnoForSlot = (date: Date, time: string) => {
    return turnos.find(turno => 
      isSameDay(new Date(turno.fecha), date) && turno.hora === time
    );
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'programado':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'completado':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <Card className="flex-1">
      <CardContent className="p-0">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r bg-gray-50">
            <span className="text-sm font-medium text-gray-600">Hora</span>
          </div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-4 border-r text-center">
              <div className="text-sm font-medium text-gray-900">
                {format(day, 'EEE', { locale: es })}
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b min-h-[60px]">
              <div className="p-2 border-r bg-gray-50 flex items-center">
                <span className="text-sm text-gray-600">{time}</span>
              </div>
              {weekDays.map((day) => {
                const turno = getTurnoForSlot(day, time);
                return (
                  <div key={`${day.toISOString()}-${time}`} className="border-r p-1">
                    {turno ? (
                      <Button
                        variant="ghost"
                        className={`w-full h-full p-2 text-xs ${getStatusColor(turno.estado)} hover:opacity-80`}
                        onClick={() => onEditTurno(turno)}
                      >
                        <div className="text-left">
                          <div className="font-medium truncate">
                            {turno.pacientes?.nombre} {turno.pacientes?.apellido}
                          </div>
                          <div className="text-xs opacity-75 truncate">
                            Dr. {turno.medicos?.nombre}
                          </div>
                        </div>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="w-full h-full p-2 hover:bg-blue-50 border-2 border-dashed border-transparent hover:border-blue-300"
                        onClick={() => onCreateTurno(day, time)}
                      >
                        <span className="text-xs text-gray-400">+</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarGrid;
