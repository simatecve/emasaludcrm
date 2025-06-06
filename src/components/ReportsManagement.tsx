
import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, DollarSign, Users, TrendingUp, BarChart3, ChartBar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useConsultasReport, useTurnosReport, useRevenueReport, usePeriodStats, useChartsData, type ReportFilters } from '@/hooks/useReports';
import { useMedicos } from '@/hooks/useMedicos';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { usePatients } from '@/hooks/usePatients';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsManagement = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
  });

  const { data: medicos } = useMedicos();
  const { data: especialidades } = useEspecialidades();
  const { data: obrasSociales } = useObrasSociales();
  const { data: pacientes } = usePatients();

  const { data: consultasReport, isLoading: consultasLoading } = useConsultasReport(filters);
  const { data: turnosReport, isLoading: turnosLoading } = useTurnosReport(filters);
  const { data: revenueReport, isLoading: revenueLoading } = useRevenueReport(filters);
  const { data: periodStats, isLoading: periodStatsLoading } = usePeriodStats(filters);
  const { data: chartsData, isLoading: chartsLoading } = useChartsData(filters);

  const updateFilter = (key: keyof ReportFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
    });
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    
    // Aplanar objetos anidados para CSV
    const flattenedData = data.map(item => {
      const flattened: any = {};
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'object' && item[key] !== null) {
          if (key === 'paciente') {
            flattened['Paciente_Nombre'] = item[key].nombre;
            flattened['Paciente_Apellido'] = item[key].apellido;
            flattened['Paciente_DNI'] = item[key].dni;
          } else if (key === 'medico' && typeof item[key] === 'object') {
            flattened['Medico_Nombre'] = item[key].nombre;
            flattened['Medico_Apellido'] = item[key].apellido;
          } else {
            flattened[key] = JSON.stringify(item[key]);
          }
        } else {
          flattened[key] = item[key];
        }
      });
      return flattened;
    });

    const csvContent = [
      Object.keys(flattenedData[0]).join(','),
      ...flattenedData.map(row => Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes del Sistema</h1>
          <p className="text-gray-600 mt-1">Análisis completo de la gestión clínica</p>
        </div>
        <Button onClick={clearFilters} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Limpiar Filtros
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
              <Input
                type="date"
                value={filters.fechaInicio || ''}
                onChange={(e) => updateFilter('fechaInicio', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Fin</label>
              <Input
                type="date"
                value={filters.fechaFin || ''}
                onChange={(e) => updateFilter('fechaFin', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Médico</label>
              <Select value={filters.medicoId?.toString() || ''} onValueChange={(value) => updateFilter('medicoId', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los médicos</SelectItem>
                  {medicos?.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id.toString()}>
                      {medico.nombre} {medico.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Especialidad</label>
              <Select value={filters.especialidadId?.toString() || ''} onValueChange={(value) => updateFilter('especialidadId', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las especialidades</SelectItem>
                  {especialidades?.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id.toString()}>
                      {esp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Obra Social</label>
              <Select value={filters.obraSocialId?.toString() || ''} onValueChange={(value) => updateFilter('obraSocialId', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las obras sociales</SelectItem>
                  {obrasSociales?.map((os) => (
                    <SelectItem key={os.id} value={os.id.toString()}>
                      {os.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Paciente</label>
              <Select value={filters.pacienteId?.toString() || ''} onValueChange={(value) => updateFilter('pacienteId', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los pacientes</SelectItem>
                  {pacientes?.slice(0, 100).map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id.toString()}>
                      {paciente.nombre} {paciente.apellido} - {paciente.dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de estadísticas del período */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Consultas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStatsLoading ? '...' : periodStats?.totalConsultas || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Turnos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStatsLoading ? '...' : periodStats?.totalTurnos || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nuevos Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStatsLoading ? '...' : periodStats?.nuevosPacientes || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStatsLoading ? '...' : `$${periodStats?.ingresosTotales?.toFixed(2) || '0.00'}`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de reportes */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumen del Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                {periodStatsLoading ? (
                  <div className="text-center py-8">Cargando estadísticas...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Consultas:</span>
                      <span className="font-semibold">{periodStats?.totalConsultas || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Turnos:</span>
                      <span className="font-semibold">{periodStats?.totalTurnos || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Turnos Completados:</span>
                      <span className="font-semibold text-green-600">{periodStats?.turnosCompletados || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Turnos Cancelados:</span>
                      <span className="font-semibold text-red-600">{periodStats?.turnosCancelados || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nuevos Pacientes:</span>
                      <span className="font-semibold text-blue-600">{periodStats?.nuevosPacientes || 0}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Ingresos Totales:</span>
                      <span className="font-semibold text-purple-600">${periodStats?.ingresosTotales?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métricas de Eficiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {periodStatsLoading ? (
                  <div className="text-center py-8">Cargando métricas...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Tasa de Completitud:</span>
                      <span className="font-semibold">
                        {periodStats?.totalTurnos ? 
                          `${((periodStats.turnosCompletados / periodStats.totalTurnos) * 100).toFixed(1)}%` : 
                          '0%'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tasa de Cancelación:</span>
                      <span className="font-semibold">
                        {periodStats?.totalTurnos ? 
                          `${((periodStats.turnosCancelados / periodStats.totalTurnos) * 100).toFixed(1)}%` : 
                          '0%'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ingreso por Consulta:</span>
                      <span className="font-semibold">
                        {periodStats?.totalConsultas ? 
                          `$${(periodStats.ingresosTotales / periodStats.totalConsultas).toFixed(2)}` : 
                          '$0.00'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultas por Paciente:</span>
                      <span className="font-semibold">
                        {periodStats?.nuevosPacientes ? 
                          `${(periodStats.totalConsultas / periodStats.nuevosPacientes).toFixed(1)}` : 
                          '0'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Consultas</CardTitle>
                <Button onClick={() => exportToCSV(consultasReport || [], 'consultas-report')} disabled={!consultasReport?.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {consultasLoading ? (
                <div className="text-center py-8">Cargando consultas...</div>
              ) : !consultasReport?.length ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron consultas para los filtros seleccionados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Diagnóstico</TableHead>
                        <TableHead>Obra Social</TableHead>
                        <TableHead>Precio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consultasReport?.map((consulta) => (
                        <TableRow key={consulta.id}>
                          <TableCell>{new Date(consulta.fecha_consulta).toLocaleDateString('es-AR')}</TableCell>
                          <TableCell>{consulta.paciente.nombre} {consulta.paciente.apellido}</TableCell>
                          <TableCell>{consulta.paciente.dni}</TableCell>
                          <TableCell>{consulta.medico}</TableCell>
                          <TableCell>{consulta.motivo}</TableCell>
                          <TableCell>{consulta.diagnostico}</TableCell>
                          <TableCell>{consulta.obra_social}</TableCell>
                          <TableCell>${consulta.precio?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="turnos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Turnos</CardTitle>
                <Button onClick={() => exportToCSV(turnosReport || [], 'turnos-report')} disabled={!turnosReport?.length}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {turnosLoading ? (
                <div className="text-center py-8">Cargando turnos...</div>
              ) : !turnosReport?.length ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron turnos para los filtros seleccionados
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Especialidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {turnosReport?.map((turno) => (
                        <TableRow key={turno.id}>
                          <TableCell>{new Date(turno.fecha).toLocaleDateString('es-AR')}</TableCell>
                          <TableCell>{turno.hora}</TableCell>
                          <TableCell>{turno.paciente.nombre} {turno.paciente.apellido}</TableCell>
                          <TableCell>{turno.paciente.dni}</TableCell>
                          <TableCell>{turno.medico.nombre} {turno.medico.apellido}</TableCell>
                          <TableCell>{turno.especialidad}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              turno.estado === 'completado' ? 'bg-green-100 text-green-800' :
                              turno.estado === 'programado' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {turno.estado}
                            </span>
                          </TableCell>
                          <TableCell>{turno.motivo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ingresos">
          <Card>
            <CardHeader>
              <CardTitle>Reporte de Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="text-center py-8">Cargando datos de ingresos...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-lg font-semibold text-blue-600">${revenueReport?.totalRevenue?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-gray-600">Ingresos Totales</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-lg font-semibold text-green-600">{revenueReport?.consultasCount || 0}</p>
                      <p className="text-sm text-gray-600">Consultas Pagas</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-lg font-semibold text-purple-600">${revenueReport?.averagePrice?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-gray-600">Precio Promedio</p>
                    </div>
                  </div>

                  {Object.keys(revenueReport?.revenueByObraSocial || {}).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Ingresos por Obra Social</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Obra Social</TableHead>
                              <TableHead>Consultas</TableHead>
                              <TableHead>Ingresos Totales</TableHead>
                              <TableHead>Promedio por Consulta</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(revenueReport?.revenueByObraSocial || {}).map(([obraSocial, data]) => (
                              <TableRow key={obraSocial}>
                                <TableCell>{obraSocial}</TableCell>
                                <TableCell>{data.count}</TableCell>
                                <TableCell>${data.total.toFixed(2)}</TableCell>
                                <TableCell>${(data.total / data.count).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graficos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5" />
                  Consultas por Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartsLoading ? (
                  <div className="text-center py-8">Cargando gráficos...</div>
                ) : (
                  <ChartContainer
                    config={{
                      consultas: {
                        label: "Consultas",
                        color: "#2563eb",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <BarChart data={chartsData?.consultasPorDia || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="consultas" fill="var(--color-consultas)" />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5" />
                  Turnos por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartsLoading ? (
                  <div className="text-center py-8">Cargando gráficos...</div>
                ) : (
                  <ChartContainer
                    config={{
                      count: {
                        label: "Cantidad",
                        color: "#059669",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <PieChart>
                      <Pie
                        data={chartsData?.turnosPorEstado || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ estado, count }) => `${estado}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {chartsData?.turnosPorEstado?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ingresos por Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartsLoading ? (
                  <div className="text-center py-8">Cargando gráficos...</div>
                ) : (
                  <ChartContainer
                    config={{
                      ingresos: {
                        label: "Ingresos",
                        color: "#dc2626",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <LineChart data={chartsData?.consultasPorDia || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="ingresos" stroke="var(--color-ingresos)" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;
