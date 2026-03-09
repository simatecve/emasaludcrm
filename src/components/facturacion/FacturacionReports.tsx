import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFacturacionReports } from '@/hooks/useFacturacion';
import { Loader2, DollarSign, Clock, TrendingUp, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const FacturacionReports = () => {
  const { data, isLoading } = useFacturacionReports();

  const totalFacturado = useMemo(() => {
    if (!data) return 0;
    return data.lotes.reduce((s, l) => s + Number(l.total), 0) +
      data.comprobantes.filter(c => c.estado === 'pagado').reduce((s, c) => s + Number(c.monto), 0);
  }, [data]);

  const totalPendienteCobro = useMemo(() => {
    if (!data) return 0;
    return data.lotes.filter(l => l.estado !== 'cobrado').reduce((s, l) => s + Number(l.total), 0) +
      data.comprobantes.filter(c => c.estado === 'pendiente').reduce((s, c) => s + Number(c.monto), 0);
  }, [data]);

  const porMes = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, number>();
    for (const l of data.lotes) {
      const key = format(parseISO(l.created_at), 'yyyy-MM');
      map.set(key, (map.get(key) || 0) + Number(l.total));
    }
    for (const c of data.comprobantes.filter(c => c.estado === 'pagado' && c.fecha_pago)) {
      const key = format(parseISO(c.fecha_pago!), 'yyyy-MM');
      map.set(key, (map.get(key) || 0) + Number(c.monto));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([mes, total]) => ({
        mes: format(parseISO(`${mes}-01`), 'MMM yyyy', { locale: es }),
        total,
      }));
  }, [data]);

  const porOS = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, number>();
    for (const l of data.lotes) {
      const name = (l as any).obras_sociales?.nombre || 'Particular';
      map.set(name, (map.get(name) || 0) + Number(l.total));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Facturado</p>
                <p className="text-2xl font-bold">${totalFacturado.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Pendiente de Cobro</p>
                <p className="text-2xl font-bold">${totalPendienteCobro.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Lotes Generados</p>
                <p className="text-2xl font-bold">{data?.lotes.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Estudios Pendientes</p>
                <p className="text-2xl font-bold">{data?.pendientesCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Facturación por Mes</CardTitle></CardHeader>
          <CardContent>
            {porMes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={porMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Facturación por Obra Social</CardTitle></CardHeader>
          <CardContent>
            {porOS.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={porOS} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {porOS.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
