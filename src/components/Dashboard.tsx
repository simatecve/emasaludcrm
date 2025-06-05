
import React from 'react';
import { Users, Calendar, FileText, TrendingUp, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const stats = [
    {
      title: 'Pacientes Totales',
      value: '1,247',
      change: '+12% vs mes anterior',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Turnos Hoy',
      value: '28',
      change: '5 pendientes',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Consultas del Mes',
      value: '456',
      change: '+8% vs mes anterior',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Autorizaciones',
      value: '23',
      change: '12 pendientes',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const recentAppointments = [
    { time: '09:00', patient: 'María González', dni: '12345678', specialty: 'Cardiología', status: 'confirmado' },
    { time: '09:30', patient: 'Juan Pérez', dni: '23456789', specialty: 'Traumatología', status: 'pendiente' },
    { time: '10:00', patient: 'Ana Rodríguez', dni: '34567890', specialty: 'Dermatología', status: 'confirmado' },
    { time: '10:30', patient: 'Carlos López', dni: '45678901', specialty: 'Cardiología', status: 'cancelado' },
  ];

  const obrasSociales = [
    { name: 'OSDE', patients: 245, consultations: 89 },
    { name: 'Swiss Medical', patients: 198, consultations: 76 },
    { name: 'Galeno', patients: 167, consultations: 54 },
    { name: 'Medicus', patients: 134, consultations: 43 },
    { name: 'IOMA', patients: 112, consultations: 38 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
          <p className="text-gray-600">Bienvenido al sistema de gestión de la clínica</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Turnos de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-blue-600">
                      {appointment.time}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patient}</p>
                      <p className="text-sm text-gray-500">DNI: {appointment.dni}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.specialty}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Obras Sociales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Obras Sociales - Este Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {obrasSociales.map((obra, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{obra.name}</p>
                    <p className="text-sm text-gray-500">{obra.patients} pacientes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{obra.consultations}</p>
                    <p className="text-xs text-gray-500">consultas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
