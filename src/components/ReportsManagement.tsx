
import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, DollarSign, Users, TrendingUp, Shield, UserCog, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConsultasReport, useTurnosReport, useRevenueReport, useAutorizacionesReport, useMedicosReport, useObrasSocialesReport, type ReportFilters } from '@/hooks/useReports';
import { useMedicos } from '@/hooks/useMedicos';
import { useEspecialidades } from '@/hooks/useEspecialidades';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { usePatients } from '@/hooks/usePatients';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const { data: autorizacionesReport, isLoading: autorizacionesLoading } = useAutorizacionesReport(filters);
  const { data: medicosReport, isLoading: medicosLoading } = useMedicosReport(filters);
  const { data: obrasSocialesReport, isLoading: obrasSocialesLoading } = useObrasSocialesReport(filters);

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

  const exportToPDF = (data: any[], filename: string, title: string, columns: string[]) => {
    if (!data || data.length === 0) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Add date range
    doc.setFontSize(10);
    doc.text(`Período: ${filters.fechaInicio || 'Inicio'} - ${filters.fechaFin || 'Fin'}`, 20, 30);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 20, 35);
    
    // Prepare table data
    const tableData = data.map(row => 
      columns.map(col => {
        const value = row[col];
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).join(' ');
        }
        return value || '';
      })
    );
    
    // Add table
    (doc as any).autoTable({
      head: [columns],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Informes y Reportes</h1>
      </div>

      {/* Filtros Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Generales
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
              <label className="block text-sm font-medium mb-2">Paciente</label>
              <Select value={filters.pacienteId?.toString() || 'all'} onValueChange={(value) => updateFilter('pacienteId', value === 'all' ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pacientes</SelectItem>
                  {pacientes?.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id.toString()}>
                      {paciente.nombre} {paciente.apellido} - {paciente.dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Médico</label>
              <Select value={filters.medicoId?.toString() || 'all'} onValueChange={(value) => updateFilter('medicoId', value === 'all' ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar médico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los médicos</SelectItem>
                  {medicos?.map((medico) => (
                    <SelectItem key={medico.id} value={medico.id.toString()}>
                      {medico.nombre} {medico.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Específicos de Autorizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Filtros de Autorizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">N° Autorización</label>
              <Input
                placeholder="Número de autorización"
                value={filters.numeroAutorizacion || ''}
                onChange={(e) => updateFilter('numeroAutorizacion', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo Autorización</label>
              <Select value={filters.tipoAutorizacion || 'all'} onValueChange={(value) => updateFilter('tipoAutorizacion', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="estudio">Estudio</SelectItem>
                  <SelectItem value="tratamiento">Tratamiento</SelectItem>
                  <SelectItem value="internacion">Internación</SelectItem>
                  <SelectItem value="laboratorio">Laboratorio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <Select value={filters.estado || 'all'} onValueChange={(value) => updateFilter('estado', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Obra Social</label>
              <Select value={filters.obraSocialId?.toString() || 'all'} onValueChange={(value) => updateFilter('obraSocialId', value === 'all' ? undefined : parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar obra social" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las obras sociales</SelectItem>
                  {obrasSociales?.map((obraSocial) => (
                    <SelectItem key={obraSocial.id} value={obraSocial.id.toString()}>
                      {obraSocial.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prestador</label>
              <Input
                placeholder="Nombre del prestador"
                value={filters.prestador || ''}
                onChange={(e) => updateFilter('prestador', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Código Prestación</label>
              <Input
                placeholder="Código de prestación"
                value={filters.prestacionCodigo || ''}
                onChange={(e) => updateFilter('prestacionCodigo', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">N° Credencial</label>
              <Input
                placeholder="Número de credencial"
                value={filters.numeroCredencial || ''}
                onChange={(e) => updateFilter('numeroCredencial', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Profesional Solicitante</label>
              <Input
                placeholder="Nombre del profesional"
                value={filters.profesionalSolicitante || ''}
                onChange={(e) => updateFilter('profesionalSolicitante', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                <p className="text-sm text-gray-600 mb-1">Autorizaciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {autorizacionesLoading ? '...' : autorizacionesReport?.length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Médicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicosLoading ? '...' : medicosReport?.length || 0}
                </p>
              </div>
              <UserCog className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Obras Sociales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {obrasSocialesLoading ? '...' : obrasSocialesReport?.length || 0}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de reportes */}
      <Tabs defaultValue="consultas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="turnos">Turnos</TabsTrigger>
          <TabsTrigger value="autorizaciones">Autorizaciones</TabsTrigger>
          <TabsTrigger value="medicos">Médicos</TabsTrigger>
          <TabsTrigger value="obras-sociales">Obras Sociales</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
        </TabsList>

        <TabsContent value="consultas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Consultas</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportToCSV(consultasReport || [], 'consultas-report')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={() => exportToPDF(consultasReport || [], 'consultas-report', 'Reporte de Consultas', ['fecha_consulta', 'paciente', 'medico', 'motivo', 'diagnostico', 'obra_social', 'precio'])}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {consultasLoading ? (
                <div className="text-center py-8">Cargando consultas...</div>
              ) : (
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
                    {consultasReport?.map((consulta) => (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="turnos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Turnos</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportToCSV(turnosReport || [], 'turnos-report')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={() => exportToPDF(turnosReport || [], 'turnos-report', 'Reporte de Turnos', ['fecha', 'hora', 'paciente', 'medico', 'especialidad', 'estado', 'motivo'])}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {turnosLoading ? (
                <div className="text-center py-8">Cargando turnos...</div>
              ) : (
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
                    {turnosReport?.map((turno) => (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autorizaciones">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Autorizaciones</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportToCSV(autorizacionesReport || [], 'autorizaciones-report')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={() => exportToPDF(autorizacionesReport || [], 'autorizaciones-report', 'Reporte de Autorizaciones', ['numero_autorizacion', 'fecha_solicitud', 'tipo_autorizacion', 'estado', 'paciente', 'obra_social', 'prestacion_codigo'])}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {autorizacionesLoading ? (
                <div className="text-center py-8">Cargando autorizaciones...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Autorización</TableHead>
                        <TableHead>Fecha Solicitud</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Obra Social</TableHead>
                        <TableHead>N° Credencial</TableHead>
                        <TableHead>Parentesco</TableHead>
                        <TableHead>Prestación</TableHead>
                        <TableHead>Prestador</TableHead>
                        <TableHead>Prof. Solicitante</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {autorizacionesReport?.map((autorizacion) => (
                        <TableRow key={autorizacion.id}>
                          <TableCell className="font-medium">{autorizacion.numero_autorizacion}</TableCell>
                          <TableCell>{new Date(autorizacion.fecha_solicitud).toLocaleDateString('es-AR')}</TableCell>
                          <TableCell className="capitalize">{autorizacion.tipo_autorizacion}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                              autorizacion.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                              autorizacion.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {autorizacion.estado}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{autorizacion.paciente.nombre} {autorizacion.paciente.apellido}</TableCell>
                          <TableCell>{autorizacion.paciente.dni}</TableCell>
                          <TableCell>{autorizacion.obra_social}</TableCell>
                          <TableCell>{autorizacion.numero_credencial}</TableCell>
                          <TableCell className="capitalize">{autorizacion.parentesco_beneficiario}</TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium">{autorizacion.prestacion_codigo}</div>
                              <div className="text-sm text-gray-500">{autorizacion.prestacion_descripcion}</div>
                            </div>
                          </TableCell>
                          <TableCell>{autorizacion.prestador}</TableCell>
                          <TableCell>{autorizacion.profesional_solicitante}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={autorizacion.descripcion}>
                              {autorizacion.descripcion}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={autorizacion.observaciones}>
                              {autorizacion.observaciones}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicos">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Médicos</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportToCSV(medicosReport || [], 'medicos-report')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={() => exportToPDF(medicosReport || [], 'medicos-report', 'Reporte de Médicos', ['nombre', 'apellido', 'dni', 'matricula', 'especialidad', 'telefono', 'email', 'activo', 'total_turnos', 'total_consultas'])}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {medicosLoading ? (
                <div className="text-center py-8">Cargando médicos...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Turnos</TableHead>
                      <TableHead>Consultas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicosReport?.map((medico) => (
                      <TableRow key={medico.id}>
                        <TableCell>{medico.nombre} {medico.apellido}</TableCell>
                        <TableCell>{medico.dni}</TableCell>
                        <TableCell>{medico.matricula}</TableCell>
                        <TableCell>{medico.especialidad}</TableCell>
                        <TableCell>{medico.telefono}</TableCell>
                        <TableCell>{medico.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            medico.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {medico.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell>{medico.total_turnos}</TableCell>
                        <TableCell>{medico.total_consultas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obras-sociales">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reporte de Obras Sociales</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportToCSV(obrasSocialesReport || [], 'obras-sociales-report')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button onClick={() => exportToPDF(obrasSocialesReport || [], 'obras-sociales-report', 'Reporte de Obras Sociales', ['nombre', 'codigo', 'telefono', 'email', 'activa', 'total_pacientes', 'total_autorizaciones'])}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {obrasSocialesLoading ? (
                <div className="text-center py-8">Cargando obras sociales...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Pacientes</TableHead>
                      <TableHead>Autorizaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obrasSocialesReport?.map((obraSocial) => (
                      <TableRow key={obraSocial.id}>
                        <TableCell>{obraSocial.nombre}</TableCell>
                        <TableCell>{obraSocial.codigo}</TableCell>
                        <TableCell>{obraSocial.telefono}</TableCell>
                        <TableCell>{obraSocial.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            obraSocial.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {obraSocial.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </TableCell>
                        <TableCell>{obraSocial.total_pacientes}</TableCell>
                        <TableCell>{obraSocial.total_autorizaciones}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;
