import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLotesFacturacion, useUpdateLoteEstado } from '@/hooks/useFacturacion';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const estadoColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  generado: 'secondary',
  enviado: 'outline',
  cobrado: 'default',
};

export const LotesHistorial = () => {
  const { data: lotes, isLoading } = useLotesFacturacion();
  const updateEstado = useUpdateLoteEstado();

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de Lotes de Facturación</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!lotes?.length ? (
          <div className="text-center py-8 text-muted-foreground">No hay lotes generados</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nro. Lote</TableHead>
                <TableHead>Obra Social</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estudios</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotes.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-sm">{l.numero_lote}</TableCell>
                  <TableCell>{l.obras_sociales?.nombre || 'Particular'}</TableCell>
                  <TableCell>
                    {format(new Date(l.fecha_desde), 'dd/MM/yyyy')} - {format(new Date(l.fecha_hasta), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{l.cantidad_estudios}</TableCell>
                  <TableCell className="text-right font-medium">${Number(l.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={l.estado}
                      onValueChange={v => updateEstado.mutate({ id: l.id, estado: v })}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge variant={estadoColors[l.estado] || 'secondary'}>
                          {l.estado.charAt(0).toUpperCase() + l.estado.slice(1)}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generado">Generado</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="cobrado">Cobrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
