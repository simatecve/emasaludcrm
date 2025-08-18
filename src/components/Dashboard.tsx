
import React from 'react';
import { Users, Calendar, FileText, TrendingUp, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTurnosHoy } from '@/hooks/useTurnosHoy';
import { useObrasSocialesStats } from '@/hooks/useObrasSocialesStats';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: turnosHoy, isLoading: turnosLoading } = useTurnosHoy();
  const { data: obrasSocialesStats, isLoading: obrasLoading } = useObrasSocialesStats();

  const statsCards = [
    {
      title: 'Pacientes Registrados',
      value: statsLoading ? '...' : (stats?.totalPacientes?.toString() || '0'),
      change: 'Total en sistema',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Turnos Hoy',
      value: statsLoading ? '...' : (stats?.turnosHoy?.toString() || '0'),
      change: `${stats?.turnosPendientesHoy || 0} pendientes`,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Consultas del Mes',
      value: statsLoading ? '...' : (stats?.consultasMes?.toString() || '0'),
      change: 'Consultas realizadas',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Autorizaciones',
      value: statsLoading ? '...' : (stats?.autorizacionesPendientes?.toString() || '0'),
      change: 'Pendientes de revisión',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
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
        {statsCards.map((stat, index) => {
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
            {turnosLoading ? (
              <div className="text-center py-4">Cargando turnos...</div>
            ) : (
              <div className="space-y-3">
                {turnosHoy && turnosHoy.length > 0 ? (
                  turnosHoy.slice(0, 4).map((turno) => (
                    <div key={turno.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-blue-600">
                          {turno.hora}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {turno.pacientes?.nombre} {turno.pacientes?.apellido}
                          </p>
                          <p className="text-sm text-gray-500">DNI: {turno.pacientes?.dni}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {turno.medicos?.especialidades?.nombre || 'Sin especialidad'}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          turno.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                          turno.estado === 'programado' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {turno.estado}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay turnos programados para hoy
                  </div>
                )}
              </div>
            )}
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
            {obrasLoading ? (
              <div className="text-center py-4">Cargando estadísticas...</div>
            ) : (
              <div className="space-y-3">
                {obrasSocialesStats && obrasSocialesStats.length > 0 ? (
                  obrasSocialesStats.map((obra, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{obra.nombre}</p>
                        <p className="text-sm text-gray-500">{obra.pacientes} pacientes</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{obra.consultas}</p>
                        <p className="text-xs text-gray-500">consultas</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No hay datos de obras sociales disponibles
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
