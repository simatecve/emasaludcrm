
import React, { useState } from 'react';
import { Calendar, Clock, Plus, User, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AppointmentScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');

  const specialties = ['Todas', 'Cardiología', 'Traumatología', 'Dermatología', 'Ginecología', 'Pediatría'];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const appointments = [
    { time: '09:00', patient: 'María González', dni: '12345678', specialty: 'Cardiología', doctor: 'Dr. Martínez' },
    { time: '09:30', patient: 'Juan Pérez', dni: '23456789', specialty: 'Traumatología', doctor: 'Dr. López' },
    { time: '10:30', patient: 'Ana Rodríguez', dni: '34567890', specialty: 'Dermatología', doctor: 'Dra. García' },
    { time: '15:00', patient: 'Carlos López', dni: '45678901', specialty: 'Cardiología', doctor: 'Dr. Martínez' },
  ];

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(apt => apt.time === time);
  };

  const isSlotAvailable = (time: string) => {
    return !getAppointmentForSlot(time);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Turnos</h1>
          <p className="text-gray-600">Programa y administra las citas médicas</p>
        </div>
        <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4" />
          Nuevo Turno
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">
                    {selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="p-2 font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  
                  {getDaysInMonth(selectedDate).map((date, index) => (
                    <div
                      key={index}
                      onClick={() => date && setSelectedDate(date)}
                      className={`p-2 cursor-pointer rounded transition-colors ${
                        date
                          ? isSelected(date)
                            ? 'bg-blue-600 text-white'
                            : isToday(date)
                            ? 'bg-blue-100 text-blue-600 font-semibold'
                            : 'hover:bg-gray-100'
                          : ''
                      }`}
                    >
                      {date?.getDate()}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialty Filter */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {specialties.map(specialty => (
                  <button
                    key={specialty}
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      selectedSpecialty === specialty
                        ? 'bg-blue-100 text-blue-600 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Slots */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Turnos - {selectedDate.toLocaleDateString('es-AR')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar paciente..." 
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {timeSlots.map(time => {
                  const appointment = getAppointmentForSlot(time);
                  const available = isSlotAvailable(time);
                  
                  return (
                    <div
                      key={time}
                      className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                        available
                          ? 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{time}</span>
                        {available ? (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            Disponible
                          </span>
                        ) : (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            Ocupado
                          </span>
                        )}
                      </div>
                      
                      {appointment ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{appointment.patient}</span>
                          </div>
                          <p className="text-xs text-gray-500">DNI: {appointment.dni}</p>
                          <p className="text-xs text-blue-600">{appointment.specialty}</p>
                          <p className="text-xs text-gray-600">{appointment.doctor}</p>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <Plus className="h-6 w-6 text-green-500 mx-auto mb-1" />
                          <p className="text-xs text-green-600">Asignar turno</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
