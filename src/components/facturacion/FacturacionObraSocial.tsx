import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAutorizacionesPendientesFacturacion, useGenerarLote, AutorizacionFacturable } from '@/hooks/useFacturacion';
import { useObrasSociales } from '@/hooks/useObrasSociales';
import { useMedicos } from '@/hooks/useMedicos';
import { Loader2, FileSpreadsheet, FileText, Package } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate } from '@/lib/utils';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const FacturacionObraSocial = () => {
  const [obraSocialId, setObraSocialId] = useState<number | undefined>();
  const [medicoId, setMedicoId] = useState<number | undefined>();
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: obrasSociales } = useObrasSociales();
  const { data: medicos } = useMedicos();
  const { data: autorizaciones, isLoading } = useAutorizacionesPendientesFacturacion({
    obraSocialId,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
    medicoId,
  });
  const generarLote = useGenerarLote();

  // Filter only those with OS
  const conOS = useMemo(() => (autorizaciones || []).filter(a => a.obra_social_id), [autorizaciones]);

  const totalSelected = useMemo(() => {
    return conOS
      .filter(a => selectedIds.has(a.id))
      .reduce((sum, a) => sum + a.prestaciones.reduce((s, p) => s + p.precio * p.cantidad, 0), 0);
  }, [conOS, selectedIds]);

  const toggleAll = () => {
    if (selectedIds.size === conOS.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(conOS.map(a => a.id)));
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleGenerarLote = async () => {
    if (selectedIds.size === 0 || !obraSocialId) return;
    await generarLote.mutateAsync({
      obraSocialId,
      fechaDesde: fechaDesde || format(new Date(), 'yyyy-MM-01'),
      fechaHasta: fechaHasta || format(new Date(), 'yyyy-MM-dd'),
      autorizacionIds: Array.from(selectedIds),
      total: totalSelected,
    });
    setSelectedIds(new Set());
  };

  const getSelectedAutorizaciones = () => conOS.filter(a => selectedIds.has(a.id));

  const exportExcel = () => {
    const items = getSelectedAutorizaciones();
    const rows = items.flatMap(a =>
      a.prestaciones.map(p => ({
        Paciente: `${a.pacientes?.apellido || ''} ${a.pacientes?.nombre || ''}`,
        DNI: a.pacientes?.dni || '',
        'Obra Social': a.obras_sociales?.nombre || '',
        Afiliado: a.pacientes?.numero_afiliado || '',
        'Cod. Prestación': p.prestacion_codigo,
        Prestación: p.prestacion_descripcion,
        Cantidad: p.cantidad,
        'Precio Unit.': p.precio,
        Subtotal: p.precio * p.cantidad,
        Profesional: a.medicos ? `${a.medicos.apellido} ${a.medicos.nombre}` : '',
        Fecha: a.fecha_solicitud || '',
      }))
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturación');
    XLSX.writeFile(wb, `facturacion_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportPDF = () => {
    const items = getSelectedAutorizaciones();
    const doc = new jsPDF();
    const osName = obrasSociales?.find(o => o.id === obraSocialId)?.nombre || 'Particular';

    doc.setFontSize(16);
    doc.text('Lote de Facturación', 14, 20);
    doc.setFontSize(10);
    doc.text(`Obra Social: ${osName}`, 14, 28);
    doc.text(`Período: ${fechaDesde || '-'} a ${fechaHasta || '-'}`, 14, 34);
    doc.text(`Total: $${totalSelected.toFixed(2)}`, 14, 40);
    doc.text(`Cantidad de estudios: ${items.length}`, 14, 46);

    const rows = items.flatMap(a =>
      a.prestaciones.map(p => [
        `${a.pacientes?.apellido || ''} ${a.pacientes?.nombre || ''}`,
        a.pacientes?.dni || '',
        p.prestacion_codigo,
        p.prestacion_descripcion,
        p.cantidad.toString(),
        `$${p.precio.toFixed(2)}`,
        `$${(p.precio * p.cantidad).toFixed(2)}`,
      ])
    );

    autoTable(doc, {
      startY: 52,
      head: [['Paciente', 'DNI', 'Código', 'Prestación', 'Cant.', 'Precio', 'Subtotal']],
      body: rows,
    });

    doc.save(`facturacion_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const getPrecioTotal = (a: AutorizacionFacturable) =>
    a.prestaciones.reduce((s, p) => s + p.precio * p.cantidad, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Obra Social</Label>
              <Select value={obraSocialId?.toString() || ''} onValueChange={v => setObraSocialId(v ? Number(v) : undefined)}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  {(obrasSociales || []).filter(o => o.activa).map(o => (
                    <SelectItem key={o.id} value={o.id.toString()}>{o.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Profesional</Label>
              <Select value={medicoId?.toString() || ''} onValueChange={v => setMedicoId(v ? Number(v) : undefined)}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  {(medicos || []).filter(m => m.activo).map(m => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.apellido} {m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha Desde</Label>
              <Input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
            </div>
            <div>
              <Label>Fecha Hasta</Label>
              <Input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.size > 0 && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {selectedIds.size} seleccionado(s)
                </Badge>
                <span className="text-lg font-semibold">
                  Total: ${totalSelected.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportExcel}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportPDF}>
                  <FileText className="h-4 w-4 mr-1" /> PDF
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerarLote}
                  disabled={generarLote.isPending || !obraSocialId}
                >
                  {generarLote.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Package className="h-4 w-4 mr-1" />}
                  Generar Lote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : conOS.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay autorizaciones pendientes de facturar</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.size === conOS.length && conOS.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Obra Social</TableHead>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Prestaciones</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conOS.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Checkbox checked={selectedIds.has(a.id)} onCheckedChange={() => toggleOne(a.id)} />
                    </TableCell>
                    <TableCell className="font-medium">{a.pacientes?.apellido} {a.pacientes?.nombre}</TableCell>
                    <TableCell>{a.pacientes?.dni}</TableCell>
                    <TableCell>{a.obras_sociales?.nombre}</TableCell>
                    <TableCell>{a.pacientes?.numero_afiliado || '-'}</TableCell>
                    <TableCell>
                      {a.prestaciones.map(p => (
                        <div key={p.id} className="text-sm">{p.prestacion_codigo} - {p.prestacion_descripcion} (x{p.cantidad})</div>
                      ))}
                    </TableCell>
                    <TableCell>{a.medicos ? `${a.medicos.apellido} ${a.medicos.nombre}` : '-'}</TableCell>
                    <TableCell>{a.fecha_solicitud ? format(parseLocalDate(a.fecha_solicitud), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell className="text-right font-medium">${getPrecioTotal(a).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
