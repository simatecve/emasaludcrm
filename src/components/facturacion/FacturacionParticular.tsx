import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  useAutorizacionesParticularesPendientes,
  useCrearComprobante,
  useComprobantesParticulares,
  useRegistrarPagoComprobante,
  AutorizacionFacturable,
} from '@/hooks/useFacturacion';
import { Loader2, Receipt, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const FacturacionParticular = () => {
  const { data: pendientes, isLoading: loadingPend } = useAutorizacionesParticularesPendientes();
  const { data: comprobantes, isLoading: loadingComp } = useComprobantesParticulares();
  const crearComprobante = useCrearComprobante();
  const registrarPago = useRegistrarPagoComprobante();

  const [comprobanteDialog, setComprobanteDialog] = useState<AutorizacionFacturable | null>(null);
  const [pagoDialog, setPagoDialog] = useState<number | null>(null);
  const [metodoPago, setMetodoPago] = useState('');
  const [fechaPago, setFechaPago] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleCrearComprobante = async (a: AutorizacionFacturable) => {
    const monto = a.prestaciones.reduce((s, p) => s + p.precio * p.cantidad, 0);
    await crearComprobante.mutateAsync({
      autorizacion_id: a.id,
      paciente_id: a.paciente_id,
      monto,
      numero_comprobante: `COMP-${Date.now()}`,
    });
    setComprobanteDialog(null);
  };

  const handleRegistrarPago = async () => {
    if (!pagoDialog || !metodoPago) return;
    await registrarPago.mutateAsync({ id: pagoDialog, metodo_pago: metodoPago, fecha_pago: fechaPago });
    setPagoDialog(null);
    setMetodoPago('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Autorizaciones Particulares Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingPend ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : !pendientes?.length ? (
            <div className="text-center py-8 text-muted-foreground">Sin autorizaciones particulares pendientes</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Prestaciones</TableHead>
                  <TableHead>Profesional</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendientes.map(a => {
                  const total = a.prestaciones.reduce((s, p) => s + p.precio * p.cantidad, 0);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.pacientes?.apellido} {a.pacientes?.nombre}</TableCell>
                      <TableCell>{a.pacientes?.dni}</TableCell>
                      <TableCell>
                        {a.prestaciones.map(p => (
                          <div key={p.id} className="text-sm">{p.prestacion_codigo} - {p.prestacion_descripcion}</div>
                        ))}
                      </TableCell>
                      <TableCell>{a.medicos ? `${a.medicos.apellido} ${a.medicos.nombre}` : '-'}</TableCell>
                      <TableCell>{a.fecha_solicitud ? format(new Date(a.fecha_solicitud), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell className="text-right font-medium">${total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setComprobanteDialog(a)}>
                          <Receipt className="h-4 w-4 mr-1" /> Comprobante
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comprobantes Emitidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingComp ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : !comprobantes?.length ? (
            <div className="text-center py-8 text-muted-foreground">Sin comprobantes emitidos</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nro. Comprobante</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Emisión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comprobantes.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.numero_comprobante}</TableCell>
                    <TableCell>{c.pacientes?.apellido} {c.pacientes?.nombre}</TableCell>
                    <TableCell className="font-medium">${Number(c.monto).toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(c.fecha_emision), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant={c.estado === 'pagado' ? 'default' : 'secondary'}>
                        {c.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.fecha_pago ? format(new Date(c.fecha_pago), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>
                      {c.estado === 'pendiente' && (
                        <Button size="sm" variant="outline" onClick={() => setPagoDialog(c.id)}>
                          <CreditCard className="h-4 w-4 mr-1" /> Pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Confirm comprobante dialog */}
      <Dialog open={!!comprobanteDialog} onOpenChange={() => setComprobanteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generar Comprobante</DialogTitle></DialogHeader>
          {comprobanteDialog && (
            <div className="space-y-2">
              <p><strong>Paciente:</strong> {comprobanteDialog.pacientes?.apellido} {comprobanteDialog.pacientes?.nombre}</p>
              <p><strong>Monto:</strong> ${comprobanteDialog.prestaciones.reduce((s, p) => s + p.precio * p.cantidad, 0).toFixed(2)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setComprobanteDialog(null)}>Cancelar</Button>
            <Button onClick={() => comprobanteDialog && handleCrearComprobante(comprobanteDialog)} disabled={crearComprobante.isPending}>
              {crearComprobante.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment dialog */}
      <Dialog open={!!pagoDialog} onOpenChange={() => setPagoDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Método de Pago</Label>
              <Select value={metodoPago} onValueChange={setMetodoPago}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta Débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha de Pago</Label>
              <Input type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPagoDialog(null)}>Cancelar</Button>
            <Button onClick={handleRegistrarPago} disabled={registrarPago.isPending || !metodoPago}>
              {registrarPago.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Confirmar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
