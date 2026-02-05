import React, { useMemo } from 'react';
import { User, Phone, Mail, MapPin, Building2, Calendar, FileText, Clock, Shield, Download, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Patient } from '@/hooks/usePatients';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface HistoryItem {
  id: string;
  tipo: 'consulta' | 'turno' | 'autorizacion';
  fecha: string;
  detalle: string;
  estado: string;
  info_adicional: string;
  raw: any;
}

interface PatientHistoryTabProps {
  pacienteId: number | undefined;
  pacientes: Patient[] | undefined;
  consultasReport: any[] | undefined;
  turnosReport: any[] | undefined;
  autorizacionesReport: any[] | undefined;
  isLoading: boolean;
  filters: { fechaInicio?: string; fechaFin?: string };
}

const PatientHistoryTab: React.FC<PatientHistoryTabProps> = ({
  pacienteId,
  pacientes,
  consultasReport,
  turnosReport,
  autorizacionesReport,
  isLoading,
  filters
}) => {
  // Obtener datos del paciente seleccionado
  const selectedPatient = useMemo(() => {
    if (!pacienteId || !pacientes) return null;
    return pacientes.find(p => p.id === pacienteId);
  }, [pacienteId, pacientes]);

  // Combinar y ordenar el historial
  const patientHistory = useMemo(() => {
    const history: HistoryItem[] = [];

    // Agregar consultas
    consultasReport?.forEach(consulta => {
      history.push({
        id: `consulta-${consulta.id}`,
        tipo: 'consulta',
        fecha: consulta.fecha_consulta,
        detalle: `${consulta.motivo || 'Sin motivo'} - Dx: ${consulta.diagnostico || 'Sin diagnóstico'}`,
        estado: 'Realizada',
        info_adicional: `Dr. ${consulta.medico || 'N/A'} - $${consulta.precio?.toFixed(2) || '0.00'}`,
        raw: consulta
      });
    });

    // Agregar turnos
    turnosReport?.forEach(turno => {
      history.push({
        id: `turno-${turno.id}`,
        tipo: 'turno',
        fecha: turno.fecha,
        detalle: `${turno.especialidad || 'Sin especialidad'} - ${turno.hora || ''} hs`,
        estado: turno.estado || 'Pendiente',
        info_adicional: `Dr. ${turno.medico || 'N/A'}${turno.motivo ? ` - ${turno.motivo}` : ''}`,
        raw: turno
      });
    });

    // Agregar autorizaciones
    autorizacionesReport?.forEach(auth => {
      history.push({
        id: `auth-${auth.id}`,
        tipo: 'autorizacion',
        fecha: auth.fecha_solicitud,
        detalle: `${auth.tipo || 'N/A'} - ${auth.prestacion_descripcion || auth.prestacion_codigo || 'Sin descripción'}`,
        estado: auth.estado || 'Pendiente',
        info_adicional: `N° ${auth.numero_autorizacion || 'S/N'} - ${auth.prestador || 'Sin prestador'}`,
        raw: auth
      });
    });

    // Ordenar por fecha descendente
    return history.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime();
      const dateB = new Date(b.fecha).getTime();
      return dateB - dateA;
    });
  }, [consultasReport, turnosReport, autorizacionesReport]);

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'consulta': return 'default';
      case 'turno': return 'secondary';
      case 'autorizacion': return 'outline';
      default: return 'default';
    }
  };

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'consulta': return 'bg-blue-500 hover:bg-blue-600';
      case 'turno': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'autorizacion': return 'bg-orange-500 hover:bg-orange-600 text-white';
      default: return '';
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('aprobada') || estadoLower.includes('confirmado') || estadoLower.includes('realizada') || estadoLower.includes('completado')) {
      return 'bg-green-100 text-green-800';
    }
    if (estadoLower.includes('pendiente')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (estadoLower.includes('rechazada') || estadoLower.includes('cancelado') || estadoLower.includes('vencida')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const exportHistoryToCSV = () => {
    if (!patientHistory.length || !selectedPatient) return;
    
    const csvData = patientHistory.map(item => ({
      Fecha: new Date(item.fecha).toLocaleDateString('es-AR'),
      Tipo: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1),
      Detalle: item.detalle,
      Estado: item.estado,
      Info_Adicional: item.info_adicional
    }));

    const csvContent = [
      `Historial de Paciente: ${selectedPatient.nombre} ${selectedPatient.apellido} - DNI: ${selectedPatient.dni}`,
      '',
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_${selectedPatient.dni}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportHistoryToPDF = () => {
    if (!patientHistory.length || !selectedPatient) return;
    
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Historial del Paciente', 20, 20);
    
    // Datos del paciente
    doc.setFontSize(12);
    doc.text(`${selectedPatient.nombre} ${selectedPatient.apellido}`, 20, 30);
    doc.setFontSize(10);
    doc.text(`DNI: ${selectedPatient.dni}`, 20, 36);
    doc.text(`Obra Social: ${selectedPatient.obra_social?.nombre || 'Sin obra social'}${selectedPatient.plan ? ` - Plan: ${selectedPatient.plan}` : ''}`, 20, 42);
    doc.text(`Teléfono: ${selectedPatient.telefono || 'N/A'} | Email: ${selectedPatient.email || 'N/A'}`, 20, 48);
    doc.text(`Período: ${filters.fechaInicio || 'Inicio'} - ${filters.fechaFin || 'Fin'}`, 20, 54);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 20, 60);
    
    // Tabla de historial
    const tableData = patientHistory.map(item => [
      new Date(item.fecha).toLocaleDateString('es-AR'),
      item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1),
      item.detalle,
      item.estado,
      item.info_adicional
    ]);
    
    (doc as any).autoTable({
      head: [['Fecha', 'Tipo', 'Detalle', 'Estado', 'Info Adicional']],
      body: tableData,
      startY: 70,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 55 },
        3: { cellWidth: 25 },
        4: { cellWidth: 50 }
      }
    });
    
    doc.save(`historial_${selectedPatient.dni}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Si no hay paciente seleccionado
  if (!pacienteId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Seleccione un paciente
          </h3>
          <p className="text-gray-500">
            Use el filtro "Paciente" en la sección de Filtros Generales para ver el historial completo de un paciente.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando historial del paciente...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ficha del Paciente */}
      {selectedPatient && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" />
              Ficha del Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedPatient.nombre} {selectedPatient.apellido}
                </h3>
                <p className="text-gray-600">DNI: {selectedPatient.dni}</p>
                {selectedPatient.sexo && (
                  <p className="text-sm text-gray-500">Sexo: {selectedPatient.sexo}</p>
                )}
                {selectedPatient.fecha_nacimiento && (
                  <p className="text-sm text-gray-500">
                    Nac: {new Date(selectedPatient.fecha_nacimiento).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <span>{selectedPatient.obra_social?.nombre || 'Sin obra social'}</span>
                </div>
                {selectedPatient.plan && (
                  <Badge variant="outline" className="ml-6">{selectedPatient.plan}</Badge>
                )}
                {selectedPatient.numero_afiliado && (
                  <p className="text-sm text-gray-500 ml-6">N° Afil: {selectedPatient.numero_afiliado}</p>
                )}
              </div>
              
              <div className="space-y-1">
                {selectedPatient.telefono && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>{selectedPatient.telefono}</span>
                  </div>
                )}
                {selectedPatient.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-red-500" />
                    <span className="text-sm truncate">{selectedPatient.email}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                {(selectedPatient.localidad || selectedPatient.provincia) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span>{[selectedPatient.localidad, selectedPatient.provincia].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {selectedPatient.direccion && (
                  <p className="text-sm text-gray-500 ml-6">{selectedPatient.direccion}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Actividad */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Actividad
              <Badge variant="secondary">{patientHistory.length} registros</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportHistoryToCSV} disabled={patientHistory.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportHistoryToPDF} disabled={patientHistory.length === 0}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {patientHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No se encontraron registros para este paciente en el período seleccionado.</p>
              <p className="text-sm">Intente ampliar el rango de fechas.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Fecha</TableHead>
                  <TableHead className="w-[120px]">Tipo</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead>Información Adicional</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {new Date(item.fecha).toLocaleDateString('es-AR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getBadgeColor(item.tipo)}>
                        {item.tipo === 'consulta' && <FileText className="h-3 w-3 mr-1" />}
                        {item.tipo === 'turno' && <Calendar className="h-3 w-3 mr-1" />}
                        {item.tipo === 'autorizacion' && <Shield className="h-3 w-3 mr-1" />}
                        {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.detalle}</TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadge(item.estado)} variant="outline">
                        {item.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{item.info_adicional}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumen por tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{consultasReport?.length || 0}</p>
              <p className="text-sm text-gray-600">Consultas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{turnosReport?.length || 0}</p>
              <p className="text-sm text-gray-600">Turnos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{autorizacionesReport?.length || 0}</p>
              <p className="text-sm text-gray-600">Autorizaciones</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientHistoryTab;
