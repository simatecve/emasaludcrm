
import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, DollarSign, Users, TrendingUp, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useConsultasReport, useTurnosReport, useRevenueReport, useChartData, type ReportFilters } from '@/hooks/useReports';
import { useMedicos } from '@/hooks/useMedicos';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { usePatients } from '@/hooks/usePatients';

const chartConfig = {
  consultas: {
    label: "Consultas",
    color: "hsl(var(--chart-1))",
  },
  turnos: {
    label: "Turnos",
    color: "hsl(var(--chart-2))",
  },
  ingresos: {
    label: "Ingresos",
    color: "hsl(var(--chart-3))",
  },
};

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
  const { data: chartData, isLoading: chartLoading } = useChartData(filters);

  const updateFilter = (key: keyof ReportFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilters({
      fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Informes y Reportes</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectValue placeholder="Seleccionar médico" />
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
              <label className="block text-sm font-medium mb-2">Paciente</label>
              <Select value={filters.pacienteId?.toString() || ''} onValueChange={(value) => updateFilter('pacienteId', value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los pacientes</SelectItem>
                  {pacientes?.map((paciente) => (
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

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Consultas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consultasLoading ? '...' : consultasReport?.length || 0}
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
                  {turnosLoading ? '...' : turnosReport?.length || 0}
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
                <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {revenueLoading ? '...' : `$${revenueReport?.totalRevenue?.toFixed(2) || '0.00'}`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {revenueLoading ? '...' : `$${revenueReport?.averagePrice?.toFixed(2) || '0.00'}`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Consultas por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">Cargando gráfico...</div>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData?.consultasPorMes || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-consultas)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Turnos por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-64 flex items-center justify-center">Cargando gráfico...</div>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.turnosPorEstado || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {chartData?.turnosPorEstado?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs de reportes detallados */}
      <Tabs defaultValue="consultas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
        </TabsList>

        <TabsContent value="consultas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Consultas</CardTitle>
                <Button onClick={() => exportToCSV(consultasReport || [], 'consultas-report')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {consultasLoading ? (
                <div className="text-center py-8">Cargando consultas...</div>
              ) : consultasReport && consultasReport.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Obra Social</TableHead>
                      <TableHead>Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultasReport.map((consulta) => (
                      <TableRow key={consulta.id}>
                        <TableCell>{new Date(consulta.fecha_consulta).toLocaleDateString('es-AR')}</TableCell>
                        <TableCell>{consulta.paciente.nombre} {consulta.paciente.apellido}</TableCell>
                        <TableCell>{consulta.medico}</TableCell>
                        <TableCell>{consulta.motivo}</TableCell>
                        <TableCell>{consulta.diagnostico}</TableCell>
                        <TableCell>{consulta.obra_social}</TableCell>
                        <TableCell>${consulta.precio?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron consultas para los filtros seleccionados
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
                <Button onClick={() => exportToCSV(turnosReport || [], 'turnos-report')}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {turnosLoading ? (
                <div className="text-center py-8">Cargando turnos...</div>
              ) : turnosReport && turnosReport.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {turnosReport.map((turno) => (
                      <TableRow key={turno.id}>
                        <TableCell>{new Date(turno.fecha).toLocaleDateString('es-AR')}</TableCell>
                        <TableCell>{turno.hora}</TableCell>
                        <TableCell>{turno.paciente.nombre} {turno.paciente.apellido}</TableCell>
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron turnos para los filtros seleccionados
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
                      <p className="text-sm text-gray-600">Consultas Realizadas</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-lg font-semibold text-purple-600">${revenueReport?.averagePrice?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-gray-600">Precio Promedio</p>
                    </div>
                  </div>

                  {revenueReport?.revenueByObraSocial && Object.keys(revenueReport.revenueByObraSocial).length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Ingresos por Obra Social</h3>
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
                          {Object.entries(revenueReport.revenueByObraSocial).map(([obraSocial, data]) => (
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No se encontraron datos de ingresos para los filtros seleccionados
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;
