
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Turno } from '@/hooks/useTurnos';
import { Eye, Edit } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  turnos: Turno[];
  onEditTurno: (turno: Turno) => void;
  onCreateTurno: (date: Date, time: string) => void;
  onViewTurno?: (turno: Turno) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  turnos,
  onEditTurno,
  onCreateTurno,
  onViewTurno
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
    return turnos.find(turno => {
      const turnoDate = new Date(turno.fecha);
      return isSameDay(turnoDate, date) && turno.hora === time;
    });
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'programado':
        return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      case 'cancelado':
        return 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200';
      case 'completado':
        return 'bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100';
    }
  };

  console.log('CalendarGrid - turnos:', turnos);
  console.log('CalendarGrid - weekDays:', weekDays);

  return (
    <Card className="flex-1 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-4 border-r">
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
              <div className="text-xs text-gray-500 mt-1">
                {format(day, 'MMM', { locale: es })}
              </div>
            </div>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b min-h-[70px] hover:bg-gray-50">
              <div className="p-3 border-r bg-gray-50 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">{time}</span>
              </div>
              {weekDays.map((day) => {
                const turno = getTurnoForSlot(day, time);
                console.log(`Checking slot ${format(day, 'yyyy-MM-dd')} ${time}:`, turno);
                return (
                  <div key={`${day.toISOString()}-${time}`} className="border-r p-1 relative">
                    {turno ? (
                      <div className={`w-full h-full p-2 rounded border-2 ${getStatusColor(turno.estado)} transition-colors group cursor-pointer`}>
                        <div className="text-xs space-y-1">
                          <div className="font-medium truncate">
                            {turno.pacientes?.nombre} {turno.pacientes?.apellido}
                          </div>
                          <div className="text-xs opacity-75 truncate">
                            Dr. {turno.medicos?.nombre}
                          </div>
                          {turno.motivo && (
                            <div className="text-xs opacity-60 truncate">
                              {turno.motivo}
                            </div>
                          )}
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            {onViewTurno && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewTurno(turno);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditTurno(turno);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        className="w-full h-full p-2 hover:bg-blue-50 border-2 border-dashed border-transparent hover:border-blue-300 transition-colors group"
                        onClick={() => onCreateTurno(day, time)}
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-lg text-gray-400 group-hover:text-blue-500">+</span>
                        </div>
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
