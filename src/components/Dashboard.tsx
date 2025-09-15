
import React from 'react';
import { Users, Calendar, FileText, TrendingUp, Clock, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTurnosHoy } from '@/hooks/useTurnosHoy';
import { useObrasSocialesStats } from '@/hooks/useObrasSocialesStats';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: turnosHoy, isLoading: turnosLoading } = useTurnosHoy();
  const { data: obrasSocialesStats, isLoading: obrasLoading } = useObrasSocialesStats();

  // Chart configurations
  const chartConfig = {
    confirmado: {
      label: "Confirmado",
      color: "hsl(var(--chart-1))",
    },
    programado: {
      label: "Programado", 
      color: "hsl(var(--chart-2))",
    },
    cancelado: {
      label: "Cancelado",
      color: "hsl(var(--chart-3))",
    },
  };

  const statsChartConfig = {
    pacientes: {
      label: "Pacientes",
      color: "hsl(var(--chart-1))",
    },
    turnos: {
      label: "Turnos Hoy",
      color: "hsl(var(--chart-2))",
    },
    consultas: {
      label: "Consultas",
      color: "hsl(var(--chart-3))",
    },
    autorizaciones: {
      label: "Autorizaciones",
      color: "hsl(var(--chart-4))",
    },
  };

  // Prepare chart data
  const turnosStatusData = React.useMemo(() => {
    if (!turnosHoy) return [];
    
    const statusCount = turnosHoy.reduce((acc, turno) => {
      acc[turno.estado] = (acc[turno.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
      fill: chartConfig[status as keyof typeof chartConfig]?.color || "hsl(var(--chart-5))"
    }));
  }, [turnosHoy]);

  const statsData = React.useMemo(() => {
    if (!stats) return [];
    
    return [
      { name: "Pacientes", value: stats.totalPacientes, fill: "hsl(var(--chart-1))" },
      { name: "Turnos", value: stats.turnosHoy, fill: "hsl(var(--chart-2))" },
      { name: "Consultas", value: stats.consultasMes, fill: "hsl(var(--chart-3))" },
      { name: "Autorizaciones", value: stats.autorizacionesPendientes, fill: "hsl(var(--chart-4))" }
    ];
  }, [stats]);

  const obrasSocialesChartData = React.useMemo(() => {
    if (!obrasSocialesStats) return [];
    
    return obrasSocialesStats.slice(0, 6).map((obra, index) => ({
      name: obra.nombre.length > 15 ? obra.nombre.substring(0, 15) + '...' : obra.nombre,
      pacientes: obra.pacientes,
      consultas: obra.consultas,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }));
  }, [obrasSocialesStats]);

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-center py-4">Cargando datos...</div>
            ) : (
              <ChartContainer config={statsChartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent hideLabel />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Turnos Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Estado de Turnos Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {turnosLoading ? (
              <div className="text-center py-4">Cargando turnos...</div>
            ) : turnosStatusData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={turnosStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {turnosStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center py-4 text-gray-500 h-[300px] flex items-center justify-center">
                No hay turnos para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Obras Sociales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Obras Sociales - Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {obrasLoading ? (
              <div className="text-center py-4">Cargando estadísticas...</div>
            ) : obrasSocialesChartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={obrasSocialesChartData} layout="horizontal">
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="consultas" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center py-4 text-gray-500 h-[300px] flex items-center justify-center">
                No hay datos de obras sociales disponibles
              </div>
            )}
          </CardContent>
        </Card>

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
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {turnosHoy && turnosHoy.length > 0 ? (
                  turnosHoy.slice(0, 8).map((turno) => (
                    <div key={turno.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-primary">
                          {turno.hora}
                        </div>
                        <div>
                          <p className="font-medium">
                            {turno.pacientes?.nombre} {turno.pacientes?.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">DNI: {turno.pacientes?.dni}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {turno.medicos?.especialidades?.nombre || 'Sin especialidad'}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          turno.estado === 'confirmado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          turno.estado === 'programado' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {turno.estado}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No hay turnos programados para hoy
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
